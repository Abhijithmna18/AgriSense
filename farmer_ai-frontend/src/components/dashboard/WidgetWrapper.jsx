import React from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Minimize2, X } from 'lucide-react';

const WidgetWrapper = ({
    title,
    children,
    onRemove,
    onMinimize,
    isLoading = false,
    actions = null,
    className = ''
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`glass rounded-2xl overflow-hidden flex flex-col h-full ${className}`}
        >
            {/* Widget Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-accent-gold/10">
                <h3 className="text-sm font-serif font-bold text-dark-green-text dark:text-warm-ivory">
                    {title}
                </h3>
                <div className="flex items-center gap-2">
                    {actions}
                    <button
                        onClick={onMinimize}
                        className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-dark-green-text/60 hover:text-accent-gold"
                    >
                        <Minimize2 size={14} />
                    </button>
                    <button
                        onClick={onRemove}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-dark-green-text/60 hover:text-red-500"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Widget Content */}
            <div className="flex-1 p-4 overflow-auto custom-scrollbar">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="w-8 h-8 border-3 border-primary-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    children
                )}
            </div>
        </motion.div>
    );
};

export default WidgetWrapper;
