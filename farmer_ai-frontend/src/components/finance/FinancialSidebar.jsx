
import React from 'react';
import { ChevronRight } from 'lucide-react';

const FinancialSidebar = ({ activeSection, onNavigate, navigationItems = [] }) => {
    return (
        <div className="w-64 shrink-0 hidden lg:block sticky top-24">
            <div className="bg-white/90 backdrop-blur-xl border-2 border-emerald-200/60 shadow-2xl shadow-emerald-200/40 rounded-3xl overflow-hidden">
                <div className="p-6">
                    {/* Enhanced Header */}
                    <div className="mb-6 px-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                            <h2 className="text-[11px] font-black text-emerald-600/70 uppercase tracking-widest">
                                Financial Suite
                            </h2>
                        </div>
                        <div className="h-0.5 w-12 bg-gradient-to-r from-emerald-400 to-transparent rounded-full" />
                    </div>

                    <div className="space-y-1.5">
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
                                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-300/50 translate-x-1 scale-105'
                                            : 'text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-700 hover:translate-x-1'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className={`
                                            p-1.5 rounded-lg transition-all duration-300
                                            ${isActive 
                                                ? 'bg-white/20 text-white shadow-inner' 
                                                : 'bg-transparent text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-100/80'
                                            }
                                        `}>
                                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                        </div>
                                        <span className="tracking-tight">{item.label}</span>
                                    </div>

                                    {isActive && (
                                        <ChevronRight size={14} className="text-white/80 animate-in fade-in slide-in-from-left-1" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Enhanced Decorative bottom element */}
                <div className="p-6 mt-4 bg-gradient-to-b from-transparent to-emerald-50/50">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200/60 rounded-2xl p-4 shadow-inner">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="relative">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                            </div>
                            <span className="text-xs font-bold text-emerald-900">System Status</span>
                        </div>
                        <p className="text-[10px] text-emerald-700/80 leading-relaxed font-medium">
                            Financial Engine v3.0 active. Real-time sync enabled.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialSidebar;
