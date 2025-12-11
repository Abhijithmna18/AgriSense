import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthHeader = () => {
    return (
        <header className="absolute top-0 left-0 right-0 p-6 z-10">
            <div className="container mx-auto">
                <Link to="/" className="inline-flex items-center gap-3 group">
                    <motion.div
                        className="w-10 h-10 bg-deep-forest-green rounded-xl flex items-center justify-center shadow-lg shadow-deep-forest-green/20"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Sprout size={24} className="text-fresh-lime-green" strokeWidth={2.5} />
                    </motion.div>
                    <span
                        className="text-2xl font-bold text-deep-forest-green group-hover:text-emerald-800 transition-colors tracking-tight"
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
