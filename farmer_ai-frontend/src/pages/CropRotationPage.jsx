import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Sprout, ArrowRight, Leaf, Droplets, Calendar, Loader2, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/authApi';

const CropRotationPage = ({ isEmbedded }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentCrop: 'Wheat',
        soilType: 'Loamy',
        season: 'Kharif'
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const commonCrops = ['Wheat', 'Rice', 'Corn', 'Cotton', 'Sugarcane', 'Potato', 'Mustard', 'Soybean'];
    const soilTypes = ['Loamy', 'Clay', 'Sandy', 'Black', 'Red', 'Alluvial'];
    const seasons = ['Kharif (Monsoon)', 'Rabi (Winter)', 'Zaid (Summer)'];

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/api/crop-intelligence/rotation', formData);
            setResult(data.data);
            toast.success('Rotation advice generated!');
        } catch (error) {
            console.error('Failed to get advice', error);
            toast.error('Failed to generate advice. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`p-6 max-w-7xl mx-auto space-y-8 animate-fade-in ${isEmbedded ? 'pt-0' : ''}`}>
            {/* Header */}
            {!isEmbedded && (
                <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <RefreshCw className="animate-spin-slow" />
                            Crop Rotation Planner
                        </h1>
                        <p className="text-green-100 max-w-2xl text-lg">
                            Optimize your soil health and yield by scientifically selecting your next crop.
                            AI analyzes nutrient depletion to suggest the perfect restorative cycle.
                        </p>
                    </div>
                    <Leaf className="absolute right-0 bottom-0 text-green-800 opacity-20 w-64 h-64 -mr-10 -mb-10" />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Sprout className="text-green-600" />
                        Current Status
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Harvested / Current Crop</label>
                            <select
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition"
                                value={formData.currentCrop}
                                onChange={e => setFormData({ ...formData, currentCrop: e.target.value })}
                            >
                                {commonCrops.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Soil Type</label>
                            <select
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition"
                                value={formData.soilType}
                                onChange={e => setFormData({ ...formData, soilType: e.target.value })}
                            >
                                {soilTypes.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upcoming Season</label>
                            <select
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition"
                                value={formData.season}
                                onChange={e => setFormData({ ...formData, season: e.target.value })}
                            >
                                {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-200 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <RefreshCw size={20} />}
                            Generate Rotation Plan
                        </button>
                    </div>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-2 space-y-6">
                    {result ? (
                        <>
                            {/* Soil Impact Summary */}
                            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
                                <h3 className="font-bold text-blue-800 mb-2">🌱 Soil Health Impact</h3>
                                <p className="text-blue-700 leading-relaxed">
                                    {result.soil_health_impact}
                                </p>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900">Recommended Next Crops</h3>

                            <div className="grid gap-6">
                                {result.recommendations.map((rec, index) => (
                                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-green-500" />

                                        <div className="flex flex-col md:flex-row justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border border-green-200">
                                                        {index + 1}
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-gray-900">{rec.crop_name}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${rec.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                                        rec.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {rec.difficulty}
                                                    </span>
                                                </div>

                                                <p className="text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                    "{rec.reasoning}"
                                                </p>

                                                <div className="flex flex-wrap gap-2">
                                                    {rec.benefits.map((benefit, i) => (
                                                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-1">
                                                            <Leaf size={14} /> {benefit}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3 min-w-[150px] border-l border-gray-100 pl-6 border-dashed">
                                                <div className="text-sm">
                                                    <span className="text-gray-500 block mb-1">Duration</span>
                                                    <span className="font-bold text-gray-900 flex items-center gap-2">
                                                        <Calendar size={16} className="text-green-600" />
                                                        {rec.duration} Days
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => navigate('/crop-calendar', {
                                                        state: {
                                                            cropName: rec.crop_name,
                                                            soilType: formData.soilType,
                                                            season: formData.season
                                                        }
                                                    })}
                                                    className="px-4 py-2 border-2 border-blue-600 bg-blue-50 text-blue-700 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition text-sm flex items-center justify-center gap-2"
                                                >
                                                    <Calendar size={16} /> Smart Calendar
                                                </button>
                                                <button
                                                    onClick={() => navigate('/crop-knowledge', {
                                                        state: {
                                                            section: 'cultivation',
                                                            initialQuery: `Complete cultivation guide for ${rec.crop_name}`
                                                        }
                                                    })}
                                                    className="mt-auto px-4 py-2 border-2 border-green-600 text-green-600 rounded-lg font-bold hover:bg-green-50 transition text-sm flex items-center justify-center gap-2"
                                                >
                                                    <Sprout size={16} /> View Guide
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
                            <Sprout size={64} className="mb-4 text-gray-300" />
                            <h3 className="text-xl font-bold text-gray-500">No Analysis Yet</h3>
                            <p>Select your current crop and click generated to see recommendations.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CropRotationPage;
