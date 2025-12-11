import React from 'react';
import ModernNavbar from '../components/ModernNavbar';
import ModernHero from '../components/ModernHero';
import ModernFeatures from '../components/ModernFeatures';
import ModernDataViz from '../components/ModernDataViz';
import ModernMarketplace from '../components/ModernMarketplace';
import ModernFooter from '../components/ModernFooter';

const Home = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <ModernNavbar />
            <ModernHero />
            <ModernFeatures />
            <ModernDataViz />
            <ModernMarketplace />
            <ModernFooter />
        </div>
    );
};

export default Home;
