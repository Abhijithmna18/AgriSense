import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import { recommendationsApi } from '../services/recommendationsApi';
import { authAPI } from '../services/authApi';
import { Sprout, AlertCircle, CheckCircle, X, Loader, TrendingUp, Activity, HelpCircle, ChevronRight, ChevronLeft, Sliders } from 'lucide-react';

// Steps for Guided Analysis
const STEPS = [
    { id: 1, title: 'Location & Season', description: 'Where and when are you planting?' },
    { id: 2, title: 'Soil Health', description: 'Enter NPK and pH values' },
    { id: 3, title: 'Goals & Constraints', description: 'Set your priorities' }
];

const Recommendations = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState([]);

    // Analysis State
    const [showModal, setShowModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    // Simulation State
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulatedSoil, setSimulatedSoil] = useState(null);

    const [formData, setFormData] = useState({
        location: { name: 'Punjab, India', lat: 30.7, lng: 76.7 },
        soil: { n: 100, p: 40, k: 40, ph: 6.5, texture: 'loamy' },
        season: 'Winter',
        constraints: { maxWaterUse: 'Medium', minProfitPerHa: 40000 }
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const userRes = await authAPI.getMe();
            setUser(userRes.data);
            const historyRes = await recommendationsApi.getHistory();
            setHistory(historyRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
    };

    const handleInputChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const runAnalysis = async (isSimulation = false) => {
        setAnalyzing(true);
        try {
            const soilData = isSimulation ? simulatedSoil : formData.soil;
            const response = await recommendationsApi.getRecommendations({
                location: formData.location,
                soil: soilData,
                season: formData.season,
                constraints: formData.constraints
            });

            setAnalysisResult(response.data.recommendations);

            if (!isSimulation) {
                setShowModal(false);
                setIsSimulating(false);
                setSimulatedSoil(formData.soil); // Initialize simulation state
                const historyRes = await recommendationsApi.getHistory();
                setHistory(historyRes.data);
            }
        } catch (err) {
            console.error("Analysis failed", err);
            alert("Analysis failed. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    // Simulation Handlers
    const handleSimulationChange = (field, value) => {
        setSimulatedSoil(prev => ({ ...prev, [field]: value }));
    };

    // Debounced simulation run
    useEffect(() => {
        if (isSimulating && simulatedSoil) {
            const timer = setTimeout(() => {
                runAnalysis(true);
            }, 800); // 800ms debounce
            return () => clearTimeout(timer);
        }
    }, [simulatedSoil]);

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="min-h-screen bg-warm-ivory dark:bg-deep-forest transition-colors flex">
            <Sidebar onLogout={handleLogout} />
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
                <TopBar user={user} onLogout={handleLogout} />

                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <div className="max-w-[1400px] mx-auto space-y-8">
                        {/* Header */}
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-serif font-bold text-dark-green-text dark:text-warm-ivory">
                                    Crop Intelligence
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    AI-driven agronomic advice & soil simulation.
                                </p>
                            </div>
                            {analysisResult && (
                                <button
                                    onClick={() => { setAnalysisResult(null); setShowModal(true); setCurrentStep(1); }}
                                    className="bg-primary-green text-white px-5 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2"
                                >
                                    <Sprout size={18} /> New Analysis
                                </button>
                            )}
                        </div>

                        {/* Main Interaction Area */}
                        {!analysisResult ? (
                            <div className="bg-white dark:bg-white/5 p-12 rounded-3xl border border-stone-200 dark:border-white/10 text-center shadow-sm">
                                <div className="bg-stone-100 dark:bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Sprout size={40} className="text-primary-green" />
                                </div>
                                <h2 className="text-2xl font-bold mb-3 text-dark-green-text dark:text-warm-ivory">Start Guided Analysis</h2>
                                <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto mb-8">
                                    Our enhanced engine analyzes your soil's NPK levels, pH balance, and local constraints to calculate precise crop suitability scores.
                                </p>
                                <button
                                    onClick={() => { setShowModal(true); setCurrentStep(1); }}
                                    className="bg-primary-green text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-primary-green/20 text-lg flex items-center gap-3 mx-auto"
                                >
                                    Start Analysis Flow <ChevronRight size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Simulation Panel */}
                                <div className="bg-gradient-to-r from-stone-50 to-white dark:from-white/5 dark:to-white/10 p-6 rounded-2xl border border-stone-200 dark:border-white/10">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                                <Sliders size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-dark-green-text dark:text-warm-ivory">Soil Simulator</h3>
                                                <p className="text-xs text-gray-500">Adjust values to see real-time impact on suitability.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isSimulating}
                                                    onChange={(e) => setIsSimulating(e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{isSimulating ? 'Simulation ON' : 'Simulation OFF'}</span>
                                            </label>
                                        </div>
                                    </div>

                                    {isSimulating && simulatedSoil && (
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div>
                                                <label className="flex justify-between text-sm font-bold mb-2">
                                                    <span>Nitrogen (N)</span>
                                                    <span className="text-blue-600">{simulatedSoil.n} kg/ha</span>
                                                </label>
                                                <input
                                                    type="range" min="0" max="300"
                                                    value={simulatedSoil.n}
                                                    onChange={(e) => handleSimulationChange('n', Number(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                />
                                            </div>
                                            <div>
                                                <label className="flex justify-between text-sm font-bold mb-2">
                                                    <span>pH Level</span>
                                                    <span className="text-purple-600">{simulatedSoil.ph}</span>
                                                </label>
                                                <input
                                                    type="range" min="4" max="9" step="0.1"
                                                    value={simulatedSoil.ph}
                                                    onChange={(e) => handleSimulationChange('ph', Number(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Results Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <AnimatePresence>
                                        {analysisResult.map((rec, idx) => (
                                            <motion.div
                                                key={rec.cropId}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3 }}
                                                className="bg-white dark:bg-white/5 rounded-2xl md:p-6 p-5 border border-stone-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{rec.cropName}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${rec.marketMomentum === 'High' || rec.marketMomentum === 'Very High' ? 'bg-green-100 text-green-700' :
                                                                rec.marketMomentum === 'Volatile' ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                Market: {rec.marketMomentum || 'Stable'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-3xl font-black text-primary-green">
                                                            {Math.round(rec.suitability)}%
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 uppercase font-bold">Match Score</div>
                                                    </div>
                                                </div>

                                                {/* Metric Bars */}
                                                <div className="space-y-2 mb-4">
                                                    {rec.explanation?.featureContributions?.map((feat, i) => (
                                                        <div key={i} className="flex justify-between items-center text-xs">
                                                            <span className="text-gray-500">{feat.feature}</span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-blue-500 rounded-full"
                                                                        style={{ width: `${feat.contribution * 100}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="bg-stone-50 dark:bg-white/5 p-3 rounded-xl text-sm text-gray-600 dark:text-gray-300 mb-4">
                                                    <p className="flex items-start gap-2">
                                                        <HelpCircle size={14} className="mt-0.5 text-blue-500 shrink-0" />
                                                        {rec.explanation?.ruleMatches?.[0] || 'Suitable based on inputs.'}
                                                    </p>
                                                </div>

                                                <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex gap-2 flex-wrap">
                                                    {rec.soilActions?.note && (
                                                        <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md border border-yellow-200">
                                                            ⚠️ {rec.soilActions.note}
                                                        </span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        {/* Recent History */}
                        {history.length > 0 && !analysisResult && (
                            <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-stone-200 dark:border-white/10">
                                <h3 className="font-bold text-lg mb-4 text-dark-green-text dark:text-warm-ivory">Recent Analysis</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {history.slice(0, 4).map(item => (
                                        <div key={item._id} className="p-4 rounded-xl border border-gray-100 dark:border-white/5 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                                            <div className="flex justify-between">
                                                <span className="font-bold text-gray-800 dark:text-gray-200">{new Date(item.requestedAt).toLocaleDateString()}</span>
                                                <span className="text-sm text-primary-green">{item.results?.[0]?.cropName} Recommended</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{item.inputs?.location?.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* Wizard Modal */}
                <AnimatePresence>
                    {showModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-deep-forest w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden"
                            >
                                {/* Header */}
                                <div className="bg-stone-50 dark:bg-black/20 px-8 py-6 border-b border-gray-100 dark:border-white/10">
                                    <h2 className="text-xl font-bold text-dark-green-text dark:text-warm-ivory">
                                        Step {currentStep} of 3: {STEPS[currentStep - 1].title}
                                    </h2>
                                    <p className="text-sm text-gray-500">{STEPS[currentStep - 1].description}</p>
                                    {/* Progress Bar */}
                                    <div className="mt-4 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-primary-green"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(currentStep / 3) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="p-8 min-h-[300px]">
                                    {currentStep === 1 && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold mb-2">Farm Location</label>
                                                <input
                                                    value={formData.location.name}
                                                    onChange={e => handleInputChange('location', 'name', e.target.value)}
                                                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-2">Season</label>
                                                <select
                                                    value={formData.season}
                                                    onChange={e => setFormData(p => ({ ...p, season: e.target.value }))}
                                                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none transition-all"
                                                >
                                                    <option>Summer (Pre-Monsoon)</option>
                                                    <option>Monsoon (Rainy Season)</option>
                                                    <option>Post-Monsoon (Autumn)</option>
                                                    <option>Winter</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 2 && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold mb-2">Nitrogen (N)</label>
                                                <input
                                                    type="number"
                                                    value={formData.soil.n}
                                                    onChange={e => handleInputChange('soil', 'n', Number(e.target.value))}
                                                    className="w-full p-3 rounded-xl border border-gray-200 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-2">Phosphorus (P)</label>
                                                <input
                                                    type="number"
                                                    value={formData.soil.p}
                                                    onChange={e => handleInputChange('soil', 'p', Number(e.target.value))}
                                                    className="w-full p-3 rounded-xl border border-gray-200 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-2">Potassium (K)</label>
                                                <input
                                                    type="number"
                                                    value={formData.soil.k}
                                                    onChange={e => handleInputChange('soil', 'k', Number(e.target.value))}
                                                    className="w-full p-3 rounded-xl border border-gray-200 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-2">pH Level</label>
                                                <input
                                                    type="number" step="0.1"
                                                    value={formData.soil.ph}
                                                    onChange={e => handleInputChange('soil', 'ph', Number(e.target.value))}
                                                    className="w-full p-3 rounded-xl border border-gray-200 outline-none"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm font-bold mb-2">Soil Texture</label>
                                                <select
                                                    value={formData.soil.texture}
                                                    onChange={e => handleInputChange('soil', 'texture', e.target.value)}
                                                    className="w-full p-3 rounded-xl border border-gray-200 outline-none"
                                                >
                                                    <option value="loamy">Loamy</option>
                                                    <option value="clay">Clay</option>
                                                    <option value="sandy">Sandy</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 3 && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold mb-2">Prioritize Profit?</label>
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => handleInputChange('constraints', 'minProfitPerHa', 50000)}
                                                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${formData.constraints.minProfitPerHa > 40000 ? 'border-primary-green bg-green-50 text-primary-green font-bold' : 'border-gray-200'}`}
                                                    >
                                                        High Returns 💰
                                                    </button>
                                                    <button
                                                        onClick={() => handleInputChange('constraints', 'minProfitPerHa', 20000)}
                                                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${formData.constraints.minProfitPerHa <= 40000 ? 'border-primary-green bg-green-50 text-primary-green font-bold' : 'border-gray-200'}`}
                                                    >
                                                        Safe Bet 🛡️
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="p-6 border-t border-gray-100 dark:border-white/10 flex justify-between">
                                    <button
                                        onClick={currentStep === 1 ? () => setShowModal(false) : prevStep}
                                        className="text-gray-500 font-bold hover:text-gray-800 px-4"
                                    >
                                        {currentStep === 1 ? 'Cancel' : 'Back'}
                                    </button>

                                    {currentStep < 3 ? (
                                        <button
                                            onClick={nextStep}
                                            className="bg-dark-green-text text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2"
                                        >
                                            Next <ChevronRight size={18} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => runAnalysis(false)}
                                            disabled={analyzing}
                                            className="bg-primary-green text-white px-8 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-primary-green/20"
                                        >
                                            {analyzing ? <Loader className="animate-spin" size={18} /> : <Sprout size={18} />}
                                            Run Analysis
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Recommendations;
