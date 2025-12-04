import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, AlertTriangle, MapPin, Activity, Users, TrendingUp, CheckCircle, XCircle, GripVertical } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopBar from '../components/admin/AdminTopBar';
import '../styles/adminTheme.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AdminDashboard = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        document.body.classList.add('admin-mode');
        return () => document.body.classList.remove('admin-mode');
    }, []);

    // Mock Data
    const farmLocations = [
        { id: 1, name: 'Farm Alpha', lat: 28.6139, lng: 77.2090, status: 'pest', severity: 'critical' },
        { id: 2, name: 'Farm Beta', lat: 28.7041, lng: 77.1025, status: 'harvest', severity: 'ready' },
        { id: 3, name: 'Farm Gamma', lat: 28.5355, lng: 77.3910, status: 'pest', severity: 'warning' },
        { id: 4, name: 'Farm Delta', lat: 28.6500, lng: 77.2500, status: 'harvest', severity: 'ready' }
    ];

    const aiDiagnoses = [
        { id: 1, issue: 'Leaf Spot Detected', confidence: 92, farm: 'Farm Alpha', status: 'pending' },
        { id: 2, issue: 'Nitrogen Deficiency', confidence: 87, farm: 'Farm Gamma', status: 'pending' },
        { id: 3, issue: 'Optimal Growth Detected', confidence: 95, farm: 'Farm Beta', status: 'verified' }
    ];

    const transactions = [
        'Wheat sold @ $320/ton - Farm Beta',
        'Fertilizer Order #402 Dispatched',
        'Rice purchased @ $280/ton - Farm Delta',
        'Pesticide Order #403 Processing',
        'Corn sold @ $310/ton - Farm Alpha'
    ];

    const systemMetrics = [
        { label: 'Model Accuracy', value: 94, color: '#00FF88' },
        { label: 'API Latency', value: 78, color: '#FFB800' },
        { label: 'Server Load', value: 45, color: '#00D4FF' }
    ];

    const CircularProgress = ({ value, label, color }) => {
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (value / 100) * circumference;

        return (
            <div className="flex flex-col items-center">
                <div className="circular-progress">
                    <svg width="120" height="120">
                        <circle className="bg-circle" cx="60" cy="60" r="45" />
                        <circle
                            className="progress-circle"
                            cx="60" cy="60" r="45"
                            style={{
                                stroke: color,
                                strokeDasharray: circumference,
                                strokeDashoffset: offset
                            }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold cyber-text">{value}%</span>
                    </div>
                </div>
                <p className="mt-2 text-sm text-gray-400">{label}</p>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--admin-bg-primary)' }}>
            <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-[280px]'}`}>
                <AdminTopBar isEditMode={isEditMode} onToggleEdit={() => setIsEditMode(!isEditMode)} />

                <main className="flex-1 p-6 overflow-y-auto mission-grid">
                    {/* Alert Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="alert-banner p-4 rounded-lg mb-6 flex items-center gap-3"
                    >
                        <AlertTriangle size={24} className="text-white" />
                        <div className="flex-1">
                            <p className="font-bold text-white">Severe Weather Warning</p>
                            <p className="text-sm text-white/80">Cyclone approaching Sector 4 - Immediate action required</p>
                        </div>
                    </motion.div>

                    {/* Financial Summary */}
                    <div className="mb-6 p-4 admin-glass rounded-lg border border-cyber-green/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Total Processed Loans</p>
                                <p className="text-3xl font-bold cyber-text">$1.2M</p>
                            </div>
                            <TrendingUp size={32} className="text-cyber-green" />
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-12 gap-6">
                        {/* Widget A: Central Map */}
                        <div className="col-span-12 lg:col-span-6 admin-glass rounded-2xl overflow-hidden admin-widget">
                            <div className="p-4 border-b border-cyber-green/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MapPin size={18} className="text-cyber-green" />
                                    <h3 className="font-bold text-gray-200">Geospatial Intelligence</h3>
                                </div>
                                {isEditMode && <GripVertical size={18} className="text-cyber-green drag-handle" />}
                            </div>
                            <div className="h-[400px]">
                                <MapContainer center={[28.6139, 77.2090]} zoom={10} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer
                                        attribution='&copy; OpenStreetMap'
                                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    />
                                    {farmLocations.map((farm) => (
                                        <React.Fragment key={farm.id}>
                                            <Marker position={[farm.lat, farm.lng]}>
                                                <Popup>
                                                    <div className="text-xs">
                                                        <div className="font-bold">{farm.name}</div>
                                                        <div>Status: {farm.status === 'pest' ? 'Pest Outbreak' : 'Harvest Ready'}</div>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                            <Circle
                                                center={[farm.lat, farm.lng]}
                                                radius={3000}
                                                pathOptions={{
                                                    color: farm.status === 'pest' ? '#FF3366' : '#D4AF37',
                                                    fillColor: farm.status === 'pest' ? '#FF3366' : '#D4AF37',
                                                    fillOpacity: 0.2
                                                }}
                                            />
                                        </React.Fragment>
                                    ))}
                                </MapContainer>
                            </div>
                        </div>

                        {/* Widget B: AI Diagnostics */}
                        <div className="col-span-12 lg:col-span-6 admin-glass rounded-2xl p-4 admin-widget">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Activity size={18} className="text-cyber-green" />
                                    <h3 className="font-bold text-gray-200">AI Advisory Engine</h3>
                                </div>
                                {isEditMode && <GripVertical size={18} className="text-cyber-green drag-handle" />}
                            </div>
                            <div className="space-y-3 max-h-[360px] overflow-y-auto custom-scrollbar">
                                {aiDiagnoses.map((diagnosis) => (
                                    <motion.div
                                        key={diagnosis.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="data-card"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-200 mb-1">{diagnosis.issue}</h4>
                                                <p className="text-xs text-gray-400">{diagnosis.farm}</p>
                                            </div>
                                            <span className="cyber-text text-sm">{diagnosis.confidence}% confidence</span>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <button className="admin-btn admin-btn-primary flex items-center gap-1 text-xs">
                                                <CheckCircle size={14} />
                                                Approve
                                            </button>
                                            <button className="admin-btn admin-btn-danger flex items-center gap-1 text-xs">
                                                <XCircle size={14} />
                                                Reject
                                            </button>
                                            <button className="admin-btn admin-btn-secondary text-xs">Verify</button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Widget C: Marketplace Ticker */}
                        <div className="col-span-12 admin-glass rounded-2xl p-4 overflow-hidden admin-widget">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-200">Live Marketplace Transactions</h3>
                                {isEditMode && <GripVertical size={18} className="text-cyber-green drag-handle" />}
                            </div>
                            <div className="overflow-hidden">
                                <div className="ticker-scroll flex gap-8 whitespace-nowrap">
                                    {[...transactions, ...transactions].map((txn, idx) => (
                                        <span key={idx} className="text-cyber-green font-mono text-sm">
                                            {txn}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Widget D: System Health */}
                        <div className="col-span-12 lg:col-span-6 admin-glass rounded-2xl p-6 admin-widget">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-200">System Health</h3>
                                {isEditMode && <GripVertical size={18} className="text-cyber-green drag-handle" />}
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {systemMetrics.map((metric) => (
                                    <CircularProgress key={metric.label} {...metric} />
                                ))}
                            </div>
                        </div>

                        {/* Widget E: User Stats */}
                        <div className="col-span-12 lg:col-span-6 admin-glass rounded-2xl p-6 admin-widget">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-200">User Statistics</h3>
                                {isEditMode && <GripVertical size={18} className="text-cyber-green drag-handle" />}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="data-card text-center">
                                    <Users size={32} className="text-cyber-green mx-auto mb-2" />
                                    <p className="text-3xl font-bold cyber-text">2,847</p>
                                    <p className="text-sm text-gray-400 mt-1">Active Farmers</p>
                                    <div className="flex items-center justify-center gap-1 mt-2">
                                        <TrendingUp size={14} className="text-green-500" />
                                        <span className="text-xs text-green-500">+12.5%</span>
                                    </div>
                                </div>
                                <div className="data-card text-center">
                                    <Users size={32} className="text-alert-amber mx-auto mb-2" />
                                    <p className="text-3xl font-bold text-alert-amber">342</p>
                                    <p className="text-sm text-gray-400 mt-1">Institutional Buyers</p>
                                    <div className="flex items-center justify-center gap-1 mt-2">
                                        <TrendingUp size={14} className="text-green-500" />
                                        <span className="text-xs text-green-500">+8.3%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Floating Add Widget Button */}
            <button className="admin-fab">
                <Plus size={28} className="text-admin-bg-primary" />
            </button>
        </div>
    );
};

export default AdminDashboard;
