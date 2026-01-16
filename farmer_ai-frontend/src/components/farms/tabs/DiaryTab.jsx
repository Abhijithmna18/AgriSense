import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, X, Calendar, AlertCircle, FileText } from 'lucide-react';
import {
    getDiaryEntries,
    createDiaryEntry,
    updateDiaryEntry,
    deleteDiaryEntry
} from '../../../services/mockDataService';

const DiaryTab = ({ zone }) => {
    const [entries, setEntries] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'note',
        content: '',
        imageUrl: null
    });
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        loadEntries();
    }, [zone._id]);

    const loadEntries = () => {
        const data = getDiaryEntries(zone._id);
        setEntries(data);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setFormData({ ...formData, imageUrl: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingId) {
            updateDiaryEntry(editingId, formData);
        } else {
            createDiaryEntry(zone._id, formData);
        }

        resetForm();
        loadEntries();
    };

    const handleEdit = (entry) => {
        setEditingId(entry.id);
        setFormData({
            date: entry.date.split('T')[0],
            type: entry.type,
            content: entry.content,
            imageUrl: entry.imageUrl
        });
        setImagePreview(entry.imageUrl);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            deleteDiaryEntry(id);
            loadEntries();
        }
    };

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            type: 'note',
            content: '',
            imageUrl: null
        });
        setImagePreview(null);
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Field Diary</h3>
                    <p className="text-sm text-gray-600">Log observations, notes, and incidents</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                    {showForm ? <X size={16} /> : <Plus size={16} />}
                    {showForm ? 'Cancel' : 'New Entry'}
                </button>
            </div>

            {/* Entry Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="note"
                                        checked={formData.type === 'note'}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="mr-2"
                                    />
                                    <FileText size={16} className="mr-1" />
                                    Note
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="incident"
                                        checked={formData.type === 'incident'}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="mr-2"
                                    />
                                    <AlertCircle size={16} className="mr-1" />
                                    Incident
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Content *
                        </label>
                        <textarea
                            required
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                            placeholder="Describe what you observed or did..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image (Optional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                        {imagePreview && (
                            <div className="mt-2 relative inline-block">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="h-32 rounded-lg border border-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImagePreview(null);
                                        setFormData({ ...formData, imageUrl: null });
                                    }}
                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                            {editingId ? 'Update Entry' : 'Add Entry'}
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

            {/* Entries Feed */}
            <div className="space-y-4">
                {entries.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                        <FileText size={48} className="mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500">No diary entries yet. Start logging your observations.</p>
                    </div>
                ) : (
                    entries.map(entry => (
                        <div
                            key={entry.id}
                            className={`bg-white rounded-xl shadow-sm border p-4 ${entry.type === 'incident'
                                    ? 'border-orange-200 bg-orange-50/30'
                                    : 'border-gray-200'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${entry.type === 'incident'
                                            ? 'bg-orange-100'
                                            : 'bg-blue-100'
                                        }`}>
                                        {entry.type === 'incident' ? (
                                            <AlertCircle size={20} className="text-orange-600" />
                                        ) : (
                                            <FileText size={20} className="text-blue-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 capitalize">
                                            {entry.type}
                                        </p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(entry.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(entry)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(entry.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-gray-700 mb-3">{entry.content}</p>

                            {entry.imageUrl && (
                                <div className="mt-3">
                                    <img
                                        src={entry.imageUrl}
                                        alt="Entry attachment"
                                        className="max-h-64 rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => window.open(entry.imageUrl, '_blank')}
                                    />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DiaryTab;
