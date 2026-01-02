import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MapPin,
    Sprout,
    Droplets,
    AlertCircle,
    Plus,
    ArrowRight,
    ChevronRight,
    Loader
} from 'lucide-react';
import { farmAPI } from '../../services/farmApi';

const FarmManagementCard = () => {
    const navigate = useNavigate();
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFarms();
    }, []);

    const fetchFarms = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await farmAPI.getFarms();
            setFarms(response.data || []);
        } catch (err) {
            console.error('Error fetching farms:', err);
            setError('Failed to load farms. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewRecommendations = () => {
        if (farms.length > 0) {
            // Navigate with first farm's ID as default
            navigate(`/recommendations?farmId=${farms[0]._id}`);
        }
    };

    const handleManageFarms = () => {
        navigate('/farms');
    };

    const handleAddFarm = () => {
        navigate('/farms/new');
    };

    // Loading State
    if (loading) {
        return (
            <div className="admin-card">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                            <Sprout className="text-[var(--admin-accent)]" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[var(--admin-text-primary)]">Farm Management & AI Recommendations</h3>
                            <p className="text-sm text-[var(--admin-text-secondary)]">Manage your farms and view AI recommendations tailored to each field</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader className="animate-spin text-[var(--admin-accent)]" size={32} />
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="admin-card border-[var(--admin-danger)]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                            <AlertCircle className="text-[var(--admin-danger)]" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[var(--admin-text-primary)]">Farm Management & AI Recommendations</h3>
                            <p className="text-sm text-[var(--admin-danger)]">{error}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={fetchFarms}
                    className="w-full py-3 bg-[var(--admin-accent)] text-white rounded-xl font-medium hover:bg-[var(--admin-accent-hover)] transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Empty State
    if (farms.length === 0) {
        return (
            <div className="admin-card bg-gradient-to-br from-emerald-50 to-white border-2 border-dashed border-[var(--admin-border)]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Sprout className="text-[var(--admin-accent)]" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-[var(--admin-text-primary)]">Farm Management & AI Recommendations</h3>
                        <p className="text-sm text-[var(--admin-text-secondary)]">Manage your farms and view AI recommendations tailored to each field</p>
                    </div>
                </div>

                <div className="py-8 text-center">
                    <div className="w-16 h-16 bg-[var(--admin-bg-hover)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="text-[var(--admin-text-muted)]" size={32} />
                    </div>
                    <p className="font-semibold text-[var(--admin-text-primary)] mb-2">No farms registered yet</p>
                    <p className="text-sm text-[var(--admin-text-secondary)] mb-6 max-w-md mx-auto">
                        Add your farm to unlock AI crop recommendations tailored to your soil type, location, and irrigation system.
                    </p>
                    <button
                        onClick={handleAddFarm}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--admin-accent)] text-white rounded-xl font-medium hover:bg-[var(--admin-accent-hover)] transition-all shadow-lg hover:shadow-xl"
                    >
                        <Plus size={20} />
                        Add Your First Farm
                    </button>
                </div>
            </div>
        );
    }

    // Populated State
    const displayedFarms = farms.slice(0, 2);
    const hasMoreFarms = farms.length > 2;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-card hover:shadow-lg transition-shadow"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                        <Sprout className="text-[var(--admin-accent)]" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-[var(--admin-text-primary)]">Farm Management & AI Recommendations</h3>
                        <p className="text-sm text-[var(--admin-text-secondary)]">Manage your farms and view AI recommendations tailored to each field</p>
                    </div>
                </div>
                <div className="px-3 py-1 bg-emerald-100 text-[var(--admin-accent)] rounded-full text-sm font-bold">
                    {farms.length} Active Farm{farms.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Farm Preview List */}
            <div className="space-y-3 mb-4">
                {displayedFarms.map((farm, index) => (
                    <motion.div
                        key={farm._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-[var(--admin-bg-hover)] rounded-xl border border-[var(--admin-border)] hover:border-[var(--admin-accent)] transition-all cursor-pointer"
                        onClick={() => navigate(`/recommendations?farmId=${farm._id}`)}
                    >
                        <h4 className="font-bold text-[var(--admin-text-primary)] mb-2 flex items-center gap-2">
                            <MapPin size={16} className="text-[var(--admin-accent)]" />
                            {farm.name}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-[var(--admin-text-secondary)] flex-wrap">
                            <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {farm.location?.coordinates?.[1]?.toFixed(2) || 'N/A'}°N, {farm.location?.coordinates?.[0]?.toFixed(2) || 'N/A'}°E
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Sprout size={14} />
                                {farm.soilType} Soil
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Droplets size={14} />
                                {farm.irrigationType || farm.irrigationSource || 'Rainfed'}
                            </span>
                        </div>
                    </motion.div>
                ))}

                {hasMoreFarms && (
                    <button
                        onClick={handleManageFarms}
                        className="w-full py-2 text-[var(--admin-accent)] font-medium text-sm hover:underline flex items-center justify-center gap-1"
                    >
                        View all {farms.length} farms
                        <ChevronRight size={16} />
                    </button>
                )}
            </div>

            {/* AI Context Indicator */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-xs text-blue-800 flex items-start gap-2">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>
                        AI recommendations use soil type, location, and weather data from your farms to provide personalized crop suggestions.
                    </span>
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={handleViewRecommendations}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--admin-accent)] text-white rounded-xl font-medium hover:bg-[var(--admin-accent-hover)] transition-all shadow-md hover:shadow-lg"
                >
                    <Sprout size={18} />
                    View Farm AI Recommendations
                    <ArrowRight size={16} />
                </button>
                <button
                    onClick={handleAddFarm}
                    className="px-4 py-3 bg-white border-2 border-[var(--admin-accent)] text-[var(--admin-accent)] rounded-xl font-medium hover:bg-[var(--admin-bg-hover)] transition-colors flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add New Farm
                </button>
            </div>
        </motion.div>
    );
};

export default FarmManagementCard;
