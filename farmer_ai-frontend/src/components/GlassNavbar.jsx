import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { ShoppingBag, FileText, Crown, ToggleLeft, ToggleRight } from 'lucide-react';
import styles from './GlassNavbar.module.css';

export const GlassNavbar = () => {
    const { adminMode, toggleAdminMode } = useData();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
            <div className="container">
                <div className={styles.navContent}>
                    <div className={styles.brand}>
                        <span className={styles.logo}>🌾</span>
                        <span className={styles.brandName}>Farmer AI</span>
                    </div>

                    <div className={styles.navLinks}>
                        <a href="#marketplace" className={styles.navLink}>
                            <ShoppingBag size={18} />
                            Marketplace
                        </a>
                        <a href="#advisories" className={styles.navLink}>
                            <FileText size={18} />
                            Advisories
                        </a>
                        <a href="#premium" className={styles.navLink}>
                            <Crown size={18} />
                            Premium
                        </a>
                    </div>

                    <button
                        className={`${styles.adminToggle} ${adminMode ? styles.active : ''}`}
                        onClick={toggleAdminMode}
                        title={adminMode ? 'Exit Admin Mode' : 'Enter Admin Mode'}
                    >
                        {adminMode ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        <span>{adminMode ? 'Admin ON' : 'Admin OFF'}</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};
