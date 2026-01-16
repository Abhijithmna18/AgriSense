import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, CheckSquare, TrendingUp, BookOpen, Package, FileText } from 'lucide-react';

// Import tab components
import OverviewTab from './tabs/OverviewTab';
import ResponsibilitiesTab from './tabs/ResponsibilitiesTab';
import LifecycleTab from './tabs/LifecycleTab';
import DiaryTab from './tabs/DiaryTab';
import HarvestTab from './tabs/HarvestTab';
import ReportsTab from './tabs/ReportsTab';

const TABS = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'responsibilities', label: 'Responsibilities', icon: CheckSquare },
    { id: 'lifecycle', label: 'Lifecycle', icon: TrendingUp },
    { id: 'diary', label: 'Diary', icon: BookOpen },
    { id: 'harvest', label: 'Harvest', icon: Package },
    { id: 'reports', label: 'Reports', icon: FileText }
];

const ZoneDrawer = ({ zone, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');

    // Reset to overview when zone changes
    React.useEffect(() => {
        if (zone) {
            setActiveTab('overview');
        }
    }, [zone?._id]);

    const renderTabContent = () => {
        if (!zone) return null;

        switch (activeTab) {
            case 'overview':
                return <OverviewTab zone={zone} />;
            case 'responsibilities':
                return <ResponsibilitiesTab zone={zone} />;
            case 'lifecycle':
                return <LifecycleTab zone={zone} />;
            case 'diary':
                return <DiaryTab zone={zone} />;
            case 'harvest':
                return <HarvestTab zone={zone} />;
            case 'reports':
                return <ReportsTab zone={zone} />;
            default:
                return null;
        }
    };

    return (
        <div className="h-full w-full bg-white flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 p-6 shrink-0 z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{zone.name}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded border border-gray-200 uppercase tracking-wider">
                                {zone.crop_name}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600 text-sm font-medium">{zone.area_acres} acres</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600 text-sm font-medium">{zone.type}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                        title="Close Panel"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${zone.status === 'Healthy'
                            ? 'bg-green-100 text-green-700'
                            : zone.status === 'Risk'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                    >
                        {zone.status}
                    </span>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200 px-4 shrink-0 overflow-x-auto">
                <div className="flex gap-1 min-w-max">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${isActive
                                    ? 'border-green-600 text-green-700 bg-green-50/50'
                                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                    >
                        {renderTabContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ZoneDrawer;
