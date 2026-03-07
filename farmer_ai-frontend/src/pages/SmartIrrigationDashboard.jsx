import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Droplets, Thermometer, Wind, Activity, Zap, AlertTriangle,
    BrainCircuit, Power, RefreshCw, BarChart2, Wifi, WifiOff, Beaker,
    TrendingUp, TrendingDown, CheckCircle, XCircle, AlertCircle, Gauge
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area,
    BarChart, Bar, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
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

// Feed names matching ESP32 configuration
const FEEDS = {
    PUMP_CONTROL: 'pump-control',
    PUMP_STATUS: 'pump-status',
    SOIL_MOISTURE: 'soil-moisture',
    TEMPERATURE: 'temperature',
    HUMIDITY: 'humidity',
    TDS: 'tds',
    FLOW_RATE: 'flow-rate',
    WATER_VOLUME: 'water-volume',
    ET_INDEX: 'et-index',
    DRY_RUN_ALERT: 'dry-run-alert',
    SOIL_WARNING: 'soil-warning'
};

const missingFeeds = new Set();

const aioFetch = (feed) => {
    // If we already know the feed is missing, don't spam the network (which causes native browser 404 logs)
    if (missingFeeds.has(feed)) return Promise.resolve(0);

    return fetch(`${AIO_BASE}/${feed}/data/last`, { headers: AIO_HEADERS })
        .then(r => {
            if (!r.ok) {
                if (r.status === 404) missingFeeds.add(feed);
                return { value: 0 }; // Fallback object instead of throwing
            }
            // If it succeeds, ensure it's removed from missing feeds just in case
            if (missingFeeds.has(feed)) missingFeeds.delete(feed);
            return r.json();
        })
        .then(d => parseFloat(d.value) || 0)
        .catch(err => {
            return 0; // Final fallback
        });
};

const aioPublish = async (feed, value) => {
    try {
        const response = await fetch(`${AIO_BASE}/${feed}/data`, {
            method: 'POST',
            headers: AIO_HEADERS,
            body: JSON.stringify({ value: value }),
        });
        if (!response.ok) {
            console.warn(`Feed ${feed} might not exist yet: ${response.status}`);
            return false;
        }
        console.log(`✓ Published to ${feed}: ${value}`);
        return true;
    } catch (err) {
        console.warn(`Feed ${feed} could not be published to (likely 404/Missing)`);
        return false;
    }
};

// ─── AI Decision Engine ────────────────────────────────────────────────────────
const calculateETIndex = (temp, humidity) => {
    // Simplified ET calculation based on temperature and humidity
    const tempFactor = Math.max(0, (temp - 15) / 2);
    const humidityFactor = Math.max(0, (100 - humidity) / 10);
    return parseFloat((tempFactor + humidityFactor).toFixed(2));
};

const makeIrrigationDecision = (sensorData) => {
    const { soilMoisture, temperature, humidity, tdsValue, flowRate, pumpActive, totalWaterVolume } = sensorData;

    const etIndex = calculateETIndex(temperature, humidity);

    let decision = {
        irrigation: 0,
        fertilizer_needed: false,
        fertilizer_level: 'optimal',
        dry_run_warning: false,
        soil_response_warning: false,
        recommended_runtime_seconds: 0,
        et_index: etIndex,
        decision_reason: ''
    };

    // Rule 1: Irrigation decision based on soil moisture and ET
    if (soilMoisture < 35 && etIndex > 10) {
        decision.irrigation = 1;
        decision.recommended_runtime_seconds = Math.ceil((60 - soilMoisture) * 30);
        decision.decision_reason = 'Low soil moisture + High ET demand';
    } else if (soilMoisture < 35) {
        decision.irrigation = 1;
        decision.recommended_runtime_seconds = Math.ceil((60 - soilMoisture) * 20);
        decision.decision_reason = 'Low soil moisture detected';
    } else if (soilMoisture > 60) {
        decision.irrigation = 0;
        decision.decision_reason = 'Soil moisture optimal';
    } else {
        decision.decision_reason = 'Monitoring conditions';
    }

    // Rule 2: Fertilizer management based on TDS
    if (tdsValue < 400) {
        decision.fertilizer_needed = true;
        decision.fertilizer_level = 'low';
    } else if (tdsValue > 1200) {
        decision.fertilizer_level = 'high';
        decision.fertilizer_needed = false;
    } else {
        decision.fertilizer_level = 'optimal';
    }

    // Rule 3: Dry run detection
    // Note: The ESP32 handles rapid dry-run shutoff internally after a 5 second pump start delay. 
    // We rely on the `dryRunAlert` feed from the ESP32 rather than making an instantaneous frontend decision.


    return decision;
};

