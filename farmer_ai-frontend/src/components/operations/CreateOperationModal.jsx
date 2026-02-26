import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Droplets, Sprout, Loader2 } from 'lucide-react';
import api from '../../services/authApi';
import { toast } from 'react-hot-toast';

const OPERATION_TYPES = [
    'Irrigation', 'Fertilization', 'Sowing', 'Spraying',
    'Harvesting', 'Maintenance', 'Other'
];

const CreateOperationModal = ({ isOpen, onClose, farmId, onSuccess }) => {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        type: 'Irrigation',
        assignedPlot: '',
        priority: 'Medium',
        scheduledDate: '',
        estimatedDuration: 1,
        costEstimate: 0,
        notes: '',
        resourcesRequired: {
            waterLiters: 0,
            fertilizerKg: 0,
            laborHours: 0,
            equipment: 'None'
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/api/operations', {
                ...formData,
                farmId
            });
            toast.success('Operation scheduled successfully!');
            onSuccess(); // refresh parent
            onClose(); // close modal
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to schedule operation');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                >
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-3xl">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Schedule Operation</h2>
                            <p className="text-gray-500 text-sm mt-1">Plan a new task for your field.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="text-gray-500" size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* General */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Operation Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
                                    >
                                        {OPERATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assigned Plot / Location</label>
                                    <input
                                        type="text"
                                        name="assignedPlot"
                                        required
                                        placeholder="e.g. Tomato Field A"
                                        value={formData.assignedPlot}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority Level</label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>

                            {/* Schedule & Duration */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Scheduled Date & Time</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                        <input
                                            type="datetime-local"
                                            name="scheduledDate"
                                            required
                                            value={formData.scheduledDate}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Est. Duration (Hours)</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                        <input
                                            type="number"
                                            min="0.5"
                                            step="0.5"
                                            name="estimatedDuration"
                                            required
                                            value={formData.estimatedDuration}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cost Estimate (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        name="costEstimate"
                                        value={formData.costEstimate}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Resources Matrix */}
                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5">
                            <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                                <Droplets className="text-blue-500" size={18} />
                                Resource Allocation
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <label className="block text-gray-600 mb-1">Water (L)</label>
                                    <input type="number" name="resourcesRequired.waterLiters" value={formData.resourcesRequired.waterLiters} onChange={handleChange} className="w-full rounded-lg border-gray-200 p-2" />
                                </div>
                                <div>
                                    <label className="block text-gray-600 mb-1">Fertilizer (Kg)</label>
                                    <input type="number" name="resourcesRequired.fertilizerKg" value={formData.resourcesRequired.fertilizerKg} onChange={handleChange} className="w-full rounded-lg border-gray-200 p-2" />
                                </div>
                                <div>
                                    <label className="block text-gray-600 mb-1">Labor (Hrs)</label>
                                    <input type="number" name="resourcesRequired.laborHours" value={formData.resourcesRequired.laborHours} onChange={handleChange} className="w-full rounded-lg border-gray-200 p-2" />
                                </div>
                                <div>
                                    <label className="block text-gray-600 mb-1">Equipment</label>
                                    <input type="text" name="resourcesRequired.equipment" placeholder="Tractor..." value={formData.resourcesRequired.equipment} onChange={handleChange} className="w-full rounded-lg border-gray-200 p-2" />
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Additional Notes</label>
                            <textarea
                                name="notes"
                                rows="3"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Any special instructions handling this operation..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-shadow resize-none"
                            ></textarea>
                        </div>

                        <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white border-t border-gray-100 -mx-6 -mb-6 p-6 rounded-b-3xl">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-green-200 transition-all flex items-center gap-2"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Calendar size={20} />}
                                {submitting ? 'Saving...' : 'Schedule Operation'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CreateOperationModal;
