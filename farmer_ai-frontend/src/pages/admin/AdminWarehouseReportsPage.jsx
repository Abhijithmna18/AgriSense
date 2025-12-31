import React, { useState, useEffect } from 'react';
import { getWarehouseAiReport } from '../../services/warehouseApi';
import { Sparkles, TrendingUp, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminWarehouseReportsPage = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReport();
    }, []);

    const loadReport = async () => {
        try {
            const data = await getWarehouseAiReport();
            setReport(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="text-purple-600" /> AI Warehouse Advisory
            </h1>

            {loading ? <div>Generating AI Analysis...</div> : report ? (
                <div className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="text-gray-500 text-sm mb-1">Total Bookings</div>
                            <div className="text-3xl font-bold">{report.metrics.totalBookings}</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="text-gray-500 text-sm mb-1">Revenue</div>
                            <div className="text-3xl font-bold text-green-600">₹{report.metrics.totalRevenue}</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="text-gray-500 text-sm mb-1">Vol (Tons)</div>
                            <div className="text-3xl font-bold text-blue-600">{report.metrics.totalTons}</div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-blue-600" /> Metrics Overview
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Bookings', value: report.metrics.totalBookings },
                                { name: 'Warehouses', value: report.metrics.totalWarehouses }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* AI Analysis */}
                    <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl shadow-sm border border-purple-100">
                        <h2 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" /> Strategic Insights
                        </h2>
                        <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                            {report.summary}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-red-500">Failed to load report. Check if AI service is running.</div>
            )}
        </div>
    );
};

export default AdminWarehouseReportsPage;
