import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Calendar as CalendarIcon, Clock, CheckCircle, AlertTriangle, CloudRain,
    TrendingUp, Droplets, Sprout, Settings, Briefcase, Plus, Filter,
    BarChart2, List, Grid, XCircle, Loader2, ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/authApi';
import CreateOperationModal from '../components/operations/CreateOperationModal';
import CropCycleManager from '../components/operations/CropCycleManager';
import IrrigationControlPanel from '../components/operations/IrrigationControlPanel';

const TYPE_ICONS = {
    Irrigation: Droplets,
    Fertilization: Sprout,
    Sowing: Sprout,
    Spraying: CloudRain,
    Harvesting: Briefcase,
    Maintenance: Settings,
    Other: List
};

const TYPE_COLORS = {
    Irrigation: 'text-blue-600 bg-blue-50 border-blue-200',
    Fertilization: 'text-green-600 bg-green-50 border-green-200',
    Sowing: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    Spraying: 'text-purple-600 bg-purple-50 border-purple-200',
    Harvesting: 'text-amber-600 bg-amber-50 border-amber-200',
    Maintenance: 'text-gray-600 bg-gray-50 border-gray-200',
    Other: 'text-indigo-600 bg-indigo-50 border-indigo-200'
};

const FieldOperationsPage = () => {
    const navigate = useNavigate();
    const [operations, setOperations] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [weatherAlerts, setWeatherAlerts] = useState([]);
    const [farms, setFarms] = useState([]);
    const [selectedFarm, setSelectedFarm] = useState('');

    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar'
    const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'cycles'
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [dateRange, setDateRange] = useState('upcoming');

    useEffect(() => {
        fetchFarms();
    }, []);

    useEffect(() => {
        if (selectedFarm) {
            fetchData();
        }
    }, [selectedFarm, statusFilter, dateRange]);

    const fetchFarms = async () => {
        try {
            const res = await api.get('/api/farms');
            const userFarms = res.data?.data || [];
            setFarms(userFarms);
            if (userFarms.length > 0) {
                setSelectedFarm(userFarms[0]._id);
            } else {
                setLoading(false);
            }
        } catch (error) {
            toast.error('Failed to load farms');
            setLoading(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch tasks
            const opsRes = await api.get(`/api/operations?farmId=${selectedFarm}&status=${statusFilter}&dateRange=${dateRange}`);
            setOperations(opsRes.data.data);

            // Fetch Analytics & Alerts
            const analyticsRes = await api.get(`/api/operations/analytics/${selectedFarm}`);
            setAnalytics(analyticsRes.data.data.summary);
            setWeatherAlerts(analyticsRes.data.data.weatherAlerts);

        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.put(`/api/operations/${id}`, { status: newStatus });
            toast.success(`Operation marked as ${newStatus}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update operation');
        }
    };

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
            ' at ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    // Derived states
    const overdueOps = operations.filter(op => new Date(op.scheduledDate) < new Date() && op.status !== 'Completed');

    if (loading && !operations.length) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-green-600" size={48} /></div>;
    }

    return (
        <div className="min-h-screen bg-[#F4F7F6] p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Row */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-700 font-medium mb-2 transition-colors group"
                        >
                            <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={16} />
                            Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Briefcase className="text-green-600" size={32} />
                            Farm Operations OS
                        </h1>
                        <p className="text-gray-500 mt-1">Manage field tasks, track plant growth, and monitor resources.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <select
                            value={selectedFarm}
                            onChange={(e) => setSelectedFarm(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium shadow-sm focus:ring-2 focus:ring-green-500 outline-none flex-1 md:flex-none"
                        >
                            {farms.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                        </select>

                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-green-200 transition-all whitespace-nowrap"
                        >
                            <Plus size={18} />
                            Add Operation
                        </button>
                    </div>
                </div>

                {/* Main View Tabs */}
                <div className="flex gap-2 p-1 bg-gray-200/50 rounded-xl w-max">
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-200 ${activeTab === 'tasks' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <List size={18} /> Task Command Center
                    </button>
                    <button
                        onClick={() => setActiveTab('cycles')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-200 ${activeTab === 'cycles' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Sprout size={18} /> Crop Cycle Manager
                    </button>
                    <button
                        onClick={() => setActiveTab('irrigation')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-200 ${activeTab === 'irrigation' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Droplets size={18} /> Irrigation Console
                    </button>
                </div>

                {activeTab === 'tasks' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {/* Weather & Environmental Alerts Banner */}
                        {weatherAlerts.length > 0 && (
                            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 shadow-sm animate-fade-in">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="text-orange-600 mt-1 flex-shrink-0" size={24} />
                                    <div>
                                        <h3 className="text-orange-800 font-bold text-lg">Weather Warnings for Scheduled Operations</h3>
                                        <div className="mt-2 space-y-2">
                                            {weatherAlerts.map((w, idx) => (
                                                <div key={idx} className="flex flex-col md:flex-row md:items-center gap-2 text-sm">
                                                    <span className="font-semibold text-orange-900">{w.title}:</span>
                                                    <span className="text-orange-700">{w.message}</span>
                                                    <span className="text-orange-600 font-medium italic">({w.suggestion})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Analytics Summary Row */}
                        {analytics && (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 text-gray-500 mb-2">
                                        <CheckCircle size={18} className="text-emerald-500" />
                                        <span className="font-semibold text-sm">Completion Rate</span>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <h2 className="text-3xl font-black text-gray-900">{analytics.efficiencyScore}%</h2>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
                                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${analytics.efficiencyScore}%` }} />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">{analytics.completedOps} of {analytics.totalOps} operations completed this week</p>
                                </div>

                                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 text-gray-500 mb-2">
                                        <BarChart2 size={18} className="text-blue-500" />
                                        <span className="font-semibold text-sm">Est. Operational Cost</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900">₹{analytics.resources.totalCost.toLocaleString()}</h2>
                                    <p className="text-xs text-gray-400 mt-3">Total forecasted expense for scheduled tasks.</p>
                                </div>

                                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 text-gray-500 mb-2">
                                        <Droplets size={18} className="text-blue-400" />
                                        <span className="font-semibold text-sm">Water Usage (Week)</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900">{analytics.resources.totalWater.toLocaleString()} <span className="text-lg text-gray-400 font-medium">L</span></h2>
                                    <p className="text-xs text-gray-400 mt-3">Scheduled planned consumption.</p>
                                </div>

                                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 text-gray-500 mb-2">
                                        <Clock size={18} className="text-amber-500" />
                                        <span className="font-semibold text-sm">Pending Actions</span>
                                    </div>
                                    <h2 className={`text-3xl font-black ${overdueOps.length > 0 ? 'text-red-500' : 'text-gray-900'}`}>
                                        {analytics.pendingOps}
                                    </h2>
                                    {overdueOps.length > 0 && (
                                        <p className="text-xs font-bold text-red-500 mt-3">{overdueOps.length} operations are overdue!</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Operations List / Main View */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">

                            {/* Toolbar */}
                            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex gap-2">
                                    <select
                                        value={dateRange}
                                        onChange={(e) => setDateRange(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="upcoming">All Upcoming</option>
                                        <option value="">All Time</option>
                                    </select>

                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>

                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                                    >
                                        <List size={16} /> List
                                    </button>
                                    {/* Calendar view logic can be expanded here. For now, we mock the toggle visually */}
                                    <button
                                        onClick={() => setViewMode('calendar')}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                                    >
                                        <Grid size={16} /> Board
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 md:p-6">
                                {operations.length === 0 ? (
                                    <div className="text-center py-24">
                                        <CalendarIcon size={48} className="mx-auto text-gray-300 mb-4" />
                                        <h3 className="text-xl font-bold text-gray-900">No Operations Found</h3>
                                        <p className="text-gray-500 mt-2">Adjust your filters or schedule a new farm operation.</p>
                                        <button
                                            onClick={() => setIsCreateModalOpen(true)}
                                            className="mt-6 text-green-600 font-bold hover:underline"
                                        >
                                            + Create First Operation
                                        </button>
                                    </div>
                                ) : (
                                    <div className={viewMode === 'list' ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
                                        {operations.map(op => {
                                            const Icon = TYPE_ICONS[op.type] || TYPE_ICONS.Other;
                                            const typeClasses = TYPE_COLORS[op.type] || TYPE_COLORS.Other;
                                            const isOverdue = new Date(op.scheduledDate) < new Date() && op.status !== 'Completed';

                                            return (
                                                <div key={op._id} className={`bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${isOverdue ? 'border-red-300 relative' : 'border-gray-200'}`}>
                                                    {isOverdue && (
                                                        <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                                                            Overdue
                                                        </div>
                                                    )}

                                                    <div className="p-5 flex flex-col h-full">
                                                        <div className="flex items-start gap-4">
                                                            <div className={`p-3 rounded-xl border ${typeClasses}`}>
                                                                <Icon size={24} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-start">
                                                                    <h3 className="font-bold text-lg text-gray-900">{op.type}</h3>
                                                                    <span className={`text-xs font-bold px-2 py-1 rounded-md border 
                                                                ${op.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                                            op.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                                'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                                        {op.status}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm font-medium text-gray-600">{op.assignedPlot}</p>

                                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2 font-medium">
                                                                    <Clock size={14} />
                                                                    {formatDate(op.scheduledDate)}
                                                                    <span className="mx-1">•</span>
                                                                    <span className={
                                                                        op.priority === 'High' ? 'text-red-600' :
                                                                            op.priority === 'Medium' ? 'text-amber-600' : 'text-blue-600'
                                                                    }>{op.priority} Priority</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4 pt-4 border-t border-gray-100 flex-1">
                                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                                <div>
                                                                    <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">Duration</p>
                                                                    <p className="font-medium text-gray-800">{op.estimatedDuration} hrs</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">Est. Cost</p>
                                                                    <p className="font-medium text-gray-800">₹{op.costEstimate}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="mt-5 flex gap-2">
                                                            {op.status !== 'Completed' && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(op._id, 'Completed')}
                                                                    className="flex-1 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 border border-gray-200 hover:border-emerald-200 transition-colors py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                                                                >
                                                                    <CheckCircle size={16} /> Mark Complete
                                                                </button>
                                                            )}
                                                            {op.status === 'Pending' && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(op._id, 'In Progress')}
                                                                    className="flex-1 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200 hover:border-blue-200 transition-colors py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                                                                >
                                                                    <TrendingUp size={16} /> Start
                                                                </button>
                                                            )}
                                                            <button className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-lg transition-colors">
                                                                <Settings size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'cycles' && (
                    <CropCycleManager farmId={selectedFarm} />
                )}

                {activeTab === 'irrigation' && (
                    <IrrigationControlPanel farmId={selectedFarm} />
                )}
            </div>

            {/* Create Modal */}
            <CreateOperationModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                farmId={selectedFarm}
                onSuccess={fetchData}
            />
        </div>
    );
};

export default FieldOperationsPage;
