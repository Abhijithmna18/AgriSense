import React, { useState } from 'react';
import {
    Leaf, Droplets, Thermometer, Sun, Activity, AlertTriangle,
    TrendingUp, DollarSign, Sprout, ClipboardCheck, Video,
    ShieldCheck, CloudRain, Package, ChevronRight, Plus, MapPin, ArrowRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Card = ({ title, value, icon: Icon, unit, color = "blue", subtext }) => (
    <div className={`p-4 bg-white rounded-xl shadow-sm border-l-4 border-${color}-500 flex items-center space-x-4`}>
        <div className={`p-3 bg-${color}-50 rounded-full text-${color}-600`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value} <span className="text-sm font-normal text-gray-400">{unit}</span></h3>
            {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
    </div>
);

const SectionHeader = ({ icon: Icon, title, append }) => (
    <div className="flex items-center justify-between mb-4 mt-6 first:mt-0">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <Icon size={20} className="text-green-600" /> {title}
        </h3>
        {append}
    </div>
);

const ZoneDashboard = ({ zone, onGetAdvice, onCheckDisease, onAlertClick }) => {
    const [activeTab, setActiveTab] = useState('overview');

    // DEFAULT STATE - FARM OVERVIEW
    if (!zone) {
        return (
            <div className="h-full bg-gray-50 p-6 overflow-y-auto">
                <div className="mb-6 border-b border-gray-200 pb-4">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <MapPin className="text-green-600" /> Farm Overview
                    </h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">ACTION REQUIRED</span>
                        Select a zone on the map to manage it.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm">Active Zones</p>
                        <h3 className="text-3xl font-bold text-green-700">4</h3>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm">Risk Alerts</p>
                        <h3 className="text-3xl font-bold text-red-600">2</h3>
                    </div>
                </div>

                {/* Interactive Alerts */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 transition-all hover:shadow-md cursor-pointer"
                    onClick={() => onAlertClick && onAlertClick(['z2'])}> {/* Mock Zone ID z2 */}
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <CloudRain size={18} className="text-blue-500" /> Weather Alert
                        </h3>
                        <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-full">Click to Locate Risk</span>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
                        <strong>Heavy Rain Forecast</strong>: 40mm expected. Check drainage in low-lying zones (Sector A).
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Package size={18} className="text-orange-500" /> Inventory Low Stock
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-0">
                            <div>
                                <span className="block font-medium text-gray-800">Urea 46%</span>
                                <span className="text-red-500 text-xs">20% remaining (120kg)</span>
                            </div>
                            <button className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-200 transition-colors">
                                Reorder
                            </button>
                        </div>
                        <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-0">
                            <div>
                                <span className="block font-medium text-gray-800">Bio-Pesticide</span>
                                <span className="text-orange-500 text-xs">Warning (5L)</span>
                            </div>
                            <button className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-200 transition-colors">
                                Reorder
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const sensors = zone.current_sensors || {};
    const activities = zone.activities || [];
    const isRubber = zone.crop_name?.toLowerCase().includes('rubber');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: sp => <Leaf size={sp} /> },
        { id: 'finance', label: 'Costs & Yield', icon: sp => <DollarSign size={sp} /> },
        { id: 'expert', label: 'Expert & AI', icon: sp => <Video size={sp} /> },
    ];

    return (
        <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
            {/* Header */}
            <div className="bg-white p-5 border-b border-gray-200 shadow-sm shrink-0">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{zone.name}</h1>
                        <p className="text-sm text-gray-500">{zone.type} • {zone.area_acres} Acres • {zone.crop_name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${zone.status === 'Healthy' ? 'bg-green-100 text-green-700 border-green-200' :
                            zone.status === 'Risk' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                'bg-red-100 text-red-700 border-red-200'
                        }`}>
                        {zone.status}
                    </span>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-white text-green-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.icon(16)} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">

                {/* === OVERVIEW TAB === */}
                {activeTab === 'overview' && (
                    <>
                        {/* Live Conditions */}
                        <SectionHeader icon={Activity} title="Live Conditions"
                            append={<span className="text-xs text-gray-400">Updated 5m ago</span>}
                        />
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                                <span className="text-xs text-gray-400">Moisture</span>
                                <div className="text-xl font-bold text-blue-600 flex items-end gap-1">
                                    {sensors.soil_moisture || '--'}%
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-orange-100 shadow-sm">
                                <span className="text-xs text-gray-400">Temp</span>
                                <div className="text-xl font-bold text-orange-600 flex items-end gap-1">
                                    {sensors.temperature || '--'}°C
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-cyan-100 shadow-sm">
                                <span className="text-xs text-gray-400">Rainfall (24h)</span>
                                <div className="text-xl font-bold text-cyan-600 flex items-end gap-1">
                                    12 mm
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-yellow-100 shadow-sm">
                                <span className="text-xs text-gray-400">Sunlight</span>
                                <div className="text-xl font-bold text-yellow-600 flex items-end gap-1">
                                    {sensors.sunlight || '--'} lx
                                </div>
                            </div>
                        </div>

                        {/* AI Recommendation Card (Visible & Actionable) */}
                        <SectionHeader icon={Sprout} title="Zone Recommendation" />
                        <div className="bg-gradient-to-r from-emerald-50 to-white border border-emerald-100 rounded-xl p-5 mb-6 shadow-sm relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded">High Confidence (88%)</span>
                                </div>
                                <h4 className="font-bold text-emerald-900 mb-1">Increase Irrigation by 15%</h4>
                                <p className="text-sm text-emerald-800 mb-3">"Soil moisture dropped below 60% and high heat is forecast."</p>
                                <div className="flex gap-2">
                                    <button
                                        className="text-xs bg-emerald-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-emerald-700 transition shadow-sm"
                                        onClick={() => alert("Irrigation Schedule Updated!")}
                                    >
                                        Apply Adjustment
                                    </button>
                                    <button className="text-xs bg-white text-emerald-600 px-3 py-2 rounded-lg font-medium border border-emerald-200 hover:bg-emerald-50 transition">
                                        View Details
                                    </button>
                                </div>
                            </div>
                            {/* Decorative Background */}
                            <Leaf className="absolute -right-4 -bottom-4 text-emerald-100 opacity-50" size={100} />
                        </div>


                        {/* Crop Details */}
                        <SectionHeader icon={ShieldCheck} title="Crop Health"
                            append={<button onClick={onCheckDisease} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100 hover:bg-red-100">Upload Image</button>}
                        />
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium">Stage: <span className="text-green-600 font-bold">{zone.crop_stage || 'Vegetative'}</span></p>
                                    <p className="text-xs text-gray-500">Irrigation: {zone.irrigation_type || 'Drip'}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-green-50">
                                <p className="text-sm text-green-800 flex items-center gap-2">
                                    <ShieldCheck size={16} /> No diseases detected.
                                </p>
                            </div>
                        </div>

                        {/* Zone Actions */}
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 p-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                                <ClipboardCheck size={16} /> Log Activity
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 p-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                                <TrendingUp size={16} /> View Cost Impact
                            </button>
                        </div>
                    </>
                )}

                {/* === FINANCE TAB === */}
                {activeTab === 'finance' && (
                    <>
                        <SectionHeader icon={DollarSign} title="Cost Tracker"
                            append={<button className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded border border-green-100 hover:bg-green-100 flex items-center gap-1"><Plus size={12} /> Log Expense</button>}
                        />
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-4">
                            <div className="flex justify-between mb-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Total Cost</p>
                                    <h3 className="text-2xl font-bold text-gray-800">$1,250</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase">Per Acre</p>
                                    <h3 className="text-xl font-bold text-gray-800">${(1250 / zone.area_acres).toFixed(0)}</h3>
                                </div>
                            </div>
                            <div className="h-4 flex rounded-full overflow-hidden bg-gray-100 mb-2">
                                <div style={{ width: '40%' }} className="bg-blue-400" title="Labor"></div>
                                <div style={{ width: '30%' }} className="bg-green-400" title="Fertilizer"></div>
                                <div style={{ width: '20%' }} className="bg-yellow-400" title="Machinery"></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Labor</span>
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400"></div> Inputs</span>
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Machinery</span>
                            </div>
                        </div>

                        <SectionHeader icon={Package} title="Inventory Usage"
                            append={<button className="text-xs text-blue-600 hover:underline">Replenish</button>}
                        />
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="p-3 font-medium">Item</th>
                                        <th className="p-3 font-medium">Used</th>
                                        <th className="p-3 font-medium">Stock</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="p-3">NPK 20-20-20</td>
                                        <td className="p-3">50 kg</td>
                                        <td className="p-3 text-red-500">20 kg</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3">Pesticide A</td>
                                        <td className="p-3">2 L</td>
                                        <td className="p-3 text-green-500">10 L</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* COMPLIANCE SECTION (Conditional) */}
                        {isRubber && (
                            <>
                                <SectionHeader icon={ClipboardCheck} title="Regulatory & Compliance" />
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-blue-900">Rubber NRL Export Data</h4>
                                        <button className="text-xs bg-white text-blue-700 px-2 py-1 rounded shadow-sm">Generate PDF</button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-blue-700/70 text-xs">Avg DRC %</p>
                                            <p className="font-medium text-blue-900">32.5%</p>
                                        </div>
                                        <div>
                                            <p className="text-blue-700/70 text-xs">Quality Grade</p>
                                            <p className="font-medium text-blue-900">RSS-4</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* === EXPERT TAB === */}
                {activeTab === 'expert' && (
                    <>
                        <SectionHeader icon={Sprout} title="AI Advisory" />
                        <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-5 mb-6 shadow-sm">
                            <p className="text-gray-600 italic mb-4">"Based on recent soil moisture drop (22%) and vegetative stage..."</p>
                            <button
                                onClick={onGetAdvice}
                                className="w-full py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition shadow-md flex justify-center items-center gap-2"
                            >
                                <Leaf size={18} /> Update Recommendation
                            </button>
                        </div>

                        <SectionHeader icon={Video} title="Human Expert" />
                        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3 overflow-hidden">
                                <img src="/api/placeholder/64/64" alt="Expert" className="w-full h-full object-cover" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Dr. Aruna Reddy</h4>
                            <p className="text-xs text-gray-500 mb-4">Senior Agronomist • Available Now</p>
                            <button className="w-full py-2 border border-blue-500 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition flex justify-center items-center gap-2">
                                <Video size={18} /> Consult via Video
                            </button>
                            <p className="text-[10px] text-gray-400 mt-2">Share permission: Sensors, History, AI Logs</p>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default ZoneDashboard;
