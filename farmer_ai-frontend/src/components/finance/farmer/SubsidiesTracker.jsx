import React, { useState, useEffect } from 'react';
import { Shield, FileText, Plus, AlertCircle, TrendingUp, TrendingDown, Clock, Search } from 'lucide-react';
import { addTransaction, getTransactions } from '../../../api/financeApi';
import { toast } from 'react-hot-toast';

const SubsidiesTracker = () => {
    const [subsidies, setSubsidies] = useState([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        type: 'subsidy', // 'subsidy' or 'emi'
        name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        status: 'pending' // 'pending' or 'received/paid'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const allTx = await getTransactions();

            // Filter out transactions that represent subsidies or EMIs. 
            // We use 'subsidy' and 'emi' as categories.
            const relevantTx = allTx.filter(tx =>
                tx.category === 'subsidy' || tx.category === 'loan_emi'
            );

            // Since our backend transaction model tracks status as 'completed', 'pending'
            setSubsidies(relevantTx);
        } catch (error) {
            console.error("Failed to fetch subsidies", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Map to backend transaction format
            const payload = {
                amount: parseFloat(formData.amount),
                type: formData.type === 'subsidy' ? 'credit' : 'debit',
                category: formData.type === 'subsidy' ? 'subsidy' : 'loan_emi',
                description: formData.name,
                date: formData.date
                // Backend auto-sets status to completed for now, but we'll adapt.
            };

            await addTransaction(payload);
            toast.success(`${formData.type === 'subsidy' ? 'Subsidy' : 'EMI'} entry saved!`);
            setIsAddOpen(false);
            setFormData({
                type: 'subsidy',
                name: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                status: 'pending'
            });
            fetchData();

        } catch (error) {
            toast.error("Failed to save entry");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Shield className="text-emerald-500" />
                        Subsidies & EMI Tracker
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Track government schemes, grants, insurance claims, and loan EMIs.</p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-sm shadow-emerald-200"
                >
                    <Plus size={16} /> New Entry
                </button>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Subsidies claiming</p>
                        <h3 className="text-2xl font-bold text-slate-800">
                            ₹{subsidies.filter(s => s.category === 'subsidy').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
                        <TrendingDown size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total EMIs Paid</p>
                        <h3 className="text-2xl font-bold text-slate-800">
                            ₹{subsidies.filter(s => s.category === 'loan_emi').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                        </h3>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl shadow-sm text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full translate-x-10 -translate-y-10 blur-xl"></div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Upcoming Milestone</p>
                        <h3 className="text-lg font-bold text-white mb-2">PM-KISAN Installment</h3>
                        <p className="text-sm text-indigo-200 flex items-center gap-2">
                            <Clock size={14} /> Expected next month
                        </p>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Tracking History</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-slate-400">Loading entries...</div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Title / Description</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {subsidies.length > 0 ? subsidies.map((item) => (
                                <tr key={item._id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{new Date(item.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.category === 'subsidy' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {item.category.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-800">{item.description}</td>
                                    <td className={`px-6 py-4 text-right font-bold ${item.category === 'subsidy' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                        {item.category === 'subsidy' ? '+' : '-'}₹{item.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'completed' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        No tracker entries found. Add one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900">Add Tracker Entry</h3>
                            <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="sr-only">Close</span>
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Entry Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'subsidy' })}
                                        className={`py-2 px-4 rounded-lg text-sm font-bold border ${formData.type === 'subsidy' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600'}`}
                                    >
                                        Subsidy / Grant
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'emi' })}
                                        className={`py-2 px-4 rounded-lg text-sm font-bold border ${formData.type === 'emi' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-slate-200 text-slate-600'}`}
                                    >
                                        Loan EMI
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description (Scheme / Bank)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium text-slate-700"
                                    placeholder={formData.type === 'subsidy' ? "e.g. PM-KISAN, Fertilizer Subsidy" : "e.g. Tractor Loan EMI"}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Amount (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-800"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium text-slate-700"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-4 bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200"
                            >
                                Save Entry
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubsidiesTracker;
