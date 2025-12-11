import React from 'react';

const CompactMetric = ({ label, value, icon: Icon }) => {
    return (
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 rounded-lg bg-[var(--admin-bg-primary)] border border-[var(--admin-border)]">
                    {Icon && <Icon className="text-[var(--admin-text-secondary)]" size={20} />}
                </div>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-[var(--admin-text-primary)] tracking-tight mb-1">{value}</h3>
                <p className="text-[var(--admin-text-muted)] text-xs font-medium uppercase tracking-wider">{label}</p>
            </div>
        </div>
    );
};

export default CompactMetric;
