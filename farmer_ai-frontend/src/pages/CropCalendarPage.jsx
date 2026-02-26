import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Calendar as CalendarIcon, ArrowLeft, Loader2, Droplets, Leaf,
    ShieldAlert, Sprout, CheckCircle, Clock, Map
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/authApi';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';

const CropCalendarPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [calendarData, setCalendarData] = useState(null);
    const [loading, setLoading] = useState(true);

    const { cropName, soilType, season } = location.state || {};

    useEffect(() => {
        if (!cropName) {
            toast.error("No crop selected for calendar generation.");
            navigate('/crop-rotation');
            return;
        }

        const fetchCalendar = async () => {
            try {
                const { data } = await api.post('/api/crop-intelligence/calendar', {
                    cropName,
                    soilType,
                    season,
                    farmSize: '1 acre'
                });
                setCalendarData(data.data);
            } catch (error) {
                console.error("Failed to generate calendar", error);
                toast.error("Failed to generate smart calendar. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchCalendar();
    }, [cropName, soilType, season, navigate]);

    const getCategoryIcon = (category) => {
        switch (category.toLowerCase()) {
            case 'irrigation': return <Droplets className="text-blue-500" size={18} />;
            case 'nutrition': return <Leaf className="text-green-500" size={18} />;
            case 'maintenance/pest control':
            case 'maintenance':
            case 'pest control': return <ShieldAlert className="text-red-500" size={18} />;
            default: return <CheckCircle className="text-gray-500" size={18} />;
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-[#F8FAF9]">
                <Sidebar />
                <div className="flex-1 flex flex-col md:ml-64">
                    <TopBar />
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-green-600 mb-4" size={48} />
                        <h2 className="text-xl font-bold text-gray-700">Generating Smart Calendar...</h2>
                        <p className="text-gray-500 mt-2">AI is analyzing growth stages for {cropName}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!calendarData) return null;

    return (
        <div className="flex h-screen bg-[#F8FAF9] font-sans overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 md:ml-64">
                <TopBar />

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                    <div className="max-w-5xl mx-auto space-y-8 pb-10">

                        {/* Header */}
                        <div className="flex items-center gap-4 mb-2">
                            <button
                                onClick={() => navigate('/crop-rotation')}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                    <CalendarIcon className="text-green-600" size={32} />
                                    Smart Crop Calendar: {calendarData.crop_info.name}
                                </h1>
                                <p className="text-gray-500 mt-1">Personalized phase-by-phase farming schedule</p>
                            </div>
                        </div>

                        {/* Crop Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Total Duration</p>
                                    <p className="text-xl font-bold text-gray-900">{calendarData.crop_info.total_duration_days} Days</p>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                                    <Sprout size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Est. Yield (per acre)</p>
                                    <p className="text-lg font-bold text-gray-900">{calendarData.crop_info.estimated_yield_per_acre}</p>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                                    <Map size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Seed Req. (per acre)</p>
                                    <p className="text-lg font-bold text-gray-900">{calendarData.crop_info.seed_requirement_per_acre}</p>
                                </div>
                            </div>
                        </div>

                        {/* Timeline / Weekly Tasks */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Week-by-Week Action Plan</h2>

                            <div className="relative border-l-2 border-green-100 ml-4 space-y-10 pb-4">
                                {calendarData.weekly_tasks.map((week, index) => {
                                    // Find matching phase detail if available
                                    const phaseDetails = calendarData.growth_stages?.find(s => s.stage === week.phase);

                                    return (
                                        <div key={index} className="relative pl-8">
                                            {/* Timeline dot */}
                                            <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-green-500 border-4 border-white shadow-sm"></div>

                                            <div className="mb-4">
                                                <div className="flex items-baseline gap-3">
                                                    <h3 className="text-lg font-bold text-gray-900">Week {week.week_number}</h3>
                                                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                                                        {week.phase}
                                                    </span>
                                                </div>
                                                {phaseDetails && index === calendarData.weekly_tasks.findIndex(w => w.phase === week.phase) && (
                                                    <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                        📖 <strong>Phase Overview:</strong> {phaseDetails.description} ({phaseDetails.duration_weeks} weeks)
                                                    </p>
                                                )}
                                            </div>

                                            {/* Tasks List */}
                                            <div className="grid gap-3">
                                                {week.tasks.map((task, taskIdx) => (
                                                    <div key={taskIdx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all bg-white group cursor-default">
                                                        <div className="flex items-start gap-4">
                                                            <div className="mt-0.5 p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                                                                {getCategoryIcon(task.category)}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{task.category}</p>
                                                                <p className="text-gray-800 font-medium">{task.action}</p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                                                            <button className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors flex items-center gap-2">
                                                                <CheckCircle size={16} /> Mark Done
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default CropCalendarPage;
