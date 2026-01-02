import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Check,
    Sprout,
    MapPin,
    Droplets,
    History,
    AlertCircle,
    Save
} from 'lucide-react';
import { farmAPI } from '../services/farmApi';

// Steps Components (will be defined in same file for simplicity or imported)
import StepIdentity from '../components/farms/steps/StepIdentity';
import StepLocation from '../components/farms/steps/StepLocation';
import StepSoil from '../components/farms/steps/StepSoil';
import StepWater from '../components/farms/steps/StepWater';
import StepHistory from '../components/farms/steps/StepHistory';

const AddFarmPage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        // Step 1: Identity
        name: '',
        totalArea: '',
        landholdingType: 'Owner',
        irrigationType: '',

        // Step 2: Location
        location: {
            state: '',
            district: '',
            village: '',
            coordinates: [] // [lng, lat]
        },

        // Step 3: Soil
        soilType: '',
        soilDataSource: 'Unknown',
        soilTest: { n: '', p: '', k: '', ph: '' },

        // Step 4: Water
        waterAvailability: 'Medium',
        waterReliability: 'Stable',
        hasPowerForIrrigation: false,

        // Step 5: History
        cropHistory: []
    });

    const totalSteps = 5;

    // Helper to calculate readiness score for UI preview
    const calculateReadiness = () => {
        let score = 0;
        // Simplified Logic for UI visualization
        if (formData.name && formData.totalArea && formData.irrigationType) score += 20;
        if (formData.location.state && formData.location.district) score += 20;
        if (formData.soilType) score += 10;
        if (formData.soilDataSource === 'Lab Tested') score += 20;
        else if (formData.soilDataSource === 'Estimated') score += 10;
        if (formData.waterAvailability) score += 20;
        if (formData.cropHistory.length > 0) score += 10;
        return Math.min(100, score);
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        window.scrollTo(0, 0);
    };

    const validateStep = (step) => {
        setError(null);
        switch (step) {
            case 1:
                if (!formData.name) return setError('Farm Name is required');
                if (!formData.totalArea || formData.totalArea <= 0) return setError('Valid Total Area is required');
                if (!formData.irrigationType) return setError('Irrigation Type is required');
                return true;
            case 2:
                if (!formData.location.state) return setError('State is required');
                if (!formData.location.district) return setError('District is required');
                // Note: Coordinates validation would normally happen here too
                return true;
            case 3:
                if (!formData.soilType) return setError('Soil Type is required');
                return true;
            case 4:
                return true; // Defaults are set
            default:
                return true;
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return;

        setLoading(true);
        try {
            // Format data for API
            // Format data for API
            const formattedCoordinates = [
                formData.location.coordinates[0] ? Number(formData.location.coordinates[0]) : 0,
                formData.location.coordinates[1] ? Number(formData.location.coordinates[1]) : 0
            ].map(c => isNaN(c) ? 0 : c);

            const payload = {
                ...formData,
                totalArea: Number(formData.totalArea),
                location: {
                    ...formData.location,
                    type: 'Point', // Explicitly set GeoJSON type
                    coordinates: formattedCoordinates
                },
                soilTest: {
                    n: formData.soilTest.n ? Number(formData.soilTest.n) : null,
                    p: formData.soilTest.p ? Number(formData.soilTest.p) : null,
                    k: formData.soilTest.k ? Number(formData.soilTest.k) : null,
                    ph: formData.soilTest.ph ? Number(formData.soilTest.ph) : null,
                }
            };

            await farmAPI.createFarm(payload);
            navigate('/dashboard'); // Or back to farm list
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to create farm');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--admin-bg-primary)] p-4 md:p-8 font-sans">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] mb-4 transition-colors">
                        <ChevronLeft size={20} />
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-serif font-bold text-[var(--admin-text-primary)]">Add New Farm</h1>
                    <p className="text-[var(--admin-text-secondary)] mt-2">
                        Complete your farm profile to get precision AI crop recommendations.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        {['Basic Info', 'Location', 'Soil', 'Water', 'History'].map((label, idx) => (
                            <span
                                key={idx}
                                className={`text-xs font-medium uppercase tracking-wider ${currentStep > idx + 1 ? 'text-[var(--admin-accent)]' : currentStep === idx + 1 ? 'text-[var(--admin-text-primary)]' : 'text-gray-300'}`}
                            >
                                {label}
                            </span>
                        ))}
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[var(--admin-accent)] transition-all duration-500 ease-out"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        />
                    </div>
                    <div className="mt-4 flex justify-end">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold ring-1 ring-blue-100">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            Data Readiness: {calculateReadiness()}%
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-[var(--admin-border)] overflow-hidden">
                    <div className="p-6 md:p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100">
                                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {currentStep === 1 && <StepIdentity data={formData} updateData={setFormData} />}
                                {currentStep === 2 && <StepLocation data={formData} updateData={setFormData} />}
                                {currentStep === 3 && <StepSoil data={formData} updateData={setFormData} />}
                                {currentStep === 4 && <StepWater data={formData} updateData={setFormData} />}
                                {currentStep === 5 && <StepHistory data={formData} updateData={setFormData} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer / Navigation */}
                    <div className="p-6 bg-gray-50 border-t border-[var(--admin-border)] flex justify-between items-center">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className={`px-6 py-2.5 rounded-xl font-medium transition-colors ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-[var(--admin-text-secondary)] hover:bg-gray-200'}`}
                        >
                            Back
                        </button>

                        <button
                            onClick={currentStep === totalSteps ? handleSubmit : handleNext}
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-2.5 bg-[var(--admin-accent)] text-white rounded-xl font-medium hover:bg-[var(--admin-accent-hover)] transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </span>
                            ) : currentStep === totalSteps ? (
                                <>
                                    <Save size={18} />
                                    Submit Farm
                                </>
                            ) : (
                                <>
                                    Next Step
                                    <ChevronRight size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddFarmPage;
