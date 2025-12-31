import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar'; // Assuming standard layout components
import TopBar from '../components/dashboard/TopBar'; // Or similar header
// Note: Depending on layout, we might just wrap this in a Dashboard Layout or use base components.
// Checking Dashboard.jsx, it uses Sidebar and TopBar manually.

import FeedbackForm from '../components/feedback/FeedbackForm';
import MyFeedbackList from '../components/feedback/MyFeedbackList';
import CommunityTrends from '../components/feedback/CommunityTrends';
import FeedbackAnalytics from '../components/feedback/FeedbackAnalytics';
import { MessageSquare, List, BarChart2, TrendingUp } from 'lucide-react';

const FeedbackCenter = () => {
    // Mock user for TopBar if context not ready, but we should use context ideally
    // For now, mirroring Dashboard structure
    const [activeTab, setActiveTab] = useState('submit');

    const tabs = [
        { id: 'submit', label: 'Submit New', icon: MessageSquare },
        { id: 'my-feedback', label: 'My Feedback', icon: List },
        { id: 'analytics', label: 'Analytics', icon: BarChart2 }, // Placeholder
        { id: 'trends', label: 'Trends', icon: TrendingUp }, // Placeholder
    ];

    const handleSuccess = () => {
        setActiveTab('my-feedback');
    };

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
            <Sidebar />

            <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
                <TopBar /> {/* Assuming TopBar handles its own user fetching or context */}

                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <div className="max-w-5xl mx-auto">

                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Feedback Center</h1>
                            <p className="text-gray-500 dark:text-gray-400">Report issues, suggest improvements, or share your experience.</p>
                        </div>

                        {/* Tabs */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 p-1 flex overflow-x-auto">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center
                                        ${activeTab === tab.id
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 shadow-sm'
                                            : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:text-gray-400'
                                        }
                                    `}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="animate-fade-in-up">
                            {activeTab === 'submit' && <FeedbackForm onSuccess={handleSuccess} />}

                            {activeTab === 'my-feedback' && <MyFeedbackList />}

                            {activeTab === 'analytics' && (
                                <FeedbackAnalytics />
                            )}

                            {activeTab === 'trends' && (
                                <CommunityTrends />
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FeedbackCenter;
