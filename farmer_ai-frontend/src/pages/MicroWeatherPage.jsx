import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CloudRain, Wind, Droplets, Sun, Calendar,
    Navigation, MapPin, ArrowLeft, Umbrella,
    AlertCircle, CheckCircle2, Thermometer
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { weatherApi } from '../services/weatherApi';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const MicroWeatherPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [location, setLocation] = useState({ lat: 28.61, lon: 77.20, name: 'New Delhi' }); // Default

    useEffect(() => {
        // Try to get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        name: 'Current Location'
                    });
                },
                (error) => {
                    console.error("Location access denied, using default.");
                    toast('Using default location (New Delhi)', { icon: '📍' });
                }
            );
        }
    }, []);

    useEffect(() => {
        if (location.lat && location.lon) {
            fetchWeatherData();
        }
    }, [location]);

    const fetchWeatherData = async () => {
        setLoading(true);
        try {
            const [currentRes, forecastRes] = await Promise.all([
                weatherApi.getCurrentWeather(location.lat, location.lon),
                weatherApi.getForecast(location.lat, location.lon)
            ]);

            if (currentRes.data.success) {
                setWeather(currentRes.data.data);
            }
            if (forecastRes.data.success) {
                setForecast(forecastRes.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch weather', error);
            toast.error('Could not load weather data');
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data from forecast (next 24h)
    const chartData = forecast?.list?.slice(0, 8).map(item => ({
        time: new Date(item.dt * 1000).getHours() + ':00',
        temp: Math.round(item.main.temp),
        rain: (item.pop * 100).toFixed(0)
    })) || [];

    const getAdvice = (type) => {
        if (!weather) return null;

        const { et0, sprayCondition } = weather.agriIndices || {};

        if (type === 'irrigation') {
            if (et0 > 5) return { status: 'High', text: 'Significant water loss today. Irrigate this evening.', color: 'text-orange-600', bg: 'bg-orange-50' };
            if (et0 < 2) return { status: 'Low', text: 'Low evaporation. Delay irrigation to save water.', color: 'text-green-600', bg: 'bg-green-50' };
            return { status: 'Moderate', text: 'Standard irrigation schedule recommended.', color: 'text-blue-600', bg: 'bg-blue-50' };
        }

        if (type === 'spray') {
            if (sprayCondition === 'Optimal') return { status: 'Go Ahead', text: 'Wind and humidity are ideal for spraying.', color: 'text-green-600', bg: 'bg-green-50' };
            return { status: 'Avoid', text: 'High wind or rain risk. Spraying may vary.', color: 'text-red-600', bg: 'bg-red-50' };
        }

        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--admin-bg-primary)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--admin-accent)]"></div>
            </div>
        );
    }

    const irrigationAdvice = getAdvice('irrigation');
    const sprayAdvice = getAdvice('spray');

    return (
        <div className="min-h-screen flex admin-layout bg-[var(--admin-bg-primary)]">
            <Sidebar onLogout={logout} />

            <main className="flex-1 md:ml-64 p-6 overflow-y-auto">
                <TopBar user={user} onLogout={logout} />

                <div className="max-w-7xl mx-auto space-y-6 mt-6">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-2 transition-colors">
                                <ArrowLeft size={18} /> Back
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900">Micro Weather Intelligence</h1>
                            <p className="text-gray-500 flex items-center gap-2 mt-1">
                                <MapPin size={16} /> {weather?.name || location.name}
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Live Updates</span>
                            </p>
                        </div>
                        <div className="text-right hidden md:block">
                            <h2 className="text-4xl font-bold text-gray-900">{Math.round(weather?.main?.temp)}°C</h2>
                            <p className="text-gray-500 capitalize">{weather?.weather?.[0]?.description}</p>
                        </div>
                    </div>

                    {/* Main Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-gray-500 text-sm">Humidity</span>
                                <Droplets size={20} className="text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">{weather?.main?.humidity}%</h3>
                            <p className="text-xs text-gray-400 mt-1">Dew Point: {Math.round(weather?.main?.temp_min)}°</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-gray-500 text-sm">Wind Speed</span>
                                <Wind size={20} className="text-teal-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">{weather?.wind?.speed} m/s</h3>
                            <p className="text-xs text-gray-400 mt-1">Direction: {weather?.wind?.deg}°</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-gray-500 text-sm">Soil Moisture (Est)</span>
                                <Sun size={20} className="text-amber-500" />
                            </div>
                            {/* Improved Mock/Calc Display */}
                            <h3 className="text-2xl font-bold text-gray-900">
                                {weather?.main?.humidity > 60 ? 'High' : 'Moderate'}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">Evaporation: {weather?.agriIndices?.et0} mm/day</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-gray-500 text-sm">Precipitation</span>
                                <CloudRain size={20} className="text-indigo-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">{forecast?.list?.[0]?.pop * 100}%</h3>
                            <p className="text-xs text-gray-400 mt-1">Next 3 hours</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* 24h Trend Chart */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-900">24-Hour Temperature Trend</h3>
                                <div className="flex gap-2">
                                    <span className="flex items-center gap-1 text-xs text-gray-500"><div className="w-3 h-3 bg-[var(--admin-accent)] rounded-full"></div> Temp</span>
                                </div>
                            </div>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--admin-accent)" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="var(--admin-accent)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="temp" stroke="var(--admin-accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Smart Agri-Advisory Column */}
                        <div className="space-y-4">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-[var(--admin-accent)]" />
                                    Smart Actions
                                </h3>

                                {/* Irrigation Card */}
                                <div className={`p-4 rounded-xl mb-3 border ${irrigationAdvice?.bg} ${irrigationAdvice?.color === 'text-orange-600' ? 'border-orange-100' : 'border-blue-100'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-sm uppercase tracking-wide">Irrigation</span>
                                        <Droplets size={16} />
                                    </div>
                                    <h4 className={`text-lg font-bold mb-1 ${irrigationAdvice?.color}`}>{irrigationAdvice?.status} Priority</h4>
                                    <p className="text-sm text-gray-700 leading-snug">{irrigationAdvice?.text}</p>
                                </div>

                                {/* Spraying Card */}
                                <div className={`p-4 rounded-xl border ${sprayAdvice?.bg} ${sprayAdvice?.color === 'text-red-600' ? 'border-red-100' : 'border-green-100'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-sm uppercase tracking-wide">Spraying</span>
                                        <Umbrella size={16} />
                                    </div>
                                    <h4 className={`text-lg font-bold mb-1 ${sprayAdvice?.color}`}>{sprayAdvice?.status}</h4>
                                    <p className="text-sm text-gray-700 leading-snug">{sprayAdvice?.text}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5 Day Forecast List */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">5-Day Outlook</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {forecast?.list?.filter((_, i) => i % 8 === 0).slice(0, 5).map((day, i) => ( // Take 1 reading per day approx
                                <div key={i} className="text-center p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <p className="text-sm font-medium text-gray-500 mb-2">
                                        {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                                    </p>
                                    <div className="w-10 h-10 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-2 text-2xl">
                                        {day.weather[0].main === 'Rain' ? '🌧️' : (day.weather[0].main === 'Clouds' ? '☁️' : '☀️')}
                                    </div>
                                    <p className="font-bold text-gray-900">{Math.round(day.main.temp_max)}° <span className="text-gray-400 text-sm">/ {Math.round(day.main.temp_min)}°</span></p>
                                    <p className="text-xs text-blue-500 mt-1 font-medium">{Math.round(day.pop * 100)}% Rain</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default MicroWeatherPage;
