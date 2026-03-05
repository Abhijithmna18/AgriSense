import React, { useState, useEffect, useCallback } from 'react';
import {
    Activity, Droplets, Thermometer, Wind, AlertTriangle,
    RefreshCw, Download, FileText, Plus, Bell, Wifi, WifiOff,
    CheckCircle, XCircle
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { authAPI } from '../services/authApi';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import WaterUsageTracker from '../components/dashboard/WaterUsageTracker';
import '../styles/admin.css';

// ─── Adafruit IO Config ────────────────────────────────────────────────────────
const AIO_USERNAME = import.meta.env.VITE_AIO_USERNAME || '';
const AIO_KEY = import.meta.env.VITE_AIO_KEY || '';
const AIO_BASE = `https://io.adafruit.com/api/v2/${AIO_USERNAME}/feeds`;
const AIO_HEADERS = { 'X-AIO-Key': AIO_KEY };

const aioFetch = async (feed) => {
    const res = await fetch(`${AIO_BASE}/${feed}/data/last`, { headers: AIO_HEADERS });
    if (!res.ok) throw new Error(`AIO ${feed}: ${res.status}`);
    const d = await res.json();
    return parseFloat(d.value) ?? 0;
};

// ─── Feed status helper ───────────────────────────────────────────────────────
const makeFeedRow = (name, feedKey, value, connected) => ({
    name,
    feedKey,
    value,
    status: connected ? 'connected' : 'error',
    lastSync: connected ? 'just now' : 'failed',
});

// ─── Sub-components (unchanged layout, data-driven) ──────────────────────────

/* 1. Page Header */
const MonitoringHeader = ({ lastUpdated, onRefresh, isLoading, connected }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Farm Monitoring Dashboard</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-sm font-medium ${connected ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-600'}`}>
                    {connected
                        ? <><span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />AIO Live</>
                        : <><WifiOff size={12} />Disconnected</>
                    }
                </span>
                <span className="text-sm text-gray-500">Last updated: {lastUpdated || '—'}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    @{AIO_USERNAME}
                </span>
            </div>
        </div>
        <div className="flex gap-2">
            <button
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium disabled:opacity-60"
            >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                {isLoading ? 'Fetching…' : 'Fetch New Data'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium">
                <FileText size={16} /> Export CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm font-medium">
                <Download size={16} /> Export PDF
            </button>
        </div>
    </div>
);

/* 2. Critical Alerts */
const CriticalAlerts = ({ soilMoisture }) => {
    if (soilMoisture === null || soilMoisture >= 30) return null;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
                    <Droplets size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-red-700">Critical Soil Moisture Alert</h3>
                    <p className="text-red-600 text-sm mt-1">
                        Current Level: <span className="font-bold">{soilMoisture.toFixed(0)}%</span> (Threshold: 30%)
                    </p>
                    <p className="text-red-800 text-sm font-medium mt-2 bg-red-100/50 p-2 rounded">
                        Action: Immediate irrigation required to prevent crop stress.
                    </p>
                </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg shrink-0">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-orange-700">Irrigation System Warning</h3>
                    <p className="text-orange-600 text-sm mt-1">Automated pump trigger pending due to low moisture.</p>
                    <button className="mt-2 text-xs font-bold text-orange-700 underline">Check Pump Status</button>
                </div>
            </div>
        </div>
    );
};

/* 3. Sensor Metric Card */
const MetricCard = ({ label, value, unit, icon: Icon, colorClass, iconBgClass }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-gray-500 text-sm font-medium">{label}</p>
            <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold text-gray-800">
                    {value !== null ? Number(value).toFixed(value >= 10 ? 1 : 2) : '—'}
                </span>
                <span className="text-gray-400 text-sm font-medium">{unit}</span>
            </div>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgClass} ${colorClass}`}>
            <Icon size={24} />
        </div>
    </div>
);

const SensorMetrics = ({ data }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Temperature" value={data.temperature} unit="°C" icon={Thermometer} colorClass="text-orange-500" iconBgClass="bg-orange-50" />
        <MetricCard label="Humidity" value={data.humidity} unit="%" icon={Wind} colorClass="text-blue-500" iconBgClass="bg-blue-50" />
        <MetricCard label="Soil Moisture" value={data.soilMoisture} unit="%" icon={Droplets} colorClass="text-green-500" iconBgClass="bg-green-50" />
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2 animate-spin-slow">
                <Activity size={20} />
            </div>
            <p className="text-gray-900 font-bold text-sm">Analytics</p>
            <p className="text-xs text-gray-400 mt-1">Processing forecast…</p>
        </div>
    </div>
);

/* 4. Trend Charts */
const TrendCharts = ({ data }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Environmental Trends */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Thermometer size={18} className="text-gray-400" /> Environmental Trends
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} dy={10} minTickGap={20} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} dot={false} name="Temp (°C)" />
                        <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} dot={false} name="Humidity (%)" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Soil Moisture Trend */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Droplets size={18} className="text-gray-400" /> Soil Moisture Trend
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} dy={10} minTickGap={20} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Line type="step" dataKey="moisture" stroke="#22c55e" strokeWidth={2} dot={false} name="Moisture (%)" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
);

/* 5. Bottom Section */
const BottomSection = ({ feeds }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Custom Alerts Manager */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
                <span>Custom Alerts Manager</span>
                <button className="text-green-600 hover:bg-green-50 p-1 rounded transition-colors"><Plus size={18} /></button>
            </h3>
            <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center p-4">
                <Bell size={24} className="text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm font-medium">No custom alerts configured.</p>
                <button className="mt-2 text-xs font-bold text-green-600 hover:underline">Create your first alert</button>
            </div>
        </div>

        {/* Sensor Info */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Sensor Information</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Data Source</span>
                    <span className="font-bold text-gray-800">Adafruit IO</span>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Moisture Guide</p>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /><span className="text-gray-600">&lt; 30% : Immediate Irrigation</span></div>
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500" /><span className="text-gray-600">30–60% : Moderate</span></div>
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" /><span className="text-gray-600">&gt; 60% : Adequate</span></div>
                    </div>
                </div>
            </div>
        </div>

        {/* IoT Feed Mapping — live status */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Adafruit IO Feed Mapping</h3>
            <div className="space-y-3">
                {feeds.map((feed, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-full ${feed.status === 'connected' ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-500'}`}>
                                {feed.status === 'connected' ? <Wifi size={14} /> : <WifiOff size={14} />}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{feed.name}</p>
                                <p className="text-xs text-gray-400">
                                    {feed.feedKey} &bull; {feed.status} &bull; {feed.lastSync}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                            {feed.status === 'connected'
                                ? <CheckCircle size={16} className="text-green-500" />
                                : <XCircle size={16} className="text-rose-400" />
                            }
                            {feed.value !== null && (
                                <span className="text-xs font-bold text-gray-600">{Number(feed.value).toFixed(1)}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <button className="w-full mt-4 py-2 border border-green-600 text-green-600 rounded-lg text-sm font-bold hover:bg-green-50 transition-colors">
                Configure Feeds
            </button>
        </div>
    </div>
);

// ─── Main Page Component ──────────────────────────────────────────────────────
const FarmMonitoringPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    const [sensorData, setSensorData] = useState({
        temperature: null,
        humidity: null,
        soilMoisture: null,
        lastUpdated: null,
    });

    const [feeds, setFeeds] = useState([
        { name: 'DHT — Temperature', feedKey: 'dht-temp', value: null, status: 'syncing', lastSync: '—' },
        { name: 'DHT — Humidity', feedKey: 'dht-hum', value: null, status: 'syncing', lastSync: '—' },
        { name: 'Soil Moisture', feedKey: 'soil-moisture', value: null, status: 'syncing', lastSync: '—' },
    ]);

    const [trendData, setTrendData] = useState([]);

    // ── Auth init ────────────────────────────────────────────────────────────
    useEffect(() => {
        authAPI.getMe()
            .then(res => setUser(res.data))
            .catch(err => { if (err.response?.status === 401) navigate('/login'); })
            .finally(() => setAuthLoading(false));
    }, [navigate]);

    // ── Adafruit IO fetch ────────────────────────────────────────────────────
    const fetchAIO = useCallback(async () => {
        setIsLoading(true);
        try {
            const [temp, hum, soil] = await Promise.all([
                aioFetch('dht-temp'),
                aioFetch('dht-hum'),
                aioFetch('soil-moisture'),
            ]);

            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const displayTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            setSensorData({ temperature: temp, humidity: hum, soilMoisture: soil, lastUpdated: displayTime });
            setConnected(true);
            setFetchError(null);

            // Update feed status panel
            setFeeds([
                makeFeedRow('DHT — Temperature', 'dht-temp', temp, true),
                makeFeedRow('DHT — Humidity', 'dht-hum', hum, true),
                makeFeedRow('Soil Moisture', 'soil-moisture', soil, true),
            ]);

            // Append to rolling trend (max 30 points)
            setTrendData(prev => {
                const point = { time: timeStr, temp, humidity: hum, moisture: soil };
                const updated = [...prev, point];
                return updated.length > 30 ? updated.slice(-30) : updated;
            });

        } catch (err) {
            console.error('Adafruit IO fetch failed:', err);
            setConnected(false);
            setFetchError('Could not reach Adafruit IO. Check your network.');
            setFeeds(prev => prev.map(f => ({ ...f, status: 'error', lastSync: 'failed' })));
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ── Auto-poll every 5 seconds ─────────────────────────────────────────────
    useEffect(() => {
        fetchAIO();
        const id = setInterval(fetchAIO, 5000);
        return () => clearInterval(id);
    }, [fetchAIO]);

    const handleLogout = async () => {
        try { await authAPI.logout(); } catch (_) { }
        localStorage.removeItem('auth_token');
        navigate('/login');
    };

    if (authLoading) return <div className="p-10 text-center">Loading…</div>;

    return (
        <div className="flex h-screen bg-[#F8FAF9] font-sans overflow-hidden">
            <Sidebar onLogout={handleLogout} />

            <div className="flex-1 flex flex-col min-w-0 md:ml-64">
                <TopBar user={user} onLogout={handleLogout} />

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                    <div className="w-full pb-10">

                        <MonitoringHeader
                            lastUpdated={sensorData.lastUpdated}
                            onRefresh={fetchAIO}
                            isLoading={isLoading}
                            connected={connected}
                        />

                        {fetchError && (
                            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-center gap-2">
                                <WifiOff size={16} /> {fetchError}
                            </div>
                        )}

                        {isLoading && !connected && (
                            <div className="mb-4 p-2 bg-green-50 text-green-700 text-sm text-center rounded-lg animate-pulse">
                                Syncing with Adafruit IO…
                            </div>
                        )}

                        <CriticalAlerts soilMoisture={sensorData.soilMoisture} />
                        <SensorMetrics data={sensorData} />
                        <TrendCharts data={trendData} />
                        <BottomSection feeds={feeds} />

                        {/* Water Usage Tracker */}
                        <WaterUsageTracker />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmMonitoringPage;
