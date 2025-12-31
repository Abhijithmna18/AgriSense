import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit3, Save, Plus } from 'lucide-react';
import { authAPI } from '../services/authApi';

// Components
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import WidgetGrid from '../components/dashboard/WidgetGrid';

// Widgets
import AIAdvisoryWidget from '../components/widgets/AIAdvisoryWidget';
import GeospatialWidget from '../components/widgets/GeospatialWidget';
import MarketplaceWidget from '../components/widgets/MarketplaceWidget';
import FinancialWidget from '../components/widgets/FinancialWidget';
import GovernmentSchemesWidget from '../components/widgets/GovernmentSchemesWidget';
import StatCard from '../components/dashboard/StatCard';
import AnalyticsPanel from '../components/dashboard/AnalyticsPanel';

// Icons
import { Sprout, Droplets, CloudRain, TrendingUp } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);

    // Default widget layout
    const [widgets, setWidgets] = useState([
        {
            id: 'ai-advisory',
            layout: { i: 'ai-advisory', x: 0, y: 0, w: 12, h: 3, minW: 6, minH: 2 },
            component: <AIAdvisoryWidget onRemove={() => removeWidget('ai-advisory')} onMinimize={() => { }} />
        },
        {
            id: 'geospatial',
            layout: { i: 'geospatial', x: 0, y: 3, w: 6, h: 4, minW: 4, minH: 3 },
            component: <GeospatialWidget onRemove={() => removeWidget('geospatial')} onMinimize={() => { }} />
        },
        {
            id: 'marketplace',
            layout: { i: 'marketplace', x: 6, y: 3, w: 3, h: 4, minW: 3, minH: 3 },
            component: <MarketplaceWidget onRemove={() => removeWidget('marketplace')} onMinimize={() => { }} />
        },
        {
            id: 'financial',
            layout: { i: 'financial', x: 9, y: 3, w: 3, h: 4, minW: 3, minH: 3 },
            component: <FinancialWidget onRemove={() => removeWidget('financial')} onMinimize={() => { }} />
        },
        {
            id: 'gov-schemes',
            layout: { i: 'gov-schemes', x: 0, y: 7, w: 4, h: 3, minW: 3, minH: 2 },
            component: <GovernmentSchemesWidget onRemove={() => removeWidget('gov-schemes')} onMinimize={() => { }} />
        }
    ]);

    useEffect(() => {
        fetchUserData();
        // Load saved layout from localStorage
        const savedLayout = localStorage.getItem('dashboard-layout');
        if (savedLayout) {
            try {
                const parsed = JSON.parse(savedLayout);
                setWidgets(prev => prev.map(w => {
                    const saved = parsed.find(p => p.i === w.id);
                    return saved ? { ...w, layout: saved } : w;
                }));
            } catch (e) {
                console.error('Failed to parse saved layout');
            }
        }
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await authAPI.getMe();
            setUser(response.data);
        } catch (err) {
            // Token invalid, will be redirected by interceptor
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        navigate('/login');
    };

    const handleLayoutChange = (newLayout) => {
        if (isEditMode) {
            localStorage.setItem('dashboard-layout', JSON.stringify(newLayout));
        }
    };

    const removeWidget = (widgetId) => {
        if (isEditMode) {
            setWidgets(prev => prev.filter(w => w.id !== widgetId));
        }
    };

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-warm-ivory dark:bg-deep-forest flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-dark-green-text dark:text-warm-ivory font-serif tracking-wide">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-warm-ivory dark:bg-deep-forest transition-colors flex">
            {/* Sidebar */}
            <Sidebar onLogout={handleLogout} />

            {/* Main Content */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
                <TopBar user={user} onLogout={handleLogout} />

                <main className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-[1400px] mx-auto space-y-6"
                    >
                        {/* Header with Edit Mode Toggle */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-serif font-bold text-dark-green-text dark:text-warm-ivory mb-2">
                                    AgriSense Dashboard
                                </h1>
                                <p className="text-dark-green-text/60 dark:text-warm-ivory/60">
                                    Ecosystem overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            <button
                                onClick={toggleEditMode}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium ${isEditMode
                                    ? 'bg-accent-gold text-white shadow-lg'
                                    : 'bg-white/5 border border-dark-green-text/10 hover:border-accent-gold hover:text-accent-gold'
                                    }`}
                            >
                                {isEditMode ? <Save size={18} /> : <Edit3 size={18} />}
                                <span>{isEditMode ? 'Save Layout' : 'Edit Dashboard'}</span>
                            </button>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Crop Health Index"
                                value="94%"
                                trend="up"
                                trendValue="2.5%"
                                icon={Sprout}
                                color="green"
                            />
                            <StatCard
                                title="Active Orders"
                                value="12"
                                trend="up"
                                trendValue="8%"
                                icon={TrendingUp}
                                color="gold"
                            />
                            <StatCard
                                title="Soil Moisture"
                                value="62%"
                                trend="down"
                                trendValue="1.2%"
                                icon={Droplets}
                                color="blue"
                            />
                            <StatCard
                                title="Schemes Eligible"
                                value="3"
                                icon={CloudRain}
                                color="green"
                            />
                        </div>

                        {/* Widget Grid */}
                        <div className={`${isEditMode ? 'ring-2 ring-accent-gold/30 rounded-2xl p-4' : ''}`}>
                            {isEditMode && (
                                <div className="mb-4 p-3 bg-accent-gold/10 border border-accent-gold/30 rounded-lg text-sm text-dark-green-text dark:text-warm-ivory">
                                    <strong>Edit Mode:</strong> Drag widgets to rearrange, resize from corners, or remove using the X button.
                                </div>
                            )}
                            <WidgetGrid
                                widgets={widgets}
                                onLayoutChange={handleLayoutChange}
                                isEditMode={isEditMode}
                            />
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
