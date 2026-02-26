/**
 * rlIrrigationController.js
 * Handles RL-based irrigation recommendations.
 * Now uses:
 *  1. Google Maps Geocoding API → precise lat/lon for the farm location
 *  2. Open-Meteo API           → real-time weather at those coordinates
 *  3. The RL microservice      → action decision based on real state vector
 */
const axios = require('axios');
const Farm = require('../models/Farm');
const CropCycle = require('../models/CropCycle');
const SoilTest = require('../models/SoilTest');
const IrrigationEpisode = require('../models/IrrigationEpisode');

const RL_SERVICE_URL = process.env.RL_SERVICE_URL || 'http://localhost:8001';
const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY;

// ──────────────────────────────────────────────
// Geo + Weather helpers
// ──────────────────────────────────────────────

/**
 * Resolve a farm's location to precise lat/lon.
 * Priority: farm.location.coordinates → Google Maps Geocoding → fallback defaults
 */
const resolveFarmCoordinates = async (farm) => {
    // 1. Use stored GeoJSON coordinates if present
    const coords = farm.location?.coordinates;
    if (coords && coords.length === 2 && coords[0] !== 0) {
        return { lat: coords[1], lon: coords[0], source: 'farm_coordinates' };
    }

    // 2. Use Google Maps Geocoding API
    if (GOOGLE_MAPS_KEY) {
        try {
            const address = [farm.location?.district, farm.location?.state, 'India']
                .filter(Boolean).join(', ');
            const geoRes = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
                params: { address, key: GOOGLE_MAPS_KEY },
                timeout: 6000
            });
            const result = geoRes.data?.results?.[0]?.geometry?.location;
            if (result) {
                console.log(`[RL] Google Maps geocoded "${address}" → ${result.lat}, ${result.lng}`);
                return { lat: result.lat, lon: result.lng, source: 'google_maps', address };
            }
        } catch (e) {
            console.warn('[RL] Google Maps geocoding failed:', e.message);
        }
    }

    // 3. India center fallback
    return { lat: 22.5937, lon: 78.9629, source: 'default_india' };
};

/**
 * Fetch real-time weather from Open-Meteo given lat/lon.
 * Returns a normalized weather object compatible with buildState().
 */
const fetchRealWeather = async (lat, lon) => {
    const { data } = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
            latitude: lat,
            longitude: lon,
            current: [
                'temperature_2m',
                'relative_humidity_2m',
                'precipitation',
                'weather_code',
                'wind_speed_10m',
                'et0_fao_evapotranspiration'
            ].join(','),
            daily: 'precipitation_sum',
            forecast_days: 1,
            timezone: 'auto'
        },
        timeout: 8000
    });

    const c = data.current;
    const dailyRainSum = data.daily?.precipitation_sum?.[0] || 0;

    return {
        temp: c.temperature_2m,
        humidity: c.relative_humidity_2m,
        precipitation: c.precipitation,           // mm in last measurement period
        daily_rain_mm: dailyRainSum,              // total rain today
        et0: c.et0_fao_evapotranspiration || 3.0, // FAO-56 Penman-Monteith ET0
        weather_code: c.weather_code,
        wind_speed: c.wind_speed_10m,
        source: 'open-meteo',
        fetched_at: c.time
    };
};

// ──────────────────────────────────────────────
// State builder — converts raw data to RL state vector
// ──────────────────────────────────────────────
const buildState = (farm, soilTest, weather) => {
    const humidity = weather?.humidity ?? 60;
    const organicCarbon = soilTest?.organicCarbon ?? 0.5;

    // Soil moisture: blended from relative humidity + organic carbon water holding
    const soilMoisturePct = Math.min(1, (humidity / 100) * 0.6 + organicCarbon * 0.1);

    // Temperature normalized [10°C = 0 → 45°C = 1]
    const temp = weather?.temp ?? 28;
    const temperatureNorm = Math.max(0, Math.min(1, (temp - 10) / 35));

    const humidityNorm = Math.min(1, humidity / 100);

    // Rainfall: prefer actual current precipitation; fallback to daily sum fraction
    const rainfall = weather?.precipitation ?? weather?.daily_rain_mm ?? 0;
    const rainfallNorm = Math.min(1, rainfall / 30);

    // ET0 normalized [0→8 mm/day = 0→1]
    const et0 = weather?.et0 ?? 3.0;
    const et0Norm = Math.min(1, et0 / 8);

    // Water availability from farm model
    const waterAvailMap = { Low: 0.0, Medium: 0.5, High: 1.0 };
    const waterAvailability = waterAvailMap[farm.waterAvailability] ?? 0.5;

    return {
        soil_moisture_pct: parseFloat(soilMoisturePct.toFixed(3)),
        temperature_norm: parseFloat(temperatureNorm.toFixed(3)),
        humidity_norm: parseFloat(humidityNorm.toFixed(3)),
        rainfall_norm: parseFloat(rainfallNorm.toFixed(3)),
        growth_stage: 0.5, // overridden by caller
        et0_norm: parseFloat(et0Norm.toFixed(3)),
        water_availability: waterAvailability,
    };
};

// ──────────────────────────────────────────────
// Controller exports
// ──────────────────────────────────────────────

/**
 * @desc    Get RL irrigation recommendation for a farm
 * @route   GET /api/rl/recommendation/:farmId
 * @access  Private (Farmer)
 */
