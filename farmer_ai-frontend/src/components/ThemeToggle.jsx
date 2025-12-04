import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle = () => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full glass flex items-center justify-center hover:border-accent-gold/60 transition-all shadow-lg"
            aria-label="Toggle theme"
        >
            {isDark ? (
                <Sun size={20} className="text-warm-ivory" strokeWidth={1.5} />
            ) : (
                <Moon size={20} className="text-dark-green-text" strokeWidth={1.5} />
            )}
        </motion.button>
    );
};
