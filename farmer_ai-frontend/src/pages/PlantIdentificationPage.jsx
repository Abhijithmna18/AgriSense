import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    Leaf,
    AlertTriangle,
    CheckCircle,
    Droplets,
    Sun,
    Sprout,
    Search,
    AlertCircle,
    Loader2,
    Camera,
    ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/authApi';
import ReactMarkdown from 'react-markdown';

import { useNavigate } from 'react-router-dom';

const PlantIdentificationPage = () => {
    const navigate = useNavigate();
    // Debug log to verify updated component version
    console.log('PlantIdentificationPage rendered (v2)');
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null); // Reset results on new image
        }
    };

    const handleIdentify = async () => {
        if (!selectedImage) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', selectedImage);

        try {
            const response = await api.post('/api/ai/identify', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                // Use aiDetails which contains the actual AI response, not the database record
                setResult(response.data.aiDetails);
                toast.success('Plant identified successfully!');
            } else {
                toast.error('Could not identify plant.');
            }
        } catch (error) {
            console.error('Identification error:', error);
            toast.error(error.response?.data?.message || 'Failed to identify plant. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status, confidence }) => {
        const isConfirmed = status === 'confirmed';
        const colorClass = isConfirmed ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800';
        const icon = isConfirmed ? <CheckCircle size={16} /> : <AlertTriangle size={16} />;

        return (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
                {icon}
                <span className="capitalize">{status}</span>
                <span className="text-xs opacity-75">({(confidence * 100).toFixed(0)}%)</span>
            </div>
        );
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors mb-4"
            >
                <ArrowLeft size={16} className="mr-2" />
                Back to Dashboard
            </button>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Leaf className="text-green-600" size={32} />
                        Plant Doctor
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Upload a photo to identify plants, detect diseases, and get cultivation tips.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Upload Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold mb-4">Upload Image</h2>

                        <div className={`
                            border-2 border-dashed rounded-xl p-8 text-center transition-all
                            ${previewUrl ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 bg-gray-50'}
                        `}>
                            {previewUrl ? (
                                <div className="space-y-4">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-64 object-cover rounded-lg shadow-md"
                                    />
                                    <button
                                        onClick={() => {
                                            setSelectedImage(null);
                                            setPreviewUrl(null);
                                            setResult(null);
                                        }}
                                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Remove Image
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                        <Camera size={28} />
                                    </div>
                                    <div>
                                        <label htmlFor="plant-upload" className="cursor-pointer">
                                            <span className="text-green-600 font-semibold hover:text-green-700">Click to upload</span>
                                            <span className="text-gray-500"> or drag and drop</span>
                                            <input
                                                id="plant-upload"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                        <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP up to 5MB</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleIdentify}
                            disabled={!selectedImage || loading}
                            className={`
                                w-full mt-6 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                                ${!selectedImage || loading
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
                                }
                            `}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Analyzing Plant...
                                </>
                            ) : (
                                <>
                                    <Search size={20} />
                                    Identify Plant
                                </>
                            )}
                        </button>
                    </div>

                    {/* Quick Tips */}
                    {!result && (
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                <AlertCircle size={18} />
                                Tips for best results
                            </h3>
                            <ul className="space-y-2 text-sm text-blue-800">
                                <li className="flex gap-2">
                                    <span>•</span>
                                    Ensure the plant is well-lit and in focus.
                                </li>
                                <li className="flex gap-2">
                                    <span>•</span>
                                    Capture leaves, flowers, or fruit if visible.
                                </li>
                                <li className="flex gap-2">
                                    <span>•</span>
                                    Avoid cluttered backgrounds.
                                </li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* Right Column: Results */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-gray-100"
                            >
                                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 relative">
                                    <div className="absolute inset-0 border-4 border-green-100 rounded-full animate-ping"></div>
                                    <Leaf className="text-green-500 animate-pulse" size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing your plant...</h3>
                                <p className="text-gray-500 max-w-md">
                                    Our botanical AI is examining visual traits to identify the species and assess its health.
                                </p>
                            </motion.div>
                        ) : result ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Identification Header */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-3xl font-bold text-gray-900">
                                                    {result.common_name || "Unknown Plant"}
                                                </h2>
                                                <StatusBadge status={result.identification_status} confidence={result.confidence} />
                                            </div>
                                            <p className="text-lg text-gray-600 italic font-serif">
                                                {result.scientific_name}
                                            </p>
                                        </div>
                                        <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 capitalize">
                                            {result.plant_category} • {result.growth_stage}
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                                        <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Key Visual Traits</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.key_visual_traits && result.key_visual_traits.map((trait, idx) => (
                                                <span key={idx} className="bg-white border border-gray-200 px-3 py-1 rounded-md text-sm text-gray-600">
                                                    {trait}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Health Analysis */}
                                {result.health_analysis && (
                                    <div className={`rounded-2xl shadow-sm border p-6 ${result.health_analysis.severity === 'none'
                                        ? 'bg-green-50 border-green-100'
                                        : 'bg-red-50 border-red-100'
                                        }`}>
                                        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${result.health_analysis.severity === 'none' ? 'text-green-800' : 'text-red-800'
                                            }`}>
                                            {result.health_analysis.severity === 'none' ? <CheckCircle /> : <AlertTriangle />}
                                            Health Analysis: <span className="capitalize">{result.health_analysis.severity}</span>
                                        </h3>

                                        {result.health_analysis.visible_issues?.length > 0 ? (
                                            <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                                                {result.health_analysis.visible_issues.map((issue, idx) => (
                                                    <li key={idx}>{issue}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-green-700">No visible issues detected. The plant appears healthy.</p>
                                        )}
                                    </div>
                                )}

                                {/* Two Column Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Agricultural Relevance */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Sprout className="text-emerald-600" size={20} />
                                            Relevance
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <span className="text-sm text-gray-500 block mb-1">Economic Importance</span>
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${result.agricultural_relevance?.economic_importance === 'high' ? 'bg-purple-100 text-purple-700' :
                                                    result.agricultural_relevance?.economic_importance === 'medium' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {result.agricultural_relevance?.economic_importance || 'Unknown'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-500 block mb-1">Primary Uses</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {result.agricultural_relevance?.primary_uses?.map((use, idx) => (
                                                        <span key={idx} className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded">
                                                            {use}
                                                        </span>
                                                    )) || <span className="text-xs text-gray-500">None listed</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cultivation Hints */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Sun className="text-orange-500" size={20} />
                                            Cultivation
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <Sun className="text-orange-400 mt-1 shrink-0" size={16} />
                                                <div>
                                                    <span className="text-xs font-bold text-gray-400 uppercase">Climate</span>
                                                    <p className="text-sm text-gray-700">{result.cultivation_hints?.climate_preference || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Sprout className="text-amber-700 mt-1 shrink-0" size={16} />
                                                <div>
                                                    <span className="text-xs font-bold text-gray-400 uppercase">Soil</span>
                                                    <p className="text-sm text-gray-700">{result.cultivation_hints?.soil_preference || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Droplets className="text-blue-400 mt-1 shrink-0" size={16} />
                                                <div>
                                                    <span className="text-xs font-bold text-gray-400 uppercase">Water</span>
                                                    <p className="text-sm text-gray-700">{result.cultivation_hints?.water_needs || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes Section */}
                                {result.notes && (
                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-sm leading-relaxed text-gray-700">
                                        <h3 className="font-bold text-gray-900 mb-2">Additional Notes</h3>
                                        {result.notes}
                                    </div>
                                )}

                                {/* Alternative Matches */}
                                {result.alternative_matches && result.alternative_matches.length > 0 && (
                                    <div className="mt-8 pt-6 border-t border-gray-200">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Alternative Matches</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {result.alternative_matches.map((match, idx) => (
                                                <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 opacity-75 hover:opacity-100 transition-opacity">
                                                    <p className="font-bold text-gray-800">{match.common_name}</p>
                                                    <p className="text-xs text-gray-500 italic mb-2">{match.scientific_name}</p>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                        <div
                                                            className="bg-gray-400 h-1.5 rounded-full"
                                                            style={{ width: `${match.confidence * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-xs text-right mt-1 text-gray-500">{(match.confidence * 100).toFixed(0)}% match</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <Leaf className="text-gray-300 mb-4" size={64} />
                                <h3 className="text-lg font-medium text-gray-900">No plant analyzed yet</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mt-2">
                                    Upload a photo in the panel to the left to get detailed botanical insights.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default PlantIdentificationPage;
