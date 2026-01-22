import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MessageSquare,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ArrowRight,
    User,
    Building,
    DollarSign,
    Calendar,
    TrendingUp,
    TrendingDown,
    Eye,
    IndianRupee
} from 'lucide-react';
import { negotiationAPI } from '../../../services/negotiationApi';
import toast from 'react-hot-toast';

const ActiveNegotiations = () => {
    const navigate = useNavigate();
    const [negotiations, setNegotiations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadNegotiations();
    }, [filter]);

    const loadNegotiations = async () => {
        try {
            setLoading(true);
            const status = filter === 'all' ? null : filter;
            const data = await negotiationAPI.getBuyerNegotiations(status, 1, 10);
            setNegotiations(data.negotiations || []);
        } catch (error) {
            console.error('Failed to load negotiations:', error);
            // Don't show error toast for 404 - just means no negotiations exist yet
            if (error.response?.status !== 404) {
                toast.error('Failed to load negotiations');
            }
            setNegotiations([]);
        } finally {
            setLoading(false);
        }
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

    const getPriceChange = (currentPrice, baselinePrice) => {
        if (!baselinePrice || baselinePrice === 0) return null;
        const change = ((currentPrice - baselinePrice) / baselinePrice) * 100;
        return {
            percentage: Math.abs(change).toFixed(1),
            direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
            isGood: change < 0 // Price reduction is good for buyer
        };
    };

    const getTimeRemaining = (expiresAt) => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry - now;

        if (diff <= 0) return 'Expired';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    };

    const filterOptions = [
        { value: 'all', label: 'All Negotiations', count: negotiations.length },
        { value: 'pending', label: 'Active', count: negotiations.filter(n => n.status === 'pending').length },
        { value: 'accepted', label: 'Accepted', count: negotiations.filter(n => n.status === 'accepted').length },
        { value: 'rejected', label: 'Rejected', count: negotiations.filter(n => n.status === 'rejected').length }
    ];

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <MessageSquare className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Active Negotiations</h3>
                            <p className="text-sm text-gray-600">Manage your ongoing price negotiations</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/negotiations')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        View All
                        <ArrowRight size={14} />
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {filterOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setFilter(option.value)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === option.value
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {option.label}
                            <span className={`px-2 py-0.5 rounded-full text-xs ${filter === option.value
                                ? 'bg-blue-200 text-blue-800'
                                : 'bg-gray-200 text-gray-700'
                                }`}>
                                {option.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Negotiations List */}
            <div className="divide-y divide-gray-200">
                {negotiations.length === 0 ? (
                    <div className="p-8 text-center">
                        <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No Negotiations Found</h4>
                        <p className="text-gray-600 mb-4">
                            {filter === 'all'
                                ? "You haven't started any negotiations yet."
                                : `No ${filter} negotiations found.`
                            }
                        </p>
                        <button
                            onClick={() => navigate('/marketplace')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    negotiations.map((negotiation, index) => {
                        const latestOffer = negotiation.offers?.[0];
                        const priceChange = latestOffer ? getPriceChange(latestOffer.price, negotiation.baseline?.price) : null;

                        return (
                            <motion.div
                                key={negotiation.id || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => navigate(`/negotiations/${negotiation.id}`)}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Product Image */}
                                    <img
                                        src={negotiation.product?.image ? `http://localhost:5002/${negotiation.product.image}` : 'https://placehold.co/60x60?text=No+Image'}
                                        alt={negotiation.product?.name || 'Product'}
                                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://placehold.co/60x60?text=No+Image';
                                        }}
                                    />

                                    {/* Main Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 truncate">
                                                    {negotiation.product?.name || 'Unknown Product'}
                                                </h4>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Building size={14} />
                                                    <span>{negotiation.vendor?.name || 'Unknown Vendor'}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(negotiation.status)}`}>
                                                    {getStatusIcon(negotiation.status)}
                                                    <span className="ml-1 capitalize">{negotiation.status}</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Negotiation Details */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                            {/* Current Price */}
                                            <div className="flex items-center gap-2">
                                                <IndianRupee size={14} className="text-gray-400" />
                                                <div>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        ₹{latestOffer?.price || negotiation.baseline?.price || 0}
                                                    </span>
                                                    {priceChange && priceChange.direction !== 'same' && (
                                                        <div className={`flex items-center gap-1 text-xs ${priceChange.isGood ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                            {priceChange.direction === 'down' ?
                                                                <TrendingDown size={12} /> :
                                                                <TrendingUp size={12} />
                                                            }
                                                            <span>{priceChange.percentage}%</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Quantity */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">Qty:</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {latestOffer?.quantity || negotiation.baseline?.quantity || 0}
                                                </span>
                                            </div>

                                            {/* Round */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">Round:</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {negotiation.currentRound}/{negotiation.maxRounds}
                                                </span>
                                            </div>

                                            {/* Time Remaining */}
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-gray-400" />
                                                <span className={`text-sm font-medium ${negotiation.status === 'pending' ? 'text-yellow-600' : 'text-gray-600'
                                                    }`}>
                                                    {getTimeRemaining(negotiation.expiresAt)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Latest Activity */}
                                        {latestOffer && (
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <User size={12} />
                                                <span>
                                                    Latest {latestOffer.type === 'buyer_offer' ? 'offer' : 'counter'} •
                                                    {new Date(latestOffer.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <div className="shrink-0">
                                        <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors group">
                                            <Eye size={16} className="text-gray-400 group-hover:text-blue-600" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ActiveNegotiations;