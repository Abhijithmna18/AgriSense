
import React, { useState, useMemo } from 'react';
import { Plus, Filter, PieChart as PieIcon, List, Download } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const SharedExpenseManager = ({ transactions = [], categories = [], onAddExpense }) => {
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'chart'
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Filter only expenses (backend stores as 'debit', frontend might send 'expense')
    const expenses = useMemo(() => transactions.filter(t => t.type === 'expense' || t.type === 'debit'), [transactions]);

    // Aggregate by category
    const categoryData = useMemo(() => {
        const aggs = {};
        expenses.forEach(t => {
            const cat = t.category || 'Miscellaneous';
            aggs[cat] = (aggs[cat] || 0) + t.amount;
        });
        return Object.entries(aggs).map(([name, value]) => ({ name, value }));
    }, [expenses]);

    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <List size={16} /> List
                    </button>
                    <button
                        onClick={() => setViewMode('chart')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'chart' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <PieIcon size={16} /> Analysis
                    </button>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">
                        <Filter size={16} /> Filter
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-200"
                    >
                        <Plus size={16} /> Add Expense
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                {viewMode === 'chart' ? (
                    categoryData.length > 0 ? (
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 mb-4">Category Breakdown</h4>
                                <div className="space-y-3">
                                    {categoryData.map((cat, idx) => (
                                        <div key={cat.name} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                                <span className="text-slate-600">{cat.name}</span>
                                            </div>
                                            <span className="font-bold text-slate-800">₹{cat.value.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-80 text-slate-400">
                            <div className="bg-slate-50 p-4 rounded-full mb-4">
                                <PieIcon size={32} className="text-slate-300" />
                            </div>
                            <p className="font-medium">No expenses to analyze yet.</p>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="text-sm text-indigo-600 font-bold mt-2 hover:underline"
                            >
                                Add your first expense
                            </button>
                        </div>
                    )
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {expenses.length > 0 ? expenses.map((tx) => (
                                <tr key={tx._id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 text-slate-500">{new Date(tx.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium text-slate-800">{tx.description || 'Expense Entry'}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                                            {tx.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                                        ₹{tx.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">Paid</span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        No expenses found. Add one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Expense Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900">Add New Expense</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="sr-only">Close</span>
                                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                        <ExpenseForm
                            categories={categories}
                            onClose={() => setIsAddModalOpen(false)}
                            onSuccess={(newExpense) => {
                                if (onAddExpense) onAddExpense(newExpense);
                                setIsAddModalOpen(false);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const ExpenseForm = ({ categories, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        category: categories[0] || 'Miscellaneous',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { addTransaction } = await import('../../../api/financeApi');
            const payload = {
                ...formData,
                type: 'expense',
                amount: parseFloat(formData.amount)
            };
            const savedTransaction = await addTransaction(payload);
            onSuccess(savedTransaction);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Amount (₹)</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                        type="number"
                        required
                        min="1"
                        step="0.01"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-bold text-slate-800"
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-slate-700"
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                    {!categories.includes('Miscellaneous') && <option value="Miscellaneous">Miscellaneous</option>}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date</label>
                    <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-slate-700"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Reference (Optional)</label>
                    <input
                        type="text"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-slate-700"
                        placeholder="e.g. Invoice #123"
                    />
                </div>
            </div>

            <div className="pt-4 flex gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 text-sm flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Plus size={18} /> Save Expense
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default SharedExpenseManager;
