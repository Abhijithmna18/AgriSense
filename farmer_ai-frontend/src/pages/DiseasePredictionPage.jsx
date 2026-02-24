import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    CheckCircle,
    Info,
    Camera,
    Search,
    Loader2,
    ArrowLeft,
    Shield,
    Leaf
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/authApi';
import { useNavigate } from 'react-router-dom';

const DiseasePredictionPage = () => {
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('Image size should be less than 10MB');
                return;
            }
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
        }
    };

    const handlePredict = async () => {
        if (!selectedImage) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', selectedImage);

        try {
            // We will create this proxy route in the backend next
            const response = await api.post('/api/ml/predict-disease', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data) {
                setResult(response.data);
                toast.success('Disease analysis complete!');
            } else {
                toast.error('Could not analyze the image.');
            }
        } catch (error) {
            console.error('Prediction error:', error);
            toast.error(error.response?.data?.message || 'Failed to analyze plant. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ severity }) => {
        let colorClass = 'bg-gray-100 text-gray-800';
        let icon = <Info size={16} />;

        if (severity === 'High') {
            colorClass = 'bg-red-100 text-red-800';
            icon = <AlertTriangle size={16} />;
        } else if (severity === 'Medium') {
            colorClass = 'bg-amber-100 text-amber-800';
            icon = <AlertTriangle size={16} />;
        } else if (severity === 'Low') {
            colorClass = 'bg-green-100 text-green-800';
            icon = <CheckCircle size={16} />;
        }

        return (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
                {icon}
                <span className="uppercase tracking-wider">{severity} SEVERITY</span>
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
                        <Activity className="text-red-500" size={32} />
                        Disease Predictor
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Upload a photo of a leaf to instantly identify diseases and receive a verified treatment plan.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Upload Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold mb-4">Upload Leaf Image</h2>

                        <div className={`
                            border-2 border-dashed rounded-xl p-8 text-center transition-all
                            ${previewUrl ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-400 bg-gray-50'}
                        `}>
                            {previewUrl ? (
                                <div className="space-y-4">
                                    <img
                                        src={previewUrl}
                                        alt="Upload Preview"
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
                                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                                        <Camera size={28} />
                                    </div>
                                    <div>
                                        <label htmlFor="disease-img-upload" className="cursor-pointer">
                                            <span className="text-red-600 font-semibold hover:text-red-700">Click to upload</span>
                                            <span className="text-gray-500"> or drag and drop</span>
                                            <input
                                                id="disease-img-upload"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                        <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP up to 10MB</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handlePredict}
                            disabled={!selectedImage || loading}
                            className={`
                                w-full mt-6 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                                ${!selectedImage || loading
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg'
                                }
                            `}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Analyzing Imagery...
                                </>
                            ) : (
                                <>
                                    <Search size={20} />
                                    Run Diagnosis
                                </>
                            )}
                        </button>
                    </div>
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
                                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 relative">
                                    <div className="absolute inset-0 border-4 border-red-100 rounded-full animate-ping"></div>
                                    <Activity className="text-red-500 animate-pulse" size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Running Deep Learning Model...</h3>
                                <p className="text-gray-500 max-w-md">
                                    Analyzing leaf patterns to detect potential diseases and generate a treatment plan.
                                </p>
                            </motion.div>
                        ) : result ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Analysis Header */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-3xl font-bold text-gray-900">
                                                    {result.disease_prediction?.disease || "Analysis Complete"}
                                                </h2>
                                                <StatusBadge severity={result.disease_prediction?.severity_estimation} />
                                            </div>
                                            <p className="text-lg text-gray-600 font-serif">
                                                Crop: <strong>{result.disease_prediction?.crop}</strong>
                                            </p>
                                        </div>
                                        <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-bold text-gray-700">
                                            {(result.disease_prediction?.confidence * 100).toFixed(1)}% Confidence
                                        </div>
                                    </div>

                                    {result.disease_prediction?.consult_expert_recommended && (
                                        <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-100">
                                            <AlertTriangle size={18} />
                                            <strong>Expert Consultation Recommended:</strong> The confidence score is below optimal thresholds. Consider bringing a physical sample to a local expert.
                                        </div>
                                    )}
                                </div>

                                {/* Visual Explanation and Treatment Plan */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Visual Explanation (Grad-CAM) */}
                                    {result.visual_explanation && (
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                                                <Camera className="text-blue-500" size={20} />
                                                <h3 className="font-bold text-gray-900">AI Visual Explanation</h3>
                                            </div>
                                            <div className="relative flex-1 bg-black">
                                                <img
                                                    src={result.visual_explanation}
                                                    alt="Grad-CAM Heatmap"
                                                    className="w-full h-full object-cover opacity-90"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/60 transition-opacity">
                                                    <p className="text-white text-xs px-6 text-center">
                                                        The highlighted red/yellow regions indicate exactly what our AI identified as the diseased spots.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Treatment Plan */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-3">
                                            <Shield className="text-green-600" size={20} />
                                            Treatment Plan
                                        </h3>

                                        {result.treatment_plan?.medicines ? (
                                            <div className="space-y-4 flex-1">
                                                {result.treatment_plan.medicines.map((med, idx) => (
                                                    <div key={idx} className="bg-green-50 rounded-xl p-4 border border-green-100">
                                                        <h4 className="font-bold text-green-900 mb-1">{med.name}</h4>
                                                        <p className="text-sm text-green-800 mb-2">Active Ingredient: <strong>{med.chemical}</strong></p>
                                                        <p className="text-sm text-gray-700 bg-white p-2 rounded border border-green-50">
                                                            <strong>Dosage:</strong> {med.dosage}
                                                        </p>
                                                        {med.application && (
                                                            <p className="text-sm text-gray-700 mt-2 bg-white p-2 rounded border border-green-50">
                                                                <strong>Application:</strong> {med.application}
                                                            </p>
                                                        )}
                                                        {/* Marketplace integration placeholder */}
                                                        <button
                                                            onClick={() => navigate(`/marketplace?search=${encodeURIComponent(med.name)}`)}
                                                            className="w-full mt-3 bg-green-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-green-700 transition-colors"
                                                        >
                                                            Find on Marketplace
                                                        </button>
                                                    </div>
                                                ))}
                                                {result.treatment_plan.general_advice && (
                                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
                                                        <strong className="block mb-1 text-gray-900">General Advice:</strong>
                                                        {result.treatment_plan.general_advice}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col justify-center text-center p-6 text-gray-500">
                                                <Leaf size={32} className="mx-auto mb-2 text-gray-300" />
                                                <p>{result.treatment_plan?.message || "No specific treatment mapped for this condition."}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <Activity className="text-gray-300 mb-4" size={64} />
                                <h3 className="text-lg font-medium text-gray-900">No diagnosis run yet</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mt-2">
                                    Upload a photo of a leaf in the panel to the left to detect diseases.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default DiseasePredictionPage;
