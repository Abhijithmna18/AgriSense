import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, AlertCircle, Check, Loader, Plus, Trash2, Edit2, Activity, Database, Server } from 'lucide-react';
import homepageService from '../../../services/homepageService';
import ModernDataViz from '../../../components/ModernDataViz';

const PerformanceEditor = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        metrics: [],
        chart: {
            title: '',
            isLive: false,
            liveSource: '',
            manualData: [],
            legendLabels: { projected: '', actual: '' }
        },
        systemStatus: {
            showLiveFeed: true,
            showServerLoad: true,
            showDbStatus: true
        }
    });

    const [activeTab, setActiveTab] = useState('kpi'); // kpi, chart, status

    // KPI Editor State
    const [isEditingMetric, setIsEditingMetric] = useState(false);
    const [currentMetricIndex, setCurrentMetricIndex] = useState(null);
    const [metricForm, setMetricForm] = useState({
        label: '',
        isLive: false,
        demoValue: '',
        liveSource: 'sensor_health',
        progress: 0,
        status: 'Optimal'
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const config = await homepageService.getHomepageConfig();
            if (config && config.performance) {
                // Ensure defaults for nested objects to prevent crash
                const perf = config.performance;
                setFormData({
                    title: perf.title || '',
                    description: perf.description || '',
                    metrics: perf.metrics || [],
                    chart: {
                        title: perf.chart?.title || '',
                        isLive: perf.chart?.isLive || false,
                        liveSource: perf.chart?.liveSource || 'api/yields',
                        manualData: perf.chart?.manualData || [],
                        legendLabels: {
                            projected: perf.chart?.legendLabels?.projected || 'Projected',
                            actual: perf.chart?.legendLabels?.actual || 'Actual'
                        }
                    },
                    systemStatus: {
                        showLiveFeed: perf.systemStatus?.showLiveFeed ?? true,
                        showServerLoad: perf.systemStatus?.showServerLoad ?? true,
                        showDbStatus: perf.systemStatus?.showDbStatus ?? true
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
                performance: formData
            };

            await homepageService.updateHomepageConfig(updatedConfig);
            setSuccess('Performance section updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update configuration');
        } finally {
            setSaving(false);
        }
    };

    // Metric Management
    const handleAddMetric = () => {
        setMetricForm({
            label: 'New Metric',
            isLive: false,
            demoValue: '50%',
            liveSource: 'sensor_generic',
            progress: 50,
            status: 'Optimal'
        });
        setCurrentMetricIndex(-1);
        setIsEditingMetric(true);
    };

    const handleEditMetric = (index) => {
        setMetricForm({ ...formData.metrics[index] });
        setCurrentMetricIndex(index);
        setIsEditingMetric(true);
    };

    const handleDeleteMetric = (index) => {
        const newMetrics = [...formData.metrics];
        newMetrics.splice(index, 1);
        setFormData({ ...formData, metrics: newMetrics });
    };

    const handleSaveMetric = () => {
        const newMetrics = [...formData.metrics];
        if (currentMetricIndex === -1) {
            newMetrics.push(metricForm);
        } else {
            newMetrics[currentMetricIndex] = metricForm;
        }
        setFormData({ ...formData, metrics: newMetrics });
        setIsEditingMetric(false);
    };

    // Chart Data Management
    const handleChartDataChange = (index, field, value) => {
        const newData = [...formData.chart.manualData];
        newData[index] = { ...newData[index], [field]: value };
        setFormData({
            ...formData,
            chart: { ...formData.chart, manualData: newData }
        });
    };

    const addChartRow = () => {
        const newData = [...formData.chart.manualData, { month: 'New', projected: 0, actual: 0 }];
        setFormData({
            ...formData,
            chart: { ...formData.chart, manualData: newData }
        });
    };

    const removeChartRow = (index) => {
        const newData = [...formData.chart.manualData];
        newData.splice(index, 1);
        setFormData({
            ...formData,
            chart: { ...formData.chart, manualData: newData }
        });
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader className="animate-spin text-emerald-600" /></div>;

    return (
        <div className="space-y-8 text-[var(--admin-text-primary)]">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Performance Dashboard Editor</h1>
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

            {/* Main Section Header Config */}
            <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Section Header</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <label className="block text-sm font-medium mb-1.5 opacity-80">Description / Subtitle</label>
                        <textarea
                            rows={1}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--admin-border)] mb-6">
                <button
                    onClick={() => setActiveTab('kpi')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'kpi' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    KPI Metrics
                </button>
                <button
                    onClick={() => setActiveTab('chart')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'chart' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Chart Configuration
                </button>
                <button
                    onClick={() => setActiveTab('status')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'status' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    System Status
                </button>
            </div>

            {/* Tab Content */}
            <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-xl p-6 min-h-[400px]">

                {/* KPI Metrics Tab */}
                {activeTab === 'kpi' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-semibold text-lg">Metric Highlight Cards</h3>
                            <button onClick={handleAddMetric} className="flex items-center gap-2 text-sm bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-100 font-medium">
                                <Plus size={16} /> Add Metric
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {formData.metrics.map((metric, index) => (
                                <div key={index} className="p-4 border border-[var(--admin-border)] rounded-lg bg-[var(--admin-bg-secondary)] relative group">
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditMetric(index)} className="p-1 hover:bg-white rounded"><Edit2 size={14} /></button>
                                        <button onClick={() => handleDeleteMetric(index)} className="p-1 hover:bg-white rounded text-red-500"><Trash2 size={14} /></button>
                                    </div>
                                    <h4 className="font-medium text-sm text-gray-500">{metric.label}</h4>
                                    <div className="flex items-end gap-2 mt-1">
                                        <span className="text-2xl font-bold">{metric.isLive ? 'LIVE' : metric.demoValue}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${metric.status === 'Optimal' ? 'bg-green-100 text-green-700' :
                                                metric.status === 'Warning' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>{metric.status}</span>
                                    </div>
                                    <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: `${metric.progress}%` }}></div>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-400">
                                        Source: {metric.isLive ? metric.liveSource : 'Demo Mode'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chart Config Tab */}
                {activeTab === 'chart' && (
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Chart Title</label>
                                <input
                                    type="text"
                                    value={formData.chart.title}
                                    onChange={(e) => setFormData({ ...formData, chart: { ...formData.chart, title: e.target.value } })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Data Mode</label>
                                <div className="flex items-center gap-4 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={!formData.chart.isLive}
                                            onChange={() => setFormData({ ...formData, chart: { ...formData.chart, isLive: false } })}
                                            className="text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span>Manual / Mock Data</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={formData.chart.isLive}
                                            onChange={() => setFormData({ ...formData, chart: { ...formData.chart, isLive: true } })}
                                            className="text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span>AI / Live Data Source</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {formData.chart.isLive ? (
                            <div className="p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                                <label className="block text-sm font-bold mb-2">Live Data Source Selector</label>
                                <select
                                    value={formData.chart.liveSource}
                                    onChange={(e) => setFormData({ ...formData, chart: { ...formData.chart, liveSource: e.target.value } })}
                                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg"
                                >
                                    <option value="api/yields">Yield Prediction API</option>
                                    <option value="api/market_trends">Market Trends API</option>
                                    <option value="db/historical_yields">Historical Yields DB</option>
                                </select>
                                <p className="text-xs mt-2 opacity-80">Selects the backend endpoint to fetch data from. Ensure the endpoint is active.</p>
                            </div>
                        ) : (
                            <div>
                                <h4 className="font-semibold mb-3">Manual Data Editor</h4>
                                <div className="overflow-x-auto border rounded-lg">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-700 font-semibold">
                                            <tr>
                                                <th className="px-4 py-2">Month</th>
                                                <th className="px-4 py-2">Projected Yield</th>
                                                <th className="px-4 py-2">Actual Yield</th>
                                                <th className="px-4 py-2 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.chart.manualData.map((row, index) => (
                                                <tr key={index} className="border-t">
                                                    <td className="px-2 py-1">
                                                        <input type="text" value={row.month} onChange={(e) => handleChartDataChange(index, 'month', e.target.value)} className="w-full px-2 py-1 border rounded" />
                                                    </td>
                                                    <td className="px-2 py-1">
                                                        <input type="number" value={row.projected} onChange={(e) => handleChartDataChange(index, 'projected', parseFloat(e.target.value))} className="w-full px-2 py-1 border rounded" />
                                                    </td>
                                                    <td className="px-2 py-1">
                                                        <input type="number" value={row.actual} onChange={(e) => handleChartDataChange(index, 'actual', parseFloat(e.target.value))} className="w-full px-2 py-1 border rounded" />
                                                    </td>
                                                    <td className="px-2 py-1 text-center">
                                                        <button onClick={() => removeChartRow(index)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button onClick={addChartRow} className="mt-2 text-sm text-emerald-600 font-medium hover:underline">+ Add Row</button>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Legend Label: Projected</label>
                                <input
                                    type="text"
                                    value={formData.chart.legendLabels.projected}
                                    onChange={(e) => setFormData({ ...formData, chart: { ...formData.chart, legendLabels: { ...formData.chart.legendLabels, projected: e.target.value } } })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Legend Label: Actual</label>
                                <input
                                    type="text"
                                    value={formData.chart.legendLabels.actual}
                                    onChange={(e) => setFormData({ ...formData, chart: { ...formData.chart, legendLabels: { ...formData.chart.legendLabels, actual: e.target.value } } })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* System Status Tab */}
                {activeTab === 'status' && (
                    <div className="space-y-6 max-w-xl">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <Activity className="text-emerald-500" size={20} />
                                <div>
                                    <h4 className="font-semibold">Live Activity Feed</h4>
                                    <p className="text-xs text-gray-500">Show real-time system events on homepage</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.systemStatus.showLiveFeed}
                                    onChange={(e) => setFormData({ ...formData, systemStatus: { ...formData.systemStatus, showLiveFeed: e.target.checked } })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <Server className="text-blue-500" size={20} />
                                <div>
                                    <h4 className="font-semibold">Server Load Visibility</h4>
                                    <p className="text-xs text-gray-500">Display current server status indicator</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.systemStatus.showServerLoad}
                                    onChange={(e) => setFormData({ ...formData, systemStatus: { ...formData.systemStatus, showServerLoad: e.target.checked } })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <Database className="text-purple-500" size={20} />
                                <div>
                                    <h4 className="font-semibold">Database Status Visibility</h4>
                                    <p className="text-xs text-gray-500">Display database connection health</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.systemStatus.showDbStatus}
                                    onChange={(e) => setFormData({ ...formData, systemStatus: { ...formData.systemStatus, showDbStatus: e.target.checked } })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Live Preview (Simplified) */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Live Preview</h2>
                </div>
                <ModernDataViz config={formData} />
            </div>

            {/* Edit Metric Modal */}
            <AnimatePresence>
                {isEditingMetric && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white text-slate-900 rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4"
                        >
                            <h3 className="text-lg font-bold mb-4">{currentMetricIndex === -1 ? 'Add Metric' : 'Edit Metric'}</h3>
                            <div>
                                <label className="block text-sm font-bold mb-1">Metric Label</label>
                                <input type="text" value={metricForm.label} onChange={(e) => setMetricForm({ ...metricForm, label: e.target.value })} className="w-full border rounded px-3 py-2" />
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="block text-sm font-bold mb-1">Data Source Mode</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2"><input type="radio" checked={!metricForm.isLive} onChange={() => setMetricForm({ ...metricForm, isLive: false })} /> Demo (Static)</label>
                                    <label className="flex items-center gap-2"><input type="radio" checked={metricForm.isLive} onChange={() => setMetricForm({ ...metricForm, isLive: true })} /> Live (Sensor)</label>
                                </div>
                            </div>

                            {metricForm.isLive ? (
                                <div>
                                    <label className="block text-sm font-bold mb-1">Live Source Identifier</label>
                                    <select value={metricForm.liveSource} onChange={(e) => setMetricForm({ ...metricForm, liveSource: e.target.value })} className="w-full border rounded px-3 py-2">
                                        <option value="sensor_health">Sensor: Plant Health</option>
                                        <option value="sensor_moisture">Sensor: Soil Moisture</option>
                                        <option value="sensor_temp">Sensor: Temperature</option>
                                        <option value="ai_yield_est">AI: Yield Estimate</option>
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-bold mb-1">Demo Value</label>
                                    <input type="text" value={metricForm.demoValue} onChange={(e) => setMetricForm({ ...metricForm, demoValue: e.target.value })} className="w-full border rounded px-3 py-2" />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold mb-1">Progress / Fill (%)</label>
                                <input type="number" min="0" max="100" value={metricForm.progress} onChange={(e) => setMetricForm({ ...metricForm, progress: parseInt(e.target.value) })} className="w-full border rounded px-3 py-2" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1">Status</label>
                                <select value={metricForm.status} onChange={(e) => setMetricForm({ ...metricForm, status: e.target.value })} className="w-full border rounded px-3 py-2">
                                    <option value="Optimal">Optimal (Green)</option>
                                    <option value="Warning">Warning (Yellow)</option>
                                    <option value="Critical">Critical (Red)</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setIsEditingMetric(false)} className="px-4 py-2 border rounded">Cancel</button>
                                <button onClick={handleSaveMetric} className="px-4 py-2 bg-emerald-600 text-white rounded">Save Metric</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PerformanceEditor;
