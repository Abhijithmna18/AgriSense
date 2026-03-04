import React, { useState, useEffect } from 'react';
import { Sprout, Calendar, TrendingUp, AlertCircle, Plus, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';

export default function CropCycleManager({ farmId }) {
    // Mock Data for Phase 2 UI building
    const [activeCycles, setActiveCycles] = useState([
        {
            _id: 'c1',
            cropName: 'Wheat HD-2967',
            status: 'growing',
            plantedAt: '2026-01-15',
            expectedHarvestDate: '2026-05-10',
            areaAllocated: 5.5,
            yieldExpected: 12500,
            timeline: [
                { stage: 'Sowing', completed: true, date: '2026-01-15' },
                { stage: 'Germination', completed: true, date: '2026-01-25' },
                { stage: 'Tillering', completed: false, date: '2026-02-28' },
                { stage: 'Flowering', completed: false, date: '2026-04-05' },
                { stage: 'Harvesting', completed: false, date: '2026-05-10' }
            ]
        }
    ]);

    // Mock Growth Data for Chart
    const growthData = [
        { day: 'Day 1', growth: 0 },
        { day: 'Day 15', growth: 20 },
        { day: 'Day 30', growth: 45 },
        { day: 'Day 45 (Now)', growth: 55 },
        { day: 'Day 60', growth: 80 },
        { day: 'Day 90', growth: 100 }
    ];

    const calculateProgress = (cycle) => {
        const start = new Date(cycle.plantedAt).getTime();
        const end = new Date(cycle.expectedHarvestDate).getTime();
        const now = new Date().getTime();

        if (now >= end) return 100;
        if (now <= start) return 0;

        return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-emerald-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Sprout className="text-emerald-500" />
                        Crop Cycle Manager
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Track active planting seasons, growth stages, and estimated yields.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-sm shadow-emerald-200">
                    <Plus size={16} /> New Planting
                </button>
            </div>

            {activeCycles.map(cycle => {
                const progress = calculateProgress(cycle);
                const currentStageIndex = cycle.timeline.findIndex(t => !t.completed);
                const currentStage = currentStageIndex !== -1 ? cycle.timeline[currentStageIndex] : cycle.timeline[cycle.timeline.length - 1];

                return (
                    <div key={cycle._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        {/* Header Area */}
                        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-6">
                            <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold text-slate-900">{cycle.cropName}</h3>
                                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {cycle.status}
                                    </span>
                                </div>
                                <div className="flex gap-6 text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Calendar size={16} className="text-slate-400" />
                                        <span>Planted: <strong className="text-slate-800">{new Date(cycle.plantedAt).toLocaleDateString()}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <TrendingUp size={16} className="text-slate-400" />
                                        <span>Est. Yield: <strong className="text-slate-800">{cycle.yieldExpected.toLocaleString()} kg</strong></span>
                                    </div>
                                </div>
                            </div>

                            {/* Circular Progress (Using standard div tricks for UI speed) */}
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Growth Progress</p>
                                    <h4 className="text-2xl font-black text-emerald-600">{progress.toFixed(0)}%</h4>
                                </div>
                            </div>
                        </div>

                        {/* Middle Content: Timeline & Chart */}
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            {/* Growth Timeline */}
                            <div className="p-6 border-r border-slate-100 border-b lg:border-b-0 space-y-6">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Clock size={18} className="text-indigo-500" />
                                    Growth Stages
                                </h4>
                                <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
                                    {cycle.timeline.map((stage, idx) => (
                                        <div key={idx} className="relative pl-6">
                                            {/* Node Marker */}
                                            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${stage.completed ? 'bg-emerald-500 border-emerald-500' :
                                                    idx === currentStageIndex ? 'bg-indigo-500 border-white shadow-[0_0_0_2px_#6366f1]' :
                                                        'bg-white border-slate-300'
                                                }`} />

                                            <div>
                                                <h5 className={`font-bold text-sm ${stage.completed ? 'text-slate-800' : idx === currentStageIndex ? 'text-indigo-700' : 'text-slate-500'}`}>
                                                    {stage.stage}
                                                </h5>
                                                <p className="text-xs text-slate-500 mt-1 font-medium text-[11px] uppercase tracking-wider">
                                                    Target: {new Date(stage.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Chart Area */}
                            <div className="p-6 flex flex-col">
                                <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <TrendingUp size={18} className="text-emerald-500" />
                                    Projected Vigour Curve
                                </h4>
                                <div className="flex-1 min-h-[200px] bg-slate-50/50 rounded-xl border border-slate-100 p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={growthData}>
                                            <defs>
                                                <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="growth" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-3 items-start">
                                    <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-800 font-medium">Standard NPK application recommended in 3 days before entering the Flowering stage.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
