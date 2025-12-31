import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import { recommendationsApi } from '../services/recommendationsApi';
import { authAPI } from '../services/authApi';
import { Sprout, AlertCircle, CheckCircle, X, Loader } from 'lucide-react';

const Recommendations = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState([]);

    // Analysis State
    const [showModal, setShowModal] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    const [formData, setFormData] = useState({
        location: { name: 'Punjab, India', lat: 30.7, lng: 76.7 },
        soil: { n: 100, p: 40, k: 40, ph: 6.5, texture: 'loamy' },
        season: 'Rabi',
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

    const handleDirectChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const runAnalysis = async () => {
        setAnalyzing(true);
        try {
            const response = await recommendationsApi.getRecommendations({
                location: formData.location,
                soil: formData.soil,
                season: formData.season,
                constraints: formData.constraints
            });
            setAnalysisResult(response.data.recommendations);
            setShowModal(false);
            // Refresh history
            const historyRes = await recommendationsApi.getHistory();
            setHistory(historyRes.data);
        } catch (err) {
            console.error("Analysis failed", err);
            alert("Analysis failed. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-warm-ivory dark:bg-deep-forest transition-colors flex">
            <Sidebar onLogout={handleLogout} />
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
                <TopBar user={user} onLogout={handleLogout} />

                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <div className="max-w-[1400px] mx-auto space-y-6">
                        <h1 className="text-3xl font-serif font-bold text-dark-green-text dark:text-warm-ivory">
                            Crop Recommendations
                        </h1>

                        {/* Main Action Area */}
                        {!analysisResult ? (
                            <div className="bg-white dark:bg-white/5 p-8 rounded-2xl border border-stone-200 dark:border-white/10 text-center">
                                <Sprout size={48} className="mx-auto text-primary-green mb-4" />
                                <h2 className="text-xl font-bold mb-2 text-dark-green-text dark:text-warm-ivory">AI Advisory Engine</h2>
                                <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto mb-6">
                                    Get personalized crop recommendations based on your soil health, local climate, and market trends.
                                </p>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="bg-primary-green text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-primary-green/20"
                                >
                                    Start New Analysis
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-dark-green-text dark:text-warm-ivory">Analysis Results</h2>
                                    <button
                                        onClick={() => setAnalysisResult(null)}
                                        className="text-sm text-gray-500 hover:text-primary-green underline"
                                    >
                                        Start Over
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {analysisResult.map((rec, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-stone-200 dark:border-white/10 shadow-sm relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 bg-accent-gold text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                                {rec.suitability?.toFixed(0)}% Match
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{rec.cropName}</h3>

                                            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                                <div className="flex justify-between">
                                                    <span>Yield Potential:</span>
                                                    <span className="font-bold">{rec.estimatedYieldKgHa} kg/ha</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Est. Profit:</span>
                                                    <span className="font-bold text-green-600">₹{rec.expectedProfitPerHa}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Risk:</span>
                                                    <span className="text-orange-500 font-medium">{rec.riskFactors?.[0] || 'Low'}</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                                <p className="text-xs text-gray-400 mb-2">Soil Actions Needed:</p>
                                                <div className="flex gap-2 flex-wrap">
                                                    {rec.soilActions?.addNkgHa > 0 && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded">+N {rec.soilActions.addNkgHa}</span>}
                                                    {rec.soilActions?.addPkgHa > 0 && <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded">+P {rec.soilActions.addPkgHa}</span>}
                                                    {rec.soilActions?.note && <span className="text-[10px] bg-gray-50 text-gray-600 px-2 py-1 rounded truncate max-w-full">{rec.soilActions.note}</span>}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* History List */}
                        {history.length > 0 && (
                            <div className="bg-stone-50 dark:bg-white/5 rounded-2xl p-6">
                                <h3 className="font-bold text-lg mb-4 text-dark-green-text dark:text-warm-ivory">Recent Analysis</h3>
                                <div className="space-y-2">
                                    {history.map(item => (
                                        <div key={item._id} className="bg-white dark:bg-black/20 p-4 rounded-xl border border-stone-200 dark:border-white/10 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold">{new Date(item.requestedAt).toLocaleDateString()}</p>
                                                <p className="text-xs text-gray-500">{item.inputs?.location?.name || 'Unknown Location'}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                                                    Completed
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* Analysis Modal */}
                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.95 }}
                                className="bg-white dark:bg-deep-forest w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
                            >
                                <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                                    <h3 className="text-xl font-serif font-bold text-dark-green-text dark:text-warm-ivory">New Crop Analysis</h3>
                                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                                    {/* Location & Season Removed as per request */}

                                    {/* Soil Section */}
                                    <div>
                                        <h4 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-3">Soil Composition</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Nitrogen (N)</label>
                                                <input
                                                    type="number"
                                                    value={formData.soil.n}
                                                    onChange={(e) => handleInputChange('soil', 'n', Number(e.target.value))}
                                                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Phosphorus (P)</label>
                                                <input
                                                    type="number"
                                                    value={formData.soil.p}
                                                    onChange={(e) => handleInputChange('soil', 'p', Number(e.target.value))}
                                                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Potassium (K)</label>
                                                <input
                                                    type="number"
                                                    value={formData.soil.k}
                                                    onChange={(e) => handleInputChange('soil', 'k', Number(e.target.value))}
                                                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">pH Level</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={formData.soil.ph}
                                                    onChange={(e) => handleInputChange('soil', 'ph', Number(e.target.value))}
                                                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-black/10 flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-2 rounded-xl font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={runAnalysis}
                                        disabled={analyzing}
                                        className="px-6 py-2 rounded-xl font-bold bg-primary-green text-white hover:bg-emerald-700 transition-colors flex items-center gap-2"
                                    >
                                        {analyzing ? (
                                            <>
                                                <Loader className="animate-spin" size={18} />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Sprout size={18} />
                                                Run Analysis
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Recommendations;
