import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sprout,
    Droplets,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
    MapPin,
    Calendar,
    ChevronDown,
    ChevronUp,
    Info,
    Leaf
} from 'lucide-react';
import { recommendationsApi } from '../services/recommendationsApi';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import { useAuth } from '../context/AuthContext';
import WeatherAlertsWidget from '../components/weather/WeatherAlertsWidget';

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[var(--admin-accent)]/10 flex items-center justify-center">
            <Icon className="text-[var(--admin-accent)]" size={20} />
        </div>
        <div>
            <h2 className="text-xl font-bold text-[var(--admin-text-primary)]">{title}</h2>
            {subtitle && <p className="text-sm text-[var(--admin-text-secondary)]">{subtitle}</p>}
        </div>
    </div>
);

const InputCard = ({ icon: Icon, label, value, subtext, color = "blue" }) => (
    <div className="bg-white p-4 rounded-xl border border-[var(--admin-border)] shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-2">
            <span className="text-sm text-[var(--admin-text-secondary)] font-medium">{label}</span>
            <div className={`p-1.5 rounded-lg bg-${color}-50 text-${color}-600`}>
                <Icon size={16} />
            </div>
        </div>
        <div className="font-bold text-[var(--admin-text-primary)] text-lg mb-1">{value}</div>
        {subtext && <div className="text-xs text-[var(--admin-text-secondary)]">{subtext}</div>}
    </div>
);

