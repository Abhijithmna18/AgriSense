import React, { useState } from 'react';
import { AlertTriangle, MapPin, Navigation, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DiseaseRadarCard = () => {
    const navigate = useNavigate();

    // Mock Data for "Community Alerts"
    const [alerts] = useState([
        { id: 1, disease: 'Late Blight', crop: 'Potato', dist: '2.5km', level: 'high', time: '2h ago' },
        { id: 2, disease: 'Leaf Curl', crop: 'Tomato', dist: '5.0km', level: 'medium', time: 'Yesterday' },
    ]);

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 z-10">
                <div>
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        Disease Radar
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                    </h3>
                    <p className="text-sm text-gray-500">Nearby threats detected</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                    <AlertTriangle size={18} />
                </div>
            </div>

            {/* Radar Visual / List */}
            <div className="flex-1 z-10 space-y-3">
                {alerts.length > 0 ? (
                    alerts.map((alert) => (
                        <div key={alert.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-red-50/30 transition-colors group cursor-pointer">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${alert.level === 'high' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                <AlertTriangle size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-gray-900 text-sm truncate">{alert.disease}</h4>
                                    <span className="text-[10px] text-gray-400">{alert.time}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                    <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200">{alert.crop}</span>
                                    <span className="flex items-center gap-1 text-red-500 font-medium">
                                        <MapPin size={10} /> {alert.dist}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-6">
                        <ShieldCheck size={48} className="text-green-200 mb-2" />
                        <p className="text-gray-500 font-medium">No nearby threats</p>
                        <p className="text-xs text-gray-400">Your area is currently safe</p>
                    </div>
                )}
            </div>

            {/* Footer Action */}
            <button
                onClick={() => navigate('/disease-map')}
                className="mt-4 w-full py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors flex items-center justify-center gap-2 z-10 shadow-sm shadow-red-200"
            >
                <Navigation size={16} /> View on Map
            </button>

            {/* Decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-red-50 rounded-full blur-3xl opacity-30 pointer-events-none -mr-10 -mt-10"></div>
        </div>
    );
};

export default DiseaseRadarCard;
