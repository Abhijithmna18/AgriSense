import React, { useState, useEffect } from 'react';
import homepageService from '../services/homepageService';
import ModernNavbar from '../components/ModernNavbar';
import ModernHero from '../components/ModernHero';
import ModernFeatures from '../components/ModernFeatures';
import ModernDataViz from '../components/ModernDataViz';
import ModernMarketplace from '../components/ModernMarketplace';
import ModernFooter from '../components/ModernFooter';
import { Loader } from 'lucide-react';

const Home = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const data = await homepageService.getHomepageConfig();
                setConfig(data);
            } catch (error) {
                console.error('Failed to load homepage config:', error);
                // Keep default null to allow components to use their internal fallbacks
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <Loader className="animate-spin text-emerald-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <ModernNavbar config={config?.hero} />
            <ModernHero config={config?.hero} />
            <ModernFeatures config={config?.features} />
            <ModernDataViz config={config?.performance} />
            <ModernMarketplace config={config?.marketplace} />
            <ModernFooter config={config?.footer} />
        </div>
    );
};

export default Home;