const RecommendationCard = ({ rec, index }) => {
    const [expanded, setExpanded] = useState(false);
    const isAdvisory = rec.isAdvisory;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
                relative overflow-hidden rounded-2xl border transition-all duration-300
                ${expanded ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}
                ${isAdvisory
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-white border-[var(--admin-border)]'
                }
            `}
        >
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className={`
                            w-14 h-14 rounded-2xl flex items-center justify-center shrink-0
                            ${isAdvisory ? 'bg-amber-100 text-amber-600' : 'bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]'}
                        `}>
                            {isAdvisory ? <AlertCircle size={28} /> : <Sprout size={28} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-[var(--admin-text-primary)]">{rec.cropName}</h3>
                                {!isAdvisory && (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
                                        {rec.suitability}% Match
                                    </span>
                                )}
                            </div>
                            <p className="text-[var(--admin-text-secondary)] text-sm">{rec.explanation?.marketReasoning}</p>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                {!isAdvisory && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-3 rounded-xl bg-[var(--admin-bg-secondary)]">
                            <div className="text-xs text-[var(--admin-text-secondary)] mb-1">Potential Yield</div>
                            <div className="font-semibold text-[var(--admin-text-primary)]">
                                {rec.estimatedYieldKgHa?.toLocaleString()} kg/ha
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-[var(--admin-bg-secondary)]">
                            <div className="text-xs text-[var(--admin-text-secondary)] mb-1">Exp. Profit</div>
                            <div className="font-semibold text-emerald-600">
                                ₹{rec.expectedProfitPerHa?.toLocaleString()}
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-[var(--admin-bg-secondary)]">
                            <div className="text-xs text-[var(--admin-text-secondary)] mb-1">Market Trend</div>
                            <div className="font-semibold text-blue-600 flex items-center gap-1">
                                <TrendingUp size={14} />
                                {rec.marketMomentum || 'Stable'}
                            </div>
                        </div>
                    </div>
                )}

                {/* Contextual Explanation (The "Why?") */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-white/50 border border-black/5 hover:bg-white/80 transition-colors"
                >
                    <span className="text-sm font-medium flex items-center gap-2 text-[var(--admin-text-primary)]">
                        <Info size={16} className="text-[var(--admin-accent)]" />
                        Why is this recommended for my farm?
                    </span>
                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 space-y-3">
                                <p className="text-sm font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider text-xs">
                                    Analysis Factors
                                </p>
                                <ul className="space-y-2">
                                    {rec.explanation?.ruleMatches?.map((rule, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-[var(--admin-text-primary)] bg-white p-3 rounded-lg border border-[var(--admin-border)]">
                                            <CheckCircle2 size={16} className="text-[var(--admin-accent)] mt-0.5 shrink-0" />
                                            <span className="leading-relaxed">{rule}</span>
                                        </li>
                                    ))}
                                </ul>

                                {rec.riskFactors?.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-black/5">
                                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <AlertCircle size={14} /> Risk Factors
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {rec.riskFactors.map((risk, i) => (
                                                <span key={i} className="px-2 py-1 rounded-md bg-amber-100 text-amber-700 text-xs font-medium border border-amber-200">
                                                    {risk}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Color Bar */}
            <div className={`h-1.5 w-full ${isAdvisory ? 'bg-amber-400' : 'bg-gradient-to-r from-[var(--admin-accent)] to-emerald-400'}`} />
        </motion.div>
    );
};

const AiRecommendationsPage = () => {
    const { farmId } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (farmId) {
            fetchRecommendations();
        }
    }, [farmId]);

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            const response = await recommendationsApi.getFarmRecommendations(farmId);
            setData(response.data.data); // Assuming response structure { success: true, data: { ... } }
        } catch (err) {
            console.error(err);
            setError("Unable to generate recommendations at this time.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--admin-bg-primary)] flex items-center justify-center flex-col gap-4">
                <div className="w-16 h-16 border-4 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin"></div>
                <div className="text-center">
                    <h3 className="text-lg font-bold text-[var(--admin-text-primary)]">Analyzing Farm Data...</h3>
                    <p className="text-[var(--admin-text-secondary)]">Consulting agronomy rules and historical yields</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[var(--admin-bg-primary)] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <AlertCircle size={48} className="mx-auto text-[var(--admin-danger)] mb-4" />
                    <h2 className="text-xl font-bold mb-2">Analysis Failed</h2>
                    <p className="text-gray-600 mb-6">{error || "No data available."}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-[var(--admin-accent)] text-white px-6 py-3 rounded-xl font-semibold w-full"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const { inputs, results } = data;

    return (
        <div className="min-h-screen flex admin-layout bg-[var(--admin-bg-primary)]">
            <Sidebar onLogout={logout} />

            <main className="flex-1 md:ml-64 p-6 overflow-y-auto">
                <TopBar user={user} onLogout={logout} />

                <div className="max-w-7xl mx-auto mt-6 space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors mb-2"
                            >
                                <ArrowLeft size={18} />
                                Back to Dashboard
                            </button>
                            <h1 className="text-3xl font-bold text-[var(--admin-text-primary)]">
                                AI Farm Intelligence
                            </h1>
                            <p className="text-[var(--admin-text-secondary)] flex items-center gap-2 mt-1">
                                <MapPin size={16} />
                                {inputs.location.name}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-[var(--admin-border)]">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-sm font-medium text-[var(--admin-text-primary)]">
                                Analysis Confidence: <span className="text-[var(--admin-accent)]">{(data.confidenceScore * 100).toFixed(0)}%</span>
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* LEFT COLUMN: Context/Inputs */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Weather Alerts Widget */}
                            <WeatherAlertsWidget 
                                farmId={farmId} 
                                farmLocation={inputs.location}
                            />
                            
                            <div>
                                <h3 className="text-sm font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-4">
                                    Farm Context Used
                                </h3>
                                <div className="space-y-3">
                                    <InputCard
                                        icon={Sprout}
                                        label="Soil Type"
                                        value={inputs.soil.type}
                                        subtext={`pH: ${inputs.soil.ph || 'N/A'}, N: ${inputs.soil.n || 'N/A'}`}
                                    />
                                    <InputCard
                                        icon={Droplets}
                                        label="Irrigation"
                                        value={inputs.irrigation.type}
                                        subtext={inputs.irrigation.source}
                                        color="blue"
                                    />
                                    <InputCard
                                        icon={Calendar}
                                        label="Season"
                                        value={inputs.season}
                                        color="amber"
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                    <Info size={16} />
                                    How this works
                                </h4>
                                <p className="text-xs text-blue-800 leading-relaxed">
                                    Our AI analyzes your specific farm data against thousands of agronomy rules to suggest crops that maximize profit while minimizing risk.
                                </p>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Recommendations */}
                        <div className="lg:col-span-3">
                            <SectionHeader
                                icon={Leaf}
                                title="Strategic Recommendations"
                                subtitle="Personalized suggestions based on your soil, water, and market conditions."
                            />

                            <div className="space-y-4">
                                {results.map((rec, index) => (
                                    <RecommendationCard key={rec._id || index} rec={rec} index={index} />
                                ))}

                                {results.length === 0 && (
                                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[var(--admin-border)]">
                                        <Sprout size={48} className="mx-auto text-[var(--admin-text-muted)] mb-4" />
                                        <p className="text-[var(--admin-text-secondary)]">
                                            No specific recommendations found for the current data.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AiRecommendationsPage;
