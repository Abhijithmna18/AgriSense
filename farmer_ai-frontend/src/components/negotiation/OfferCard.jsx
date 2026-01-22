import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    User, 
    Building, 
    Clock, 
    CheckCircle, 
    XCircle, 
    MessageSquare,
    TrendingUp,
    TrendingDown,
    Minus,
    Calendar,
    Package,
    Shield,
    DollarSign,
    Hash,
    Truck,
    AlertTriangle
} from 'lucide-react';

const OfferCard = ({ 
    offer, 
    isLatest, 
    baseline, 
    onAccept, 
    onReject, 
    onAddMessage, 
    canInteract, 
    submitting 
}) => {
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const getOfferTypeInfo = (type) => {
        switch (type) {
            case 'buyer_offer':
                return {
                    icon: <User size={16} />,
                    label: 'Buyer Offer',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    textColor: 'text-blue-800'
                };
            case 'vendor_counteroffer':
                return {
                    icon: <Building size={16} />,
                    label: 'Vendor Counter',
                    bgColor: 'bg-purple-50',
                    borderColor: 'border-purple-200',
                    textColor: 'text-purple-800'
                };
            default:
                return {
                    icon: <User size={16} />,
                    label: 'Offer',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    textColor: 'text-gray-800'
                };
        }
    };

    const calculateChange = (current, baseline) => {
        if (!baseline || baseline === 0) return { percentage: 0, direction: 'same' };
        
        const change = ((current - baseline) / baseline) * 100;
        return {
            percentage: Math.abs(change).toFixed(1),
            direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same'
        };
    };

    const getChangeIcon = (direction) => {
        switch (direction) {
            case 'up': return <TrendingUp size={14} className="text-red-500" />;
            case 'down': return <TrendingDown size={14} className="text-green-500" />;
            default: return <Minus size={14} className="text-gray-500" />;
        }
    };

    const getChangeColor = (direction) => {
        switch (direction) {
            case 'up': return 'text-red-600';
            case 'down': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    const handleReject = () => {
        if (!rejectReason.trim()) return;
        onReject(rejectReason);
        setShowRejectForm(false);
        setRejectReason('');
    };

    const typeInfo = getOfferTypeInfo(offer.type);
    const priceChange = calculateChange(offer.price, baseline.price);
    const quantityChange = calculateChange(offer.quantity, baseline.quantity);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden ${
                isLatest ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'
            }`}
        >
            {/* Offer Header */}
            <div className={`px-6 py-4 ${typeInfo.bgColor} ${typeInfo.borderColor} border-b`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-white ${typeInfo.textColor}`}>
                            {typeInfo.icon}
                        </div>
                        <div>
                            <h3 className={`font-semibold ${typeInfo.textColor}`}>
                                {typeInfo.label}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {new Date(offer.timestamp).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {offer.status === 'pending' && <Clock className="text-yellow-500" size={16} />}
                        {offer.status === 'accepted' && <CheckCircle className="text-green-500" size={16} />}
                        {offer.status === 'rejected' && <XCircle className="text-red-500" size={16} />}
                        {offer.status === 'expired' && <AlertTriangle className="text-gray-500" size={16} />}
                        
                        <span className={`text-sm font-medium capitalize ${
                            offer.status === 'pending' ? 'text-yellow-700' :
                            offer.status === 'accepted' ? 'text-green-700' :
                            offer.status === 'rejected' ? 'text-red-700' :
                            'text-gray-700'
                        }`}>
                            {offer.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Offer Details */}
            <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    {/* Price */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign size={14} />
                            <span>Price</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                                ${offer.price}
                            </span>
                            {priceChange.direction !== 'same' && (
                                <div className={`flex items-center gap-1 text-xs ${getChangeColor(priceChange.direction)}`}>
                                    {getChangeIcon(priceChange.direction)}
                                    <span>{priceChange.percentage}%</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Hash size={14} />
                            <span>Quantity</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                                {offer.quantity}
                            </span>
                            {quantityChange.direction !== 'same' && (
                                <div className={`flex items-center gap-1 text-xs ${getChangeColor(quantityChange.direction)}`}>
                                    {getChangeIcon(quantityChange.direction)}
                                    <span>{quantityChange.percentage}%</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Delivery Date */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} />
                            <span>Delivery</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                            {new Date(offer.deliveryDate).toLocaleDateString()}
                        </span>
                    </div>

                    {/* Quality */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Shield size={14} />
                            <span>Quality</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                            {offer.qualityRequirements || baseline.qualityGrade}
                        </span>
                    </div>
                </div>

                {/* Additional Terms */}
                {(offer.packaging || offer.customization) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {offer.packaging && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Package size={14} />
                                    <span>Packaging</span>
                                </div>
                                <p className="text-sm text-gray-900">{offer.packaging}</p>
                            </div>
                        )}
                        
                        {offer.customization && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Truck size={14} />
                                    <span>Customization</span>
                                </div>
                                <p className="text-sm text-gray-900">{offer.customization}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Offer Message */}
                {offer.message && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-2">
                            <MessageSquare size={16} className="text-gray-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-gray-700">{offer.message}</p>
                        </div>
                    </div>
                )}

                {/* Messages Thread */}
                {offer.messages && offer.messages.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Messages</h4>
                        <div className="space-y-3 max-h-40 overflow-y-auto">
                            {offer.messages.map((message, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                        <User size={14} className="text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-gray-900">
                                                {message.sender}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(message.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700">{message.message}</p>
                                        {message.attachments && message.attachments.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {message.attachments.map((attachment, i) => (
                                                    <a
                                                        key={i}
                                                        href={attachment.url}
                                                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {attachment.name}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {canInteract && offer.type === 'vendor_counteroffer' && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onAccept}
                            disabled={submitting}
                            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {submitting ? 'Processing...' : 'Accept Offer'}
                        </button>
                        
                        <button
                            onClick={() => setShowRejectForm(true)}
                            disabled={submitting}
                            className="px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Reject
                        </button>
                        
                        <button
                            onClick={onAddMessage}
                            disabled={submitting}
                            className="px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <MessageSquare size={16} />
                        </button>
                    </div>
                )}

                {/* Add Message Button for Buyer Offers */}
                {canInteract && offer.type === 'buyer_offer' && (
                    <button
                        onClick={onAddMessage}
                        disabled={submitting}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        <MessageSquare size={16} />
                        Add Clarification
                    </button>
                )}
            </div>

            {/* Reject Form */}
            {showRejectForm && (
                <div className="border-t border-gray-200 p-6 bg-red-50">
                    <h4 className="font-medium text-red-900 mb-3">Reason for Rejection</h4>
                    <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Please provide a reason for rejecting this offer..."
                        className="w-full p-3 border border-red-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        rows={3}
                    />
                    <div className="flex items-center gap-3 mt-4">
                        <button
                            onClick={handleReject}
                            disabled={!rejectReason.trim() || submitting}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Confirm Rejection
                        </button>
                        <button
                            onClick={() => {
                                setShowRejectForm(false);
                                setRejectReason('');
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default OfferCard;