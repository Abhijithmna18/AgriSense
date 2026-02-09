import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bug, AlertTriangle, Shield, TrendingUp, Calendar, Leaf, CloudRain, Thermometer } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/authApi';

const PestPredictionPage = () => {
    const navigate = useNavigate();
    const [predictions, setPredictions] = useState([]);
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedFarm, setSelectedFarm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [predictionsRes, farmsRes] = await Promise.all([
                api.get('/api/pest-prediction/my-predictions'),
                api.get('/api/farms')
            ]);
            setPredictions(predictionsRes.data || []);
            setFarms(farmsRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load predictions');
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePrediction = async () => {
        if (!selectedFarm) {
            toast.error('Please select a farm');
            return;
        }

        setGenerating(true);
        try {
            // Mock weather data - in production, fetch from weather API
            const weatherData = {
                current: {
                    temperature: 28,
                    humidity: 75,
                    rainfall: 5,
                    wind: 12
                }
            };

            await api.post('/api/pest-prediction/analyze', {
                farmId: selectedFarm,
                weatherData
            });

            toast.success('Pest risk prediction generated!');
            fetchData();
        } catch (error) {
            console.error('Failed to generate prediction:', error);
            toast.error(error.response?.data?.message || 'Failed to generate prediction');
        } finally {
            setGenerating(false);
        }
    };

    const getRiskColor = (level) => {
        const colors = {
            low: 'bg-green-100 text-green-700 border-green-200',
            medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            high: 'bg-orange-100 text-orange-700 border-orange-200',
            critical: 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[level] || colors.low;
    };

    const getRiskIcon = (level) => {
        if (level === 'critical' || level === 'high') return <AlertTriangle size={20} />;
        if (level === 'medium') return <TrendingUp size={20} />;
        return <Shield size={20} />;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Bug size={32} className="text-green-600" />
                            Pest Risk Prediction
                        </h1>
                        <p className="text-gray-500 mt-2">AI-powered early warning system for pest management</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                        Back to Dashboard
                    </button>
                </div>

                {/* Generate New Prediction */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border-2 border-green-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Generate New Prediction</h2>
                    <div className="flex gap-4">
                        <select
                            value={selectedFarm}
                            onChange={(e) => setSelectedFarm(e.target.value)}
                            className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Select a farm...</option>
                            {farms.map(farm => (
                                <option key={farm._id} value={farm._id}>
                                    {farm.name} - {farm.location?.district}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleGeneratePrediction}
                            disabled={generating || !selectedFarm}
                            className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {generating ? 'Analyzing...' : 'Generate Prediction'}
                        </button>
                    </div>
                </div>

                {/* Predictions List */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading predictions...</div>
                ) : predictions.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <Bug size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">No predictions yet</p>
                        <p className="text-gray-400 text-sm mt-2">Generate your first pest risk prediction above</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {predictions.map(prediction => (
                            <div key={prediction._id} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                                {/* Prediction Header */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{prediction.farm?.name}</h3>
                                        <p className="text-gray-500 mt-1">
                                            {prediction.crop} • {prediction.cropStage} stage • {prediction.daysSinceSowing} days
                                        </p>
                                    </div>
                                    <span className={`px-4 py-2 rounded-full font-medium border flex items-center gap-2 ${getRiskColor(prediction.overallRiskLevel)}`}>
                                        {getRiskIcon(prediction.overallRiskLevel)}
                                        {prediction.overallRiskLevel.toUpperCase()} RISK
                                    </span>
                                </div>

                                {/* Weather Info */}
                                {prediction.weatherData?.current && (
                                    <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Thermometer size={18} className="text-red-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Temperature</p>
                                                <p className="font-medium">{prediction.weatherData.current.temperature}°C</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CloudRain size={18} className="text-blue-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Humidity</p>
                                                <p className="font-medium">{prediction.weatherData.current.humidity}%</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CloudRain size={18} className="text-blue-600" />
                                            <div>
                                                <p className="text-xs text-gray-500">Rainfall</p>
                                                <p className="font-medium">{prediction.weatherData.current.rainfall}mm</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Leaf size={18} className="text-green-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Wind</p>
                                                <p className="font-medium">{prediction.weatherData.current.wind}km/h</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Pest Risks */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900">Identified Pest Risks</h4>
                                    {prediction.pestRisks.map((risk, idx) => (
                                        <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h5 className="font-bold text-gray-900">{risk.pestName}</h5>
                                                    <p className="text-sm text-gray-600 mt-1">{risk.reason}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-red-600">{risk.riskPercent}%</p>
                                                    <p className="text-xs text-gray-500">Risk Level</p>
                                                </div>
                                            </div>

                                            {/* Preventive Actions */}
                                            {risk.preventiveActions && risk.preventiveActions.length > 0 && (
                                                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                                                    <p className="text-sm font-semibold text-blue-900">Preventive Actions:</p>
                                                    {risk.preventiveActions.map((action, actionIdx) => (
                                                        <div key={actionIdx} className="flex items-start gap-3 text-sm">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${action.urgency === 'immediate' ? 'bg-red-100 text-red-700' :
                                                                    action.urgency === 'monitor' ? 'bg-yellow-100 text-yellow-700' :
                                                                        'bg-green-100 text-green-700'
                                                                }`}>
                                                                {action.urgency}
                                                            </span>
                                                            <div className="flex-1">
                                                                <p className="text-gray-900 font-medium">{action.action}</p>
                                                                <p className="text-gray-600 text-xs mt-1">
                                                                    {action.type} • {action.cost} cost • {action.impact}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="flex justify-between items-center pt-4 border-t border-gray-200 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} />
                                        Generated: {new Date(prediction.createdAt).toLocaleDateString()}
                                    </div>
                                    <div>
                                        Valid for: {prediction.predictionWindow}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PestPredictionPage;
