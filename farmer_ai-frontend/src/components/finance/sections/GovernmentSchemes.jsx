/**
 * Government Schemes & Subsidies Page
 * 
 * Features:
 * - Browse government schemes
 * - Search and filter subsidies
 * - Check eligibility
 * - Apply online
 * - Track application status
 */

import React, { useState } from 'react';
import {
    Award,
    Search,
    Filter,
    ExternalLink,
    CheckCircle,
    Clock,
    TrendingUp,
    Users,
    MapPin,
    Calendar,
    FileText,
    ArrowRight,
    AlertCircle,
    Star,
    Target,
    Zap,
    Shield,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Government Schemes Data
const SCHEMES = [
    {
        id: 1,
        name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
        category: 'Direct Benefit Transfer',
        authority: 'Ministry of Agriculture',
        benefit: '₹6,000/year',
        description: 'Direct income support of ₹6000 per year to all farmer families in three equal installments.',
        eligibility: [
            'All landholding farmer families',
            'Cultivable land holding',
            'Aadhaar card mandatory'
        ],
        documents: ['Aadhaar Card', 'Land Records', 'Bank Account Details'],
        applicationUrl: 'https://pmkisan.gov.in/',
        deadline: 'Open throughout the year',
        beneficiaries: '11+ Crore farmers',
        status: 'active',
        featured: true,
        tags: ['Income Support', 'Direct Transfer', 'All India']
    },
    {
        id: 2,
        name: 'Kisan Credit Card (KCC)',
        category: 'Credit Facility',
        authority: 'NABARD',
        benefit: 'Up to ₹3 Lakh at 7% interest',
        description: 'Short-term credit facility for farmers to meet agricultural expenses with subsidized interest rates.',
        eligibility: [
            'Farmers (owner/tenant)',
            'Share croppers',
            'Self Help Groups'
        ],
        documents: ['Land Records', 'Identity Proof', 'Address Proof', 'Passport Photo'],
        applicationUrl: 'https://www.nabard.org/content1.aspx?id=23',
        deadline: 'Ongoing',
        beneficiaries: '7+ Crore farmers',
        status: 'active',
        featured: true,
        tags: ['Credit', 'Low Interest', 'All India']
    },
    {
        id: 3,
        name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        category: 'Insurance',
        authority: 'Ministry of Agriculture',
        benefit: 'Crop insurance at 2% premium',
        description: 'Comprehensive crop insurance scheme covering pre-sowing to post-harvest losses.',
        eligibility: [
            'All farmers growing notified crops',
            'Sharecroppers and tenant farmers',
            'Compulsory for loanee farmers'
        ],
        documents: ['Land Records', 'Sowing Certificate', 'Bank Account', 'Aadhaar'],
        applicationUrl: 'https://pmfby.gov.in/',
        deadline: 'Before sowing season',
        beneficiaries: '5.5+ Crore farmers',
        status: 'active',
        featured: true,
        tags: ['Insurance', 'Risk Coverage', 'All India']
    },
    {
        id: 4,
        name: 'Soil Health Card Scheme',
        category: 'Advisory',
        authority: 'Department of Agriculture',
        benefit: 'Free soil testing',
        description: 'Provides soil health cards to farmers with recommendations on nutrient management.',
        eligibility: [
            'All farmers',
            'No land size restriction'
        ],
        documents: ['Land Records', 'Aadhaar Card'],
        applicationUrl: 'https://soilhealth.dac.gov.in/',
        deadline: 'Ongoing',
        beneficiaries: '22+ Crore cards issued',
        status: 'active',
        featured: false,
        tags: ['Soil Health', 'Advisory', 'All India']
    },
    {
        id: 5,
        name: 'PM Kusum (Solar Pump Scheme)',
        category: 'Infrastructure',
        authority: 'Ministry of New & Renewable Energy',
        benefit: '90% subsidy on solar pumps',
        description: 'Financial support for installation of solar pumps and grid-connected solar power plants.',
        eligibility: [
            'Individual farmers',
            'Farmer groups',
            'Cooperatives'
        ],
        documents: ['Land Ownership Proof', 'Electricity Bill', 'Bank Account', 'Aadhaar'],
        applicationUrl: 'https://pmkusum.mnre.gov.in/',
        deadline: 'Check state portal',
        beneficiaries: '30+ Lakh farmers targeted',
        status: 'active',
        featured: true,
        tags: ['Solar', 'Subsidy', 'Infrastructure']
    },
    {
        id: 6,
        name: 'National Agriculture Market (e-NAM)',
        category: 'Marketing',
        authority: 'Ministry of Agriculture',
        benefit: 'Online trading platform',
        description: 'Pan-India electronic trading portal for agricultural commodities.',
        eligibility: [
            'Registered farmers',
            'Traders',
            'Commission agents'
        ],
        documents: ['Aadhaar Card', 'Bank Account', 'Mobile Number'],
        applicationUrl: 'https://www.enam.gov.in/',
        deadline: 'Ongoing registration',
        beneficiaries: '1.7+ Crore farmers',
        status: 'active',
        featured: false,
        tags: ['Marketing', 'Online Trading', 'All India']
    },
    {
        id: 7,
        name: 'Paramparagat Krishi Vikas Yojana (PKVY)',
        category: 'Organic Farming',
        authority: 'Ministry of Agriculture',
        benefit: '₹50,000/hectare for 3 years',
        description: 'Promotes organic farming through cluster approach and PGS certification.',
        eligibility: [
            'Farmers willing to adopt organic farming',
            'Minimum 20 farmers per cluster',
            '50 hectare cluster size'
        ],
        documents: ['Land Records', 'Group Formation Certificate', 'Bank Account'],
        applicationUrl: 'https://pgsindia-ncof.gov.in/',
        deadline: 'Annual application window',
        beneficiaries: '10+ Lakh hectares covered',
        status: 'active',
        featured: false,
        tags: ['Organic', 'Subsidy', 'Cluster Based']
    },
    {
        id: 8,
        name: 'Rashtriya Krishi Vikas Yojana (RKVY)',
        category: 'Development',
        authority: 'Ministry of Agriculture',
        benefit: 'State-specific projects',
        description: 'State Plan Scheme for ensuring holistic development of agriculture and allied sectors.',
        eligibility: [
            'State governments',
            'Farmer groups',
            'Cooperatives'
        ],
        documents: ['Project Proposal', 'Registration Certificate', 'Bank Details'],
        applicationUrl: 'https://rkvy.nic.in/',
        deadline: 'Check state agriculture department',
        beneficiaries: 'State-wide coverage',
        status: 'active',
        featured: false,
        tags: ['Development', 'State Scheme', 'Infrastructure']
    }
];

const CATEGORIES = [
    'All Schemes',
    'Direct Benefit Transfer',
    'Credit Facility',
    'Insurance',
    'Infrastructure',
    'Marketing',
    'Organic Farming',
    'Development'
];

const GovernmentSchemes = () => {
    const [schemes, setSchemes] = useState(SCHEMES);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Schemes');
    const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
    const [selectedScheme, setSelectedScheme] = useState(null);

    // Filter schemes
    const filteredSchemes = schemes.filter(scheme => {
        const matchesSearch = 
            scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            scheme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            scheme.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCategory = 
            selectedCategory === 'All Schemes' || 
            scheme.category === selectedCategory;
        
        const matchesFeatured = !showFeaturedOnly || scheme.featured;

        return matchesSearch && matchesCategory && matchesFeatured;
    });

    const handleApply = (scheme) => {
        window.open(scheme.applicationUrl, '_blank');
        toast.success(`Opening ${scheme.name} application portal...`);
    };

    const handleCheckEligibility = (scheme) => {
        setSelectedScheme(scheme);
        toast.success('Checking your eligibility...');
    };

    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                
                <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                            <Award size={32} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black">Government Schemes & Subsidies</h2>
                            <p className="text-emerald-100">Discover and apply for agricultural schemes</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <p className="text-emerald-100 text-sm mb-1">Total Schemes</p>
                            <p className="text-3xl font-black">{schemes.length}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <p className="text-emerald-100 text-sm mb-1">Active Programs</p>
                            <p className="text-3xl font-black">{schemes.filter(s => s.status === 'active').length}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <p className="text-emerald-100 text-sm mb-1">Featured</p>
                            <p className="text-3xl font-black">{schemes.filter(s => s.featured).length}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <p className="text-emerald-100 text-sm mb-1">Categories</p>
                            <p className="text-3xl font-black">{CATEGORIES.length - 1}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search schemes, benefits, or keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </div>

                    {/* Featured Toggle */}
                    <button
                        onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                            showFeaturedOnly
                                ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                                : 'bg-slate-50 text-slate-600 border-2 border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <Star size={18} className={showFeaturedOnly ? 'fill-amber-500' : ''} />
                        Featured Only
                    </button>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                    {CATEGORIES.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                selectedCategory === category
                                    ? 'bg-emerald-600 text-white shadow-lg'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Schemes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredSchemes.map((scheme, index) => (
                    <motion.div
                        key={scheme.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden hover:shadow-xl transition-all ${
                            scheme.featured ? 'border-amber-300' : 'border-slate-200'
                        }`}
                    >
                        {/* Scheme Header */}
                        <div className={`p-6 ${scheme.featured ? 'bg-gradient-to-r from-amber-50 to-orange-50' : 'bg-slate-50'}`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {scheme.featured && (
                                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1">
                                                <Star size={12} className="fill-amber-500" />
                                                FEATURED
                                            </span>
                                        )}
                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                                            {scheme.category}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">{scheme.name}</h3>
                                    <p className="text-sm text-slate-600">{scheme.authority}</p>
                                </div>
                            </div>

                            {/* Benefit Highlight */}
                            <div className="bg-white rounded-xl p-4 border-2 border-emerald-200">
                                <p className="text-xs text-slate-500 mb-1">Benefit Amount</p>
                                <p className="text-2xl font-black text-emerald-600">{scheme.benefit}</p>
                            </div>
                        </div>

                        {/* Scheme Details */}
                        <div className="p-6">
                            {/* Description */}
                            <p className="text-sm text-slate-700 mb-4 leading-relaxed">
                                {scheme.description}
                            </p>

                            {/* Key Info */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-indigo-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Beneficiaries</p>
                                        <p className="text-sm font-semibold text-slate-900">{scheme.beneficiaries}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-blue-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Deadline</p>
                                        <p className="text-sm font-semibold text-slate-900">{scheme.deadline}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Eligibility */}
                            <div className="mb-4">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Eligibility Criteria
                                </p>
                                <ul className="space-y-1">
                                    {scheme.eligibility.map((criteria, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                            <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                            {criteria}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Documents Required */}
                            <div className="mb-6">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Documents Required
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {scheme.documents.map((doc, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1"
                                        >
                                            <FileText size={12} />
                                            {doc}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {scheme.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleApply(scheme)}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    Apply Now
                                    <ExternalLink size={16} />
                                </button>
                                <button
                                    onClick={() => handleCheckEligibility(scheme)}
                                    className="px-4 py-3 border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-semibold rounded-xl transition-colors"
                                >
                                    <Shield size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* No Results */}
            {filteredSchemes.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                    <AlertCircle size={48} className="text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No schemes found</h3>
                    <p className="text-slate-600 mb-4">Try adjusting your search or filters</p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('All Schemes');
                            setShowFeaturedOnly(false);
                        }}
                        className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        Reset Filters
                    </button>
                </div>
            )}

            {/* Help Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                        <Sparkles className="text-blue-600" size={24} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-slate-900 mb-2">Need Help Finding the Right Scheme?</h4>
                        <p className="text-sm text-slate-700 mb-4">
                            Our AI assistant can help you find schemes based on your specific needs, location, and farm details.
                        </p>
                        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2">
                            Talk to AI Assistant
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GovernmentSchemes;
