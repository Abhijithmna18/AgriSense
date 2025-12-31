import React, { useState, useEffect } from 'react';
import {
    Activity, Droplets, Thermometer, Wind, AlertTriangle,
    RefreshCw, Download, FileText, Plus, Bell, Wifi, WifiOff,
    CheckCircle, XCircle
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// --- MOCK DATA ---
const MOCK_SENSOR_DATA = {
    temperature: 28.5,
    humidity: 62,
    soilMoisture: 28, // Low to trigger alert
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

const MOCK_TREND_DATA = Array.from({ length: 12 }, (_, i) => ({
    time: `${i * 2}:00`,
    temp: 24 + Math.random() * 5,
    humidity: 50 + Math.random() * 20,
    moisture: 40 - Math.random() * 15 // Dropping trend
}));

const MOCK_FEEDS = [
    { name: 'ESP32 - Temp Sensor', status: 'connected', lastSync: '2s ago' },
    { name: 'ESP32 - Humidity Sensor', status: 'connected', lastSync: '2s ago' },
    { name: 'Adafruit - Soil Moisture', status: 'syncing', lastSync: '15s ago' },
];

// --- SUB-COMPONENTS ---

/* 1. Page Header */
const MonitoringHeader = ({ lastUpdated, onRefresh }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Farm Monitoring Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
                    Live
                </span>
                <span className="text-sm text-gray-500">Last updated: {lastUpdated}</span>
            </div>
        </div>
        <div className="flex gap-2">
            <button
                onClick={onRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
            >
                <RefreshCw size={16} /> Fetch New Data
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
    if (soilMoisture >= 30) return null; // No alerts

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
                    <Droplets size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-red-700">Critical Soil Moisture Alert</h3>
                    <p className="text-red-600 text-sm mt-1">Current Level: <span className="font-bold">{soilMoisture}%</span> (Threshold: 30%)</p>
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

/* 3. Sensor Metrics */
const MetricCard = ({ label, value, unit, icon: Icon, colorClass, iconBgClass }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-gray-500 text-sm font-medium">{label}</p>
            <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold text-gray-800">{value}</span>
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
        <MetricCard
            label="Temperature"
            value={data.temperature}
            unit="°C"
            icon={Thermometer}
            colorClass="text-orange-500"
            iconBgClass="bg-orange-50"
        />
        <MetricCard
            label="Humidity"
            value={data.humidity}
            unit="%"
            icon={Wind}
            colorClass="text-blue-500"
            iconBgClass="bg-blue-50"
        />
        <MetricCard
            label="Soil Moisture"
            value={data.soilMoisture}
            unit="%"
            icon={Droplets}
            colorClass="text-green-500"
            iconBgClass="bg-green-50"
        />
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2 animate-spin-slow">
                <Activity size={20} />
            </div>
            <p className="text-gray-900 font-bold text-sm">Analytics</p>
            <p className="text-xs text-gray-400 mt-1">Processing forecast...</p>
        </div>
    </div>
);

/* 4. Trend Carts */
const TrendCharts = ({ data }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Environment Trends */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Thermometer size={18} className="text-gray-400" /> Environmental Trends
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} dot={false} name="Temp (°C)" />
                        <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} dot={false} name="Humidity (%)" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Moisture Trends */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Droplets size={18} className="text-gray-400" /> Soil Moisture Trend
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} domain={[0, 100]} />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Line type="step" dataKey="moisture" stroke="#22c55e" strokeWidth={2} dot={false} name="Moisture (%)" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
);

/* 5. Bottom Section: Info, Feeds & Custom Alerts */
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
                <button className="mt-2 text-xs font-bold text-green-600 hover:underline">
                    Create your first alert
                </button>
            </div>
        </div>

        {/* Data Information */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Sensor Information</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Total Data Points</span>
                    <span className="font-bold text-gray-800">12,450</span>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Moisture Guide</p>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span className="text-gray-600">&lt; 30% : Immediate Irrigation</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            <span className="text-gray-600">30-60% : Moderate</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-gray-600">&gt; 60% : Adequate</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* IoT Feed Mapping */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Adafruit IO Feed Mapping</h3>
            <div className="space-y-3">
                {feeds.map((feed, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-full ${feed.status === 'connected' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                <Wifi size={14} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{feed.name}</p>
                                <p className="text-xs text-gray-400">{feed.status} • {feed.lastSync}</p>
                            </div>
                        </div>
                        {feed.status === 'connected' ? (
                            <CheckCircle size={16} className="text-green-500" />
                        ) : (
                            <RefreshCw size={16} className="text-blue-500 animate-spin" />
                        )}
                    </div>
                ))}
            </div>
            <button className="w-full mt-4 py-2 border border-green-600 text-green-600 rounded-lg text-sm font-bold hover:bg-green-50 transition-colors">
                Configure Feeds
            </button>
        </div>

    </div>
);

// --- MAIN PAGE COMPONENT ---
const FarmMonitoringPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(MOCK_SENSOR_DATA);

    const handleRefresh = () => {
        setIsLoading(true);
        // Simulate network request
        setTimeout(() => {
            setData({
                ...MOCK_SENSOR_DATA,
                temperature: (28 + Math.random() * 2).toFixed(1),
                humidity: Math.floor(60 + Math.random() * 5),
                soilMoisture: Math.floor(25 + Math.random() * 10), // Randomize around threshold
                lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            setIsLoading(false);
        }, 1200);
    };

    return (
        <div className="p-6 md:p-8 bg-[#F8FAF9] min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                <MonitoringHeader lastUpdated={data.lastUpdated} onRefresh={handleRefresh} />

                {isLoading && (
                    <div className="mb-4 p-2 bg-green-50 text-green-700 text-sm text-center rounded-lg animate-pulse">
                        Syncing with IoT Gateway...
                    </div>
                )}

                <CriticalAlerts soilMoisture={data.soilMoisture} />
                <SensorMetrics data={data} />
                <TrendCharts data={MOCK_TREND_DATA} />
                <BottomSection feeds={MOCK_FEEDS} />
            </div>
        </div>
    );
};

export default FarmMonitoringPage;
