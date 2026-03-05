import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Droplets, Thermometer, Wind, Activity, Zap,
    BrainCircuit, Power, RefreshCw, BarChart2, Wifi, WifiOff
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area,
    BarChart, Bar, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/authApi';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';

// ─── Adafruit IO Config ────────────────────────────────────────────────────────
const AIO_USERNAME = import.meta.env.VITE_AIO_USERNAME || '';
const AIO_KEY = import.meta.env.VITE_AIO_KEY || '';
const AIO_BASE = `https://io.adafruit.com/api/v2/${AIO_USERNAME}/feeds`;
const AIO_HEADERS = { 'X-AIO-Key': AIO_KEY, 'Content-Type': 'application/json' };

const aioFetch = (feed) =>
    fetch(`${AIO_BASE}/${feed}/data/last`, { headers: AIO_HEADERS })
        .then(r => r.json())
        .then(d => parseFloat(d.value) || 0);

const aioPublish = (feed, value) =>
    fetch(`${AIO_BASE}/${feed}/data`, {
        method: 'POST',
        headers: AIO_HEADERS,
        body: JSON.stringify({ value: String(value) }),
    });

// ─── AI Command Derivation ────────────────────────────────────────────────────
const getAICommand = (soilMoisture) => {
    if (soilMoisture < 35) return { label: 'IRRIGATION REQUIRED', color: 'teal', needed: true };
    if (soilMoisture <= 60) return { label: 'MONITOR CONDITIONS', color: 'amber', needed: false };
    return { label: 'NO IRRIGATION NEEDED', color: 'slate', needed: false };
};

