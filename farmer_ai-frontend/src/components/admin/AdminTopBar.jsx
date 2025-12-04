import React, { useState } from 'react';
import { Search, Bell, User, Edit3, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminTopBar = ({ isEditMode, onToggleEdit }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [hasNotifications, setHasNotifications] = useState(true);

    return (
        <header className="sticky top-0 z-40 px-8 py-4 admin-glass border-b border-cyber-green/20">
            <div className="flex items-center justify-between">
                {/* Left: Search */}
                <div className="flex-1 max-w-2xl">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyber-green transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search farmers, crops, or orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-full bg-admin-bg-tertiary border border-cyber-green/20 focus:border-cyber-green focus:outline-none focus:ring-2 focus:ring-cyber-green/20 transition-all duration-300 placeholder:text-gray-600 text-gray-200"
                        />
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-6 ml-8">
                    {/* Edit Layout Toggle */}
                    <button
                        onClick={onToggleEdit}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm ${isEditMode
                                ? 'bg-cyber-green text-admin-bg-primary neon-glow'
                                : 'bg-admin-bg-tertiary border border-cyber-green/30 text-cyber-green hover:bg-cyber-green/10'
                            }`}
                    >
                        {isEditMode ? <Save size={16} /> : <Edit3 size={16} />}
                        <span>{isEditMode ? 'Save Layout' : 'Edit Layout'}</span>
                    </button>

                    {/* Notifications */}
                    <button className="relative p-2 text-gray-400 hover:text-cyber-green transition-colors rounded-full hover:bg-white/5">
                        <Bell size={20} />
                        {hasNotifications && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-1 right-1 w-2.5 h-2.5 bg-alert-red rounded-full border-2 border-admin-bg-secondary"
                            />
                        )}
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-admin-bg-tertiary border border-cyber-green/20">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-green to-cyber-green-bright flex items-center justify-center">
                            <User size={16} className="text-admin-bg-primary" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-gray-200">Admin Console</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Superuser</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminTopBar;
