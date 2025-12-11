import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Upload, TrendingUp, AlertTriangle, CheckCircle, Info, Save, RotateCcw } from 'lucide-react';
import recommendationsApi from '../services/recommendationsApi';
import Sidebar from '../components/dashboard/Sidebar';

// Utility for animations
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

const Recommendations = () => {
    // State
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState(null);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('new'); // 'new' | 'history'

    // Inputs
    const [inputs, setInputs] = useState({
        location: { name: '', lat: '', lng: '' },
        soil: { n: '', p: '', k: '', ph: '', texture: 'loamy' }, // defaults
        season: 'kharif',
        marketTrends: [] // To be implemented with file upload
    });

    // Mock Market Data (simplification for UI)
    const [marketFile, setMarketFile] = useState(null);

    // Fetch History on mount
    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const res = await recommendationsApi.getHistory();
            setHistory(res.data);
        } catch (err) {
            console.error('Failed to load history', err);
        }
    };

    const handleInputChange = (e, section) => {
        const { name, value } = e.target;
        if (section) {
            setInputs(prev => ({
                ...prev,
                [section]: { ...prev[section], [name]: value }
            }));
        } else {
            setInputs(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleGetRecommendations = async () => {
        setLoading(true);
        try {
            // Clean inputs for API (convert strings to numbers)
            const payload = {
                ...inputs,
                soil: {
                    n: Number(inputs.soil.n),
                    p: Number(inputs.soil.p),
                    k: Number(inputs.soil.k),
                    ph: Number(inputs.soil.ph),
                    texture: inputs.soil.texture
                },
                location: {
                    ...inputs.location,
                    lat: Number(inputs.location.lat) || 0,
                    lng: Number(inputs.location.lng) || 0
                }
            };

            const res = await recommendationsApi.getRecommendations(payload);
            setRecommendations(res.data);
            loadHistory(); // refresh history
        } catch (err) {
            console.error(err);
            alert('Failed to get recommendations. Please check inputs.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (id) => {
        try {
            await recommendationsApi.saveRecommendation(id, 'adopted');
            alert('Recommendation saved to your history!');
            loadHistory();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex min-h-screen bg-warm-ivory dark:bg-deep-forest text-dark-green-text dark:text-warm-ivory">
            <Sidebar />

            <main className="flex-1 md:ml-64 p-6 overflow-y-auto">
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex justify-between items-end">
                        <motion.div {...fadeInUp}>
                            <h1 className="text-3xl font-serif font-bold">Crop Recommendations</h1>
                            <p className="opacity-70">AI-driven insights based on soil health and market trends.</p>
                        </motion.div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('new')}
                                className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'new' ? 'bg-primary-green text-white' : 'bg-white/10'}`}
                            >
                                New Run
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'history' ? 'bg-primary-green text-white' : 'bg-white/10'}`}
                            >
                                History
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'new' ? (
                            <motion.div
                                key="new"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                            >
                                {/* Left Panel: Inputs */}
                                <div className="lg:col-span-4 space-y-6">
                                    {/* Location Card */}
                                    <div className="bg-white dark:bg-card-dark p-6 rounded-2xl shadow-sm border border-border-light dark:border-border-dark">
                                        <h3 className="font-bold flex items-center gap-2 mb-4 text-lg">
                                            <Sprout className="text-primary-green" size={20} />
                                            Field & Soil
                                        </h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-bold uppercase tracking-wider opacity-60">Location Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={inputs.location.name}
                                                    onChange={(e) => handleInputChange(e, 'location')}
                                                    placeholder="e.g. North Field"
                                                    className="w-full mt-1 p-2 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-accent-gold outline-none transition-colors"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-wider opacity-60">Soil N (kg/ha)</label>
                                                    <input
                                                        type="number"
                                                        name="n"
                                                        value={inputs.soil.n}
                                                        onChange={(e) => handleInputChange(e, 'soil')}
                                                        className="w-full mt-1 p-2 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-accent-gold outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-wider opacity-60">Soil P (kg/ha)</label>
                                                    <input
                                                        type="number"
                                                        name="p"
                                                        value={inputs.soil.p}
                                                        onChange={(e) => handleInputChange(e, 'soil')}
                                                        className="w-full mt-1 p-2 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-accent-gold outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-wider opacity-60">Soil K (kg/ha)</label>
                                                    <input
                                                        type="number"
                                                        name="k"
                                                        value={inputs.soil.k}
                                                        onChange={(e) => handleInputChange(e, 'soil')}
                                                        className="w-full mt-1 p-2 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-accent-gold outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-wider opacity-60">pH Level</label>
                                                    <input
                                                        type="number"
                                                        name="ph"
                                                        step="0.1"
                                                        value={inputs.soil.ph}
                                                        onChange={(e) => handleInputChange(e, 'soil')}
                                                        className="w-full mt-1 p-2 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-accent-gold outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold uppercase tracking-wider opacity-60">Texture</label>
                                                <select
                                                    name="texture"
                                                    value={inputs.soil.texture}
                                                    onChange={(e) => handleInputChange(e, 'soil')}
                                                    className="w-full mt-1 p-2 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-accent-gold outline-none"
                                                >
                                                    <option value="loamy">Loamy</option>
                                                    <option value="clay">Clay</option>
                                                    <option value="sandy">Sandy</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Market Input */}
                                    <div className="bg-white dark:bg-card-dark p-6 rounded-2xl shadow-sm border border-border-light dark:border-border-dark">
                                        <h3 className="font-bold flex items-center gap-2 mb-4 text-lg">
                                            <TrendingUp className="text-accent-gold" size={20} />
                                            Market Trends
                                        </h3>
                                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                                            <Upload className="mx-auto text-gray-400 mb-2" />
                                            <p className="text-sm font-medium">Upload Price CSV</p>
                                            <p className="text-xs text-gray-500 mt-1">or drag and drop file here</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleGetRecommendations}
                                        disabled={loading}
                                        className="w-full py-4 bg-primary-green hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? 'Analyzing...' : 'Get Recommendations'}
                                        {!loading && <Sprout size={20} />}
                                    </button>
                                </div>

                                {/* Right Panel: Results */}
                                <div className="lg:col-span-8">
                                    {!recommendations ? (
                                        <div className="h-full flex flex-col items-center justify-center opacity-40 text-center p-12 border-2 border-dashed border-gray-300 rounded-3xl">
                                            <Sprout size={48} className="mb-4 text-gra" />
                                            <h3 className="text-xl font-bold">Ready to Analyze</h3>
                                            <p>Enter your soil parameters and click the button to generate AI-driven crop recommendations.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-xl font-bold">Top Recommendations</h2>
                                                <span className="text-xs bg-accent-gold/20 text-accent-gold px-3 py-1 rounded-full border border-accent-gold/40">
                                                    AI Model v{recommendations.modelVersion}
                                                </span>
                                            </div>

                                            <div className="grid gap-4">
                                                {recommendations.recommendations.map((crop, index) => (
                                                    <motion.div
                                                        key={crop.cropId}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="bg-white dark:bg-card-dark p-6 rounded-2xl shadow-sm border border-border-light dark:border-border-dark relative overflow-hidden group hover:shadow-md transition-all"
                                                    >
                                                        {/* Rank Badge */}
                                                        <div className="absolute top-0 right-0 p-4 opacity-10 font-serif text-6xl font-black">
                                                            #{index + 1}
                                                        </div>

                                                        <div className="flex flex-col md:flex-row gap-6 relative z-10">

                                                            {/* Crop Info */}
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <div className={`w-3 h-3 rounded-full ${crop.suitability > 0.8 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                                                    <h3 className="text-2xl font-serif font-bold">{crop.cropName}</h3>
                                                                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded">
                                                                        Match: {Math.round(crop.suitability * 100)}%
                                                                    </span>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                                                                    <div>
                                                                        <p className="opacity-60 text-xs uppercase">Est. Yield</p>
                                                                        <p className="font-bold font-mono">{crop.estimatedYieldKgHa.toLocaleString()} kg/ha</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="opacity-60 text-xs uppercase">Profit Potential</p>
                                                                        <p className="font-bold font-mono text-accent-gold">₹{crop.expectedProfitPerHa.toLocaleString()}</p>
                                                                    </div>
                                                                </div>

                                                                {/* Soil Actions */}
                                                                <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg text-sm border border-blue-100 dark:border-blue-800/30">
                                                                    <p className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-300 mb-1">
                                                                        <Info size={14} /> Recommended Soil Actions:
                                                                    </p>
                                                                    <ul className="list-disc list-inside space-y-1 opacity-80 pl-1">
                                                                        {crop.soilActions.limeKgHa > 0 && (
                                                                            <li>Apply <b>{crop.soilActions.limeKgHa} kg/ha</b> Lime for pH correction</li>
                                                                        )}
                                                                        {crop.soilActions.addNkgHa > 0 && (
                                                                            <li>Add <b>{crop.soilActions.addNkgHa} kg/ha</b> Nitrogen (Urea)</li>
                                                                        )}
                                                                        {!crop.soilActions.limeKgHa && !crop.soilActions.addNkgHa && (
                                                                            <li>Soil conditions are optimal. No major amendments needed.</li>
                                                                        )}
                                                                    </ul>
                                                                </div>
                                                            </div>

                                                            {/* Actions & Explanation */}
                                                            <div className="flex flex-col justify-between items-end border-l border-gray-100 dark:border-white/5 pl-6">
                                                                <div className="text-right">
                                                                    <p className="text-xs opacity-50 mb-1">Key Factors</p>
                                                                    {crop.explanation.featureContributions.map((fc, i) => (
                                                                        <div key={i} className="text-xs flex items-center justify-end gap-2 mb-1">
                                                                            <span>{fc.feature}</span>
                                                                            <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className="h-full bg-primary-green"
                                                                                    style={{ width: `${Math.min(fc.contribution * 100, 100)}%` }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                <button
                                                                    onClick={() => handleSave(recommendations.id)}
                                                                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-white dark:bg-transparent border border-gray-200 dark:border-white/20 hover:border-primary-green text-sm rounded-lg transition-colors"
                                                                >
                                                                    <Save size={16} /> Save Plan
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="history"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                <h2 className="text-xl font-bold mb-6">Past Recommendations</h2>
                                {history.length === 0 && <p className="opacity-50">No history found.</p>}
                                {history.map(item => (
                                    <div key={item._id} className="bg-white dark:bg-card-dark p-4 rounded-xl flex justify-between items-center shadow-sm">
                                        <div>
                                            <p className="font-bold flex items-center gap-2">
                                                {new Date(item.requestedAt).toLocaleDateString()}
                                                <span className="text-xs font-normal opacity-60 px-2 py-0.5 border rounded-full">
                                                    {item.inputs.location.name || 'Unnamed Location'}
                                                </span>
                                            </p>
                                            <p className="text-sm opacity-70 mt-1">
                                                Top Pick: <b>{item.results[0]?.cropName}</b>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${item.status === 'adopted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {item.status}
                                            </span>
                                            <button className="p-2 hover:bg-gray-100 rounded-full">
                                                <RotateCcw size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </main>
        </div>
    );
};

export default Recommendations;
