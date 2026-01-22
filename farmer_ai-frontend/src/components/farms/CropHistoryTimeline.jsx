import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { useFarmIntelligence } from '../../context/FarmIntelligenceContext';
import { format } from 'date-fns';

const CropHistoryTimeline = () => {
    const { intelligence } = useFarmIntelligence();
    const history = intelligence?.cropCycles?.history || [];
    const active = intelligence?.cropCycles?.active || [];

    // Merge for timeline
    const data = [...history, ...active].map(cycle => ({
        name: cycle.cropName,
        start: new Date(cycle.sowingDate).getTime(),
        end: new Date(cycle.actualHarvestDate || cycle.expectedHarvestDate).getTime(),
        yield: cycle.yieldActual || cycle.yieldPredicted,
        status: cycle.status,
        dateFormatted: format(new Date(cycle.sowingDate), 'MMM yyyy')
    })).sort((a, b) => a.start - b.start);

    if (data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-400 text-sm">No crop history available. Start a new cycle!</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Crop Timeline & Yield</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={80} style={{ fontSize: '12px', fontWeight: 500 }} />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            content={({ payload, label }) => {
                                if (payload && payload.length) {
                                    const d = payload[0].payload;
                                    return (
                                        <div className="bg-white p-2 shadow-lg border border-gray-100 rounded text-xs">
                                            <p className="font-bold">{label}</p>
                                            <p>Sown: {format(d.start, 'dd MMM yyyy')}</p>
                                            <p>Harvest: {format(d.end, 'dd MMM yyyy')}</p>
                                            <p>Yield: {d.yield} tons</p>
                                            <p className={`capitalize font-semibold ${d.status === 'Active' ? 'text-green-600' : 'text-gray-600'}`}>
                                                {d.status}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="yield" fill="#4ade80" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CropHistoryTimeline;
