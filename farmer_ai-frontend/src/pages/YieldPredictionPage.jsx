import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Minus, Loader2, ArrowLeft,
    BarChart3, Leaf, WifiOff, RefreshCw, ChevronDown,
    Info, CheckCircle, AlertTriangle, Sprout, Thermometer,
    Droplets, FlaskConical, Wind
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/authApi';

/* ─────────────────────────────── helpers ─────────────────────────── */
const fieldIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('rain') || n.includes('water')) return <Droplets size={14} className="text-blue-400" />;
    if (n.includes('temp')) return <Thermometer size={14} className="text-orange-400" />;
    if (n.includes('fertilizer') || n.includes('pesticide') || n.includes('soil'))
        return <FlaskConical size={14} className="text-green-400" />;
    if (n.includes('area') || n.includes('ha') || n.includes('farm'))
        return <Leaf size={14} className="text-emerald-400" />;
    if (n.includes('wind') || n.includes('humidity'))
        return <Wind size={14} className="text-purple-400" />;
    return <Sprout size={14} className="text-gray-400" />;
};

const humanLabel = (col) =>
    col.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/* ─────────────────────────────── component ───────────────────────── */
const YieldPredictionPage = () => {
    const navigate = useNavigate();

    const [mlStatus, setMlStatus] = useState(null);       // null | 'online' | 'offline'
    const [metaLoading, setMetaLoading] = useState(true);
    const [metadata, setMetadata] = useState(null);       // feature columns, valid values, ranges
    const [formValues, setFormValues] = useState({});
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [showAbout, setShowAbout] = useState(false);

    /* ── 1. Health check on mount ────────────────────────────────── */
    useEffect(() => {
        (async () => {
            try {
                const res = await api.get('/api/yield/health');
                const online = res.data?.mlService?.status === 'online';
                setMlStatus(online ? 'online' : 'offline');
            } catch {
                setMlStatus('offline');
            }
        })();
    }, []);

    /* ── 2. Fetch metadata when service is online ─────────────────  */
    useEffect(() => {
        if (mlStatus !== 'online') { setMetaLoading(false); return; }
        (async () => {
            setMetaLoading(true);
            try {
                const res = await api.get('/api/yield/metadata');
                const data = res.data?.data;
                setMetadata(data);
                // Pre-fill with mean values for numeric fields
                const defaults = {};
                data?.numerical_columns?.forEach(col => {
                    const rng = data.numerical_ranges?.[col];
                    if (rng) defaults[col] = rng.mean;
                });
                setFormValues(defaults);
            } catch {
                toast.error('Failed to fetch model metadata');
            } finally {
                setMetaLoading(false);
            }
        })();
    }, [mlStatus]);

    const handleChange = (col, value) => {
        setFormValues(prev => ({ ...prev, [col]: value }));
    };

    const handlePredict = async () => {
        setLoading(true);
        setResult(null);
        try {
            const res = await api.post('/api/yield/predict', { inputs: formValues });
            if (res.data?.prediction) {
                setResult(res.data);
                toast.success('Yield prediction complete!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Prediction failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const retryHealth = async () => {
        setMlStatus(null);
        try {
            const res = await api.get('/api/yield/health');
            setMlStatus(res.data?.mlService?.status === 'online' ? 'online' : 'offline');
        } catch { setMlStatus('offline'); }
    };

    /* ── Metric card ─────────────────────────────────────────────── */
    const MetricCard = ({ label, value, sub, color = 'emerald' }) => (
        <div className={`bg-${color}-50 border border-${color}-100 rounded-xl p-4`}>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-2xl font-black text-${color}-700`}>{value}</p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
    );

    /* ── Performance badge ───────────────────────────────────────── */
    const PerformanceBadge = ({ perf, pct }) => {
        const cfg = {
            'Above Average': { color: 'green', Icon: TrendingUp },
            'Below Average': { color: 'red', Icon: TrendingDown },
            'Average': { color: 'blue', Icon: Minus },
        }[perf] ?? { color: 'gray', Icon: Minus };
        const { color, Icon } = cfg;

        return (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full
                bg-${color}-100 text-${color}-800 font-semibold text-sm`}>
                <Icon size={16} />
                {perf} ({pct > 0 ? '+' : ''}{pct}%)
            </div>
        );
    };

    /* ─────────────────────────────── render ─────────────────────── */
    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">

            {/* Back */}
            <button onClick={() => navigate('/farmer-dashboard')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                <ArrowLeft size={16} /> Back to Dashboard
            </button>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <BarChart3 className="text-emerald-600" size={32} />
                        Crop Yield Predictor
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Predict expected harvest yield using AI trained on global agricultural data.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {mlStatus === 'online' && (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50
                            border border-emerald-200 px-3 py-1.5 rounded-lg font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            AI Model Online
                        </span>
                    )}
                    {metadata?.metrics && (
                        <button onClick={() => setShowAbout(v => !v)}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800
                                bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                            <Info size={12} /> Model Info
                        </button>
                    )}
                </div>
            </div>

            {/* Model info accordion */}
            <AnimatePresence>
                {showAbout && metadata?.metrics && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-blue-50 border border-blue-100 rounded-2xl p-5 overflow-hidden">
                        <h3 className="font-bold text-blue-900 mb-3">About this Model</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            {[
                                ['Algorithm', 'Gradient Boosting + Random Forest + Ridge (Ensemble)'],
                                ['R² Score', metadata.metrics.r2],
                                ['MAE', metadata.metrics.mae],
                                ['CV R²', `${metadata.metrics.cv_r2_mean} ± ${metadata.metrics.cv_r2_std}`],
                            ].map(([k, v]) => (
                                <div key={k} className="bg-white rounded-lg p-3 border border-blue-100">
                                    <p className="text-xs text-blue-400">{k}</p>
                                    <p className="font-bold text-blue-900 text-xs mt-0.5">{String(v)}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Offline banner */}
            {mlStatus === 'offline' && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800
                        rounded-xl px-4 py-3 text-sm">
                    <WifiOff size={18} className="flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <strong>Yield ML Service Offline.</strong> Start it in a terminal:
                        <code className="block mt-1 bg-amber-100 px-2 py-1 rounded text-xs font-mono">
                            cd crop_yield_ml &amp;&amp; uvicorn main:app --port 8001
                        </code>
                    </div>
                    <button onClick={retryHealth}
                        className="flex items-center gap-1 text-amber-700 font-medium text-xs
                            hover:text-amber-900 transition-colors whitespace-nowrap">
                        <RefreshCw size={12} /> Retry
                    </button>
                </motion.div>
            )}

            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                {/* ── Left: Form ──────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Farm & Crop Inputs</h2>

                        {metaLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Loader2 className="animate-spin mb-3" size={28} />
                                <p className="text-sm">Loading model features...</p>
                            </div>
                        ) : !metadata ? (
                            <div className="text-center py-10 text-gray-500">
                                <WifiOff size={32} className="mx-auto mb-3 text-gray-300" />
                                <p className="text-sm">Start the ML service to load the form.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Categorical dropdowns */}
                                {metadata.categorical_columns?.map(col => (
                                    <div key={col}>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                                            {fieldIcon(col)} {humanLabel(col)}
                                        </label>
                                        <select
                                            value={formValues[col] ?? ''}
                                            onChange={e => handleChange(col, e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                                                bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400
                                                focus:border-transparent transition-all"
                                        >
                                            <option value="">— Select {humanLabel(col)} —</option>
                                            {metadata.unique_values?.[col]?.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}

                                {/* Numerical inputs */}
                                {metadata.numerical_columns?.map(col => {
                                    const rng = metadata.numerical_ranges?.[col];
                                    return (
                                        <div key={col}>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                                                {fieldIcon(col)} {humanLabel(col)}
                                                {rng && (
                                                    <span className="ml-auto text-gray-400 text-xs font-normal">
                                                        avg {rng.mean}
                                                    </span>
                                                )}
                                            </label>
                                            <input
                                                type="number"
                                                value={formValues[col] ?? ''}
                                                onChange={e => handleChange(col, parseFloat(e.target.value))}
                                                min={rng?.min} max={rng?.max} step="any"
                                                placeholder={rng ? `${rng.min} – ${rng.max}` : 'Enter value'}
                                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                                                    bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400
                                                    focus:border-transparent transition-all"
                                            />
                                        </div>
                                    );
                                })}

                                {/* Predict button */}
                                <button
                                    onClick={handlePredict}
                                    disabled={loading || mlStatus !== 'online'}
                                    className={`w-full mt-2 py-3 px-4 rounded-xl font-bold flex items-center
                                        justify-center gap-2 transition-all
                                        ${loading || mlStatus !== 'online'
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg'
                                        }`}
                                >
                                    {loading ? (
                                        <><Loader2 className="animate-spin" size={18} /> Predicting...</>
                                    ) : (
                                        <><BarChart3 size={18} /> Predict Yield</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right: Results ──────────────────────────────── */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center text-center p-16
                                    bg-white rounded-2xl border border-gray-100 min-h-[400px]">
                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center
                                    justify-center mb-5 relative">
                                    <div className="absolute inset-0 border-4 border-emerald-100 rounded-full animate-ping" />
                                    <BarChart3 className="text-emerald-500 animate-pulse" size={36} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Running AI Model...</h3>
                                <p className="text-gray-500 text-sm max-w-xs">
                                    Processing your farm data through the ensemble prediction model.
                                </p>
                            </motion.div>

                        ) : result ? (
                            <motion.div key="result" initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }} className="space-y-5">

                                {/* Main yield card */}
                                <div className="bg-gradient-to-br from-emerald-600 to-teal-600
                                    rounded-2xl p-6 text-white shadow-lg">
                                    <p className="text-emerald-200 text-sm mb-1">Predicted Yield</p>
                                    <div className="flex items-end gap-3 mb-3">
                                        <span className="text-6xl font-black">
                                            {result.prediction.predicted_yield.toLocaleString()}
                                        </span>
                                        <span className="text-emerald-200 text-lg mb-2">
                                            {result.prediction.unit}
                                        </span>
                                    </div>
                                    <PerformanceBadge
                                        perf={result.prediction.performance_vs_average}
                                        pct={result.prediction.percent_vs_average}
                                    />
                                    <p className="text-emerald-300 text-xs mt-3">
                                        {result.prediction.confidence_note}
                                    </p>
                                </div>

                                {/* Crop reference stats */}
                                {result.crop_reference?.historical_avg_yield != null && (
                                    <div className="grid grid-cols-3 gap-4">
                                        <MetricCard
                                            label="Historical Avg"
                                            value={result.crop_reference.historical_avg_yield?.toLocaleString()}
                                            sub={result.crop_reference.crop}
                                            color="blue"
                                        />
                                        <MetricCard
                                            label="Historical Min"
                                            value={result.crop_reference.historical_min_yield?.toLocaleString()}
                                            color="orange"
                                        />
                                        <MetricCard
                                            label="Historical Max"
                                            value={result.crop_reference.historical_max_yield?.toLocaleString()}
                                            color="green"
                                        />
                                    </div>
                                )}

                                {/* Recommendations */}
                                {result.recommendations?.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <CheckCircle className="text-emerald-500" size={18} />
                                            Agronomic Recommendations
                                        </h3>
                                        <ul className="space-y-3">
                                            {result.recommendations.map((rec, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm
                                                    text-gray-700 bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                    <Info size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Missing inputs notice */}
                                {result.missing_inputs?.length > 0 && (
                                    <div className="flex items-start gap-2 text-sm text-amber-700
                                        bg-amber-50 border border-amber-100 rounded-xl p-3">
                                        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                                        <span>
                                            <strong>Tip:</strong> Filling in{' '}
                                            <em>{result.missing_inputs.map(humanLabel).join(', ')}</em>{' '}
                                            may improve prediction accuracy.
                                        </span>
                                    </div>
                                )}
                            </motion.div>

                        ) : (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center p-16
                                    bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 min-h-[400px]">
                                <BarChart3 className="text-gray-300 mb-4" size={64} />
                                <h3 className="text-lg font-semibold text-gray-700">No prediction yet</h3>
                                <p className="text-gray-400 text-sm mt-2 max-w-xs">
                                    Fill in your farm parameters on the left and click <strong>Predict Yield</strong>.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default YieldPredictionPage;
