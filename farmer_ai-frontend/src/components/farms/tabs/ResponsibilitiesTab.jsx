import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, Calendar, User } from 'lucide-react';
import {
    getResponsibilities,
    createResponsibility,
    updateResponsibility,
    deleteResponsibility
} from '../../../services/mockDataService';

const ResponsibilitiesTab = ({ zone }) => {
    const [responsibilities, setResponsibilities] = useState([]);
    const [filter, setFilter] = useState('all'); // all, pending, completed
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        taskName: '',
        assignedTo: 'Self',
        dueDate: new Date().toISOString().split('T')[0],
        status: 'pending'
    });

    // Load responsibilities
    useEffect(() => {
        loadResponsibilities();
    }, [zone._id]);

    const loadResponsibilities = () => {
        const data = getResponsibilities(zone._id);
        setResponsibilities(data);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingId) {
            updateResponsibility(editingId, formData);
        } else {
            createResponsibility(zone._id, formData);
        }

        resetForm();
        loadResponsibilities();
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            deleteResponsibility(id);
            loadResponsibilities();
        }
    };

    const handleToggleStatus = (task) => {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        updateResponsibility(task.id, { status: newStatus });
        loadResponsibilities();
    };

    const handleEdit = (task) => {
        setEditingId(task.id);
        setFormData({
            taskName: task.taskName,
            assignedTo: task.assignedTo,
            dueDate: task.dueDate.split('T')[0],
            status: task.status
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            taskName: '',
            assignedTo: 'Self',
            dueDate: new Date().toISOString().split('T')[0],
            status: 'pending'
        });
        setEditingId(null);
        setShowForm(false);
    };

    const filteredResponsibilities = responsibilities.filter(task => {
        if (filter === 'all') return true;
        return task.status === filter;
    });

    const sortedResponsibilities = [...filteredResponsibilities].sort((a, b) =>
        new Date(a.dueDate) - new Date(b.dueDate)
    );

    return (
        <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Task Management</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                    {showForm ? <X size={16} /> : <Plus size={16} />}
                    {showForm ? 'Cancel' : 'Add Task'}
                </button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Task Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.taskName}
                            onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                            placeholder="e.g., Apply fertilizer"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Assigned To
                            </label>
                            <select
                                value={formData.assignedTo}
                                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                            >
                                <option value="Self">Self</option>
                                <option value="Worker">Worker</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Due Date
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                            {editingId ? 'Update Task' : 'Create Task'}
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                {['all', 'pending', 'completed'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${filter === f
                                ? 'border-green-600 text-green-700'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        {f} ({responsibilities.filter(t => f === 'all' || t.status === f).length})
                    </button>
                ))}
            </div>

            {/* Task List */}
            <div className="space-y-3">
                {sortedResponsibilities.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-gray-500">No tasks found. Add your first task to get started.</p>
                    </div>
                ) : (
                    sortedResponsibilities.map(task => {
                        const isOverdue = new Date(task.dueDate) < new Date() && task.status === 'pending';

                        return (
                            <div
                                key={task.id}
                                className={`bg-white rounded-xl shadow-sm border p-4 transition-all ${task.status === 'completed'
                                        ? 'border-green-200 bg-green-50/50'
                                        : isOverdue
                                            ? 'border-red-200 bg-red-50/50'
                                            : 'border-gray-200 hover:shadow-md'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => handleToggleStatus(task)}
                                        className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${task.status === 'completed'
                                                ? 'bg-green-600 border-green-600'
                                                : 'border-gray-300 hover:border-green-500'
                                            }`}
                                    >
                                        {task.status === 'completed' && <Check size={14} className="text-white" />}
                                    </button>

                                    {/* Task Details */}
                                    <div className="flex-1">
                                        <h4 className={`font-semibold ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-800'
                                            }`}>
                                            {task.taskName}
                                        </h4>

                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <User size={14} />
                                                {task.assignedTo}
                                            </span>
                                            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''
                                                }`}>
                                                <Calendar size={14} />
                                                {new Date(task.dueDate).toLocaleDateString()}
                                                {isOverdue && ' (Overdue)'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(task)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(task.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ResponsibilitiesTab;
