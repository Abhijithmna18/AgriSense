import React, { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, GripVertical, Check, X, Save, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';
import homepageService from '../../../services/homepageService';
import ModernFeatures from '../../../components/ModernFeatures';

const FeaturesEditor = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        gridColumns: 4,
        cards: []
    });

    const [isEditingCard, setIsEditingCard] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(null);
    const [cardForm, setCardForm] = useState({
        icon: 'Activity',
        title: '',
        description: '',
        color: 'bg-blue-50 text-blue-600',
        active: true
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const config = await homepageService.getHomepageConfig();
            if (config && config.features) {
                setFormData({
                    title: config.features.title || '',
                    description: config.features.description || '',
                    gridColumns: config.features.gridColumns || 4,
                    cards: config.features.cards || []
                });
            }
        } catch (err) {
            setError('Failed to load configuration');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');

            // We need to send the FULL config structure, not just features
            // But our update endpoint updates the whole doc.
            // Ideally we should merge with existing config.
            // For now, let's fetch current config again to be safe? 
            // Or assume the backend handles partial updates? 
            // My controller implementation uses `findOneAndUpdate` with `req.body`. 
            // If I send ONLY features, it might overwrite other fields if not careful with $set?
            // Checking controller: `HomepageConfig.findOneAndUpdate({}, req.body, ...)`
            // This REPLACES the document fields with req.body if it's not a $set operation? 
            // Mongoose `findOneAndUpdate` with a plain object as update maps to $set usually? 
            // Wait, `findOneAndUpdate({}, update, ...)`: if update is `{ features: ... }`, it might replace only features if using $set or replace whole doc if not.
            // Let's assume I need to fetch the whole config first and merge, OR better, let's update the controller to specific fields?
            // Validating my controller code: `await HomepageConfig.findOneAndUpdate({}, req.body, { new: true, upsert: true });`
            // If req.body is { features: {...} }, Mongoose applies this as $set for top level keys usually? 
            // It's safer to fetch the whole config first, merge locally, and send back.

            const currentConfig = await homepageService.getHomepageConfig();
            const updatedConfig = {
                ...currentConfig,
                features: formData
            };

            await homepageService.updateHomepageConfig(updatedConfig);
            setSuccess('Features section updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update configuration');
        } finally {
            setSaving(false);
        }
    };

    // Card Management
    const handleAddCard = () => {
        setCardForm({
            icon: 'Activity',
            title: 'New Feature',
            description: 'Feature description goes here.',
            color: 'bg-blue-50 text-blue-600',
            active: true
        });
        setCurrentCardIndex(-1); // -1 for new
        setIsEditingCard(true);
    };

    const handleEditCard = (index) => {
        setCardForm({ ...formData.cards[index] });
        setCurrentCardIndex(index);
        setIsEditingCard(true);
    };

    const handleDeleteCard = (index) => {
        if (window.confirm('Are you sure you want to delete this feature?')) {
            const newCards = [...formData.cards];
            newCards.splice(index, 1);
            setFormData({ ...formData, cards: newCards });
        }
    };

    const handleSaveCard = () => {
        const newCards = [...formData.cards];
        if (currentCardIndex === -1) {
            newCards.push(cardForm);
        } else {
            newCards[currentCardIndex] = cardForm;
        }
        setFormData({ ...formData, cards: newCards });
        setIsEditingCard(false);
    };

    const handleToggleActive = (index) => {
        const newCards = [...formData.cards];
        newCards[index] = { ...newCards[index], active: !newCards[index].active };
        setFormData({ ...formData, cards: newCards });
    };

    const handleReorder = (newOrder) => {
        setFormData({ ...formData, cards: newOrder });
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader className="animate-spin text-emerald-600" /></div>;

    return (
        <div className="space-y-8 text-[var(--admin-text-primary)]">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Features Section Editor</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-70"
                >
                    {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2"><AlertCircle size={20} />{error}</div>}
            {success && <div className="p-4 bg-green-50 text-green-600 rounded-lg flex items-center gap-2"><Check size={20} />{success}</div>}

            {/* Main Section Config */}
            <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-xl p-6 space-y-6">
                <h2 className="text-lg font-semibold border-b border-[var(--admin-border)] pb-2">Section Header</h2>
                <div className="grid gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 opacity-80">Section Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 opacity-80">Section Description</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 opacity-80">Grid Configuration</label>
                        <select
                            value={formData.gridColumns}
                            onChange={(e) => setFormData({ ...formData, gridColumns: parseInt(e.target.value) })}
                            className="px-4 py-2 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value={3}>3 Cards per row</option>
                            <option value={4}>4 Cards per row</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Feature Cards Manager */}
            <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold">Feature Cards</h2>
                    <button
                        onClick={handleAddCard}
                        className="px-4 py-2 bg-[var(--admin-bg-hover)] text-[var(--admin-text-primary)] border border-[var(--admin-border)] rounded-lg flex items-center gap-2 hover:bg-[var(--admin-border)] transition-colors"
                    >
                        <Plus size={18} />
                        Add New Feature
                    </button>
                </div>

                <div className="space-y-2">
                    <Reorder.Group axis="y" values={formData.cards} onReorder={handleReorder} className="space-y-3">
                        {formData.cards.map((card, index) => (
                            <Reorder.Item
                                key={card._id || index}
                                value={card}
                                className="bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg p-4 flex items-center gap-4 group cursor-grab active:cursor-grabbing"
                            >
                                <GripVertical className="text-gray-400" size={20} />
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color || 'bg-gray-100 text-gray-500'}`}>
                                    {/* Icon Preview - assuming Lucide icon name */}
                                    <span className="text-xs font-mono">{card.icon?.slice(0, 2)}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{card.title}</h3>
                                    <p className="text-sm opacity-60 truncate">{card.description}</p>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <button
                                        onClick={() => handleToggleActive(index)}
                                        title={card.active ? "Deactivate" : "Activate"}
                                        className={`p-2 rounded-lg hover:bg-[var(--admin-bg-hover)] ${card.active ? 'text-emerald-500' : 'text-gray-400'}`}
                                    >
                                        {card.active ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                    <button
                                        onClick={() => handleEditCard(index)}
                                        className="p-2 rounded-lg hover:bg-[var(--admin-bg-hover)] hover:text-[var(--admin-accent)]"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCard(index)}
                                        className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </div>
            </div>

            {/* Live Preview */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Live Preview</h2>
                </div>
                {/* We pass the formData to ModernFeatures to render preview */}
                <ModernFeatures config={formData} />
            </div>

            {/* Edit Card Modal */}
            <AnimatePresence>
                {isEditingCard && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white text-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold">
                                    {currentCardIndex === -1 ? 'Add New Feature' : 'Edit Feature'}
                                </h3>
                                <button onClick={() => setIsEditingCard(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Feature Title</label>
                                    <input
                                        type="text"
                                        value={cardForm.title}
                                        onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                        placeholder="e.g. Yield Analytics"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Description</label>
                                    <textarea
                                        rows={3}
                                        value={cardForm.description}
                                        onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                        placeholder="Feature benefits..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Icon (Lucide Name)</label>
                                        <input
                                            type="text"
                                            value={cardForm.icon}
                                            onChange={(e) => setCardForm({ ...cardForm, icon: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                            placeholder="e.g. Activity"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Theme Color</label>
                                        <select
                                            value={cardForm.color}
                                            onChange={(e) => setCardForm({ ...cardForm, color: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                        >
                                            <option value="bg-blue-50 text-blue-600">Blue</option>
                                            <option value="bg-emerald-50 text-emerald-600">Green</option>
                                            <option value="bg-purple-50 text-purple-600">Purple</option>
                                            <option value="bg-amber-50 text-amber-600">Amber</option>
                                            <option value="bg-rose-50 text-rose-600">Rose</option>
                                            <option value="bg-cyan-50 text-cyan-600">Cyan</option>
                                            <option value="bg-indigo-50 text-indigo-600">Indigo</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={cardForm.active}
                                            onChange={(e) => setCardForm({ ...cardForm, active: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                        <span className="ml-3 text-sm font-medium text-gray-900">Active</span>
                                    </label>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsEditingCard(false)}
                                    className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveCard}
                                    className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                                >
                                    Save Feature
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FeaturesEditor;
