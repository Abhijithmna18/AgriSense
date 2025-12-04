import React from 'react';
import { AlertTriangle, TrendingUp, Zap, ArrowRight } from 'lucide-react';

const AIInsightsPanel = () => {
    const insights = [
        {
            type: 'risk',
            title: 'Disease Risk Detected',
            description: 'High probability of Leaf Blight in Sector 4 due to humidity levels.',
            score: 'High',
            action: 'Inspect & Spray',
            icon: AlertTriangle,
            color: 'red'
        },
        {
            type: 'opportunity',
            title: 'Yield Optimization',
            description: 'Soil moisture optimal. Increasing irrigation by 10% could boost yield.',
            score: '+12%',
            action: 'Adjust Irrigation',
            icon: TrendingUp,
            color: 'green'
        },
        {
            type: 'prediction',
            title: 'Weather Alert',
            description: 'Heavy rainfall expected in 48 hours. Ensure drainage systems are clear.',
            score: '90%',
            action: 'View Forecast',
            icon: Zap,
            color: 'gold'
        }
    ];

    const colorMap = {
        red: 'bg-red-500 text-red-500',
        green: 'bg-green-500 text-green-500',
        gold: 'bg-accent-gold text-accent-gold'
    };

    return (
        <div className="glass p-6 rounded-2xl h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-primary-green to-accent-gold rounded-lg">
                        <Zap size={18} className="text-white" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-dark-green-text dark:text-warm-ivory">AI Insights</h3>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-primary-green/10 text-primary-green rounded-full">Live</span>
            </div>

            <div className="space-y-4">
                {insights.map((insight, index) => (
                    <div key={index} className="group p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent-gold/20 rounded-xl transition-all duration-300">
                        <div className="flex justify-between items-start mb-2">
                            <div className={`p-1.5 rounded-lg bg-opacity-10 ${colorMap[insight.color].split(' ')[0]}`}>
                                <insight.icon size={16} className={colorMap[insight.color].split(' ')[1]} />
                            </div>
                            <span className={`text-xs font-bold ${colorMap[insight.color].split(' ')[1]}`}>{insight.score}</span>
                        </div>

                        <h4 className="text-sm font-bold text-dark-green-text dark:text-warm-ivory mb-1">{insight.title}</h4>
                        <p className="text-xs text-dark-green-text/60 dark:text-warm-ivory/60 mb-3 leading-relaxed">
                            {insight.description}
                        </p>

                        <button className="w-full flex items-center justify-between text-xs font-medium text-dark-green-text/80 group-hover:text-accent-gold transition-colors py-2 border-t border-white/5">
                            <span>{insight.action}</span>
                            <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Heatmap Preview */}
            <div className="mt-6">
                <h4 className="text-xs font-bold text-dark-green-text/50 uppercase tracking-widest mb-3">Live Analysis</h4>
                <div className="relative h-32 rounded-xl overflow-hidden group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-deep-forest to-primary-green opacity-80"></div>
                    {/* Simulated Heatmap Overlay */}
                    <div className="absolute inset-0 opacity-50 mix-blend-overlay" style={{
                        backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(255,0,0,0.8) 0%, transparent 20%), radial-gradient(circle at 70% 60%, rgba(212,175,55,0.8) 0%, transparent 25%)'
                    }}></div>

                    <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white font-medium">Sector 4 Analysis</span>
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIInsightsPanel;
