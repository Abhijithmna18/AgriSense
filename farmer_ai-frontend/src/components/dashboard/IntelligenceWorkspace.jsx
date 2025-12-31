import React, { useState } from 'react';
import { Map, ShoppingBag, Banknote } from 'lucide-react';
import FieldIntelligence from './FieldIntelligence';
import CommerceSupply from './CommerceSupply';
import FinanceSchemes from './FinanceSchemes';

const IntelligenceWorkspace = ({ data }) => {
    const [activeTab, setActiveTab] = useState('field');

    const tabs = [
        { id: 'field', label: 'Field Intelligence', icon: Map },
        { id: 'commerce', label: 'Commerce & Supply', icon: ShoppingBag },
        { id: 'finance', label: 'Finance & Schemes', icon: Banknote },
    ];

    return (
        <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-stone-200 dark:border-white/10 overflow-hidden flex flex-col min-h-[600px]">

            {/* Tabs Header */}
            <div className="flex border-b border-stone-200 dark:border-white/10 overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                flex items-center gap-3 px-6 py-4 font-serif font-bold text-sm tracking-wide transition-all whitespace-nowrap
                ${isActive
                                    ? 'bg-primary-green/5 text-primary-green border-b-2 border-primary-green'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-stone-50 dark:text-gray-400 dark:hover:text-warm-ivory dark:hover:bg-white/5'
                                }
              `}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 bg-stone-50/50 dark:bg-transparent">
                {activeTab === 'field' && <FieldIntelligence data={data.fieldIntelligence} />}
                {activeTab === 'commerce' && <CommerceSupply data={data.commerce} />}
                {activeTab === 'finance' && <FinanceSchemes data={data.finance} />}
            </div>
        </div>
    );
};

export default IntelligenceWorkspace;
