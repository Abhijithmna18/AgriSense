/**
 * Bank Integration Page
 * 
 * Features:
 * - Connect bank accounts
 * - View linked banks
 * - Apply for bank loans
 * - Compare interest rates
 * - Track loan applications
 */

import React, { useState } from 'react';
import {
    Building2,
    Plus,
    CheckCircle,
    Clock,
    TrendingDown,
    Shield,
    ExternalLink,
    Search,
    Filter,
    Star,
    ArrowRight,
    CreditCard,
    Percent,
    Calendar,
    AlertCircle,
    Link as LinkIcon,
    Unlink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Sample bank data (replace with API calls)
const BANKS = [
    {
        id: 1,
        name: 'State Bank of India',
        logo: '🏦',
        type: 'Public Sector',
        rating: 4.5,
        loanTypes: ['Kisan Credit Card', 'Agriculture Term Loan', 'Crop Loan'],
        interestRate: '7.0% - 9.0%',
        maxAmount: '₹10,00,000',
        processingTime: '7-10 days',
        features: ['No collateral up to ₹1.6L', 'Flexible repayment', 'Subsidy eligible'],
        website: 'https://sbi.co.in/web/agri-rural/agriculture-banking',
        connected: false
    },
    {
        id: 2,
        name: 'HDFC Bank',
        logo: '🏛️',
        type: 'Private Sector',
        rating: 4.3,
        loanTypes: ['Farm Mechanization Loan', 'Dairy Loan', 'Poultry Loan'],
        interestRate: '8.5% - 10.5%',
        maxAmount: '₹25,00,000',
        processingTime: '5-7 days',
        features: ['Quick approval', 'Digital process', 'Doorstep service'],
        website: 'https://www.hdfcbank.com/personal/borrow/popular-loans/agricultural-loans',
        connected: false
    },
    {
        id: 3,
        name: 'NABARD',
        logo: '🌾',
        type: 'Development Bank',
        rating: 4.7,
        loanTypes: ['Rural Infrastructure', 'Watershed Development', 'Micro Irrigation'],
        interestRate: '4.0% - 6.0%',
        maxAmount: '₹50,00,000',
        processingTime: '15-20 days',
        features: ['Subsidized rates', 'Long tenure', 'Government backed'],
        website: 'https://www.nabard.org/content1.aspx?id=23&catid=8&mid=489',
        connected: false
    },
    {
        id: 4,
        name: 'Punjab National Bank',
        logo: '🏦',
        type: 'Public Sector',
        rating: 4.2,
        loanTypes: ['Kisan Credit Card', 'Tractor Loan', 'Solar Pump Loan'],
        interestRate: '7.5% - 9.5%',
        maxAmount: '₹15,00,000',
        processingTime: '7-14 days',
        features: ['Low interest', 'Easy documentation', 'Branch network'],
        website: 'https://www.pnbindia.in/en/ui/Agricultural-Loans.aspx',
        connected: false
    },
    {
        id: 5,
        name: 'ICICI Bank',
        logo: '🏛️',
        type: 'Private Sector',
        rating: 4.4,
        loanTypes: ['Agri Business Loan', 'Farm Equipment Loan', 'Working Capital'],
        interestRate: '9.0% - 11.0%',
        maxAmount: '₹20,00,000',
        processingTime: '3-5 days',
        features: ['Fast processing', 'Online tracking', 'Flexible EMI'],
        website: 'https://www.icicibank.com/business-banking/agri-business',
        connected: false
    },
    {
        id: 6,
        name: 'Axis Bank',
        logo: '🏦',
        type: 'Private Sector',
        rating: 4.1,
        loanTypes: ['Kisan Credit Card', 'Agri Gold Loan', 'Warehouse Receipt Loan'],
        interestRate: '8.0% - 10.0%',
        maxAmount: '₹12,00,000',
        processingTime: '5-8 days',
        features: ['Gold loan facility', 'Warehouse financing', 'Insurance coverage'],
        website: 'https://www.axisbank.com/retail/loans/agriculture-loan',
        connected: false
    }
];

const BankIntegration = () => {
    const [banks, setBanks] = useState(BANKS);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('rating');
    const [selectedBank, setSelectedBank] = useState(null);

    // Filter and sort banks
    const filteredBanks = banks
        .filter(bank => {
            const matchesSearch = bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                bank.loanTypes.some(type => type.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesFilter = filterType === 'all' || bank.type === filterType;
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            if (sortBy === 'rating') return b.rating - a.rating;
            if (sortBy === 'interest') return parseFloat(a.interestRate) - parseFloat(b.interestRate);
            if (sortBy === 'amount') return parseFloat(b.maxAmount.replace(/[₹,]/g, '')) - parseFloat(a.maxAmount.replace(/[₹,]/g, ''));
            return 0;
        });

    const connectedBanks = banks.filter(b => b.connected);

    const handleConnect = (bankId) => {
        setBanks(banks.map(b => 
            b.id === bankId ? { ...b, connected: true } : b
        ));
        toast.success('Bank connected successfully!');
    };

    const handleDisconnect = (bankId) => {
        setBanks(banks.map(b => 
            b.id === bankId ? { ...b, connected: false } : b
        ));
        toast.success('Bank disconnected');
    };

    const handleApply = (bank) => {
        window.open(bank.website, '_blank');
        toast.success(`Opening ${bank.name} application page...`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black mb-2">Bank Integration</h2>
                        <p className="text-blue-100">Connect your bank accounts and explore loan options</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-blue-100 mb-1">Connected Banks</p>
                        <p className="text-4xl font-black">{connectedBanks.length}</p>
                    </div>
                </div>
            </div>

            {/* Connected Banks */}
            {connectedBanks.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <LinkIcon size={20} className="text-emerald-600" />
                        Your Connected Banks
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {connectedBanks.map(bank => (
                            <motion.div
                                key={bank.id}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{bank.logo}</span>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{bank.name}</h4>
                                            <p className="text-xs text-slate-600">{bank.type}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDisconnect(bank.id)}
                                        className="text-slate-400 hover:text-rose-600 transition-colors"
                                    >
                                        <Unlink size={16} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={14} className="text-emerald-600" />
                                    <span className="text-xs text-emerald-700 font-semibold">Connected & Active</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search banks or loan types..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filter by Type */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option value="all">All Banks</option>
                        <option value="Public Sector">Public Sector</option>
                        <option value="Private Sector">Private Sector</option>
                        <option value="Development Bank">Development Bank</option>
                    </select>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option value="rating">Sort by Rating</option>
                        <option value="interest">Sort by Interest Rate</option>
                        <option value="amount">Sort by Max Amount</option>
                    </select>
                </div>
            </div>

            {/* Bank Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredBanks.map((bank, index) => (
                    <motion.div
                        key={bank.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                        {/* Bank Header */}
                        <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-slate-200">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-5xl">{bank.logo}</span>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{bank.name}</h3>
                                        <p className="text-sm text-slate-600">{bank.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full">
                                    <Star size={14} className="text-amber-500 fill-amber-500" />
                                    <span className="text-sm font-bold text-amber-700">{bank.rating}</span>
                                </div>
                            </div>

                            {/* Key Metrics */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Interest Rate</p>
                                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                                        <Percent size={14} className="text-indigo-600" />
                                        {bank.interestRate}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Max Amount</p>
                                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                                        <CreditCard size={14} className="text-emerald-600" />
                                        {bank.maxAmount}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Processing</p>
                                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                                        <Clock size={14} className="text-blue-600" />
                                        {bank.processingTime}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bank Details */}
                        <div className="p-6">
                            {/* Loan Types */}
                            <div className="mb-4">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Available Loan Types
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {bank.loanTypes.map((type, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full"
                                        >
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Features */}
                            <div className="mb-6">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Key Features
                                </p>
                                <ul className="space-y-2">
                                    {bank.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                            <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                {bank.connected ? (
                                    <>
                                        <button
                                            onClick={() => handleApply(bank)}
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            Apply for Loan
                                            <ExternalLink size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDisconnect(bank.id)}
                                            className="px-4 py-3 border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-semibold rounded-xl transition-colors"
                                        >
                                            <Unlink size={20} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleConnect(bank.id)}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            <LinkIcon size={16} />
                                            Connect Bank
                                        </button>
                                        <button
                                            onClick={() => handleApply(bank)}
                                            className="px-4 py-3 border border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-600 font-semibold rounded-xl transition-colors flex items-center gap-2"
                                        >
                                            Visit Website
                                            <ExternalLink size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* No Results */}
            {filteredBanks.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                    <AlertCircle size={48} className="text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No banks found</h3>
                    <p className="text-slate-600">Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    );
};

export default BankIntegration;
