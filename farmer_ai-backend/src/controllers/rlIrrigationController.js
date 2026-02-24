const axios = require('axios');
const Farm = require('../models/Farm');
const CropCycle = require('../models/CropCycle');
const SoilTest = require('../models/SoilTest');
const IrrigationEpisode = require('../models/IrrigationEpisode');

const RL_SERVICE_URL = process.env.RL_SERVICE_URL || 'http://localhost:8001';

// --- Helper: Build RL State from Farm Data ---
const buildState = (farm, soilTest, weather) => {
    // soil_moisture_pct: estimate from humidity + organic carbon
    const humidity = weather?.main?.humidity || 60;
    const organicCarbon = soilTest?.organicCarbon || 0.5;
    const soilMoisturePct = Math.min(1, (humidity / 100) * 0.6 + organicCarbon * 0.1);

    // temperature normalized [10°C=0 → 45°C=1]
    const temp = weather?.main?.temp || 28;
    const temperatureNorm = Math.max(0, Math.min(1, (temp - 10) / 35));

    const humidityNorm = Math.min(1, humidity / 100);

    // rainfall normalized [0→30mm = 0→1]
    const rainfall = weather?.agriIndices?.et0 ? 0 : (weather?.rain?.['1h'] || 0);
    const rainfallNorm = Math.min(1, rainfall / 30);

    // ET0 normalized [0→8 mm/day = 0→1]
    const et0 = weather?.agriIndices?.et0 || 3;
    const et0Norm = Math.min(1, et0 / 8);

    // Water availability from farm model: Low=0, Medium=0.5, High=1
    const waterAvailMap = { 'Low': 0.0, 'Medium': 0.5, 'High': 1.0 };
    const waterAvailability = waterAvailMap[farm.waterAvailability] ?? 0.5;

    return {
        soil_moisture_pct: parseFloat(soilMoisturePct.toFixed(3)),
        temperature_norm: parseFloat(temperatureNorm.toFixed(3)),
        humidity_norm: parseFloat(humidityNorm.toFixed(3)),
        rainfall_norm: parseFloat(rainfallNorm.toFixed(3)),
        growth_stage: 0.5, // Default midseason; overridden if cropCycle provided
        et0_norm: parseFloat(et0Norm.toFixed(3)),
        water_availability: waterAvailability,
    };
};

// @desc    Get RL irrigation recommendation for a farm
// @route   GET /api/rl/recommendation/:farmId
// @access  Private (Farmer)
exports.getRecommendation = async (req, res, next) => {
    try {
        const { farmId } = req.params;
        const agentType = req.query.agent || 'ql'; // 'ql' or 'ppo'

        // 1. Fetch farm & verify ownership
        const farm = await Farm.findById(farmId);
        if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });
        if (farm.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // 2. Fetch latest soil test for this farm
        const soilTest = await SoilTest.findOne({ farm: farmId }).sort({ testDate: -1 });

        // 3. Fetch active crop cycle for growth stage
        const cropCycle = await CropCycle.findOne({ farm: farmId, status: 'Active' }).sort({ createdAt: -1 });
        let growthStage = 0.5;
        if (cropCycle && cropCycle.sowingDate) {
            const daysSinceSowing = Math.floor((Date.now() - new Date(cropCycle.sowingDate)) / 86400000);
            growthStage = Math.min(1, daysSinceSowing / 120);
        }

        // 4. Get latest weather (best effort — use mock if unavailable)
        const mockWeather = {
            main: { temp: 28, humidity: 65 },
            agriIndices: { et0: 4.2 }
        };
        const weather = mockWeather; // In production: fetch from your weatherController

        // 5. Build state vector
        const state = buildState(farm, soilTest, weather);
        state.growth_stage = parseFloat(growthStage.toFixed(3));
        state.agent = agentType;

        // 6. Call Python RL microservice
        let recommendation;
        try {
            const rlRes = await axios.post(`${RL_SERVICE_URL}/rl/step`, state, { timeout: 5000 });
            recommendation = rlRes.data;
        } catch (rlError) {
            console.error('[RL] Microservice unavailable:', rlError.message);
            // Fallback: simple rule-based recommendation
            recommendation = {
                action: state.soil_moisture_pct < 0.4 ? 2 : 0,
                action_label: state.soil_moisture_pct < 0.4 ? 'Irrigate 20mm' : 'No Irrigation',
                irrigation_mm: state.soil_moisture_pct < 0.4 ? 20 : 0,
                confidence: 0.6,
                agent: 'Rule-Based Fallback',
                reasoning: 'RL service unavailable. Using soil moisture threshold rule.'
            };
        }

        // 7. Log decision to MongoDB for research
        const episode = new IrrigationEpisode({
            farm: farmId,
            user: req.user._id,
            cropCycle: cropCycle?._id,
            agent: agentType === 'ppo' ? 'ppo' : 'q_learning',
            state: {
                soilMoisturePct: state.soil_moisture_pct,
                temperatureNorm: state.temperature_norm,
                humidityNorm: state.humidity_norm,
                rainfallNorm: state.rainfall_norm,
                growthStage: state.growth_stage,
                et0Norm: state.et0_norm,
                waterAvailability: state.water_availability,
            },
            action: recommendation.action,
            actionLabel: recommendation.action_label,
            irrigationMm: recommendation.irrigation_mm,
            confidence: recommendation.confidence,
            reasoning: recommendation.reasoning,
            dayInSeason: Math.floor(growthStage * 120),
        });
        await episode.save();

        res.json({
            success: true,
            farmId,
            farmName: farm.name,
            crop: cropCycle?.cropName || 'Unknown',
            recommendation,
            state, // Send state to frontend for display
        });

    } catch (error) {
        console.error('[RL Controller] Error:', error);
        next(error);
    }
};

// @desc    Get training metrics from the RL service
// @route   GET /api/rl/metrics
// @access  Private
exports.getMetrics = async (req, res, next) => {
    try {
        const rlRes = await axios.get(`${RL_SERVICE_URL}/rl/metrics`, { timeout: 5000 });
        res.json({ success: true, data: rlRes.data });
    } catch (error) {
        res.status(503).json({
            success: false,
            message: 'RL service unavailable. Train the agents first by running: python train.py',
        });
    }
};

// @desc    Get Q-Learning vs PPO comparison table
// @route   GET /api/rl/compare
// @access  Private
exports.getComparison = async (req, res, next) => {
    try {
        const rlRes = await axios.get(`${RL_SERVICE_URL}/rl/compare`, { timeout: 5000 });
        res.json({ success: true, data: rlRes.data });
    } catch (error) {
        res.status(503).json({
            success: false,
            message: 'No comparison data available. Run training first.',
        });
    }
};

// @desc    Get irrigation decision history for a farm
// @route   GET /api/rl/history/:farmId
// @access  Private
exports.getHistory = async (req, res, next) => {
    try {
        const { farmId } = req.params;
        const farm = await Farm.findById(farmId);
        if (!farm || farm.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const history = await IrrigationEpisode
            .find({ farm: farmId })
            .sort({ createdAt: -1 })
            .limit(30)
            .select('action actionLabel irrigationMm confidence agent dayInSeason createdAt state');

        res.json({ success: true, data: history });
    } catch (error) {
        next(error);
    }
};

// @desc    Run a full 120-day simulation episode
// @route   POST /api/rl/simulate
// @access  Private
exports.runSimulation = async (req, res, next) => {
    try {
        const { farmConfig, agent = 'ql' } = req.body;
        const rlRes = await axios.post(
            `${RL_SERVICE_URL}/rl/simulate`,
            { farm_config: farmConfig, agent },
            { timeout: 30000 }
        );
        res.json({ success: true, data: rlRes.data });
    } catch (error) {
        res.status(503).json({ success: false, message: 'Simulation failed. Ensure RL service is running.' });
    }
};
