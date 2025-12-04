import React from 'react';
import { Header } from '../components/Header';
import { LuxuryHero } from '../components/LuxuryHero';
import { FeatureCards } from '../components/FeatureCards';
import { LuxuryAbout } from '../components/LuxuryAbout';
import { PremiumMarketplace } from '../components/PremiumMarketplace';
import { LuxuryFooter } from '../components/LuxuryFooter';
import { ThemeToggle } from '../components/ThemeToggle';

const Home = () => {
    return (
        <div className="min-h-screen bg-warm-ivory dark:bg-deep-forest transition-colors duration-300">
            <Header />
            <ThemeToggle />
            <LuxuryHero />
            <FeatureCards />
            <LuxuryAbout />
            <PremiumMarketplace />
            <LuxuryFooter />
        </div>
    );
};

export default Home;
