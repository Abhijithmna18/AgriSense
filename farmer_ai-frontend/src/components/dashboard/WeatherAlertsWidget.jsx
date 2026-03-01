import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Wind, Thermometer, Droplets, AlertTriangle, Loader2, CloudLightning, Info, CloudFog } from 'lucide-react';
import api from '../../services/authApi';
import { motion, AnimatePresence } from 'framer-motion';

const WeatherAlertsWidget = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFarmWeather = async () => {
            try {
                // Determine which farm to load — usually the user's primary farm.
                // For this widget, we fetch the list of farms and use the first one.
                const farmsResponse = await api.get('/api/farms');
                const farms = farmsResponse.data?.data || [];

                if (farms.length === 0) {
                    setError('No farms registered to fetch weather data.');
                    setLoading(false);
                    return;
                }

                const primaryFarmId = farms[0]._id;

                const weatherResponse = await api.get(`/api/weather/farm/${primaryFarmId}`);
                setWeatherData(weatherResponse.data.data);
            } catch (err) {
                console.error("Failed to load farm weather", err);
                setError('Failed to fetch local weather data.');
            } finally {
                setLoading(false);
            }
        };

        fetchFarmWeather();
    }, []);

    // Helper: Pick a suitable icon based on WMO weather code
    const getWeatherIcon = (code) => {
        if (code === undefined) return <Sun className="text-amber-500" size={32} />;
        if (code <= 1) return <Sun className="text-amber-500" size={32} />;
        if (code <= 3) return <CloudFog className="text-gray-400" size={32} />;
        if (code >= 51 && code <= 67) return <CloudRain className="text-blue-400" size={32} />;
        if (code >= 80 && code <= 82) return <CloudRain className="text-blue-500" size={32} />;
        if (code >= 95) return <CloudLightning className="text-purple-500" size={32} />;
        return <CloudFog className="text-gray-400" size={32} />;
    };

    if (loading) {
        return (
            <div className="admin-card h-full flex flex-col items-center justify-center p-8 border border-[var(--admin-border)]">
                <Loader2 className="animate-spin text-[var(--admin-accent)] mb-4" size={32} />
                <p className="text-[var(--admin-text-secondary)] text-sm font-medium animate-pulse">Scanning local weather systems...</p>
            </div>
        );
    }

    if (error || !weatherData) {
        return (
            <div className="admin-card h-full flex flex-col items-center justify-center p-8 border border-red-100 bg-red-50/30">
                <AlertTriangle className="text-red-400 mb-3" size={28} />
                <p className="text-red-800 text-sm font-medium">{error || "Weather data unavailable"}</p>
            </div>
        );
    }

    const { temp, humidity, wind_speed, description, weather_code, city, alerts } = weatherData;

    return (
        <div className="admin-card h-full flex flex-col flex-1 overflow-hidden transition-all hover:border-blue-300">
            {/* Header / Current Conditions */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-bold text-[var(--admin-text-primary)] text-lg">Farm Weather</h3>
                    <p className="text-sm text-[var(--admin-text-secondary)] flex items-center gap-1">
                        📍 {city}
                    </p>
                </div>
                <div className="bg-blue-50/50 p-2.5 rounded-2xl border border-blue-100/50 shadow-sm">
                    {getWeatherIcon(weather_code)}
                </div>
            </div>

            {/* Core Metrics */}
            <div className="flex items-end gap-3 mb-5">
                <div className="text-4xl font-black text-gray-900 tracking-tighter">
                    {Math.round(temp)}°
                </div>
                <div className="text-sm font-medium text-gray-600 pb-1.5 capitalize">
                    {description}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 bg-gray-50/80 rounded-xl p-2.5 border border-gray-100">
                    <Droplets className="text-blue-500" size={16} />
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Humidity</p>
                        <p className="text-xs font-bold text-gray-800">{humidity}%</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-50/80 rounded-xl p-2.5 border border-gray-100">
                    <Wind className="text-teal-500" size={16} />
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Wind</p>
                        <p className="text-xs font-bold text-gray-800">{wind_speed} <span className="text-[9px] font-medium text-gray-500">km/h</span></p>
                    </div>
                </div>
            </div>

            {/* Active Alerts */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                <AnimatePresence>
                    {alerts && alerts.length > 0 ? (
                        alerts.map((alert, index) => {
                            let bg = 'bg-gray-50';
                            let border = 'border-gray-200';
                            let text = 'text-gray-800';
                            let icon = <Info size={16} className="text-gray-500 shrink-0 mt-0.5" />;

                            if (alert.type === 'danger') {
                                bg = 'bg-red-50';
                                border = 'border-red-200 shadow-sm';
                                text = 'text-red-900';
                                icon = <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />;
                            } else if (alert.type === 'warning') {
                                bg = 'bg-amber-50';
                                border = 'border-amber-200 shadow-sm';
                                text = 'text-amber-900';
                                icon = <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />;
                            } else if (alert.type === 'success') {
                                bg = 'bg-green-50/50';
                                border = 'border-green-200';
                                text = 'text-green-800';
                            }

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex items-start gap-2.5 p-3 rounded-xl border ${bg} ${border} ${text}`}
                                >
                                    {icon}
                                    <p className="text-xs font-medium leading-relaxed">{alert.message}</p>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-sm text-gray-500">Fetching farm alerts...</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default WeatherAlertsWidget;
