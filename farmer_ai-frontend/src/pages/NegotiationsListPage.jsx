import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    MessageSquare,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Search,
    Filter,
    Download,
    Eye,
    Building,
    DollarSign,
    Calendar,
    TrendingUp,
    TrendingDown,
    User,
    Package,
    IndianRupee
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { negotiationAPI } from '../services/negotiationApi';
import toast from 'react-hot-toast';

const NegotiationsListPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [negotiations, setNegotiations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('recent');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadNegotiations();
    }, [statusFilter, sortBy, currentPage]);

    const loadNegotiations = async () => {
        try {
            setLoading(true);
            const status = statusFilter === 'all' ? null : statusFilter;
            const data = await negotiationAPI.getBuyerNegotiations(status, currentPage, 20);

            let sortedNegotiations = data.negotiations || [];

            // Apply sorting
            switch (sortBy) {
                case 'recent':
                    sortedNegotiations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    break;
                case 'oldest':
                    sortedNegotiations.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
                    break;
                case 'expiring':
                    sortedNegotiations.sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));
                    break;
                case 'value':
                    sortedNegotiations.sort((a, b) => {
                        const aValue = (a.offers?.[0]?.price || a.baseline?.price || 0) * (a.offers?.[0]?.quantity || a.baseline?.quantity || 0);
                        const bValue = (b.offers?.[0]?.price || b.baseline?.price || 0) * (b.offers?.[0]?.quantity || b.baseline?.quantity || 0);
                        return bValue - aValue;
                    });
                    break;
            }

            setNegotiations(sortedNegotiations);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Failed to load negotiations:', error);
            // Don't show error toast for 404 - just means no negotiations exist yet
            if (error.response?.status !== 404) {
                toast.error('Failed to load negotiations');
            }
            setNegotiations([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const filteredNegotiations = negotiations.filter(negotiation =>
        (negotiation.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (negotiation.vendor?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            isGood: change < 0
        };
    };

    const getTimeRemaining = (expiresAt) => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry - now;

        if (diff <= 0) return { text: 'Expired', urgent: true };

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) {
            return {
                text: `${days}d ${hours}h`,
                urgent: days <= 1
            };
        }
        return {
            text: `${hours}h`,
            urgent: hours <= 24
        };
    };

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'pending', label: 'Active' },
        { value: 'accepted', label: 'Accepted' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'expired', label: 'Expired' }
    ];

    const sortOptions = [
        { value: 'recent', label: 'Most Recent' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'expiring', label: 'Expiring Soon' },
        { value: 'value', label: 'Highest Value' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-16 bg-gray-200 rounded"></div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
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
                                <h1 className="text-xl font-bold text-gray-900">Negotiations</h1>
                                <p className="text-sm text-gray-600">
                                    Manage your price negotiations and deals
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">
                                {filteredNegotiations.length} negotiations
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters & Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by product or vendor name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Negotiations List */}
                <div className="space-y-4">
                    {filteredNegotiations.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Negotiations Found</h3>
                            <p className="text-gray-600 mb-6">
                                {searchTerm ?
                                    `No negotiations match "${searchTerm}"` :
                                    statusFilter === 'all' ?
                                        "You haven't started any negotiations yet." :
                                        `No ${statusFilter} negotiations found.`
                                }
                            </p>
                            <button
                                onClick={() => navigate('/marketplace')}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Browse Products
                            </button>
                        </div>
                    ) : (
                        filteredNegotiations.map((negotiation) => {
                            const latestOffer = negotiation.offers?.[0];
                            const priceChange = latestOffer ? getPriceChange(latestOffer.price, negotiation.baseline?.price) : null;
                            const timeRemaining = getTimeRemaining(negotiation.expiresAt);
                            const totalValue = (latestOffer?.price || negotiation.baseline?.price || 0) * (latestOffer?.quantity || negotiation.baseline?.quantity || 0);

                            return (
                                <motion.div
                                    key={negotiation.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start gap-6">
                                            {/* Product Image */}
                                            <img
                                                src={negotiation.product?.image ? `http://localhost:5002/${negotiation.product.image}` : 'https://placehold.co/80x80?text=No+Image'}
                                                alt={negotiation.product?.name || 'Product'}
                                                className="w-16 h-16 rounded-lg object-cover shrink-0"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://placehold.co/80x80?text=No+Image';
                                                }}
                                            />

                                            {/* Main Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                            {negotiation.product?.name || 'Unknown Product'}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                            <Building size={14} />
                                                            <span>{negotiation.vendor?.name || 'Unknown Vendor'}</span>
                                                            <span>•</span>
                                                            <span>SKU: {negotiation.product?.sku || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                                            <span>Started {new Date(negotiation.createdAt).toLocaleDateString()}</span>
                                                            <span>•</span>
                                                            <span>Round {negotiation.currentRound}/{negotiation.maxRounds}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(negotiation.status)}`}>
                                                            {getStatusIcon(negotiation.status)}
                                                            <span className="ml-1 capitalize">{negotiation.status}</span>
                                                        </span>

                                                        {negotiation.status === 'accepted' && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    negotiationAPI.downloadAgreement(negotiation.id);
                                                                }}
                                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                                title="Download Agreement"
                                                            >
                                                                <Download size={16} className="text-gray-600" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Negotiation Metrics */}
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-4">
                                                    {/* Current Price */}
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <IndianRupee size={14} className="text-gray-400" />
                                                            <span className="text-xs text-gray-500">Current Price</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg font-bold text-gray-900">
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
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Package size={14} className="text-gray-400" />
                                                            <span className="text-xs text-gray-500">Quantity</span>
                                                        </div>
                                                        <span className="text-lg font-bold text-gray-900">
                                                            {latestOffer?.quantity || negotiation.baseline?.quantity || 0}
                                                        </span>
                                                    </div>

                                                    {/* Total Value */}
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <IndianRupee size={14} className="text-gray-400" />
                                                            <span className="text-xs text-gray-500">Total Value</span>
                                                        </div>
                                                        <span className="text-lg font-bold text-gray-900">
                                                            ₹{totalValue.toLocaleString()}
                                                        </span>
                                                    </div>

                                                    {/* Delivery Date */}
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Calendar size={14} className="text-gray-400" />
                                                            <span className="text-xs text-gray-500">Delivery</span>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {latestOffer?.deliveryDate ?
                                                                new Date(latestOffer.deliveryDate).toLocaleDateString() :
                                                                `${negotiation.baseline?.deliveryDays || 0} days`
                                                            }
                                                        </span>
                                                    </div>

                                                    {/* Time Remaining */}
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Clock size={14} className="text-gray-400" />
                                                            <span className="text-xs text-gray-500">Expires</span>
                                                        </div>
                                                        <span className={`text-sm font-medium ${timeRemaining.urgent ? 'text-red-600' : 'text-gray-900'
                                                            }`}>
                                                            {timeRemaining.text}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Latest Activity */}
                                                {latestOffer && (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <User size={14} />
                                                            <span>
                                                                Latest {latestOffer.type === 'buyer_offer' ? 'offer' : 'counter'} •
                                                                {new Date(latestOffer.timestamp).toLocaleDateString()}
                                                            </span>
                                                            {latestOffer.message && (
                                                                <>
                                                                    <span>•</span>
                                                                    <MessageSquare size={14} />
                                                                    <span>Message attached</span>
                                                                </>
                                                            )}
                                                        </div>

                                                        <button
                                                            onClick={() => navigate(`/negotiations/${negotiation.id}`)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                        >
                                                            <Eye size={14} />
                                                            View Details
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-2 rounded-lg transition-colors ${currentPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NegotiationsListPage;