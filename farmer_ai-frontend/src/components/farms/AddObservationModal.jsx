import React, { useState } from 'react';
import { X, Eye, Camera, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useFarmIntelligence } from '../../context/FarmIntelligenceContext';
import { toast } from 'react-hot-toast';

const NODE_API_URL = 'http://localhost:5000/api'; // In prod use env

const AddObservationModal = ({ isOpen, onClose }) => {
    const { selectedFarm, fetchFarmIntelligence } = useFarmIntelligence();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'General',
        severity: 'Low',
        notes: '',
        date: new Date().toISOString().split('T')[0]
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.post(`${NODE_API_URL}/farms/${selectedFarm._id}/observations`, formData, config);

            toast.success("Observation recorded");
            fetchFarmIntelligence(selectedFarm._id); // Refresh data

            setFormData({
                type: 'General',
                severity: 'Low',
                notes: '',
                date: new Date().toISOString().split('T')[0]
            });
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add observation");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Eye size={20} className="text-blue-600" />
                        Log Observation
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 border-none">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="General">General</option>
                                <option value="Disease">Disease</option>
                                <option value="Pest">Pest</option>
                                <option value="Weather">Weather</option>
                                <option value="Soil">Soil</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Severity</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                                value={formData.severity}
                                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Observation Date</label>
                        <input
                            type="date"
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label>
                        <textarea
                            required
                            rows="3"
                            placeholder="Describe what you see..."
                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Log Observation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddObservationModal;
