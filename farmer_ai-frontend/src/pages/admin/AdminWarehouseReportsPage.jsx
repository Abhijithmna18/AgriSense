import React, { useState, useEffect } from 'react';
import { getWarehouseAiReport } from '../../services/warehouseApi';
import { Sparkles, TrendingUp, BarChart2, AlertCircle, CheckCircle, TrendingDown, Package, DollarSign, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const AdminWarehouseReportsPage = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadReport();
    }, []);

    const loadReport = async () => {
        try {
            const data = await getWarehouseAiReport();
            setReport(data.data);
            setError(null);
        } catch (error) {
            console.error(error);
            setError(error.message);
            // Set mock data for demonstration
            setReport(generateMockReport());
        } finally {
            setLoading(false);
        }
    };

    const generateMockReport = () => {
        return {
            metrics: {
                totalBookings: 1,
                totalRevenue: 30030,
                totalTons: 100.1,
                totalWarehouses: 5,
                avgBookingValue: 30030,
                utilizationRate: 65
            },
            summary: generateStrategicInsights({
                totalBookings: 1,
                totalRevenue: 30030,
                totalTons: 100.1,
                totalWarehouses: 5
            }),
            topWarehouses: [
                { name: 'Central Storage', bookings: 1, revenue: 30030 }
            ],
            trends: {
                bookingsGrowth: 0,
                revenueGrowth: 0
            }
        };
    };

    const generateStrategicInsights = (metrics) => {
        const insights = [];

        // Revenue Analysis
        if (metrics.totalRevenue > 0) {
            insights.push(`💰 Revenue Performance: Generated ₹${metrics.totalRevenue.toLocaleString()} from ${metrics.totalBookings} booking(s). Average booking value is ₹${(metrics.totalRevenue / metrics.totalBookings).toLocaleString()}.`);
        }

        // Capacity Analysis
        if (metrics.totalTons > 0) {
            insights.push(`📦 Storage Utilization: Currently managing ${metrics.totalTons} tons of agricultural produce across ${metrics.totalWarehouses} warehouse facilities.`);
        }

        // Growth Recommendations
        if (metrics.totalBookings < 10) {
            insights.push(`📈 Growth Opportunity: With only ${metrics.totalBookings} booking(s), there's significant room for expansion. Consider marketing campaigns targeting farmers in nearby regions.`);
        }

        // Operational Insights
        insights.push(`🎯 Operational Status: ${metrics.totalWarehouses} warehouses are operational. Focus on maintaining quality standards and timely service delivery.`);

        // Strategic Recommendations
        insights.push(`\n🔮 Strategic Recommendations:\n• Implement dynamic pricing based on demand patterns\n• Expand warehouse network in high-demand agricultural zones\n• Introduce loyalty programs for repeat customers\n• Leverage IoT sensors for real-time inventory monitoring\n• Partner with agricultural cooperatives for bulk bookings`);

        // Market Insights
        insights.push(`\n📊 Market Insights:\n• Peak booking season typically occurs during harvest months (Oct-Dec)\n• Average storage duration: 3-6 months for grain storage\n• Premium pricing opportunity for climate-controlled facilities\n• Growing demand for organic produce storage with certification`);

        return insights.join('\n\n');
    };

    const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="text-purple-600" /> AI Warehouse Advisory
            </h1>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <div className="text-gray-600">Generating AI Analysis...</div>
                    </div>
                </div>
            ) : report ? (
                <div className="space-y-6">
                    {/* Alert if using mock data */}
                    {error && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <div className="font-semibold text-blue-900">Demo Mode</div>
                                <div className="text-sm text-blue-700">Showing sample insights. Connect to AI service for real-time analysis.</div>
                            </div>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-gray-500 text-sm">Total Bookings</div>
                                <Calendar className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900">{report.metrics.totalBookings}</div>
                            <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Active bookings
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-gray-500 text-sm">Revenue</div>
                                <DollarSign className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="text-3xl font-bold text-green-600">₹{report.metrics.totalRevenue.toLocaleString()}</div>
                            <div className="text-xs text-gray-500 mt-2">
                                Avg: ₹{Math.round(report.metrics.totalRevenue / report.metrics.totalBookings).toLocaleString()}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-gray-500 text-sm">Volume (Tons)</div>
                                <Package className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="text-3xl font-bold text-blue-600">{report.metrics.totalTons}</div>
                            <div className="text-xs text-gray-500 mt-2">
                                Storage capacity utilized
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-gray-500 text-sm">Warehouses</div>
                                <BarChart2 className="w-5 h-5 text-purple-500" />
                            </div>
                            <div className="text-3xl font-bold text-purple-600">{report.metrics.totalWarehouses}</div>
                            <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                All operational
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Bar Chart */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-blue-600" /> Metrics Overview
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={[
                                    { name: 'Bookings', value: report.metrics.totalBookings },
                                    { name: 'Warehouses', value: report.metrics.totalWarehouses }
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" stroke="#666" />
                                    <YAxis stroke="#666" />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#fff', 
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Pie Chart */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-600" /> Revenue Distribution
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={report.topWarehouses || [
                                            { name: 'Central Storage', value: 100 }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {(report.topWarehouses || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* AI Strategic Insights */}
                    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-white p-8 rounded-2xl shadow-sm border border-purple-100">
                        <h2 className="text-xl font-bold text-purple-900 mb-6 flex items-center gap-2">
                            <Sparkles className="w-6 h-6" /> Strategic Insights
                        </h2>
                        <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed space-y-4">
                            {report.summary && report.summary.split('\n\n').map((paragraph, index) => (
                                <div key={index} className="bg-white/50 p-4 rounded-lg border border-purple-100">
                                    {paragraph}
                                </div>
                            ))}
                            {!report.summary && (
                                <div className="bg-white/50 p-4 rounded-lg border border-purple-100">
                                    No strategic insights available at this time. Generate insights by analyzing warehouse data.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Items */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" /> Recommended Actions
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                    <div className="font-semibold text-green-900">Optimize Pricing</div>
                                    <div className="text-sm text-green-700">Implement dynamic pricing based on demand</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <div className="font-semibold text-blue-900">Expand Network</div>
                                    <div className="text-sm text-blue-700">Add warehouses in high-demand zones</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                                <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                                <div>
                                    <div className="font-semibold text-purple-900">Marketing Campaign</div>
                                    <div className="text-sm text-purple-700">Target farmers in nearby regions</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-100">
                                <Package className="w-5 h-5 text-orange-600 mt-0.5" />
                                <div>
                                    <div className="font-semibold text-orange-900">IoT Integration</div>
                                    <div className="text-sm text-orange-700">Deploy sensors for real-time monitoring</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <div className="text-red-900 font-semibold mb-2">Failed to Load Report</div>
                    <div className="text-red-700 text-sm">Check if AI service is running or try refreshing the page.</div>
                    <button 
                        onClick={loadReport}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminWarehouseReportsPage;
