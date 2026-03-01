import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Bug,
    RefreshCw,
    Video,
    Sparkles,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';

// Import the existing pages
import DiseasePredictionPage from './DiseasePredictionPage';
import PestPredictionPage from './PestPredictionPage';
import CropRotationPage from './CropRotationPage';
import ConsultationPage from './ConsultationPage';

const SmartFarmingPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('disease'); // 'disease', 'pest', 'rotation', 'expert'
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const tabs = [
        { id: 'disease', label: 'Disease Detection', icon: Activity, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
        { id: 'pest', label: 'Pest Prediction', icon: Bug, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
        { id: 'rotation', label: 'Crop Rotation', icon: RefreshCw, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
        { id: 'expert', label: 'Expert Advisory', icon: Video, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--admin-bg)]">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
                <TopBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                
                <div className="flex-1 bg-[#F8FAF9] p-4 md:p-8 pt-20 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-6">

                {/* Header & Navigation */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors mb-4"
                        >
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Sparkles className="text-emerald-500" size={32} />
                            AI Advisory
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Unified smart farming tools powered by artificial intelligence.
                        </p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all text-sm md:text-base flex-1 min-w-[140px] justify-center
                                    ${isActive
                                        ? `${tab.bg} ${tab.color} border ring-1 ring-inset ${tab.border} shadow-sm`
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-transparent'
                                    }
                                `}
                            >
                                <Icon size={18} className={isActive ? tab.color : 'text-gray-400'} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content Area */}
                <div className="relative min-h-[600px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0"
                        >
                            {/* Render the selected component and pass isEmbedded=true */}
                            {activeTab === 'disease' && <DiseasePredictionPage isEmbedded={true} />}
                            {activeTab === 'pest' && <PestPredictionPage isEmbedded={true} />}
                            {activeTab === 'rotation' && <CropRotationPage isEmbedded={true} />}
                            {activeTab === 'expert' && <ConsultationPage isEmbedded={true} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
            </div>
        </div>
    );
};

export default SmartFarmingPage;
