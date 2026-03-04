import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudRain,
  Thermometer,
  Wind,
  Droplets,
  Sun,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const WeatherAlertsWidget = ({ farmId, farmLocation }) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5002') + '/api';

  useEffect(() => {
    if (farmId && farmLocation) {
      fetchWeatherForFarm();
    }
  }, [farmId, farmLocation]);

  const fetchWeatherForFarm = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');

      // Fetch current weather
      const response = await axios.get(`${API_BASE}/weather/farm/${farmId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setWeather(response.data.data);
      setAlerts(response.data.data.alerts || []);

      // Fetch forecast - handle different location formats
      if (farmLocation) {
        let city = '';

        // Try different location formats
        if (farmLocation.district && farmLocation.state) {
          city = `${farmLocation.district}, ${farmLocation.state}`;
        } else if (farmLocation.city && farmLocation.state) {
          city = `${farmLocation.city}, ${farmLocation.state}`;
        } else if (farmLocation.name) {
          city = farmLocation.name;
        }

        if (city) {
          const forecastResponse = await axios.get(`${API_BASE}/weather/forecast?city=${encodeURIComponent(city)}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setForecast(forecastResponse.data.data?.slice(0, 5) || []); // Show only 5 days
        }
      }
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      setError(error.response?.data?.message || 'Unable to load weather data');
      // Don't show error toast, just set error state
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="text-red-500" size={18} />;
      case 'warning':
        return <AlertTriangle className="text-orange-500" size={18} />;
      case 'info':
        return <Info className="text-blue-500" size={18} />;
      case 'success':
        return <CheckCircle className="text-green-500" size={18} />;
      default:
        return <Info className="text-gray-500" size={18} />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'danger':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getWeatherIcon = (temp, rain) => {
    if (rain > 0) return '🌧️';
    if (temp > 35) return '☀️';
    if (temp < 10) return '❄️';
    return '⛅';
  };

  // Generate Kerala-specific weather alert
  const generateKeralaWeatherAlert = () => {
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth() + 1;

    let timeOfDay = 'morning';
    if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 20) timeOfDay = 'evening';
    else if (hour >= 20 || hour < 6) timeOfDay = 'night';

    let season = 'summer';
    if ((month >= 6 && month <= 9)) season = 'southwest_monsoon';
    else if (month >= 10 && month <= 11) season = 'northeast_monsoon';
    else if (month >= 12 || month <= 2) season = 'winter';

    const alerts = {
      southwest_monsoon: {
        morning: {
          severity: 'Warning',
          title: 'Heavy Rainfall Warning',
          message: 'Heavy rainfall expected. Postpone spraying and ensure proper drainage.',
          icon: '⛈️',
          color: 'orange'
        }
      },
      summer: {
        afternoon: {
          severity: 'Warning',
          title: 'Heat Wave Warning',
          message: 'High temperatures expected. Irrigate during early morning or evening only.',
          icon: '🌡️',
          color: 'red'
        }
      },
      winter: {
        morning: {
          severity: 'Advisory',
          title: 'Pleasant Weather',
          message: 'Ideal conditions for agricultural activities and planting.',
          icon: '🌤️',
          color: 'green'
        }
      }
    };

    return alerts[season]?.[timeOfDay] || {
      severity: 'Advisory',
      title: 'Weather Update',
      message: 'Monitor weather conditions regularly for optimal farming.',
      icon: '🌤️',
      color: 'blue'
    };
  };

  const keralaAlert = generateKeralaWeatherAlert();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--admin-border)] p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <RefreshCw className="animate-spin text-blue-600 mx-auto mb-2" size={32} />
            <p className="text-sm text-gray-500">Loading weather data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show Kerala alert even if weather data fails to load
  if (error || !weather) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--admin-border)] shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-[var(--admin-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <CloudRain className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--admin-text-primary)]">Weather Alerts</h3>
              <p className="text-sm text-[var(--admin-text-secondary)]">Real-time conditions</p>
            </div>
          </div>
        </div>

        {/* Kerala Alert - Always Show */}
        <div className="p-4 border-b border-[var(--admin-border)]">
          <div className={`
            rounded-xl p-4 border-2
            ${keralaAlert.color === 'red' ? 'bg-red-50 border-red-200' :
              keralaAlert.color === 'orange' ? 'bg-orange-50 border-orange-200' :
                keralaAlert.color === 'green' ? 'bg-green-50 border-green-200' :
                  'bg-blue-50 border-blue-200'}
          `}>
            <div className="flex items-start gap-3">
              <div className="text-2xl">{keralaAlert.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs font-bold uppercase
                    ${keralaAlert.color === 'red' ? 'bg-red-500 text-white' :
                      keralaAlert.color === 'orange' ? 'bg-orange-500 text-white' :
                        keralaAlert.color === 'green' ? 'bg-green-500 text-white' :
                          'bg-blue-500 text-white'}
                  `}>
                    {keralaAlert.severity}
                  </span>
                </div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">{keralaAlert.title}</h4>
                <p className="text-xs text-gray-700">{keralaAlert.message}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
              <Info className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
              <div className="text-xs text-yellow-800">
                <p className="font-semibold mb-1">Weather data temporarily unavailable</p>
                <p>Showing general Kerala weather advisory. Detailed forecast will load when available.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[var(--admin-border)] shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-[var(--admin-border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <CloudRain className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--admin-text-primary)]">Weather Alerts</h3>
              <p className="text-sm text-[var(--admin-text-secondary)]">Real-time conditions</p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Kerala Alert - Always Visible */}
      <div className="p-4 border-b border-[var(--admin-border)]">
        <div className={`
          rounded-xl p-4 border-2
          ${keralaAlert.color === 'red' ? 'bg-red-50 border-red-200' :
            keralaAlert.color === 'orange' ? 'bg-orange-50 border-orange-200' :
              keralaAlert.color === 'green' ? 'bg-green-50 border-green-200' :
                'bg-blue-50 border-blue-200'}
        `}>
          <div className="flex items-start gap-3">
            <div className="text-2xl">{keralaAlert.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-bold uppercase
                  ${keralaAlert.color === 'red' ? 'bg-red-500 text-white' :
                    keralaAlert.color === 'orange' ? 'bg-orange-500 text-white' :
                      keralaAlert.color === 'green' ? 'bg-green-500 text-white' :
                        'bg-blue-500 text-white'}
                `}>
                  {keralaAlert.severity}
                </span>
              </div>
              <h4 className="font-bold text-gray-800 text-sm mb-1">{keralaAlert.title}</h4>
              <p className="text-xs text-gray-700">{keralaAlert.message}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Weather - Compact View */}
      {weather && (
        <div className="p-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Temp</div>
              <div className="flex items-center justify-center gap-1">
                <Thermometer size={14} className="text-red-500" />
                <span className="font-bold text-gray-800">{weather.temp}°C</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Humidity</div>
              <div className="flex items-center justify-center gap-1">
                <Droplets size={14} className="text-blue-500" />
                <span className="font-bold text-gray-800">{weather.humidity}%</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Rain</div>
              <div className="flex items-center justify-center gap-1">
                <CloudRain size={14} className="text-blue-500" />
                <span className="font-bold text-gray-800">{weather.rain_1h || 0}mm</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Wind</div>
              <div className="flex items-center justify-center gap-1">
                <Wind size={14} className="text-gray-500" />
                <span className="font-bold text-gray-800">{weather.wind_speed}m/s</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[var(--admin-border)]"
          >
            {/* Active Alerts */}
            {alerts.length > 0 && (
              <div className="p-4 border-b border-[var(--admin-border)]">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Active Alerts</h4>
                <div className="space-y-2">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-2 p-3 rounded-lg border ${getAlertColor(alert.type)}`}
                    >
                      {getAlertIcon(alert.type)}
                      <p className="text-sm flex-1">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5-Day Forecast */}
            {forecast.length > 0 && (
              <div className="p-4">
                <h4 className="text-sm font-bold text-gray-700 mb-3">5-Day Forecast</h4>
                <div className="grid grid-cols-5 gap-2">
                  {forecast.map((day, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded-lg text-center">
                      <p className="text-xs font-semibold text-gray-600 mb-1">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <div className="text-2xl mb-1">
                        {getWeatherIcon((day.temp_max + day.temp_min) / 2, day.rain_mm)}
                      </div>
                      <div className="flex justify-center gap-1 text-xs">
                        <span className="text-red-600 font-bold">{day.temp_max}°</span>
                        <span className="text-blue-600">{day.temp_min}°</span>
                      </div>
                      {day.rain_mm > 0 && (
                        <div className="flex items-center justify-center gap-1 text-xs text-blue-600 mt-1">
                          <Droplets size={10} />
                          <span>{day.rain_mm}mm</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WeatherAlertsWidget;
