
import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import { TrendingUp, TrendingDown, MoreHorizontal, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const KPICard = ({ title, value, trend, isPositive, data, color, Icon }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    {Icon && <Icon size={14} className="text-slate-400" />}
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
            </div>
            {trend !== undefined && (
                <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {isPositive ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                    {Math.abs(trend)}%
                </span>
            )}
        </div>

        {/* Micro Sparkline */}
        <div className="h-10 w-full opacity-50 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const FinancialSnapshot = ({ data, loading, kpiConfig = [] }) => {
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse" />)}
                </div>
                <div className="h-80 bg-slate-200 rounded-xl animate-pulse" />
            </div>
        );
    }

    if (!data) return null;

    const { monthlyCashflow } = data;

    // Mock Sparkline Data for visual effect
    const generateSparkline = (baseValue) => Array.from({ length: 10 }, (_, i) => ({ value: (baseValue || 0) * (0.8 + Math.random() * 0.4) }));

    const resolveValue = (key) => {
        const val = data[key];
        return val !== undefined && val !== null ? `₹${val.toLocaleString()}` : '₹0';
    };

    return (
        <div className="space-y-6">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiConfig.map((card) => {
                    const rawValue = data[card.dataKey];
                    return (
                        <KPICard
                            key={card.id}
                            title={card.label}
                            value={resolveValue(card.dataKey)}
                            trend={0} // Mock trend for now as it wasn't in original data prop
                            isPositive={true}
                            data={generateSparkline(rawValue)}
                            color={card.color === 'blue' ? '#3B82F6' : card.color === 'emerald' ? '#10B981' : card.color === 'rose' ? '#EF4444' : '#F59E0B'}
                            Icon={card.icon}
                        />
                    );
                })}
            </div>

            {/* Main Gradient Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Cashflow Analytics</h3>
                        <p className="text-sm text-slate-400">Income vs Expenses over time</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Income
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Expenses
                        </div>
                    </div>
                </div>

                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyCashflow} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94A3B8', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94A3B8', fontSize: 12 }}
                                tickFormatter={(value) => `₹${value / 1000}k`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontSize: '12px', fontWeight: '600' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="income"
                                stroke="#10B981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorIncome)"
                            />
                            <Area
                                type="monotone"
                                dataKey="expense"
                                stroke="#EF4444"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorExpense)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default FinancialSnapshot;