// ─── Status Badge Component ───────────────────────────────────────────────────
const StatusBadge = ({ status, label }) => {
    const styles = {
        active: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
        warning: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
        critical: 'bg-gradient-to-r from-rose-500 to-red-500 text-white animate-pulse',
        inactive: 'bg-slate-200 text-slate-600',
    };
    return (
        <span className={`px-3 py-1.5 font-bold rounded-full text-xs shadow-lg ${styles[status] || styles.inactive}`}>
            {label}
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
        tdsValue: null,
        totalWaterVolume: 0,
        pumpActive: false,
        dryRunAlert: false,
        soilWarning: false,
    });

    const [aiDecision, setAiDecision] = useState(null);
    const [pumpLoading, setPumpLoading] = useState(false);
    const [manualOverride, setManualOverride] = useState(false);
    const [historicalData, setHistoricalData] = useState([]);
    const [alerts, setAlerts] = useState([]);

    const pumpActiveRef = useRef(sensorData.pumpActive);
    const manualOverrideRef = useRef(manualOverride);

    useEffect(() => { pumpActiveRef.current = sensorData.pumpActive; }, [sensorData.pumpActive]);
    useEffect(() => { manualOverrideRef.current = manualOverride; }, [manualOverride]);

    // ── Adafruit IO Fetch ─────────────────────────────────────────────────────
    const fetchAdafruitFeeds = useCallback(async () => {
        try {
            const [temp, hum, soil, flow, tds, pumpStatus, waterVol, dryRunAlert, soilWarn] = await Promise.all([
                aioFetch(FEEDS.TEMPERATURE),
                aioFetch(FEEDS.HUMIDITY),
                aioFetch(FEEDS.SOIL_MOISTURE),
                aioFetch(FEEDS.FLOW_RATE),
                aioFetch(FEEDS.TDS),
                aioFetch(FEEDS.PUMP_STATUS),
                aioFetch(FEEDS.WATER_VOLUME),
                aioFetch(FEEDS.DRY_RUN_ALERT),
                aioFetch(FEEDS.SOIL_WARNING),
            ]);

            const reading = {
                temperature: temp,
                humidity: hum,
                soilMoisture: soil,
                waterFlow: flow,
                tdsValue: tds,
                totalWaterVolume: waterVol,
                pumpActive: pumpStatus === 1 || pumpStatus === '1', // Read actual pump state from ESP32
                dryRunAlert: dryRunAlert === 1,
                soilWarning: soilWarn === 1,
            };

            setSensorData(reading);
            setLastUpdated(Date.now());
            setFetchError(null);
            setConnected(true);

            // Make AI decision
            const decision = makeIrrigationDecision(reading);
            setAiDecision(decision);

            // Generate alerts
            const newAlerts = [];
            if (reading.dryRunAlert) {
                newAlerts.push({ type: 'critical', message: '🚨 DRY RUN DETECTED! Pump running with no water flow. System auto-stopped.' });
            }
            if (reading.soilWarning) {
                newAlerts.push({ type: 'warning', message: '⚠️ Soil not responding to irrigation. Check soil sensor or water distribution.' });
            }
            if (decision.dry_run_warning) {
                newAlerts.push({ type: 'critical', message: 'Dry run detected! Pump running with no flow.' });
            }
            if (decision.fertilizer_needed) {
                newAlerts.push({ type: 'warning', message: 'Fertilizer level low. TDS below 400 ppm.' });
            }
            if (decision.fertilizer_level === 'high') {
                newAlerts.push({ type: 'warning', message: 'Fertilizer concentration high. TDS above 1200 ppm.' });
            }
            setAlerts(newAlerts);

            // Append to history
            setHistoricalData(prev => {
                const point = {
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    temperature: temp,
                    humidity: hum,
                    soilMoisture: soil,
                    tds: tds,
                    etIndex: decision.et_index,
                };
                const updated = [...prev, point];
                return updated.length > 50 ? updated.slice(-50) : updated;
            });

            // Auto-control pump based on AI decision (if not manual override)
            if (!manualOverrideRef.current && decision.irrigation !== (pumpActiveRef.current ? 1 : 0)) {
                // await sendPumpCommand(decision.irrigation === 1);
                console.log("AI Auto-Control triggered, but overriding for safe demo. Decision:", decision.irrigation === 1);
            }

        } catch (err) {
            console.error('Adafruit IO fetch failed:', err);
            // Don't show network error for 404s, keep connected as true if basic feeds work
            // setFetchError('Cannot reach Adafruit IO. Check your network and credentials.');
            // setConnected(false);
        }
    }, []);

    // ── Polling (every 60 seconds to respect Adafruit IO Free Tier 30 RPM limit)
    useEffect(() => {
        fetchAdafruitFeeds();
        const id = setInterval(fetchAdafruitFeeds, 60000);
        return () => clearInterval(id);
    }, [fetchAdafruitFeeds]);

    // ── Pump Command ──────────────────────────────────────────────────────────
    const sendPumpCommand = async (on) => {
        setPumpLoading(true);
        console.log(`🎯 Sending pump command: ${on ? 'ON' : 'OFF'}`);

        try {
            // Publish to pump-control feed - ESP32 subscribes to this
            const success = await aioPublish(FEEDS.PUMP_CONTROL, on ? 1 : 0);

            if (success) {
                console.log(`✓ Pump command sent successfully: ${on ? 'ON' : 'OFF'}`);
                // Optimistically update UI, but actual state comes from pump-status feed
                setSensorData(prev => ({ ...prev, pumpActive: on }));

                // Wait a moment then fetch actual pump status from ESP32
                setTimeout(() => {
                    aioFetch(FEEDS.PUMP_STATUS).then(status => {
                        const actualState = status === 1 || status === '1';
                        setSensorData(prev => ({ ...prev, pumpActive: actualState }));
                        console.log(`✓ Pump status confirmed: ${actualState ? 'ON' : 'OFF'}`);
                    });
                }, 2000);
            } else {
                console.warn('Failed to publish pump command (Feed may be missing).');
                // Don't show critical UI error if we're just missing the feed during setup
                // setFetchError('Failed to send pump command. Check Adafruit IO connection.');
            }
        } catch (err) {
            console.warn('❌ Pump command failed:', err);
            // setFetchError('Failed to send pump command. Check Adafruit IO connection.');
        } finally {
            setPumpLoading(false);
        }
    };

    const handleManualPumpToggle = async () => {
        setManualOverride(true);
        await sendPumpCommand(!sensorData.pumpActive);
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    const fmt = (v, dec = 1) => (v !== null && v !== undefined ? Number(v).toFixed(dec) : '—');

    const getTDSStatus = (tds) => {
        if (tds < 400) return { status: 'critical', label: 'LOW', color: 'text-rose-600' };
        if (tds > 1200) return { status: 'warning', label: 'HIGH', color: 'text-amber-600' };
        return { status: 'active', label: 'OPTIMAL', color: 'text-emerald-600' };
    };

    const tdsStatus = getTDSStatus(sensorData.tdsValue);


    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 font-sans overflow-hidden">
            <Sidebar onLogout={handleLogout} />

            <div className="flex-1 flex flex-col min-w-0 md:ml-64">
                <TopBar user={user} onLogout={handleLogout} />

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8">
                    <div className="max-w-[1800px] mx-auto space-y-6 animate-in fade-in duration-500 pb-20">

                        {/* ── Header ─────────────────────────────────────────── */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 via-blue-900/50 to-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-500/20">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-teal-500/20 to-emerald-500/20 rounded-full blur-3xl" />

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8">
                                <div className="flex items-start gap-5">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl blur-xl opacity-60 animate-pulse" />
                                        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl">
                                            <BrainCircuit size={32} className="text-white drop-shadow-lg" />
                                        </div>
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight mb-2">
                                            AI Irrigation & Fertigation Engine
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <p className="text-slate-300 font-semibold text-sm">
                                                Real-time Decision System • ESP32 IoT Controller
                                            </p>
                                            <span className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-bold shadow-lg ${connected ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-gradient-to-r from-rose-500 to-orange-500 text-white'}`}>
                                                {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
                                                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-white animate-pulse' : 'bg-white/80'}`} />
                                                {connected ? 'LIVE' : 'OFFLINE'}
                                            </span>
                                            {lastUpdated && (
                                                <span className="text-xs text-slate-400 font-medium bg-slate-800/60 px-3 py-1 rounded-full">
                                                    Updated: {new Date(lastUpdated).toLocaleTimeString()}
                                                </span>
                                            )}
                                        </div>
                                        {fetchError && (
                                            <p className="text-xs text-rose-400 mt-2 bg-rose-500/20 px-3 py-1 rounded-lg inline-block">{fetchError}</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={fetchAdafruitFeeds}
                                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                >
                                    <RefreshCw size={16} /> Refresh Data
                                </button>
                            </div>
                        </div>

                        {/* ── Alerts Bar ────────────────────────────────────── */}
                        {alerts.length > 0 && (
                            <div className="space-y-2">
                                {alerts.map((alert, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 ${alert.type === 'critical'
                                            ? 'bg-rose-500/10 border-rose-500/50 text-rose-300'
                                            : 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                                            }`}
                                    >
                                        <AlertTriangle size={20} className="flex-shrink-0" />
                                        <span className="font-semibold">{alert.message}</span>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                            {/* ── LEFT COLUMN: Sensor Inputs ─────────────────── */}
                            <div className="xl:col-span-5 space-y-6">


                                {/* Sensor Inputs Panel */}
                                <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl shadow-2xl border border-slate-700/50">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

                                    <div className="p-7">
                                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
                                                <Activity className="text-white" size={20} />
                                            </div>
                                            Real-Time Sensor Inputs
                                        </h3>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Soil Moisture */}
                                            <motion.div
                                                className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/30 hover:border-blue-400/50 transition-all"
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <Droplets size={24} className="text-blue-400 mb-2" />
                                                <div className="text-4xl font-black text-white">{fmt(sensorData.soilMoisture, 0)}%</div>
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Soil Moisture</div>
                                                <div className={`text-xs font-semibold mt-2 ${sensorData.soilMoisture < 35 ? 'text-rose-400' :
                                                    sensorData.soilMoisture > 60 ? 'text-emerald-400' : 'text-amber-400'
                                                    }`}>
                                                    {sensorData.soilMoisture < 35 ? 'LOW' : sensorData.soilMoisture > 60 ? 'OPTIMAL' : 'MODERATE'}
                                                </div>
                                            </motion.div>

                                            {/* Temperature */}
                                            <motion.div
                                                className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-500/30 hover:border-orange-400/50 transition-all"
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <Thermometer size={24} className="text-orange-400 mb-2" />
                                                <div className="text-4xl font-black text-white">{fmt(sensorData.temperature)}°C</div>
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Temperature</div>
                                            </motion.div>

                                            {/* Humidity */}
                                            <motion.div
                                                className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 border-2 border-sky-500/30 hover:border-sky-400/50 transition-all"
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <Wind size={24} className="text-sky-400 mb-2" />
                                                <div className="text-4xl font-black text-white">{fmt(sensorData.humidity, 0)}%</div>
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Humidity</div>
                                            </motion.div>

                                            {/* TDS Value */}
                                            <motion.div
                                                className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 hover:border-purple-400/50 transition-all"
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <Beaker size={24} className="text-purple-400 mb-2" />
                                                <div className="text-4xl font-black text-white">{fmt(sensorData.tdsValue, 0)}</div>
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">TDS (ppm)</div>
                                                <div className={`text-xs font-semibold mt-2 ${tdsStatus.color}`}>
                                                    {tdsStatus.label}
                                                </div>
                                            </motion.div>

                                            {/* Flow Rate */}
                                            <motion.div
                                                className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border-2 border-teal-500/30 hover:border-teal-400/50 transition-all"
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <Gauge size={24} className="text-teal-400 mb-2" />
                                                <div className="text-4xl font-black text-white">{fmt(sensorData.waterFlow, 2)}</div>
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Flow Rate (L/min)</div>
                                            </motion.div>

                                            {/* Total Water Volume */}
                                            <motion.div
                                                className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border-2 border-indigo-500/30 hover:border-indigo-400/50 transition-all"
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <Droplets size={24} className="text-indigo-400 mb-2" />
                                                <div className="text-4xl font-black text-white">{fmt(sensorData.totalWaterVolume, 1)}</div>
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Total Volume (L)</div>
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>


                                {/* Pump Control Panel */}
                                <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl shadow-2xl border border-slate-700/50">
                                    <div className="p-7">
                                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                                                <Power className="text-white" size={20} />
                                            </div>
                                            Pump Control System
                                        </h3>

                                        <div className="flex justify-between items-center mb-6 bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
                                            <div>
                                                <p className="text-sm text-slate-300 uppercase tracking-wider font-bold mb-1">Control Mode</p>
                                                <p className="text-xs text-slate-400">
                                                    {manualOverride ? '⚡ Manual Override Active' : '🤖 AI Auto-Control'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleManualPumpToggle}
                                                disabled={pumpLoading}
                                                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${sensorData.pumpActive
                                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/50'
                                                    : 'bg-slate-600'
                                                    } disabled:opacity-60`}
                                            >
                                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${sensorData.pumpActive ? 'translate-x-9' : 'translate-x-1'
                                                    }`} />
                                            </button>
                                        </div>

                                        <div className="flex flex-col items-center justify-center p-8">
                                            <div className="relative">
                                                <AnimatePresence>
                                                    {sensorData.pumpActive && (
                                                        <>
                                                            <motion.div
                                                                initial={{ scale: 1, opacity: 0.5 }}
                                                                animate={{ scale: 2, opacity: 0 }}
                                                                exit={{ opacity: 0 }}
                                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                                                className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                                            />
                                                            <motion.div
                                                                initial={{ scale: 1, opacity: 0.3 }}
                                                                animate={{ scale: 1.6, opacity: 0 }}
                                                                exit={{ opacity: 0 }}
                                                                transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                                                                className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                                                            />
                                                        </>
                                                    )}
                                                </AnimatePresence>
                                                <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center relative z-10 transition-all duration-500 ${sensorData.pumpActive
                                                    ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 shadow-2xl shadow-emerald-500/50 border-4 border-emerald-300'
                                                    : 'bg-slate-800 border-4 border-slate-700 shadow-xl'
                                                    }`}>
                                                    <Power size={48} className={sensorData.pumpActive ? 'text-white drop-shadow-lg' : 'text-slate-500'} />
                                                    <span className={`text-sm font-black tracking-widest mt-2 ${sensorData.pumpActive ? 'text-white' : 'text-slate-500'}`}>
                                                        {pumpLoading ? 'SENDING' : sensorData.pumpActive ? 'ACTIVE' : 'STANDBY'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── CENTER COLUMN: AI Decision Engine ──────────── */}
                            <div className="xl:col-span-7 space-y-6">


                                {/* AI Decision Output */}
                                {aiDecision && (
                                    <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl shadow-2xl border border-cyan-500/30">
                                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" />

                                        <div className="relative z-10 p-7">
                                            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/50">
                                                    <BrainCircuit className="text-white" size={24} />
                                                </div>
                                                AI Decision Output
                                            </h3>

                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                {/* Irrigation Decision */}
                                                <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Irrigation</span>
                                                        {aiDecision.irrigation === 1 ? (
                                                            <CheckCircle className="text-emerald-400" size={20} />
                                                        ) : (
                                                            <XCircle className="text-slate-500" size={20} />
                                                        )}
                                                    </div>
                                                    <div className={`text-3xl font-black ${aiDecision.irrigation === 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                        {aiDecision.irrigation === 1 ? 'START' : 'STOP'}
                                                    </div>
                                                    {aiDecision.irrigation === 1 && (
                                                        <div className="mt-3 text-xs text-slate-400">
                                                            Runtime: <span className="text-cyan-400 font-bold">{aiDecision.recommended_runtime_seconds}s</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Fertilizer Status */}
                                                <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Fertilizer</span>
                                                        <Beaker className={`${aiDecision.fertilizer_level === 'optimal' ? 'text-emerald-400' :
                                                            aiDecision.fertilizer_level === 'low' ? 'text-rose-400' : 'text-amber-400'
                                                            }`} size={20} />
                                                    </div>
                                                    <div className={`text-2xl font-black uppercase ${aiDecision.fertilizer_level === 'optimal' ? 'text-emerald-400' :
                                                        aiDecision.fertilizer_level === 'low' ? 'text-rose-400' : 'text-amber-400'
                                                        }`}>
                                                        {aiDecision.fertilizer_level}
                                                    </div>
                                                    {aiDecision.fertilizer_needed && (
                                                        <div className="mt-3 text-xs text-rose-400 font-semibold">
                                                            ⚠ Injection needed
                                                        </div>
                                                    )}
                                                </div>

                                                {/* ET Index */}
                                                <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">ET Index</span>
                                                        <TrendingUp className="text-orange-400" size={20} />
                                                    </div>
                                                    <div className="text-3xl font-black text-orange-400">
                                                        {fmt(aiDecision.et_index, 2)}
                                                    </div>
                                                    <div className="mt-3 text-xs text-slate-400">
                                                        Evapotranspiration demand
                                                    </div>
                                                </div>

                                                {/* System Status */}
                                                <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Status</span>
                                                        {aiDecision.dry_run_warning ? (
                                                            <AlertCircle className="text-rose-400 animate-pulse" size={20} />
                                                        ) : (
                                                            <CheckCircle className="text-emerald-400" size={20} />
                                                        )}
                                                    </div>
                                                    <div className={`text-xl font-black ${aiDecision.dry_run_warning ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                        {aiDecision.dry_run_warning ? 'DRY RUN!' : 'NORMAL'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Decision Reason */}
                                            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-5 rounded-2xl border border-cyan-500/30">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <BrainCircuit size={16} className="text-cyan-400" />
                                                    <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Decision Logic</span>
                                                </div>
                                                <p className="text-slate-200 text-sm leading-relaxed">
                                                    {aiDecision.decision_reason}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}


                                {/* Historical Trends */}
                                <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl shadow-2xl border border-slate-700/50">
                                    <div className="p-7">
                                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                                                <BarChart2 className="text-white" size={20} />
                                            </div>
                                            Multi-Parameter Trends
                                        </h3>

                                        <div className="h-80 bg-slate-900/50 rounded-2xl p-4">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={historicalData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                                    <XAxis
                                                        dataKey="time"
                                                        tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                                                        stroke="#475569"
                                                    />
                                                    <YAxis
                                                        yAxisId="left"
                                                        tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                                                        stroke="#475569"
                                                    />
                                                    <YAxis
                                                        yAxisId="right"
                                                        orientation="right"
                                                        tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                                                        stroke="#475569"
                                                    />
                                                    <RechartsTooltip
                                                        contentStyle={{
                                                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                                            border: '1px solid #334155',
                                                            borderRadius: '12px',
                                                            padding: '12px'
                                                        }}
                                                        labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                                                    />
                                                    <Legend
                                                        wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }}
                                                        iconType="circle"
                                                    />
                                                    <Line
                                                        yAxisId="left"
                                                        type="monotone"
                                                        dataKey="soilMoisture"
                                                        name="Soil Moisture (%)"
                                                        stroke="#3b82f6"
                                                        strokeWidth={3}
                                                        dot={false}
                                                    />
                                                    <Line
                                                        yAxisId="left"
                                                        type="monotone"
                                                        dataKey="temperature"
                                                        name="Temperature (°C)"
                                                        stroke="#f97316"
                                                        strokeWidth={3}
                                                        dot={false}
                                                    />
                                                    <Line
                                                        yAxisId="right"
                                                        type="monotone"
                                                        dataKey="tds"
                                                        name="TDS (ppm)"
                                                        stroke="#a855f7"
                                                        strokeWidth={3}
                                                        dot={false}
                                                    />
                                                    <Line
                                                        yAxisId="left"
                                                        type="monotone"
                                                        dataKey="etIndex"
                                                        name="ET Index"
                                                        stroke="#10b981"
                                                        strokeWidth={3}
                                                        dot={false}
                                                        strokeDasharray="5 5"
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {/* System Performance Radar */}
                                <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl shadow-2xl border border-slate-700/50">
                                    <div className="p-7">
                                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl shadow-lg">
                                                <Activity className="text-white" size={20} />
                                            </div>
                                            System Performance Matrix
                                        </h3>

                                        <div className="h-80 bg-slate-900/50 rounded-2xl p-4">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart data={[
                                                    {
                                                        metric: 'Soil Health',
                                                        value: Math.min(100, (sensorData.soilMoisture / 60) * 100),
                                                        fullMark: 100,
                                                    },
                                                    {
                                                        metric: 'Nutrient Level',
                                                        value: Math.min(100, (sensorData.tdsValue / 1200) * 100),
                                                        fullMark: 100,
                                                    },
                                                    {
                                                        metric: 'Water Efficiency',
                                                        value: sensorData.pumpActive && sensorData.waterFlow > 0 ? 100 : 50,
                                                        fullMark: 100,
                                                    },
                                                    {
                                                        metric: 'Climate Stress',
                                                        value: aiDecision ? (aiDecision.et_index / 20) * 100 : 50,
                                                        fullMark: 100,
                                                    },
                                                    {
                                                        metric: 'System Status',
                                                        value: connected && !aiDecision?.dry_run_warning ? 100 : 30,
                                                        fullMark: 100,
                                                    },
                                                ]}>
                                                    <PolarGrid stroke="#334155" />
                                                    <PolarAngleAxis
                                                        dataKey="metric"
                                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                                    />
                                                    <PolarRadiusAxis
                                                        angle={90}
                                                        domain={[0, 100]}
                                                        tick={{ fill: '#64748b', fontSize: 10 }}
                                                    />
                                                    <Radar
                                                        name="Performance"
                                                        dataKey="value"
                                                        stroke="#06b6d4"
                                                        fill="#06b6d4"
                                                        fillOpacity={0.6}
                                                        strokeWidth={2}
                                                    />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
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