exports.getRecommendation = async (req, res, next) => {
    try {
        const { farmId } = req.params;
        const agentType = req.query.agent || 'ql';

        // 1. Fetch farm & verify ownership
        const farm = await Farm.findById(farmId);
        if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });
        if (farm.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // 2. Fetch latest soil test
        const soilTest = await SoilTest.findOne({ farm: farmId }).sort({ testDate: -1 });

        // 3. Fetch active crop cycle for growth stage
        const cropCycle = await CropCycle.findOne({ farm: farmId, status: 'Active' }).sort({ createdAt: -1 });
        let growthStage = 0.5;
        if (cropCycle?.sowingDate) {
            const daysSinceSowing = Math.floor((Date.now() - new Date(cropCycle.sowingDate)) / 86400000);
            growthStage = Math.min(1, daysSinceSowing / 120);
        }

        // 4. Resolve precise farm coordinates using Google Maps
        const geo = await resolveFarmCoordinates(farm);

        // 5. Fetch live weather from Open-Meteo at those coordinates
        let weather;
        let weatherMeta = {};
        try {
            weather = await fetchRealWeather(geo.lat, geo.lon);
            weatherMeta = {
                source: weather.source,
                geo_source: geo.source,
                coordinates: { lat: geo.lat, lon: geo.lon },
                fetched_at: weather.fetched_at,
                ...(geo.address ? { address: geo.address } : {})
            };
            console.log(`[RL] Live weather at (${geo.lat}, ${geo.lon}): temp=${weather.temp}°C humidity=${weather.humidity}% et0=${weather.et0}mm/day`);
        } catch (weatherErr) {
            console.warn('[RL] Weather fetch failed, using defaults:', weatherErr.message);
            weather = { temp: 28, humidity: 65, precipitation: 0, et0: 3.0 };
            weatherMeta = { source: 'fallback', geo_source: geo.source };
        }

        // 6. Build RL state vector
        const state = buildState(farm, soilTest, weather);
        state.growth_stage = parseFloat(growthStage.toFixed(3));
        state.agent = agentType;

        // 7. Call Python RL microservice
        let recommendation;
        try {
            const rlRes = await axios.post(`${RL_SERVICE_URL}/rl/step`, state, { timeout: 5000 });
            recommendation = rlRes.data;
        } catch (rlError) {
            console.error('[RL] Microservice unavailable:', rlError.message);
            // Fallback: rule-based
            const needsWater = state.soil_moisture_pct < 0.4 || state.et0_norm > 0.6;
            const urgentWater = state.soil_moisture_pct < 0.25;
            const action = urgentWater ? 3 : needsWater ? 2 : 0;
            const mm = [0, 10, 20, 30][action];
            recommendation = {
                action,
                action_label: [`No Irrigation`, `Irrigate 10mm`, `Irrigate 20mm`, `Irrigate 30mm`][action],
                irrigation_mm: mm,
                confidence: 0.65,
                agent: 'Rule-Based Fallback',
                reasoning: `RL service unavailable. Based on soil moisture (${(state.soil_moisture_pct * 100).toFixed(0)}%) and ET0 rate.`
            };
        }

        // 8. Log decision
        await new IrrigationEpisode({
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
        }).save();

        res.json({
            success: true,
            farmId,
            farmName: farm.name,
            crop: cropCycle?.cropName || 'Unknown',
            recommendation,
            state,
            weather: {
                temp: weather.temp,
                humidity: weather.humidity,
                precipitation_mm: weather.precipitation,
                et0_mm_day: weather.et0,
                ...weatherMeta
            }
        });

    } catch (error) {
        console.error('[RL Controller] Error:', error);
        next(error);
    }
};

/** @desc Get training metrics  @route GET /api/rl/metrics */
exports.getMetrics = async (req, res, next) => {
    try {
        const rlRes = await axios.get(`${RL_SERVICE_URL}/rl/metrics`, { timeout: 5000 });
        res.json({ success: true, data: rlRes.data });
    } catch {
        res.status(503).json({ success: false, message: 'RL service unavailable.' });
    }
};

/** @desc Q-Learning vs PPO comparison  @route GET /api/rl/compare */
exports.getComparison = async (req, res, next) => {
    try {
        const rlRes = await axios.get(`${RL_SERVICE_URL}/rl/compare`, { timeout: 5000 });
        res.json({ success: true, data: rlRes.data });
    } catch {
        res.status(503).json({ success: false, message: 'No comparison data.' });
    }
};

/** @desc Decision history for a farm  @route GET /api/rl/history/:farmId */
exports.getHistory = async (req, res, next) => {
    try {
        const farm = await Farm.findById(req.params.farmId);
        if (!farm || farm.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        const history = await IrrigationEpisode
            .find({ farm: req.params.farmId })
            .sort({ createdAt: -1 })
            .limit(30)
            .select('action actionLabel irrigationMm confidence agent dayInSeason createdAt state');
        res.json({ success: true, data: history });
    } catch (error) { next(error); }
};

/** @desc Run a full 120-day simulation  @route POST /api/rl/simulate */
exports.runSimulation = async (req, res, next) => {
    try {
        const { farmConfig, agent = 'ql' } = req.body;
        const rlRes = await axios.post(`${RL_SERVICE_URL}/rl/simulate`, { farm_config: farmConfig, agent }, { timeout: 30000 });
        res.json({ success: true, data: rlRes.data });
    } catch {
        res.status(503).json({ success: false, message: 'Simulation failed. Ensure RL service is running.' });
    }
};
