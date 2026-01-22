
import React from 'react';
import { ChevronRight } from 'lucide-react';

const FinancialSidebar = ({ activeSection, onNavigate, navigationItems = [] }) => {
    return (
        <div className="w-64 shrink-0 hidden lg:block sticky top-24">
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl shadow-slate-200/40 rounded-2xl overflow-hidden">
                <div className="p-6">
                    <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 px-3">
                        Financial Suite
                    </h2>

                    <div className="space-y-1">
                        {navigationItems.map(item => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigate(item.id)}
                                    className={`
                                        group relative w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out
                                        ${isActive
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-x-1'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className={`
                                            p-1.5 rounded-lg transition-colors duration-300
                                            ${isActive ? 'bg-white/20 text-white' : 'bg-transparent text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50'}
                                        `}>
                                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                        </div>
                                        <span className="tracking-tight">{item.label}</span>
                                    </div>

                                    {isActive && (
                                        <ChevronRight size={14} className="text-white/70 animate-in fade-in slide-in-from-left-1" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Decorative bottom element */}
                <div className="p-6 mt-4 bg-gradient-to-b from-transparent to-slate-50/50">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-indigo-900">System Status</span>
                        </div>
                        <p className="text-[10px] text-indigo-700/80 leading-relaxed font-medium">
                            Financial Engine v3.0 active. Real-time sync enabled.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialSidebar;
