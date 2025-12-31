import React, { useState, useEffect } from 'react';
import homepageService from '../../../services/homepageService';
import { Save, Loader, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const HeroEditor = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        headline: '',
        subheadline: '',
        trustIndicators: []
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const data = await homepageService.getHomepageConfig();
            setConfig(data);
            setFormData({
                headline: data.hero?.headline || '',
                subheadline: data.hero?.subheadline || '',
                trustIndicators: data.hero?.trustIndicators || []
            });
        } catch (err) {
            setError('Failed to load configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            const updatedConfig = {
                ...config,
                hero: {
                    ...config.hero,
                    ...formData
                }
            };

            await homepageService.updateHomepageConfig(updatedConfig);
            setSuccess('Hero section updated successfully!');
            setConfig(updatedConfig);
        } catch (err) {
            setError('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTrustFactorChange = (index, field, value) => {
        const newIndicators = [...formData.trustIndicators];
        newIndicators[index] = { ...newIndicators[index], [field]: value };
        setFormData(prev => ({ ...prev, trustIndicators: newIndicators }));
    };

    if (loading) return <div className="p-8 text-center text-[var(--admin-text-secondary)]"><Loader className="animate-spin mx-auto mb-2" />Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[var(--admin-text-primary)]">Hero Section Editor</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-accent)] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                >
                    {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg flex items-center gap-2">
                    <Save size={18} />
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    {/* Content Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-xl p-6"
                    >
                        <h3 className="text-lg font-semibold text-[var(--admin-text-primary)] mb-4">Main Content</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">Headline</label>
                                <input
                                    type="text"
                                    name="headline"
                                    value={formData.headline}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">Subheadline</label>
                                <textarea
                                    name="subheadline"
                                    value={formData.subheadline}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)] transition-colors"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-xl p-6"
                    >
                        <h3 className="text-lg font-semibold text-[var(--admin-text-primary)] mb-4">Trust Indicators</h3>

                        <div className="space-y-4">
                            {formData.trustIndicators.map((indicator, idx) => (
                                <div key={idx} className="flex gap-4 items-start p-4 bg-[var(--admin-bg-primary)] rounded-lg border border-[var(--admin-border)]">
                                    <div className="flex-1">
                                        <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Label</label>
                                        <input
                                            type="text"
                                            value={indicator.label}
                                            onChange={(e) => handleTrustFactorChange(idx, 'label', e.target.value)}
                                            className="w-full px-3 py-1.5 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded text-sm text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)]"
                                        />
                                    </div>
                                    <div className="w-1/3">
                                        <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Value</label>
                                        <input
                                            type="text"
                                            value={indicator.value}
                                            onChange={(e) => handleTrustFactorChange(idx, 'value', e.target.value)}
                                            className="w-full px-3 py-1.5 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded text-sm text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)]"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Preview (Simplified) */}
                <div className="hidden lg:block">
                    <div className="sticky top-6">
                        <h3 className="text-sm font-medium text-[var(--admin-text-secondary)] mb-2 uppercase tracking-wider">Live Preview (Approximation)</h3>
                        <div className="border border-[var(--admin-border)] rounded-xl overflow-hidden shadow-2xl">
                            <div className="bg-white p-8">
                                {/* Mock Hero Preview */}
                                <div className="text-center max-w-lg mx-auto py-12">
                                    <h1 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">{formData.headline || 'Your Headline'}</h1>
                                    <p className="text-lg text-slate-600 mb-8">{formData.subheadline || 'Your subheadline text goes here...'}</p>
                                    <div className="flex justify-center gap-4 mb-12">
                                        <span className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold">Get Started</span>
                                        <span className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold">Watch Demo</span>
                                    </div>
                                    <div className="flex justify-center gap-8 border-t border-slate-100 pt-8">
                                        {formData.trustIndicators.map((t, i) => (
                                            <div key={i} className="text-center">
                                                <div className="text-2xl font-bold text-emerald-600">{t.value}</div>
                                                <div className="text-sm text-slate-500">{t.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroEditor;
