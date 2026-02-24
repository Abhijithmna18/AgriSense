import React, { useState, useEffect } from 'react';
import { Truck, Thermometer, Clock, CloudRain, AlertTriangle, ShieldCheck, Snowflake } from 'lucide-react';
import { logisticsApi } from '../../../services/logisticsApi';

const ShipmentIntelligencePanel = ({ vendorId, listingId, cropName, sourceLat, sourceLon, destLat, destLon }) => {
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPrediction = async () => {
            if (!vendorId || !listingId || !cropName) return;

            setLoading(true);
            setError('');
            try {
                const response = await logisticsApi.predictSpoilageRisk({
                    vendorId,
                    listingId,
                    cropName,
                    sourceLat,
                    sourceLon,
                    destLat,
                    destLon
                });

                if (response.success && response.data) {
                    setPrediction(response.data);
                } else {
                    setError('Failed to load logistics intelligence.');
                }
            } catch (err) {
                setError(err.message || 'An error occurred during prediction.');
            } finally {
                setLoading(false);
            }
        };

        fetchPrediction();
    }, [vendorId, listingId, cropName, sourceLat, sourceLon, destLat, destLon]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6 animate-pulse">
                <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl shadow-sm border border-red-100 text-sm">
                <AlertTriangle className="inline-block mr-2 h-4 w-4" />
                {error}
            </div>
        );
    }

    if (!prediction) return null;

    const riskColor =
        prediction.riskLevel === 'High' ? 'text-red-500 bg-red-50 border-red-200' :
            prediction.riskLevel === 'Medium' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                'text-emerald-600 bg-emerald-50 border-emerald-200';

    const getRiskGaugeColor = (percent) => {
        if (percent < 30) return 'bg-emerald-500';
        if (percent < 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mt-6">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-800 p-4 font-semibold text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    <span>Smart Logistics Intelligence</span>
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium tracking-wide">AI PREDICTION</span>
            </div>

            <div className="p-5">
                {/* Top Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="text-xs text-gray-500 mb-1 font-medium flex items-center gap-1"><Truck className="h-3 w-3" /> Distance</div>
                        <div className="text-lg font-bold text-gray-800">{prediction.inputSnapshot.distanceKm} km</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="text-xs text-gray-500 mb-1 font-medium flex items-center gap-1"><Clock className="h-3 w-3" /> Transit Time</div>
                        <div className="text-lg font-bold text-gray-800">{prediction.inputSnapshot.estimatedTransitHours}h</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="text-xs text-gray-500 mb-1 font-medium flex items-center gap-1"><Thermometer className="h-3 w-3" /> Route Temp</div>
                        <div className="text-lg font-bold text-gray-800">{prediction.inputSnapshot.forecastAvgTemp.toFixed(1)}°C</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="text-xs text-gray-500 mb-1 font-medium flex items-center gap-1"><CloudRain className="h-3 w-3" /> Rain Risk</div>
                        <div className="text-lg font-bold text-gray-800">{prediction.inputSnapshot.forecastRainProbability}%</div>
                    </div>
                </div>

                {/* Spoilage Risk Section */}
                <div className={`p-4 rounded-xl border mb-6 ${riskColor}`}>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold flex items-center gap-2">
                            {prediction.riskLevel === 'High' ? <AlertTriangle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                            Calculated Spoilage Risk
                        </h4>
                        <span className="text-xl font-bold">{prediction.spoilageRiskPercent}%</span>
                    </div>

                    {/* Gauge Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3 overflow-hidden">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-1000 ${getRiskGaugeColor(prediction.spoilageRiskPercent)}`}
                            style={{ width: `${Math.min(prediction.spoilageRiskPercent, 100)}%` }}>
                        </div>
                    </div>

                    <p className="text-sm/relaxed font-medium opacity-90 mt-2">
                        <strong>AI Analysis:</strong> {prediction.recommendation.reasoning}
                    </p>
                </div>

                {/* Recommendation Footer */}
                <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div>
                        <div className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-1">Recommended Transport</div>
                        <div className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                            {prediction.recommendation.coldChainRequired && <Snowflake className="h-5 w-5 text-indigo-500" />}
                            {prediction.recommendation.suggestedTransport}
                        </div>
                    </div>

                    <div className="mt-4 md:mt-0 text-right">
                        <div className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-1">Estimated Arrival</div>
                        <div className="text-md font-semibold text-indigo-900">
                            {new Date(prediction.predictedEta).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShipmentIntelligencePanel;
