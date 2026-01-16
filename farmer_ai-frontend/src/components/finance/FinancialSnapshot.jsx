import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

const FinancialSnapshot = ({ data, loading }) => {
    if (loading) {
        return <div className="animate-pulse h-64 bg-gray-200 rounded-xl mb-6"></div>;
    }

    if (!data) return null;

    const { netIncome, totalRevenue, totalExpenses, outstandingLoanBalance, financialRisk, monthlyCashflow, expenseBreakdown } = data;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Net Income</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">₹{netIncome?.toLocaleString()}</h3>
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block">Safe</span>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-emerald-600 mt-1">₹{totalRevenue?.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Total Expenses</p>
                    <h3 className="text-2xl font-bold text-red-500 mt-1">₹{totalExpenses?.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Loan Balance</p>
                    <h3 className="text-2xl font-bold text-orange-500 mt-1">₹{outstandingLoanBalance?.toLocaleString()}</h3>
                    <div className="mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${financialRisk === 'Low' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            Risk: {financialRisk}
                        </span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cashflow Chart */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-sm font-bold text-gray-700 mb-4">Monthly Cashflow</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyCashflow}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Line type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="expense" name="Expense" stroke="#EF4444" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expense Breakdown */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-sm font-bold text-gray-700 mb-4">Expense Breakdown</h4>
                    <div className="h-64 flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={expenseBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {expenseBreakdown && expenseBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialSnapshot;
