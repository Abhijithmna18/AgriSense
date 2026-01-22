import React, { useEffect, useState } from 'react';
import { useFarmIntelligence } from '../../context/FarmIntelligenceContext';
import FarmProfileCard from './FarmProfileCard';
import CropHistoryTimeline from './CropHistoryTimeline';
import IntelligenceFeed from './IntelligenceFeed';
import AddCropCycleModal from './AddCropCycleModal';
import AddObservationModal from './AddObservationModal';
import { Plus, BarChart2, Activity, Eye } from 'lucide-react';

// Note: The context handles SINGLE farm intelligence. 
// The dashboard needs to select a farm first.

const IntelligenceDashboard = ({ farms }) => {
    const { fetchFarmIntelligence, selectedFarm, setSelectedFarm, loading, error, intelligence } = useFarmIntelligence();
    const [showCycleModal, setShowCycleModal] = useState(false);
    const [showObservationModal, setShowObservationModal] = useState(false);

    useEffect(() => {
        if (selectedFarm) {
            fetchFarmIntelligence(selectedFarm._id);
        } else if (farms.length > 0) {
            // Default to first farm
            setSelectedFarm(farms[0]);
        }
    }, [selectedFarm, farms, setSelectedFarm, fetchFarmIntelligence]);

    if (!selectedFarm && farms.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <p>No farms found. Please add a farm to get started.</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header / Farm Selector */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Selected Farm</label>
                    <select
                        className="block w-64 mt-1 text-lg font-bold text-gray-800 bg-transparent border-none focus:ring-0 p-0 cursor-pointer hover:text-green-600 transition"
                        value={selectedFarm?._id || ''}
                        onChange={(e) => setSelectedFarm(farms.find(f => f._id === e.target.value))}
                    >
                        {farms.map(f => (
                            <option key={f._id} value={f._id}>{f.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-4">
                    <div className="text-right hidden md:block">
                        <p className="text-xs text-gray-400">Last Updated</p>
                        <p className="font-medium text-gray-600">Just now</p>
                    </div>
                    <button
                        onClick={() => setShowObservationModal(true)}
                        className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition shadow-sm"
                    >
                        <Eye size={18} /> Log Observation
                    </button>
                    <button
                        onClick={() => setShowCycleModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition shadow-sm"
                    >
                        <Plus size={18} /> New Crop Cycle
                    </button>
                </div>
            </div>

            {/* Modals */}
            <AddCropCycleModal isOpen={showCycleModal} onClose={() => setShowCycleModal(false)} />
            <AddObservationModal isOpen={showObservationModal} onClose={() => setShowObservationModal(false)} />

            {loading && (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                    <p className="text-gray-400 mt-2 text-sm">Aggregating Intelligence...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-100">
                    {error}
                </div>
            )}

            {!loading && intelligence && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Col: Profile & Operations */}
                    <div className="space-y-6">
                        <FarmProfileCard />

                        {/* Financial Snapshot (Mini) */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <BarChart2 size={18} /> Financial Health
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <p className="text-xs text-green-600 uppercase font-semibold">Revenue (YTD)</p>
                                    <p className="text-xl font-bold text-green-700">₹{intelligence.financials?.totalRevenue || '0'}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-xs text-blue-600 uppercase font-semibold">Active Loans</p>
                                    <p className="text-xl font-bold text-blue-700">{intelligence.financials?.activeLoans?.length || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center Col: Crop Timeline (Wide) */}
                    <div className="space-y-6 lg:col-span-2">
                        <CropHistoryTimeline />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <IntelligenceFeed />

                            {/* Placeholder for Map or other widget */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-80 flex flex-col">
                                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <Activity size={18} /> Field Activity
                                </h3>
                                <div className="flex-1 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                                    Interactive Map (Integrated Later)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntelligenceDashboard;
