import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthHeader = () => {
    return (
        <header className="absolute top-0 left-0 right-0 p-6 z-10">
            <div className="container mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 group">
                    <motion.div
                        className="w-10 h-10 bg-gradient-to-br from-primary-green to-light-green rounded-lg flex items-center justify-center shadow-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Sprout size={24} className="text-white" strokeWidth={2} />
                    </motion.div>
                    <span
                        className="text-2xl font-bold text-dark-green-text dark:text-warm-ivory group-hover:text-primary-green dark:group-hover:text-light-green transition-colors"
                        style={{ fontFamily: 'var(--font-serif)' }}
                    >
                        AgriSense
                    </span>
                </Link>
            </div>
        </header>
    );
};

export default AuthHeader;
