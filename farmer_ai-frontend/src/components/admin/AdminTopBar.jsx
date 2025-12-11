import React from 'react';
import { Search, Bell, RefreshCw, FileText } from 'lucide-react';
import '../../styles/admin.css';

const AdminTopBar = ({ title = 'Dashboard' }) => {
    return (
        <header className="flex justify-between items-center mb-8 bg-[var(--admin-bg-secondary)] px-6 py-4 rounded-xl border border-[var(--admin-border)] shadow-sm">
            <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-[var(--admin-text-primary)] tracking-tight">{title}</h1>
                <p className="text-[var(--admin-text-secondary)] text-sm mt-1">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            <div className="flex items-center gap-4">
                {/* Global Search (Placeholder) */}
                <div className="relative hidden md:block group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-secondary)] group-focus-within:text-[var(--admin-accent)] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search system..."
                        className="bg-[var(--admin-bg-primary)] text-[var(--admin-text-primary)] pl-10 pr-4 py-2 rounded-lg border border-[var(--admin-border)] focus:outline-none focus:border-[var(--admin-accent)] transition-all w-64 placeholder-[var(--admin-text-muted)]"
                    />
                </div>

                <div className="h-8 w-px bg-[var(--admin-border)] mx-2"></div>

                <button className="p-2 rounded-lg text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-bg-hover)] transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--admin-accent)] rounded-full"></span>
                </button>

                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--admin-bg-hover)] text-[var(--admin-text-primary)] hover:bg-[var(--admin-border)] transition-colors text-sm font-medium">
                    <RefreshCw size={16} />
                    <span className="hidden sm:inline">Refetch</span>
                </button>

                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--admin-accent)] text-[#0D2818] hover:bg-[var(--admin-accent-hover)] transition-colors text-sm font-bold shadow-md">
                    <FileText size={16} />
                    <span className="hidden sm:inline">Report</span>
                </button>
            </div>
        </header>
    );
};

export default AdminTopBar;
