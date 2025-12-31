import React, { useState } from 'react';
import { Star, Smile, Meh, Frown, Upload, X } from 'lucide-react';
import feedbackService from '../../services/feedbackService';

const FeedbackForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        category: 'Bug Report',
        description: '',
        rating: 5,
        mood: 'neutral',
        priority: 'Low',
        attachments: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const categories = ['Bug Report', 'Feature Request', 'UI/UX Improvement', 'Performance Issue', 'Other'];
    const moods = [
        { value: 'sad', icon: Frown, color: 'text-red-500' },
        { value: 'neutral', icon: Meh, color: 'text-yellow-500' },
        { value: 'happy', icon: Smile, color: 'text-green-500' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('category', formData.category);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('rating', formData.rating);
            formDataToSend.append('mood', formData.mood);
            formDataToSend.append('priority', formData.priority);

            // Append files
            if (formData.attachments) {
                Array.from(formData.attachments).forEach(file => {
                    formDataToSend.append('attachments', file);
                });
            }

            await feedbackService.submitFeedback(formDataToSend);

            setFormData({
                category: 'Bug Report',
                description: '',
                rating: 5,
                mood: 'neutral',
                priority: 'Low',
                attachments: []
            });
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            setError('Failed to submit feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFormData({ ...formData, attachments: e.target.files });
        }
    };

    const handleRating = (value) => {
        setFormData({ ...formData, rating: value });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Submit New Feedback</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Category & Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500"
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority (Your View)</label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                </div>

                {/* Rating & Mood */}
                <div className="flex flex-wrap gap-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleRating(star)}
                                    className={`focus:outline-none transition-colors ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                    <Star fill={star <= formData.rating ? "currentColor" : "none"} size={24} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">How do you feel?</label>
                        <div className="flex gap-4">
                            {moods.map((m) => (
                                <button
                                    key={m.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, mood: m.value })}
                                    className={`p-2 rounded-full transition-all ${formData.mood === m.value ? 'bg-gray-100 dark:bg-gray-700 scale-110 shadow-sm' : 'opacity-50 hover:opacity-100'}`}
                                >
                                    <m.icon className={m.color} size={24} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the issue or suggestion clearly..."
                        rows={4}
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500"
                    />
                </div>

                {/* Attachments */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attachments (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative">
                        <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                        <p className="text-sm text-gray-500">Click to upload screenshots</p>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {formData.attachments && formData.attachments.length > 0 && (
                            <div className="mt-2 text-sm text-green-600 font-medium">
                                {formData.attachments.length} file(s) selected
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-green-600/20"
                    >
                        {loading ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FeedbackForm;