// ─── AI Command Badge ─────────────────────────────────────────────────────────
const AICommandBadge = ({ command }) => {
    const styles = {
        teal: 'bg-teal-500/20  text-teal-300  border-teal-500/30  animate-pulse',
        amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        slate: 'bg-slate-700    text-slate-300 border-slate-600',
    };
    return (
        <span className={`px-3 py-1 font-bold border rounded-full text-xs ${styles[command.color]}`}>
            {command.label}
        </span>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SmartIrrigationDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleLogout = async () => {
        try {
            await authAPI.logout();
            localStorage.removeItem('auth_token');
            navigate('/login');
        } catch (err) {
            console.error('Logout error', err);
        }
    };

    // ── State ─────────────────────────────────────────────────────────────────
    const [connected, setConnected] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [fetchError, setFetchError] = useState(null);

    const [sensorData, setSensorData] = useState({
        temperature: null,
        humidity: null,
        soilMoisture: null,
        waterFlow: null,
    });

    const [aiCommand, setAiCommand] = useState(getAICommand(100)); // default: no irrigation
    const [pumpActive, setPumpActive] = useState(false);
    const [pumpLoading, setPumpLoading] = useState(false);
    const [manualOverride, setManualOverride] = useState(false);

    const [historicalData, setHistoricalData] = useState([]);
    const [estimatedWaterUsed, setEstimatedWaterUsed] = useState(0);
    const waterIntervalRef = useRef(null);

    // ── Adafruit IO Fetch ─────────────────────────────────────────────────────
    const fetchAdafruitFeeds = useCallback(async () => {
        try {
            const [temp, hum, soil] = await Promise.all([
                aioFetch('dht-temp'),
                aioFetch('dht-hum'),
                aioFetch('soil-moisture'),
            ]);

            const reading = {
                temperature: temp,
                humidity: hum,
                soilMoisture: soil,
                waterFlow: null, // water-pump feed is output-only
            };

            setSensorData(reading);
            setLastUpdated(Date.now());
            setFetchError(null);
            setConnected(true);

            // Append to history
            setHistoricalData(prev => {
                const point = {
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    temperature: temp,
                    humidity: hum,
                    soilMoisture: soil,
                };
                const last = prev[prev.length - 1];
                if (last && last.time === point.time) return prev;
                const updated = [...prev, point];
                return updated.length > 50 ? updated.slice(-50) : updated;
            });

        } catch (err) {
            console.error('Adafruit IO fetch failed:', err);
            setFetchError('Cannot reach Adafruit IO. Check your network.');
            setConnected(false);
        }
    }, []);

    // ── Polling (every 4 seconds) ─────────────────────────────────────────────
    useEffect(() => {
        fetchAdafruitFeeds();
        const id = setInterval(fetchAdafruitFeeds, 4000);
        return () => clearInterval(id);
    }, [fetchAdafruitFeeds]);

    // ── Pump Command (Adafruit IO) ─────────────────────────────────────────────
    const sendPumpCommand = async (on) => {
        setPumpLoading(true);
        try {
            await aioPublish('water-pump', on ? 1 : 0);
            setPumpActive(on);
        } catch (err) {
            console.error('Pump command failed:', err);
        } finally {
            setPumpLoading(false);
        }
    };

    // ── Dynamic AI Decision Logic ────────────────────────────────────────────
    useEffect(() => {
        const soil = sensorData.soilMoisture;
        if (soil === null) return;

        let shouldPump = false;

        if (soil < 35) {
            setAiCommand({ label: 'IRRIGATION REQUIRED', color: 'teal', needed: true });
            shouldPump = true;
        } else if (soil >= 35 && soil <= 60) {
            setAiCommand({ label: 'MONITOR CONDITIONS', color: 'amber', needed: false });
            shouldPump = false;
        } else {
            setAiCommand({ label: 'NO IRRIGATION NEEDED', color: 'slate', needed: false });
            shouldPump = false;
        }

        // Apply automatic pump control
        if (!manualOverride && shouldPump !== pumpActive) {
            sendPumpCommand(shouldPump);
        }
    }, [sensorData.soilMoisture, manualOverride, pumpActive]);

    const handleManualPumpToggle = async () => {
        setManualOverride(true);
        await sendPumpCommand(!pumpActive);
    };

    // ── Water Usage Accumulator ───────────────────────────────────────────────
    useEffect(() => {
        if (pumpActive) {
            waterIntervalRef.current = setInterval(() => {
                // Assume 0.5 L/min flow when pump is on if no real flow sensor
                setEstimatedWaterUsed(prev => parseFloat((prev + 0.5 / 60).toFixed(3)));
            }, 1000);
        } else {
            clearInterval(waterIntervalRef.current);
        }
        return () => clearInterval(waterIntervalRef.current);
    }, [pumpActive]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const getMoistureStyle = (v) => {
        if (v === null) return { col: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200' };
        if (v < 35) return { col: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' };
        if (v <= 60) return { col: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' };
        return { col: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' };
    };

    const fmt = (v, dec = 1) => (v !== null && v !== undefined ? Number(v).toFixed(dec) : '—');

    const moistureStyle = getMoistureStyle(sensorData.soilMoisture);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="flex h-screen bg-[#F8FAF9] font-sans overflow-hidden">
            <Sidebar onLogout={handleLogout} />

            <div className="flex-1 flex flex-col min-w-0 md:ml-64">
                <TopBar user={user} onLogout={handleLogout} />

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">

                        {/* ── Header ─────────────────────────────────────────── */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <Droplets size={28} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Smart Irrigation Command</h1>
                                    <p className="text-slate-500 font-medium tracking-wide flex flex-wrap items-center gap-2">
                                        Live telemetry via Adafruit IO &bull; ESP32
                                        <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-bold ${connected ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
                                            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                            {connected ? 'AIO LIVE' : 'CONNECTING…'}
                                        </span>
                                        {lastUpdated && (
                                            <span className="text-xs text-slate-400 font-normal">
                                                Last update: {new Date(lastUpdated).toLocaleTimeString()}
                                            </span>
                                        )}
                                    </p>
                                    {fetchError && (
                                        <p className="text-xs text-rose-500 mt-1">{fetchError}</p>
                                    )}
                                </div>
                            </div>
                            {/* Manual Refresh */}
                            <button
                                onClick={fetchAdafruitFeeds}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold text-slate-600 transition-colors"
                            >
                                <RefreshCw size={14} /> Refresh Now
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                            {/* ── LEFT COLUMN ─────────────────────────────── */}
                            <div className="lg:col-span-4 space-y-6">

                                {/* Field Telemetry Feed */}
                                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-teal-400 to-emerald-400" />
                                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <Activity className="text-teal-500" size={20} /> Field Telemetry Feed
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Soil Moisture */}
                                        <motion.div
                                            className={`p-4 rounded-2xl border ${moistureStyle.bg} ${moistureStyle.border} flex flex-col items-center justify-center text-center transition-colors duration-500`}
                                            animate={{ scale: [1, 1.02, 1] }}
                                            transition={{ repeat: Infinity, duration: 5 }}
                                        >
                                            <Droplets size={24} className={`${moistureStyle.col} mb-2`} />
                                            <span className={`text-4xl font-black ${moistureStyle.col} tracking-tighter`}>
                                                {fmt(sensorData.soilMoisture, 0)}%
                                            </span>
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">Soil Moisture</span>
                                        </motion.div>

                                        {/* Temperature */}
                                        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col items-center justify-center text-center hover:bg-white transition-colors">
                                            <Thermometer size={24} className="text-orange-500 mb-2" />
                                            <span className="text-4xl font-black text-slate-800 tracking-tighter">{fmt(sensorData.temperature)}°</span>
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">Temperature</span>
                                        </div>

                                        {/* Humidity */}
                                        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col items-center justify-center text-center hover:bg-white transition-colors">
                                            <Wind size={24} className="text-sky-500 mb-2" />
                                            <span className="text-4xl font-black text-slate-800 tracking-tighter">{fmt(sensorData.humidity, 0)}%</span>
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">Humidity</span>
                                        </div>

                                        {/* Water Used */}
                                        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col items-center justify-center text-center hover:bg-white transition-colors">
                                            <RefreshCw size={24} className={`mb-2 ${pumpActive ? 'text-blue-500 animate-spin' : 'text-slate-400'}`} />
                                            <span className="text-3xl font-black text-slate-800 tracking-tighter">{estimatedWaterUsed.toFixed(2)}</span>
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">Water Used (L)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Deepmind AI Engine + Pump Control */}
                                <div className="bg-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden text-white">
                                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500 opacity-20 rounded-full blur-3xl" />
                                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500 opacity-20 rounded-full blur-3xl" />

                                    <div className="relative z-10">
                                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                            <BrainCircuit className="text-teal-400" size={20} /> Deepmind AI Engine
                                        </h3>

                                        {/* AI Decision */}
                                        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700 mb-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">AI Command</span>
                                                <AICommandBadge command={aiCommand} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Soil Moisture</p>
                                                    <p className="text-2xl font-black text-white">
                                                        {fmt(sensorData.soilMoisture, 0)}<span className="text-sm font-normal text-slate-400">%</span>
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">AIO Source</p>
                                                    <p className="text-sm font-bold text-teal-400">soil-moisture</p>
                                                    <p className="text-xs text-slate-500">@{AIO_USERNAME}</p>
                                                </div>
                                            </div>

                                            {/* AI Logic Thresholds */}
                                            <div className="mt-4 space-y-1.5">
                                                {[
                                                    { label: '< 35%', desc: 'Irrigation Required', active: sensorData.soilMoisture !== null && sensorData.soilMoisture < 35, color: 'text-rose-400' },
                                                    { label: '35–60%', desc: 'Monitor Conditions', active: sensorData.soilMoisture !== null && sensorData.soilMoisture >= 35 && sensorData.soilMoisture <= 60, color: 'text-amber-400' },
                                                    { label: '> 60%', desc: 'No Irrigation Needed', active: sensorData.soilMoisture !== null && sensorData.soilMoisture > 60, color: 'text-teal-400' },
                                                ].map(t => (
                                                    <div key={t.label} className={`flex justify-between items-center text-xs px-3 py-1.5 rounded-lg transition-colors ${t.active ? 'bg-slate-700' : 'opacity-40'}`}>
                                                        <span className={`font-bold ${t.color}`}>{t.label}</span>
                                                        <span className="text-slate-300">{t.desc}</span>
                                                        {t.active && <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse ml-2" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Manual Pump Override */}
                                        <div className="mb-4 px-2">
                                            <div className="flex justify-between items-center mb-3">
                                                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Pump Control</p>
                                                <button
                                                    onClick={handleManualPumpToggle}
                                                    disabled={pumpLoading}
                                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${pumpActive ? 'bg-teal-500' : 'bg-slate-600'} disabled:opacity-60`}
                                                >
                                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${pumpActive ? 'translate-x-5' : 'translate-x-1'}`} />
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                {manualOverride ? '⚡ Manual mode — auto-control disabled' : '🤖 Auto-control active via AI command'}
                                            </p>
                                        </div>

                                        {/* Pump Indicator */}
                                        <div className="flex flex-col items-center justify-center p-6 border-t border-slate-800 mt-2">
                                            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-6">Hardware Output</p>
                                            <div className="relative">
                                                <AnimatePresence>
                                                    {pumpActive && (
                                                        <motion.div
                                                            initial={{ scale: 1, opacity: 0.5 }}
                                                            animate={{ scale: 1.5, opacity: 0 }}
                                                            exit={{ opacity: 0 }}
                                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                                            className="absolute inset-0 bg-blue-500 rounded-full"
                                                        />
                                                    )}
                                                </AnimatePresence>
                                                <div className={`w-28 h-28 rounded-full flex flex-col items-center justify-center relative z-10 transition-all duration-500 shadow-2xl ${pumpActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-4 border-blue-400 shadow-blue-500/50' : 'bg-slate-800 border-4 border-slate-700'}`}>
                                                    <Power size={36} className={pumpActive ? 'text-white' : 'text-slate-500'} />
                                                    <span className={`text-xs font-black tracking-widest mt-2 ${pumpActive ? 'text-white' : 'text-slate-500'}`}>
                                                        {pumpLoading ? 'SENDING…' : pumpActive ? 'PUMP ON' : 'PUMP OFF'}
                                                    </span>
                                                </div>
                                            </div>
                                            {pumpActive && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
                                                    <div className="text-3xl font-black text-blue-400">{estimatedWaterUsed.toFixed(2)}<span className="text-lg text-slate-400 ml-1">L</span></div>
                                                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">Water Dispensed</div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── RIGHT COLUMN ─────────────────────────────── */}
                            <div className="lg:col-span-8 space-y-6">

                                {/* Soil Moisture Matrix */}
                                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            <BarChart2 className="text-blue-500" size={20} /> Soil Moisture Matrix
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" />Live</div>
                                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400" />Monitor (35%)</div>
                                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500" />Critical (35%)</div>
                                        </div>
                                    </div>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} tickMargin={10} minTickGap={30} />
                                                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                                <Area type="monotone" dataKey="soilMoisture" name="Soil Moisture (%)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMoisture)" />
                                                <Line type="monotone" dataKey={() => 35} stroke="#f43f5e" strokeDasharray="5 5" strokeWidth={2} dot={false} isAnimationActive={false} name="Critical (35%)" />
                                                <Line type="monotone" dataKey={() => 60} stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} dot={false} isAnimationActive={false} name="Monitor (60%)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Environment Pulse */}
                                    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                            <Thermometer className="text-orange-500" size={20} /> Environment Pulse
                                        </h3>
                                        <div className="h-52">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} tickMargin={10} minTickGap={30} />
                                                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', padding: '10px 0 0 0' }} />
                                                    <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#f97316" strokeWidth={3} dot={false} />
                                                    <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#0ea5e9" strokeWidth={3} dot={false} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Hardware Flow Output */}
                                    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                            <Zap className="text-indigo-500" size={20} /> Hardware Flow Output
                                        </h3>
                                        <div className="h-52">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={historicalData.slice(-20)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} tickMargin={10} minTickGap={20} />
                                                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                    <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                                    <Bar dataKey="soilMoisture" name="Soil Moisture (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <p className="text-xs text-slate-400 text-center mt-3">
                                            Water pump → <code className="bg-slate-100 px-1 rounded">water-pump</code> feed on Adafruit IO
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
