import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Store, IndianRupee, MapPin, CheckCircle, AlertCircle, Building2, Package, Truck, FileText, Upload, ChevronRight, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/authApi';

const VendorRegister = () => {
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();

    // STRICT STATE MACHINE
    // 'loading' | 'form' | 'pending' | 'rejected' | 'approved'
    const [viewState, setViewState] = useState('loading');
    const [vendorData, setVendorData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Documents
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [docUrl, setDocUrl] = useState('');

    // UI Local States
    const [error, setError] = useState('');
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    const searchParams = new URLSearchParams(window.location.search);
    const isReapplying = searchParams.get('reapply') === 'true';

    // 1. STATE RESOLVER
    const resolveSellerState = async (isBackground = false) => {
        if (!isBackground) setViewState('loading');

        try {
            const response = await api.get('/api/auth/vendor/me');
            const profile = response.data.vendorProfile;

            // Backend returned 200 OK -> Profile exists
            if (profile && profile.status) {
                setVendorData(profile);

                if (profile.status === 'approved') {
                    // Case C: Approved -> Redirect
                    // We handle navigation in useEffect to be safe
                    setViewState('approved');
                    return;
                }

                if (profile.status === 'pending') {
                    // Case B: Pending
                    setViewState('pending');
                    return;
                }

                if (profile.status === 'rejected') {
                    // Case D: Rejected
                    // If user explicitly asked to reapply via URL, show form
                    if (isReapplying) {
                        setViewState('form');
                    } else {
                        setViewState('rejected');
                    }
                    return;
                }
            }

            // Fallback (shouldn't happen if backend 404s correctly for no profile)
            setViewState('form');

        } catch (err) {
            // Case A: 404 Not Found -> Render Form
            if (err.response && err.response.status === 404) {
                setViewState('form');
            } else {
                console.error("Seller State Resolution Error", err);
                // On server error, maybe stay on loading or show error?
                // For safety, let's show form or a generic error?
                // Showing form allows retry.
                setViewState('form');
            }
        } finally {
            setIsCheckingStatus(false);
        }
    };

    // 2. INITIAL MOUNT
    useEffect(() => {
        resolveSellerState();
    }, []);

    // 3. REDIRECT GUARD
    useEffect(() => {
        if (viewState === 'approved') {
            // Sync context before leaving
            refreshProfile().catch(console.error);
            navigate('/vendor-dashboard', { replace: true });
        }
    }, [viewState, navigate, refreshProfile]);

    // 4. ACTION HANDLERS
    const handleCheckStatus = () => {
        setIsCheckingStatus(true);
        resolveSellerState(true);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingDoc(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/api/uploads/document', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setDocUrl(response.data.fileUrl);
        } catch (err) {
            console.error('Upload failed', err);
            alert('Document upload failed. Please try a valid PDF or Image under 10MB.');
        } finally {
            setUploadingDoc(false);
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setError('');
        try {
            const payload = {
                businessName: data.businessName,
                vendorType: data.vendorType,
                yearsOperation: parseInt(data.yearsOperation) || 0,
                productCategories: data.productCategories,
                expectedSellingMethod: data.expectedSellingMethod,
                deliverySupport: data.deliverySupport,
                gstin: data.gstin,
                licenseId: data.licenseId,
                documents: { businessProof: docUrl },
                bankDetails: {
                    bankName: data.bankName,
                    accountNumber: data.accountNumber,
                    ifscCode: data.ifscCode,
                    upiId: data.upiId
                },
                pickupAddress: {
                    addressLine: data.addressLine,
                    city: data.city,
                    state: data.state,
                    pinCode: data.pinCode
                },
                agreementAccepted: data.agreementAccepted
            };

            await api.post('/api/auth/vendor/apply', payload);
            window.scrollTo(0, 0);

            // Force re-resolution to hit 'pending' state
            // We await it to ensure state updates
            await resolveSellerState();

            // Also refresh global context in background
            refreshProfile();

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to submit application.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Form Hook
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            businessName: vendorData?.businessName || '', // Prefill if reapplying?
            vendorType: 'individual',
            yearsOperation: '',
            productCategories: [],
            expectedSellingMethod: 'direct',
            deliverySupport: 'self',
            addressLine: '',
            city: '',
            state: '',
            pinCode: '',
            gstin: '',
            licenseId: '',
            bankName: '',
            accountNumber: '',
            ifscCode: '',
            upiId: '',
            agreementAccepted: false
        }
    });

    // Helper for categories
    const categories = ['Crops', 'Seeds', 'Fertilizers', 'Tools & Equipment', 'Livestock', 'Organic Produce'];
    const selectedCategories = watch('productCategories');
    const handleCategoryChange = (category) => {
        const current = selectedCategories || [];
        if (current.includes(category)) {
            setValue('productCategories', current.filter(c => c !== category));
        } else {
            setValue('productCategories', [...current, category]);
        }
    };

    // --- RENDERERS ---

    // 1. Loading
    if (viewState === 'loading') {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="animate-spin text-green-600" size={32} />
                    <p className="text-gray-500 font-medium">Verifying seller status...</p>
                </div>
            </div>
        );
    }

    // 2. Approved (Should redirect, but just in case)
    if (viewState === 'approved') return null;

    // 3. Pending
    if (viewState === 'pending') {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6 border-t-4 border-yellow-500 animate-slide-up">
                    <div className="mx-auto w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600">
                        <AlertCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Application Pending</h2>
                    <p className="text-slate-600">
                        Your seller application is under review. Our team is verifying your documents. You will be notified once approved.
                    </p>
                    <div className="pt-4 space-y-3">
                        <button onClick={() => navigate('/dashboard')} className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-medium">
                            Go to Dashboard <ChevronRight size={16} />
                        </button>
                        <button
                            onClick={handleCheckStatus}
                            disabled={isCheckingStatus}
                            className="flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-slate-600 underline w-full"
                        >
                            {isCheckingStatus ? (
                                <><RefreshCw className="animate-spin" size={12} /> Checking...</>
                            ) : "Check Status Again"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 4. Rejected
    if (viewState === 'rejected') {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6 border-t-4 border-red-500 animate-slide-up">
                    <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                        <XCircle size={40} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Application Rejected</h2>
                        <p className="text-slate-500 text-sm mt-1">Status: Rejected</p>
                    </div>

                    <div className="bg-red-50 p-4 rounded-xl text-left border border-red-100">
                        <p className="text-xs font-bold text-red-800 uppercase mb-1">Reason for Rejection</p>
                        <p className="text-red-700 text-sm">{vendorData?.approvalRemarks || "Review failed."}</p>
                    </div>

                    <button
                        onClick={() => {
                            window.location.href = '/sell?reapply=true';
                        }}
                        className="w-full py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium shadow-md"
                    >
                        Corrections & Reapply
                    </button>
                </div>
            </div>
        );
    }

    // 5. Form (Default / Fallback / Reapply)
    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-3xl mx-auto space-y-8">

                <div className="text-center space-y-3">
                    <h1 className="text-3xl font-bold text-slate-900">Sell on AgriSense</h1>
                    <p className="text-slate-500">Complete your seller profile to join the marketplace.</p>
                    <div className="text-sm pt-2">
                        Already have an account? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Login here</Link>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                    <div className="bg-slate-900 p-6 rounded-t-2xl text-white flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                            <Store size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">Seller Registration</h2>
                            <p className="text-slate-400 text-sm">Please provide accurate business details.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-10 space-y-10">

                        {error && (
                            <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-100 text-sm">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        {/* 1. Business Details */}
                        <section className="space-y-6">
                            <h3 className="flex items-center gap-2 font-bold text-slate-800 text-lg border-b pb-2">
                                <Building2 className="text-emerald-600" size={20} />
                                Business Details
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Business / Seller Name *</label>
                                    <input {...register('businessName', { required: 'Required' })} className="w-full input-field" placeholder="e.g. Green Farms Ltd" />
                                    {errors.businessName && <span className="text-xs text-red-500">{errors.businessName.message}</span>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Seller Type *</label>
                                    <select {...register('vendorType')} className="w-full input-field bg-white">
                                        <option value="individual">Individual</option>
                                        <option value="company">Company</option>
                                        <option value="cooperative">Cooperative</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Years of Operation</label>
                                    <input type="number" {...register('yearsOperation')} className="w-full input-field" placeholder="e.g. 5" />
                                </div>
                            </div>
                        </section>

                        {/* 2. Product Information */}
                        <section className="space-y-6">
                            <h3 className="flex items-center gap-2 font-bold text-slate-800 text-lg border-b pb-2">
                                <Package className="text-emerald-600" size={20} />
                                Product Information
                            </h3>
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-700">Product Categories</label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => handleCategoryChange(cat)}
                                            className={`px-4 py-2 rounded-full text-sm border transition-all ${selectedCategories?.includes(cat)
                                                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-medium'
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                        >
                                            {selectedCategories?.includes(cat) && <CheckCircle size={14} className="inline mr-1" />}
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Selling Method</label>
                                    <select {...register('expectedSellingMethod')} className="w-full input-field bg-white">
                                        <option value="direct">Direct Sale</option>
                                        <option value="bulk">Bulk / Wholesale</option>
                                        <option value="both">Both</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* 3. Location & Fulfillment */}
                        <section className="space-y-6">
                            <h3 className="flex items-center gap-2 font-bold text-slate-800 text-lg border-b pb-2">
                                <MapPin className="text-emerald-600" size={20} />
                                Location & Fulfillment
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Operating / Pickup Address *</label>
                                    <input {...register('addressLine', { required: 'Required' })} className="w-full input-field" placeholder="Full street address" />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <input {...register('city', { required: true })} className="input-field" placeholder="City" />
                                    <input {...register('state', { required: true })} className="input-field" placeholder="State" />
                                    <input {...register('pinCode', { required: true })} className="input-field" placeholder="Pincode" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Truck size={16} /> Delivery Support
                                    </label>
                                    <div className="flex gap-4">
                                        {['self', 'platform', 'both'].map(opt => (
                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" value={opt} {...register('deliverySupport')} className="text-emerald-600 focus:ring-emerald-500" />
                                                <span className="capitalize text-slate-700">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 4. Compliance & Identity */}
                        <section className="space-y-6">
                            <h3 className="flex items-center gap-2 font-bold text-slate-800 text-lg border-b pb-2">
                                <FileText className="text-emerald-600" size={20} />
                                Compliance & Documents
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">GSTIN / License (Optional)</label>
                                    <input {...register('gstin')} className="w-full input-field" placeholder="e.g. 29AAAAA0000A1Z5" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Supporting Document (PDF/Image)</label>
                                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition cursor-pointer relative">
                                        <input
                                            type="file"
                                            onChange={handleFileUpload}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <div className="space-y-2 pointer-events-none">
                                            {uploadingDoc ? (
                                                <div className="text-emerald-600 font-medium animate-pulse">Uploading...</div>
                                            ) : docUrl ? (
                                                <div className="flex flex-col items-center text-emerald-600">
                                                    <CheckCircle size={24} />
                                                    <span className="text-sm font-medium mt-1">Document Uploaded</span>
                                                    <span className="text-xs text-slate-500 truncate max-w-[200px]">{docUrl.split('/').pop()}</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-slate-400">
                                                    <Upload size={24} />
                                                    <span className="text-sm mt-2">Click to Upload Proof</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 5. Payment & Payout */}
                        <section className="space-y-6">
                            <h3 className="flex items-center gap-2 font-bold text-slate-800 text-lg border-b pb-2">
                                <IndianRupee className="text-emerald-600" size={20} />
                                Payout Details
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Bank Name</label>
                                    <input {...register('bankName', { required: 'Required' })} className="w-full input-field" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Account Number</label>
                                    <input type="password" {...register('accountNumber', { required: 'Required' })} className="w-full input-field" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">IFSC Code</label>
                                    <input {...register('ifscCode', { required: 'Required' })} className="w-full input-field" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">UPI ID</label>
                                    <input {...register('upiId')} className="w-full input-field" placeholder="name@upi" />
                                </div>
                            </div>
                        </section>

                        {/* 6. Agreement */}
                        <div className="pt-4 flex items-start gap-3">
                            <input
                                type="checkbox"
                                {...register('agreementAccepted', { required: 'You must accept the terms' })}
                                className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded border-gray-300"
                            />
                            <p className="text-sm text-slate-600">
                                I agree to the <a href="#" className="text-emerald-600 underline">Marketplace Terms</a>, Pricing Rules, and Compliance Policies. I certify that the information provided is accurate.
                            </p>
                        </div>
                        {errors.agreementAccepted && <p className="text-red-500 text-sm mt-1">{errors.agreementAccepted.message}</p>}

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all ${isSubmitting ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    }`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Vendor Application'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default VendorRegister;
