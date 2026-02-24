import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/authApi';
import { useNavigate } from 'react-router-dom';
import { Loader, Plus, History, Activity, FileText, TrendingUp, ArrowLeft, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const NutrientSlider = ({ label, value, unit, min, max, optimalRange, colorClass = "bg-green-500" }) => {
    const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);

    return (
        <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="font-bold text-gray-900">{value} {unit}</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full relative overflow-hidden">
                {/* Optimal Range Indicator (Background) */}
                <div
                    className="absolute top-0 bottom-0 bg-green-100 opacity-50"
                    style={{
                        left: `${((optimalRange[0] - min) / (max - min)) * 100}%`,
                        width: `${((optimalRange[1] - optimalRange[0]) / (max - min)) * 100}%`
                    }}
                ></div>

                {/* Value Bar */}
                <div
                    className={`h-full rounded-full ${colorClass} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{min}</span>
                <span>{max}</span>
            </div>
        </div>
    );
};

const SoilTestPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [farms, setFarms] = useState([]);
    const [selectedFarm, setSelectedFarm] = useState(null);
    const [history, setHistory] = useState([]);
    const [latest, setLatest] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        labName: '',
        testDate: new Date().toISOString().split('T')[0],
        ph: '',
        nitrogen: '',
        phosphorus: '',
        potassium: '',
        organicCarbon: ''
    });

    useEffect(() => {
        fetchFarms();
    }, []);

    useEffect(() => {
        if (selectedFarm) {
            fetchSoilData(selectedFarm._id);
        }
    }, [selectedFarm]);

    const fetchFarms = async () => {
        try {
            const { data } = await authAPI.getFarms();
            if (data.success && data.data.length > 0) {
                setFarms(data.data);
                setSelectedFarm(data.data[0]);
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const fetchSoilData = async (farmId) => {
        setLoading(true);
        try {
            const [historyRes, latestRes] = await Promise.all([
                authAPI.getSoilTests(farmId),
                authAPI.getLatestSoilTest(farmId)
            ]);

            if (historyRes.data.success) setHistory(historyRes.data.data);
            if (latestRes.data.success) setLatest(latestRes.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch soil data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Date Validation
        const selectedDate = new Date(formData.testDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today to midnight for comparison

        // 1. Prevent Future Dates
        if (selectedDate > new Date()) {
            toast.error('Test date cannot be in the future');
            return;
        }

        // 2. Prevent Past Dates (Must be Today)
        if (selectedDate < today) {
            toast.error('Test date cannot be in the past. Please select today.');
            return;
        }

        // 3. Prevent Duplicate Dates
        const dateExists = history.some(test => {
            const testDate = new Date(test.testDate);
            return testDate.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
        });

        if (dateExists) {
            toast.error('A soil test for this date already exists.');
            return;
        }

        try {
            await authAPI.addSoilTest({ ...formData, farmId: selectedFarm._id });
            toast.success('Soil test added!');
            setFormData({ labName: '', testDate: new Date().toISOString().split('T')[0], ph: '', nitrogen: '', phosphorus: '', potassium: '', organicCarbon: '' });
            setActiveTab('overview');
            fetchSoilData(selectedFarm._id);
        } catch (err) {
            toast.error('Failed to save test');
        }
    };

    // Chart Data Preparation
    const chartData = {
        labels: history.slice().reverse().map(t => new Date(t.testDate).toLocaleDateString()),
        datasets: [
            {
                label: 'pH Level',
                data: history.slice().reverse().map(t => t.ph),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                label: 'Nitrogen (ppm/kg)',
                data: history.slice().reverse().map(t => t.nitrogen),
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    };

    if (loading && !selectedFarm) return <div className="p-10 text-center"><Loader className="animate-spin mx-auto" /></div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Soil Health Manager</h1>
                </div>
                <select
                    className="p-2 border rounded-lg"
                    value={selectedFarm?._id || ''}
                    onChange={(e) => setSelectedFarm(farms.find(f => f._id === e.target.value))}
                >
                    {farms.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                </select>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b overflow-x-auto">
                {[
                    { id: 'overview', label: 'Overview', icon: Activity },
                    { id: 'history', label: 'History', icon: History },
                    { id: 'trends', label: 'Trends', icon: TrendingUp },
                    { id: 'new', label: 'Add Test', icon: Plus },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-green-600 text-green-700 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'overview' && (
                <div className="grid md:grid-cols-2 gap-6">
                    {latest ? (
                        <>
                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-800">
                                    <FileText size={20} className="text-green-600" /> Latest Report ({new Date(latest.testDate).toLocaleDateString()})
                                </h3>

                                <NutrientSlider
                                    label="pH Level"
                                    value={latest.ph}
                                    unit=""
                                    min={4}
                                    max={10}
                                    optimalRange={[6.0, 7.5]}
                                    colorClass={latest.ph < 6 || latest.ph > 7.5 ? "bg-red-500" : "bg-green-500"}
                                />

                                <NutrientSlider
                                    label="Organic Carbon"
                                    value={latest.organicCarbon || 0}
                                    unit="%"
                                    min={0}
                                    max={1.5}
                                    optimalRange={[0.5, 1.0]}
                                    colorClass="bg-gray-600"
                                />

                                <div className="my-6 border-t border-gray-100"></div>

                                <NutrientSlider
                                    label="Nitrogen (N)"
                                    value={latest.nitrogen}
                                    unit="kg/ha"
                                    min={0}
                                    max={600}
                                    optimalRange={[280, 560]}
                                    colorClass="bg-blue-500"
                                />

                                <NutrientSlider
                                    label="Phosphorus (P)"
                                    value={latest.phosphorus}
                                    unit="kg/ha"
                                    min={0}
                                    max={100}
                                    optimalRange={[23, 56]}
                                    colorClass="bg-purple-500"
                                />

                                <NutrientSlider
                                    label="Potassium (K)"
                                    value={latest.potassium}
                                    unit="kg/ha"
                                    min={0}
                                    max={400}
                                    optimalRange={[140, 280]}
                                    colorClass="bg-orange-500"
                                />
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border bg-gradient-to-br from-green-50 to-white">
                                <h3 className="font-bold text-lg mb-4 text-green-900">Recommended Amendments</h3>
                                {latest.recommendations ? (
                                    <ul className="space-y-3">
                                        {[
                                            { label: 'Lime', value: latest.recommendations.limeKgHa, unit: 'kg/ha' },
                                            { label: 'Urea (N)', value: latest.recommendations.ureaKgHa, unit: 'kg/ha' },
                                            { label: 'DAP (P)', value: latest.recommendations.dapKgHa, unit: 'kg/ha' },
                                            { label: 'MOP (K)', value: latest.recommendations.mopKgHa, unit: 'kg/ha' }
                                        ].map((item, idx) => (
                                            <li key={idx} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-green-100/50">
                                                <span className="text-gray-700 font-medium">{item.label}</span>
                                                <span className={`font-bold ${item.value > 0 ? 'text-green-700' : 'text-gray-300'}`}>
                                                    {item.value} {item.unit}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p>No recommendations available.</p>}
                                <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100 flex gap-2 items-start">
                                    <Info size={16} className="mt-0.5 shrink-0" />
                                    <p><strong>Note:</strong> {latest.recommendations?.notes?.join(' ')}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="col-span-2 text-center py-12 text-gray-500">
                            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                            <p>No soil tests recorded yet.</p>
                            <button onClick={() => setActiveTab('new')} className="mt-2 text-green-600 hover:underline">Add your first test</button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-sm">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Lab</th>
                                <th className="p-4">pH</th>
                                <th className="p-4">N</th>
                                <th className="p-4">P</th>
                                <th className="p-4">K</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {history.map(test => (
                                <tr key={test._id} className="hover:bg-gray-50">
                                    <td className="p-4">{new Date(test.testDate).toLocaleDateString()}</td>
                                    <td className="p-4">{test.labName}</td>
                                    <td className="p-4 font-medium">{test.ph}</td>
                                    <td className="p-4">{test.nitrogen}</td>
                                    <td className="p-4">{test.phosphorus}</td>
                                    <td className="p-4">{test.potassium}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'trends' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border h-96">
                    <Line options={{ responsive: true, maintainAspectRatio: false }} data={chartData} />
                </div>
            )}

            {activeTab === 'new' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border max-w-2xl mx-auto">
                    <h3 className="text-xl font-bold mb-6">Enter Soil Test Results</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lab Name</label>
                                <input type="text" className="w-full p-2 border rounded-lg" value={formData.labName} onChange={e => setFormData({ ...formData, labName: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    className="w-full p-2 border rounded-lg"
                                    required
                                    value={formData.testDate}
                                    max={new Date().toISOString().split('T')[0]}
                                    onChange={e => setFormData({ ...formData, testDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">pH Level</label>
                                <input type="number" step="0.1" className="w-full p-2 border rounded-lg" required value={formData.ph} onChange={e => setFormData({ ...formData, ph: parseFloat(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Organic Carbon (%)</label>
                                <input type="number" step="0.01" className="w-full p-2 border rounded-lg" value={formData.organicCarbon} onChange={e => setFormData({ ...formData, organicCarbon: parseFloat(e.target.value) })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nitrogen (N)</label>
                                <input type="number" className="w-full p-2 border rounded-lg" required value={formData.nitrogen} onChange={e => setFormData({ ...formData, nitrogen: parseFloat(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phosphorus (P)</label>
                                <input type="number" className="w-full p-2 border rounded-lg" required value={formData.phosphorus} onChange={e => setFormData({ ...formData, phosphorus: parseFloat(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Potassium (K)</label>
                                <input type="number" className="w-full p-2 border rounded-lg" required value={formData.potassium} onChange={e => setFormData({ ...formData, potassium: parseFloat(e.target.value) })} />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">Save & Generate Recommendations</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SoilTestPage;
