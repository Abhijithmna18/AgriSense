import React from 'react';
import { AlertCircle, Target, CheckCircle, Info } from 'lucide-react';
import { useFarmIntelligence } from '../../context/FarmIntelligenceContext';
import { format } from 'date-fns';

const IntelligenceFeed = () => {
    const { intelligence, logAction } = useFarmIntelligence();
    const observations = intelligence?.observations || [];

    // In real app, we would merge AI recommendations here too

    if (observations.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                <Info className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-gray-500 text-sm">No recent observations or alerts.</p>
            </div>
        );
    }

    const handleAction = (id, type, action) => {
        logAction(id, type, action);
        // Optimistic UI update could happen here
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Intelligence Feed</h3>

            {observations.map(obs => (
                <div key={obs._id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-blue-500 border border-gray-100 relative group">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${obs.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                                    obs.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                                        'bg-blue-100 text-blue-700'
                                }`}>
                                {obs.type} • {obs.severity}
                            </span>
                            <h4 className="font-semibold text-gray-800 mt-1">{obs.notes}</h4>
                            <p className="text-xs text-gray-400 mt-1">{format(new Date(obs.date), 'dd MMM, HH:mm')}</p>
                        </div>
                        {obs.aiAnalysisId && (
                            <div className="bg-purple-50 p-1.5 rounded-lg text-purple-600" title="AI Generated">
                                <Target size={16} />
                            </div>
                        )}
                    </div>

                    {/* Explainability / Action Section */}
                    <div className="mt-3 pt-3 border-t border-gray-50 flex gap-2">
                        <button
                            onClick={() => handleAction(obs._id, 'Observation', 'Followed')}
                            className="flex-1 text-xs border border-green-200 text-green-700 bg-green-50 py-1.5 rounded hover:bg-green-100 transition flex items-center justify-center gap-1"
                        >
                            <CheckCircle size={12} /> Acknowledge
                        </button>
                        <button
                            onClick={() => handleAction(obs._id, 'Observation', 'Ignored')}
                            className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded hover:bg-gray-50 transition"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default IntelligenceFeed;
