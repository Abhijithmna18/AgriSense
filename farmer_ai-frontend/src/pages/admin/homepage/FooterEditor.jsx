import React, { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Save, AlertCircle, Check, Loader, Plus, Trash2, Edit2, GripVertical, Image as ImageIcon, Globe } from 'lucide-react';
import homepageService from '../../../services/homepageService';
import ModernFooter from '../../../components/ModernFooter';

const FooterEditor = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        branding: {
            logo: '',
            companyName: '',
            mission: ''
        },
        socialMedia: [],
        navigationColumns: [],
        newsletter: {
            heading: '',
            subtext: '',
            placeholder: '',
            submissionDestination: 'local'
        },
        legal: {
            copyright: '',
            privacyPolicyUrl: '',
            termsOfServiceUrl: '',
            showRegionSelector: false
        }
    });

    const [activeTab, setActiveTab] = useState('branding');

    // Column editing state
    const [isEditingColumn, setIsEditingColumn] = useState(false);
    const [currentColumnIndex, setCurrentColumnIndex] = useState(null);
    const [columnForm, setColumnForm] = useState({ title: '', links: [] });

    // Social media editing state
    const [isEditingSocial, setIsEditingSocial] = useState(false);
    const [currentSocialIndex, setCurrentSocialIndex] = useState(null);
    const [socialForm, setSocialForm] = useState({ platform: 'twitter', url: '' });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const config = await homepageService.getHomepageConfig();
            if (config && config.footer) {
                const ft = config.footer;
                setFormData({
                    branding: {
                        logo: ft.branding?.logo || '',
                        companyName: ft.branding?.companyName || 'AgriSense',
                        mission: ft.branding?.mission || ''
                    },
                    socialMedia: ft.socialMedia || [],
                    navigationColumns: ft.navigationColumns || [],
                    newsletter: {
                        heading: ft.newsletter?.heading || 'Stay Updated',
                        subtext: ft.newsletter?.subtext || '',
                        placeholder: ft.newsletter?.placeholder || 'Enter your email',
                        submissionDestination: ft.newsletter?.submissionDestination || 'local'
                    },
                    legal: {
                        copyright: ft.legal?.copyright || '© {year} AgriSense. All rights reserved.',
                        privacyPolicyUrl: ft.legal?.privacyPolicyUrl || '/privacy',
                        termsOfServiceUrl: ft.legal?.termsOfServiceUrl || '/terms',
                        showRegionSelector: ft.legal?.showRegionSelector ?? false
                    }
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

            const currentConfig = await homepageService.getHomepageConfig();
            const updatedConfig = {
                ...currentConfig,
                footer: formData
            };

            await homepageService.updateHomepageConfig(updatedConfig);
            setSuccess('Footer section updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update configuration');
        } finally {
            setSaving(false);
        }
    };

    // Social Media Management
    const handleAddSocial = () => {
        setSocialForm({ platform: 'twitter', url: '' });
        setCurrentSocialIndex(-1);
        setIsEditingSocial(true);
    };

    const handleEditSocial = (index) => {
        setSocialForm({ ...formData.socialMedia[index] });
        setCurrentSocialIndex(index);
        setIsEditingSocial(true);
    };

    const handleDeleteSocial = (index) => {
        const newSocial = [...formData.socialMedia];
        newSocial.splice(index, 1);
        setFormData({ ...formData, socialMedia: newSocial });
    };

    const handleSaveSocial = () => {
        const newSocial = [...formData.socialMedia];
        if (currentSocialIndex === -1) {
            newSocial.push(socialForm);
        } else {
            newSocial[currentSocialIndex] = socialForm;
        }
        setFormData({ ...formData, socialMedia: newSocial });
        setIsEditingSocial(false);
    };

    // Navigation Column Management
    const handleAddColumn = () => {
        if (formData.navigationColumns.length >= 4) {
            setError('Maximum 4 columns allowed to prevent overcrowding');
            setTimeout(() => setError(''), 3000);
            return;
        }
        setColumnForm({ title: 'New Column', links: [] });
        setCurrentColumnIndex(-1);
        setIsEditingColumn(true);
    };

    const handleEditColumn = (index) => {
        setColumnForm({ ...formData.navigationColumns[index] });
        setCurrentColumnIndex(index);
        setIsEditingColumn(true);
    };

    const handleDeleteColumn = (index) => {
        const newColumns = [...formData.navigationColumns];
        newColumns.splice(index, 1);
        setFormData({ ...formData, navigationColumns: newColumns });
    };

    const handleSaveColumn = () => {
        const newColumns = [...formData.navigationColumns];
        if (currentColumnIndex === -1) {
            newColumns.push(columnForm);
        } else {
            newColumns[currentColumnIndex] = columnForm;
        }
        setFormData({ ...formData, navigationColumns: newColumns });
        setIsEditingColumn(false);
    };

    const handleReorderColumns = (newOrder) => {
        setFormData({ ...formData, navigationColumns: newOrder });
    };

    // Column Link Management
    const addLinkToColumn = () => {
        setColumnForm({
            ...columnForm,
            links: [...columnForm.links, { label: 'New Link', url: '#' }]
        });
    };

    const updateColumnLink = (index, field, value) => {
        const newLinks = [...columnForm.links];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setColumnForm({ ...columnForm, links: newLinks });
    };

    const deleteColumnLink = (index) => {
        const newLinks = [...columnForm.links];
        newLinks.splice(index, 1);
        setColumnForm({ ...columnForm, links: newLinks });
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader className="animate-spin text-emerald-600" /></div>;

    return (
        <div className="space-y-8 text-[var(--admin-text-primary)]">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Footer Section Editor</h1>
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

            {/* Tabs */}
            <div className="flex border-b border-[var(--admin-border)] overflow-x-auto">
                {['branding', 'social', 'navigation', 'newsletter', 'legal'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-medium transition-colors border-b-2 capitalize whitespace-nowrap ${activeTab === tab ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab === 'social' ? 'Social Media' : tab}
                    </button>
                ))}
            </div>

            <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-xl p-6 min-h-[400px]">

                {/* Branding Tab */}
                {activeTab === 'branding' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold border-b border-[var(--admin-border)] pb-2">Brand & Identity</h2>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 opacity-80">Footer Logo URL (Optional)</label>
                            <input
                                type="text"
                                value={formData.branding.logo}
                                onChange={(e) => setFormData({ ...formData, branding: { ...formData.branding, logo: e.target.value } })}
                                className="w-full px-4 py-2 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="https://..."
                            />
                            {formData.branding.logo && (
                                <img src={formData.branding.logo} alt="Logo preview" className="mt-2 h-12" />
                            )}
                            <p className="text-xs text-gray-500 mt-1">Leave empty to use default icon + company name</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 opacity-80">Company Name</label>
                            <input
                                type="text"
                                value={formData.branding.companyName}
                                onChange={(e) => setFormData({ ...formData, branding: { ...formData.branding, companyName: e.target.value } })}
                                className="w-full px-4 py-2 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 opacity-80">Mission Statement (max 200 chars)</label>
                            <textarea
                                rows={3}
                                maxLength={200}
                                value={formData.branding.mission}
                                onChange={(e) => setFormData({ ...formData, branding: { ...formData.branding, mission: e.target.value } })}
                                className="w-full px-4 py-2 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">{formData.branding.mission.length}/200</p>
                        </div>
                    </div>
                )}

                {/* Social Media Tab */}
                {activeTab === 'social' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-[var(--admin-border)] pb-2">
                            <h2 className="text-lg font-semibold">Social Media Links</h2>
                            <button onClick={handleAddSocial} className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                                <Plus size={16} /> Add Social Link
                            </button>
                        </div>
                        <div className="grid gap-3">
                            {formData.socialMedia.map((social, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 bg-[var(--admin-bg-secondary)] rounded-lg border border-[var(--admin-border)]">
                                    <span className="capitalize font-medium w-24">{social.platform}</span>
                                    <input
                                        type="text"
                                        value={social.url}
                                        disabled
                                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                                    />
                                    <button onClick={() => handleEditSocial(index)} className="p-2 hover:bg-white rounded">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteSocial(index)} className="p-2 hover:bg-white rounded text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation Tab */}
                {activeTab === 'navigation' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-[var(--admin-border)] pb-2">
                            <h2 className="text-lg font-semibold">Navigation Columns</h2>
                            <button
                                onClick={handleAddColumn}
                                disabled={formData.navigationColumns.length >= 4}
                                className="text-sm text-emerald-600 font-medium flex items-center gap-1 disabled:opacity-50"
                            >
                                <Plus size={16} /> Add Column (max 4)
                            </button>
                        </div>
                        <Reorder.Group axis="y" values={formData.navigationColumns} onReorder={handleReorderColumns} className="space-y-3">
                            {formData.navigationColumns.map((column, index) => (
                                <Reorder.Item
                                    key={index}
                                    value={column}
                                    className="bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing"
                                >
                                    <GripVertical className="text-gray-400" size={20} />
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{column.title}</h3>
                                        <p className="text-sm opacity-60">{column.links?.length || 0} links</p>
                                    </div>
                                    <button onClick={() => handleEditColumn(index)} className="p-2 hover:bg-white rounded">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteColumn(index)} className="p-2 hover:bg-white rounded text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </div>
                )}

                {/* Newsletter Tab */}
                {activeTab === 'newsletter' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold border-b border-[var(--admin-border)] pb-2">Newsletter Configuration</h2>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 opacity-80">CTA Heading</label>
                            <input
                                type="text"
                                value={formData.newsletter.heading}
                                onChange={(e) => setFormData({ ...formData, newsletter: { ...formData.newsletter, heading: e.target.value } })}
                                className="w-full px-4 py-2 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 opacity-80">CTA Subtext</label>
                            <textarea
                                rows={2}
                                value={formData.newsletter.subtext}
                                onChange={(e) => setFormData({ ...formData, newsletter: { ...formData.newsletter, subtext: e.target.value } })}
                                className="w-full px-4 py-2 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 opacity-80">Email Input Placeholder</label>
                            <input
                                type="text"
                                value={formData.newsletter.placeholder}
                                onChange={(e) => setFormData({ ...formData, newsletter: { ...formData.newsletter, placeholder: e.target.value } })}
                                className="w-full px-4 py-2 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 opacity-80">Submission Destination</label>
                            <select
                                value={formData.newsletter.submissionDestination}
                                onChange={(e) => setFormData({ ...formData, newsletter: { ...formData.newsletter, submissionDestination: e.target.value } })}
                                className="w-full px-4 py-2 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="local">Local Database</option>
                                <option value="email">Email Notification</option>
                                <option value="mailchimp">Mailchimp Integration</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Legal Tab */}
                {activeTab === 'legal' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold border-b border-[var(--admin-border)] pb-2">Legal & Bottom Bar</h2>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 opacity-80">Copyright Text</label>
                            <input
                                type="text"
                                value={formData.legal.copyright}
                                onChange={(e) => setFormData({ ...formData, legal: { ...formData.legal, copyright: e.target.value } })}
                                className="w-full px-4 py-2 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Use {'{year}'} for dynamic year</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 opacity-80">Privacy Policy URL</label>
                                <input
                                    type="text"
                                    value={formData.legal.privacyPolicyUrl}
                                    onChange={(e) => setFormData({ ...formData, legal: { ...formData.legal, privacyPolicyUrl: e.target.value } })}
                                    className="w-full px-4 py-2 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 opacity-80">Terms of Service URL</label>
                                <input
                                    type="text"
                                    value={formData.legal.termsOfServiceUrl}
                                    onChange={(e) => setFormData({ ...formData, legal: { ...formData.legal, termsOfServiceUrl: e.target.value } })}
                                    className="w-full px-4 py-2 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.legal.showRegionSelector}
                                    onChange={(e) => setFormData({ ...formData, legal: { ...formData.legal, showRegionSelector: e.target.checked } })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                <span className="ml-3 text-sm font-medium">Show Region/Language Selector</span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Live Preview */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Live Preview</h2>
                </div>
                <ModernFooter config={{ footer: formData }} />
            </div>

            {/* Edit Social Modal */}
            <AnimatePresence>
                {isEditingSocial && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white text-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4"
                        >
                            <h3 className="text-lg font-bold">{currentSocialIndex === -1 ? 'Add Social Link' : 'Edit Social Link'}</h3>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Platform</label>
                                <select
                                    value={socialForm.platform}
                                    onChange={(e) => setSocialForm({ ...socialForm, platform: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="twitter">Twitter/X</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="linkedin">LinkedIn</option>
                                    <option value="youtube">YouTube</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">URL</label>
                                <input
                                    type="url"
                                    value={socialForm.url}
                                    onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setIsEditingSocial(false)} className="px-4 py-2 border rounded">Cancel</button>
                                <button onClick={handleSaveSocial} className="px-4 py-2 bg-emerald-600 text-white rounded">Save</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Column Modal */}
            <AnimatePresence>
                {isEditingColumn && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white text-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 space-y-4"
                        >
                            <h3 className="text-lg font-bold">{currentColumnIndex === -1 ? 'Add Navigation Column' : 'Edit Navigation Column'}</h3>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Column Title</label>
                                <input
                                    type="text"
                                    value={columnForm.title}
                                    onChange={(e) => setColumnForm({ ...columnForm, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-sm font-semibold">Links</label>
                                    <button onClick={addLinkToColumn} className="text-sm text-emerald-600">+ Add Link</button>
                                </div>
                                <div className="space-y-2">
                                    {columnForm.links?.map((link, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={link.label}
                                                onChange={(e) => updateColumnLink(index, 'label', e.target.value)}
                                                placeholder="Label"
                                                className="flex-1 px-3 py-2 border rounded"
                                            />
                                            <input
                                                type="text"
                                                value={link.url}
                                                onChange={(e) => updateColumnLink(index, 'url', e.target.value)}
                                                placeholder="URL"
                                                className="flex-1 px-3 py-2 border rounded"
                                            />
                                            <button onClick={() => deleteColumnLink(index)} className="p-2 text-red-500">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setIsEditingColumn(false)} className="px-4 py-2 border rounded">Cancel</button>
                                <button onClick={handleSaveColumn} className="px-4 py-2 bg-emerald-600 text-white rounded">Save Column</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FooterEditor;
