import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    MessageSquare,
    FileText,
    Download,
    Send,
    Edit3,
    Package,
    Truck,
    Shield,
    DollarSign,
    Calendar,
    Hash,
    User,
    Building,
    Paperclip
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { negotiationAPI } from '../services/negotiationApi';
import OfferCard from '../components/negotiation/OfferCard';
import OfferFormModal from '../components/negotiation/OfferFormModal';
import MessageFormModal from '../components/negotiation/MessageFormModal';
import toast from 'react-hot-toast';

const NegotiationPage = () => {
    const { negotiationId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // State Management
    const [negotiation, setNegotiation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showOfferForm, setShowOfferForm] = useState(false);
    const [showMessageForm, setShowMessageForm] = useState(null);

    // Form States
    const [offerForm, setOfferForm] = useState({
        price: '',
        quantity: '',
        deliveryDate: '',
        qualityRequirements: '',
        packaging: '',
        customization: '',
        message: ''
    });

    const [messageForm, setMessageForm] = useState({
        message: '',
        attachments: []
    });

    // Load negotiation data
    useEffect(() => {
        loadNegotiation();
    }, [negotiationId]);

    const loadNegotiation = async () => {
        try {
            setLoading(true);
            const data = await negotiationAPI.getNegotiation(negotiationId);
            setNegotiation(data);

            // Initialize form with latest offer or baseline
            const latestOffer = data.offers?.[0] || data.baseline;
            setOfferForm({
                price: latestOffer.price || '',
                quantity: latestOffer.quantity || '',
                deliveryDate: latestOffer.deliveryDate || '',
                qualityRequirements: latestOffer.qualityRequirements || '',
                packaging: latestOffer.packaging || '',
                customization: latestOffer.customization || '',
                message: ''
            });
        } catch (error) {
            console.error('Failed to load negotiation:', error);
            toast.error('Failed to load negotiation details');
            navigate('/buyer-dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitOffer = async (e) => {
        e.preventDefault();
        if (submitting) return;

        try {
            setSubmitting(true);

            // Validate offer against business rules
            const validation = validateOffer(offerForm);
            if (!validation.valid) {
                toast.error(validation.message);
                return;
            }

            await negotiationAPI.submitOffer(negotiationId, {
                ...offerForm,
                type: 'buyer_offer',
                timestamp: new Date().toISOString()
            });

            toast.success('Offer submitted successfully');
            setShowOfferForm(false);
            loadNegotiation(); // Refresh data
        } catch (error) {
            console.error('Failed to submit offer:', error);
            toast.error('Failed to submit offer');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAcceptOffer = async (offerId) => {
        if (submitting) return;

        try {
            setSubmitting(true);
            await negotiationAPI.acceptOffer(negotiationId, offerId);
            toast.success('Offer accepted! Redirecting to checkout...');

            // Redirect to checkout with locked terms
            setTimeout(() => {
                navigate('/marketplace/checkout', {
                    state: {
                        negotiationId,
                        offerId,
                        lockedTerms: true
                    }
                });
            }, 1500);
        } catch (error) {
            console.error('Failed to accept offer:', error);
            toast.error('Failed to accept offer');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRejectOffer = async (offerId, reason) => {
        if (submitting) return;

        try {
            setSubmitting(true);
            await negotiationAPI.rejectOffer(negotiationId, offerId, reason);
            toast.success('Offer rejected');
            loadNegotiation();
        } catch (error) {
            console.error('Failed to reject offer:', error);
            toast.error('Failed to reject offer');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddMessage = async (offerId) => {
        if (submitting || !messageForm.message.trim()) return;

        try {
            setSubmitting(true);
            await negotiationAPI.addMessage(negotiationId, offerId, {
                message: messageForm.message,
                attachments: messageForm.attachments,
                timestamp: new Date().toISOString()
            });

            toast.success('Message added');
            setMessageForm({ message: '', attachments: [] });
            setShowMessageForm(null);
            loadNegotiation();
        } catch (error) {
            console.error('Failed to add message:', error);
            toast.error('Failed to add message');
        } finally {
            setSubmitting(false);
        }
    };

    const validateOffer = (offer) => {
        const baseline = negotiation.baseline;
        const priceChange = ((offer.price - baseline.price) / baseline.price) * 100;

        // Configurable thresholds
        const MAX_PRICE_REDUCTION = -50; // 50% max reduction
        const MAX_QUANTITY_INCREASE = 500; // 500% max increase

        if (priceChange < MAX_PRICE_REDUCTION) {
            return {
                valid: false,
                message: `Price reduction cannot exceed ${Math.abs(MAX_PRICE_REDUCTION)}%`
            };
        }

        if (offer.quantity > baseline.quantity * (MAX_QUANTITY_INCREASE / 100 + 1)) {
            return {
                valid: false,
                message: `Quantity increase cannot exceed ${MAX_QUANTITY_INCREASE}%`
            };
        }

        return { valid: true };
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="text-yellow-500" size={16} />;
            case 'accepted': return <CheckCircle className="text-green-500" size={16} />;
            case 'rejected': return <XCircle className="text-red-500" size={16} />;
            case 'expired': return <AlertTriangle className="text-gray-500" size={16} />;
            default: return <Clock className="text-yellow-500" size={16} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading negotiation...</p>
                </div>
            </div>
        );
    }

    if (!negotiation) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Negotiation Not Found</h2>
                    <p className="text-gray-600 mb-4">The negotiation you're looking for doesn't exist or has been removed.</p>
                    <button
                        onClick={() => navigate('/buyer-dashboard')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/buyer-dashboard')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    Negotiation #{negotiation._id}
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {negotiation.product.name} • {negotiation.vendor.name}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(negotiation.status)}`}>
                                {getStatusIcon(negotiation.status)}
                                <span className="ml-1 capitalize">{negotiation.status}</span>
                            </span>

                            {negotiation.status === 'accepted' && (
                                <button
                                    onClick={() => negotiationAPI.downloadAgreement(negotiationId)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Download size={16} />
                                    Download Agreement
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel - Product & Baseline Terms */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                            {/* Product Header */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-start gap-4">
                                    <img
                                        src={negotiation.product.image || '/api/placeholder/80/80'}
                                        alt={negotiation.product.name}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{negotiation.product.name}</h3>
                                        <p className="text-sm text-gray-600">SKU: {negotiation.product.sku}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Building size={14} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">{negotiation.vendor.name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Baseline Terms */}
                            <div className="p-6">
                                <h4 className="font-semibold text-gray-900 mb-4">Baseline Terms</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={16} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">Price</span>
                                        </div>
                                        <span className="font-medium">${negotiation.baseline.price}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Hash size={16} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">MOQ</span>
                                        </div>
                                        <span className="font-medium">{negotiation.baseline.moq} units</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Truck size={16} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">Delivery</span>
                                        </div>
                                        <span className="font-medium">{negotiation.baseline.deliveryDays} days</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Shield size={16} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">Quality</span>
                                        </div>
                                        <span className="font-medium">{negotiation.baseline.qualityGrade}</span>
                                    </div>
                                </div>

                                {/* Payment Terms */}
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <h5 className="font-medium text-gray-900 mb-2">Payment Terms</h5>
                                    <p className="text-sm text-gray-600">{negotiation.baseline.paymentTerms}</p>
                                </div>

                                {/* Incoterms */}
                                {negotiation.baseline.incoterms && (
                                    <div className="mt-4">
                                        <h5 className="font-medium text-gray-900 mb-2">Incoterms</h5>
                                        <p className="text-sm text-gray-600">{negotiation.baseline.incoterms}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Negotiation Workspace */}
                    <div className="lg:col-span-2">
                        <div className="space-y-6">
                            {/* Action Bar */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Negotiation Workspace</h2>
                                        <p className="text-sm text-gray-600">
                                            Round {negotiation.currentRound} of {negotiation.maxRounds} •
                                            Expires in {negotiation.timeRemaining}
                                        </p>
                                    </div>

                                    {negotiation.status === 'pending' && (
                                        <button
                                            onClick={() => setShowOfferForm(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Edit3 size={16} />
                                            Make Offer
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Offers Timeline */}
                            <div className="space-y-4">
                                {negotiation.offers?.map((offer, index) => (
                                    <OfferCard
                                        key={offer._id}
                                        offer={offer}
                                        isLatest={index === 0}
                                        baseline={negotiation.baseline}
                                        onAccept={() => handleAcceptOffer(offer._id)}
                                        onReject={(reason) => handleRejectOffer(offer._id, reason)}
                                        onAddMessage={() => setShowMessageForm(offer._id)}
                                        canInteract={negotiation.status === 'pending' && offer.status === 'pending'}
                                        submitting={submitting}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Offer Form Modal */}
            <AnimatePresence>
                {showOfferForm && (
                    <OfferFormModal
                        form={offerForm}
                        setForm={setOfferForm}
                        baseline={negotiation.baseline}
                        onSubmit={handleSubmitOffer}
                        onClose={() => setShowOfferForm(false)}
                        submitting={submitting}
                    />
                )}
            </AnimatePresence>

            {/* Message Form Modal */}
            <AnimatePresence>
                {showMessageForm && (
                    <MessageFormModal
                        form={messageForm}
                        setForm={setMessageForm}
                        onSubmit={() => handleAddMessage(showMessageForm)}
                        onClose={() => setShowMessageForm(null)}
                        submitting={submitting}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default NegotiationPage;