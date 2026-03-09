import React, { useState, useEffect, useRef } from 'react';
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
    Leaf,
    WifiOff,
    Upload
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/authApi';
import { useNavigate } from 'react-router-dom';

const DiseasePredictionPage = ({ isEmbedded }) => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [mlStatus, setMlStatus] = useState(null); // null = checking, 'online', 'offline'
    const [isDragging, setIsDragging] = useState(false);
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState(null); // { is_valid, confidence, message }

    // Check if the ML service is running on component mount
    useEffect(() => {
        const checkMLService = async () => {
            try {
                const response = await api.get('/api/ml/health');
                if (response.data?.mlService?.status === 'online') {
                    setMlStatus('online');
                } else {
                    setMlStatus('offline');
                }
            } catch {
                setMlStatus('offline');
            }
        };
        checkMLService();
    }, []);

    const processFile = async (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload a valid image file (JPG, PNG, WebP).');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image size should be less than 10MB');
            return;
        }
        
        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
        setResult(null);
        setValidationResult(null);
        
        // Automatically validate the image
        await validateImage(file);
    };

    const validateImage = async (file) => {
        setValidating(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/api/ml/validate-leaf', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data) {
                setValidationResult({
                    is_valid: response.data.is_leaf,
                    confidence: response.data.confidence,
                    message: response.data.message
                });

                if (!response.data.is_leaf) {
                    toast.error(response.data.message || 'Invalid image. Please upload a plant leaf photo.');
                } else {
                    toast.success('✓ Leaf detected! Ready for diagnosis.');
                }
            }
        } catch (error) {
            console.error('Validation error:', error);
            // If validation service is down, allow proceeding but warn user
            setValidationResult({
                is_valid: true,
                confidence: 0,
                message: 'Validation service unavailable. Proceeding without validation.'
            });
            toast.error('Image validation unavailable. Results may be inaccurate.');
        } finally {
            setValidating(false);
        }
    };

    const handleImageChange = (e) => processFile(e.target.files[0]);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        processFile(e.dataTransfer.files[0]);
    };

    const handlePredict = async () => {
        if (!selectedImage) return;

        // Block diagnosis if validation failed
        if (validationResult && !validationResult.is_valid) {
            toast.error('Cannot run diagnosis on invalid image. Please upload a plant leaf photo.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', selectedImage);

        try {
            const response = await api.post('/api/ml/predict-disease', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data) {
                setResult(response.data);
                toast.success('Disease analysis complete!');
            } else {
                toast.error('Could not analyze the image.');
            }
        } catch (error) {
            console.error('Prediction error:', error);
            
            // Handle validation errors from backend
            if (error.response?.data?.detail?.error === 'INVALID_IMAGE') {
                const detail = error.response.data.detail;
                toast.error(detail.message || 'Invalid image detected');
                setValidationResult({
                    is_valid: false,
                    confidence: detail.confidence || 0,
                    message: detail.message
                });
            } else {
                const msg = error.response?.data?.message || 'Failed to analyze plant. Please try again.';
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    /**
     * Normalize the treatment plan to a standard format.
     * Handles both the new frontend-compatible format { medicines, general_advice }
     * and the legacy format { recommended_pesticides, organic_treatment, dosage, ... }
     */
    const normalizeTreatmentPlan = (plan) => {
        if (!plan) return { medicines: [], general_advice: '' };

        // Already in the new format
        if (Array.isArray(plan.medicines)) return plan;

        // Convert from legacy format
        const medicines = [];

        if (plan.recommended_pesticides?.length) {
            plan.recommended_pesticides.forEach((name) => {
                medicines.push({
                    name,
                    chemical: name,
                    dosage: plan.dosage || 'As directed on label',
                    application: plan.application_frequency || 'As required',
                });
            });
        }

        if (plan.organic_treatment?.length) {
            plan.organic_treatment.forEach((name) => {
                medicines.push({
                    name: `${name} (Organic)`,
                    chemical: name,
                    dosage: plan.dosage || 'As directed',
                    application: plan.application_frequency || 'As required',
                });
            });
        }

        return {
            medicines,
            general_advice: plan.precautions || plan.message || '',
        };
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
                <span className="uppercase tracking-wider">{severity} Severity</span>
            </div>
        );
    };

    return (
        <div className={`p-6 md:p-8 space-y-6 max-w-7xl mx-auto ${isEmbedded ? 'bg-transparent pt-0' : ''}`}>
            {!isEmbedded && (
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Dashboard
                </button>
            )}

            {/* ML Service Status Banner */}
            {mlStatus === 'offline' && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm"
                >
                    <WifiOff size={18} className="flex-shrink-0" />
                    <div>
                        <strong>ML Service Offline:</strong> The Python inference server is not running.
                        Start it with: <code className="bg-amber-100 px-1 rounded font-mono text-xs">uvicorn main:app --port 8000</code> from the <code className="bg-amber-100 px-1 rounded font-mono text-xs">plant_disease_ml/</code> directory.
                    </div>
                </motion.div>
            )}

            {!isEmbedded && (
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
                    {mlStatus === 'online' && (
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                            AI Model Online
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Upload Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold mb-4">Upload Leaf Image</h2>

                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                                ${isDragging ? 'border-red-500 bg-red-50 scale-[1.01]' : ''}
                                ${previewUrl ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-red-400 bg-gray-50'}
                            `}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => !previewUrl && fileInputRef.current?.click()}
                        >
                            {previewUrl ? (
                                <div className="space-y-4">
                                    <img
                                        src={previewUrl}
                                        alt="Upload Preview"
                                        className="w-full h-64 object-cover rounded-lg shadow-md"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImage(null);
                                            setPreviewUrl(null);
                                            setResult(null);
                                            setValidationResult(null);
                                        }}
                                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Remove Image
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
                                        <Upload size={28} />
                                    </div>
                                    <div>
                                        <p className="text-red-600 font-semibold">Click to upload</p>
                                        <p className="text-gray-500 text-sm">or drag and drop here</p>
                                        <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP up to 10MB</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />

                        {/* Validation Status */}
                        {validating && (
                            <div className="mt-4 flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg">
                                <Loader2 className="animate-spin" size={16} />
                                <span>Validating image...</span>
                            </div>
                        )}

                        {validationResult && !validating && (
                            <div className={`mt-4 flex items-start gap-2 text-sm px-3 py-2 rounded-lg border ${
                                validationResult.is_valid
                                    ? 'text-green-700 bg-green-50 border-green-200'
                                    : 'text-red-700 bg-red-50 border-red-200'
                            }`}>
                                {validationResult.is_valid ? (
                                    <>
                                        <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
                                        <div>
                                            <strong>✓ Leaf Detected</strong>
                                            <p className="text-xs mt-1 opacity-80">
                                                Confidence: {(validationResult.confidence * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                                        <div>
                                            <strong>✗ Invalid Image</strong>
                                            <p className="text-xs mt-1">{validationResult.message}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <button
                            onClick={handlePredict}
                            disabled={
                                !selectedImage || 
                                loading || 
                                validating || 
                                mlStatus === 'offline' || 
                                (validationResult && !validationResult.is_valid)
                            }
                            className={`
                                w-full mt-6 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                                ${!selectedImage || loading || validating || mlStatus === 'offline' || (validationResult && !validationResult.is_valid)
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
                            ) : validating ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Validating...
                                </>
                            ) : (
                                <>
                                    <Search size={20} />
                                    Run Diagnosis
                                </>
                            )}
                        </button>

                        {mlStatus === 'offline' && (
                            <p className="text-xs text-center text-amber-600 mt-2">
                                Start the Python ML server to enable diagnosis.
                            </p>
                        )}

                        {validationResult && !validationResult.is_valid && (
                            <p className="text-xs text-center text-red-600 mt-2">
                                Upload a plant leaf image to continue
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Column: Results */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-gray-100"
                            >
                                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 relative">
                                    <div className="absolute inset-0 border-4 border-red-100 rounded-full animate-ping" />
                                    <Activity className="text-red-500 animate-pulse" size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Running Deep Learning Model...</h3>
                                <p className="text-gray-500 max-w-md">
                                    Analyzing leaf patterns to detect potential diseases and generate a treatment plan.
                                </p>
                            </motion.div>
                        ) : result ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Diagnosis Header */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                <h2 className="text-3xl font-bold text-gray-900">
                                                    {result.disease_prediction?.disease || 'Analysis Complete'}
                                                </h2>
                                                <StatusBadge severity={result.disease_prediction?.severity_estimation} />
                                            </div>
                                            <p className="text-lg text-gray-600">
                                                Crop: <strong>{result.disease_prediction?.crop}</strong>
                                            </p>
                                        </div>
                                        <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-bold text-gray-700">
                                            {(result.disease_prediction?.confidence * 100).toFixed(1)}% Confidence
                                        </div>
                                    </div>

                                    {result.disease_prediction?.consult_expert_recommended && (
                                        <div className="mt-4 flex items-start gap-2 text-sm text-amber-800 bg-amber-50 px-4 py-3 rounded-lg border border-amber-100">
                                            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                                            <span>
                                                <strong>Expert Consultation Recommended:</strong> The confidence score is below optimal thresholds. Consider bringing a physical sample to a local agricultural expert.
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Visual Explanation + Treatment Plan */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Grad-CAM Heatmap */}
                                    {result.visual_explanation && (
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                                                <Camera className="text-blue-500" size={20} />
                                                <h3 className="font-bold text-gray-900">AI Visual Explanation</h3>
                                            </div>
                                            <div className="relative flex-1 bg-black group">
                                                <img
                                                    src={result.visual_explanation}
                                                    alt="Grad-CAM Heatmap"
                                                    className="w-full h-full object-cover opacity-95"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 transition-opacity duration-300">
                                                    <p className="text-white text-xs px-6 text-center">
                                                        Red/yellow regions show what the AI identified as diseased tissue.
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

                                        {(() => {
                                            const plan = normalizeTreatmentPlan(result.treatment_plan);
                                            return (
                                                <div className="space-y-4 flex-1 overflow-auto">
                                                    {plan.medicines?.length > 0 ? (
                                                        plan.medicines.map((med, idx) => (
                                                            <div key={idx} className="bg-green-50 rounded-xl p-4 border border-green-100">
                                                                <h4 className="font-bold text-green-900 mb-1">{med.name}</h4>
                                                                {med.chemical && med.chemical !== med.name && (
                                                                    <p className="text-sm text-green-800 mb-2">
                                                                        Active Ingredient: <strong>{med.chemical}</strong>
                                                                    </p>
                                                                )}
                                                                <p className="text-sm text-gray-700 bg-white p-2 rounded border border-green-100">
                                                                    <strong>Dosage:</strong> {med.dosage}
                                                                </p>
                                                                {med.application && (
                                                                    <p className="text-sm text-gray-700 mt-2 bg-white p-2 rounded border border-green-100">
                                                                        <strong>Application:</strong> {med.application}
                                                                    </p>
                                                                )}
                                                                <button
                                                                    onClick={() => navigate(`/marketplace?search=${encodeURIComponent(med.name)}`)}
                                                                    className="w-full mt-3 bg-green-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-green-700 transition-colors"
                                                                >
                                                                    Find on Marketplace
                                                                </button>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="flex-1 flex flex-col justify-center text-center p-6 text-gray-500">
                                                            <Leaf size={32} className="mx-auto mb-2 text-gray-300" />
                                                            <p>This plant appears healthy — no treatment required!</p>
                                                        </div>
                                                    )}

                                                    {plan.general_advice && (
                                                        <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-100">
                                                            <strong className="block mb-1 text-gray-900">General Advice:</strong>
                                                            {plan.general_advice}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200"
                            >
                                <Activity className="text-gray-300 mb-4" size={64} />
                                <h3 className="text-lg font-medium text-gray-900">No diagnosis run yet</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mt-2">
                                    Upload a photo of a leaf in the panel to the left to detect diseases and get a treatment plan.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default DiseasePredictionPage;
