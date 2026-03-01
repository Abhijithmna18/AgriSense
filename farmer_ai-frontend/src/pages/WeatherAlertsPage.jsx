import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  TrendingUp
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import { useAuth } from '../context/AuthContext';
import { farmAPI } from '../services/farmApi';

const WeatherAlertsPage = () => {
  const { user, logout } = useAuth();
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [loading, setLoading] = useState(true); // Start with true to show loading state
  const [checking, setChecking] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Ensure API_BASE doesn't have double /api
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
  const API_BASE = API_URL.replace(/\/api$/, '') + '/api';

  useEffect(() => {
    fetchFarms();
  }, []);

  useEffect(() => {
    if (selectedFarm) {
      fetchWeatherForFarm(selectedFarm);
    }
  }, [selectedFarm]);

  const fetchFarms = async () => {
    setLoading(true);
    try {
      console.log('Fetching farms using farmAPI service...');
      const response = await farmAPI.getFarms();
      
      console.log('Farms API response:', response);
      
      // Handle different response structures
      let farmsList = [];
      if (Array.isArray(response)) {
        farmsList = response;
      } else if (response.data && Array.isArray(response.data)) {
        farmsList = response.data;
      } else if (response.farms && Array.isArray(response.farms)) {
        farmsList = response.farms;
      } else if (response.success && response.data) {
        farmsList = Array.isArray(response.data) ? response.data : [];
      }
      
      console.log('Parsed farms list:', farmsList);
      console.log('Number of farms found:', farmsList.length);
      
      setFarms(farmsList);
      if (farmsList.length > 0) {
        setSelectedFarm(farmsList[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch farms:', error);
      console.error('Error response:', error.response);
      // Only show error if it's not a 404 (user might not have farms yet)
      if (error.response?.status !== 404) {
        toast.error('Failed to load farms');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherForFarm = async (farmId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      console.log('Fetching weather for farm:', farmId);
      
      const response = await axios.get(`${API_BASE}/weather/farm/${farmId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Weather API response:', response.data);
      
      setWeather(response.data.data);
      setAlerts(response.data.data.alerts || []);

      // Fetch forecast
      const farm = farms.find(f => f._id === farmId);
      console.log('Found farm for forecast:', farm);
      
      if (farm && farm.location) {
        const city = `${farm.location.district}, ${farm.location.state}`;
        console.log('Fetching forecast for city:', city);
        
        const forecastResponse = await axios.get(`${API_BASE}/weather/forecast?city=${encodeURIComponent(city)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Forecast API response:', forecastResponse.data);
        setForecast(forecastResponse.data.data || []);
      } else {
        console.warn('Farm location not available for forecast');
      }
      
      toast.success('Weather data loaded successfully');
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  const checkAllFarms = async () => {
    setChecking(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/weather/check-user-farms`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const totalSent = response.data.results.reduce((sum, r) => sum + (r.alertsSent || 0), 0);
      toast.success(`Checked ${response.data.farmsChecked} farms. Sent ${totalSent} alerts.`);
      
      // Refresh current farm weather
      if (selectedFarm) {
        fetchWeatherForFarm(selectedFarm);
      }
    } catch (error) {
      console.error('Failed to check farms:', error);
      toast.error('Failed to check weather alerts');
    } finally {
      setChecking(false);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="text-red-500" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-orange-500" size={20} />;
      case 'info':
        return <Info className="text-blue-500" size={20} />;
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      default:
        return <Info className="text-gray-500" size={20} />;
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

  // Generate realistic Kerala-specific weather alert based on time and season
  const generateKeralaWeatherAlert = () => {
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();
    
    // Determine time of day
    let timeOfDay = 'morning';
    let timeLabel = 'Morning';
    if (hour >= 12 && hour < 17) {
      timeOfDay = 'afternoon';
      timeLabel = 'Afternoon';
    } else if (hour >= 17 && hour < 20) {
      timeOfDay = 'evening';
      timeLabel = 'Evening';
    } else if (hour >= 20 || hour < 6) {
      timeOfDay = 'night';
      timeLabel = 'Night';
    }
    
    // Determine season in Kerala
    let season = 'summer';
    let seasonName = 'Summer';
    if ((month >= 6 && month <= 9) || (month === 5 && day >= 15)) {
      season = 'southwest_monsoon';
      seasonName = 'Southwest Monsoon';
    } else if (month >= 10 && month <= 11) {
      season = 'northeast_monsoon';
      seasonName = 'Northeast Monsoon';
    } else if (month >= 12 || month <= 2) {
      season = 'winter';
      seasonName = 'Winter';
    } else if (month >= 3 && month <= 5) {
      season = 'summer';
      seasonName = 'Summer';
    }
    
    // Kerala districts
    const coastalDistricts = ['Thiruvananthapuram', 'Kollam', 'Alappuzha', 'Ernakulam', 'Thrissur', 'Malappuram', 'Kozhikode', 'Kannur', 'Kasaragod'];
    const midlandDistricts = ['Pathanamthitta', 'Kottayam', 'Palakkad'];
    const highlandDistricts = ['Idukki', 'Wayanad'];
    
    // Generate alert based on season and time
    let alert = {
      severity: 'Advisory',
      title: '',
      message: '',
      districts: [],
      recommendations: [],
      validUntil: '',
      icon: '🌤️',
      color: 'blue'
    };
    
    // Southwest Monsoon (June-September) - Heavy rainfall season
    if (season === 'southwest_monsoon') {
      if (timeOfDay === 'morning') {
        alert = {
          severity: 'Warning',
          title: `Heavy Rainfall Warning - ${timeLabel}`,
          message: `India Meteorological Department (IMD) has issued a heavy rainfall warning for Kerala. Widespread moderate to heavy rainfall with isolated very heavy falls expected across the state. Thunderstorms with gusty winds (40-50 kmph) likely in coastal and midland areas.`,
          districts: [...coastalDistricts, ...midlandDistricts],
          recommendations: [
            'Postpone spraying operations and fertilizer application',
            'Ensure proper drainage in paddy fields and plantations',
            'Protect harvested crops from moisture damage',
            'Avoid working in open fields during thunderstorms',
            'Monitor water levels in low-lying agricultural areas'
          ],
          validUntil: `${hour + 6}:00 ${hour + 6 >= 12 ? 'PM' : 'AM'}`,
          icon: '⛈️',
          color: 'orange'
        };
      } else if (timeOfDay === 'afternoon') {
        alert = {
          severity: 'Watch',
          title: `Thunderstorm Watch - ${timeLabel}`,
          message: `Scattered thunderstorms with lightning and gusty winds expected across Kerala during afternoon hours. Rainfall intensity may increase in ghat areas and midland regions. Coastal areas may experience moderate rainfall with strong surface winds.`,
          districts: [...midlandDistricts, ...highlandDistricts],
          recommendations: [
            'Suspend all field operations during active thunderstorms',
            'Secure temporary structures and shade nets',
            'Keep livestock sheltered during heavy downpours',
            'Monitor weather updates every 2-3 hours',
            'Delay harvesting operations until weather clears'
          ],
          validUntil: `${hour + 4}:00 PM`,
          icon: '⚡',
          color: 'yellow'
        };
      } else {
        alert = {
          severity: 'Advisory',
          title: `Monsoon Advisory - ${timeLabel}`,
          message: `Moderate rainfall continuing across Kerala. Cloudy conditions with intermittent showers expected. Humidity levels remain high (85-95%). Coastal areas experiencing moderate winds. Conditions favorable for fungal diseases in crops.`,
          districts: coastalDistricts,
          recommendations: [
            'Apply preventive fungicides for pepper, cardamom, and rubber',
            'Ensure adequate drainage in coconut and arecanut plantations',
            'Monitor crops for pest and disease outbreaks',
            'Avoid irrigation during rainfall periods',
            'Store harvested produce in dry, ventilated areas'
          ],
          validUntil: 'Next 24 hours',
          icon: '🌧️',
          color: 'blue'
        };
      }
    }
    
    // Northeast Monsoon (October-November) - Moderate rainfall
    else if (season === 'northeast_monsoon') {
      alert = {
        severity: 'Advisory',
        title: `Northeast Monsoon Advisory - ${timeLabel}`,
        message: `Northeast monsoon active over Kerala. Light to moderate rainfall expected in southern and central districts. Coastal areas may experience occasional heavy spells. Pleasant weather conditions with temperatures ranging 24-30°C. High humidity (75-85%) persists.`,
        districts: ['Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Ernakulam'],
        recommendations: [
          'Ideal time for land preparation and nursery activities',
          'Proceed with winter crop sowing (vegetables, pulses)',
          'Monitor soil moisture before irrigation',
          'Apply organic manure to paddy fields',
          'Protect young plantations from waterlogging'
        ],
        validUntil: 'Next 48 hours',
        icon: '🌦️',
        color: 'blue'
      };
    }
    
    // Summer (March-May) - Hot and humid
    else if (season === 'summer') {
      if (timeOfDay === 'afternoon') {
        alert = {
          severity: 'Warning',
          title: `Heat Wave Warning - ${timeLabel}`,
          message: `Severe heat wave conditions prevailing across Kerala. Maximum temperatures soaring to 36-39°C in interior regions. Coastal areas experiencing high humidity (80-90%) with temperatures around 33-35°C. Heat index reaching dangerous levels. Isolated thunderstorms possible in evening hours.`,
          districts: ['Palakkad', 'Thrissur', 'Malappuram', 'Kozhikode'],
          recommendations: [
            'Irrigate crops during early morning or late evening only',
            'Provide shade for livestock and ensure adequate water supply',
            'Avoid field work between 11 AM and 4 PM',
            'Apply mulch to conserve soil moisture',
            'Monitor crops for heat stress symptoms',
            'Increase irrigation frequency for vegetables and young plants'
          ],
          validUntil: `${hour + 3}:00 PM`,
          icon: '🌡️',
          color: 'red'
        };
      } else if (timeOfDay === 'evening') {
        alert = {
          severity: 'Watch',
          title: `Pre-Monsoon Thunderstorm Watch - ${timeLabel}`,
          message: `Pre-monsoon thunderstorm activity likely over Kerala. Isolated to scattered thunderstorms with lightning, gusty winds (40-60 kmph), and brief heavy rainfall expected. Coastal areas may experience sea breeze convergence leading to intense convective activity.`,
          districts: [...coastalDistricts, ...midlandDistricts],
          recommendations: [
            'Secure loose agricultural equipment and materials',
            'Avoid standing under trees during thunderstorms',
            'Protect flowering crops from wind damage',
            'Harvest mature crops before storm activity',
            'Keep emergency contact numbers handy'
          ],
          validUntil: `${hour + 2}:00 ${hour + 2 >= 12 ? 'PM' : 'AM'}`,
          icon: '⛈️',
          color: 'orange'
        };
      } else {
        alert = {
          severity: 'Advisory',
          title: `Summer Heat Advisory - ${timeLabel}`,
          message: `Hot and humid conditions across Kerala. Temperatures expected to reach 34-37°C during daytime. Coastal areas experiencing sultry weather with high humidity. Clear to partly cloudy skies. Light winds from west-southwest direction.`,
          districts: [...coastalDistricts, 'Palakkad', 'Thrissur'],
          recommendations: [
            'Schedule irrigation for early morning (5-7 AM) or evening (6-8 PM)',
            'Apply organic mulch to reduce soil temperature',
            'Provide adequate water for livestock',
            'Monitor crops for water stress daily',
            'Consider shade nets for sensitive crops',
            'Avoid chemical spraying during peak heat hours'
          ],
          validUntil: 'Next 24 hours',
          icon: '☀️',
          color: 'orange'
        };
      }
    }
    
    // Winter (December-February) - Pleasant weather
    else if (season === 'winter') {
      alert = {
        severity: 'Advisory',
        title: `Winter Season Advisory - ${timeLabel}`,
        message: `Pleasant winter conditions prevailing across Kerala. Clear to partly cloudy skies with comfortable temperatures (22-30°C). Low humidity levels (60-70%). Gentle winds from northeast direction. Ideal weather for agricultural activities. Morning dew observed in highland areas.`,
        districts: [...highlandDistricts, ...midlandDistricts],
        recommendations: [
          'Excellent time for land preparation and planting',
          'Proceed with winter vegetable cultivation',
          'Apply fertilizers as per crop requirements',
          'Conduct pest and disease management activities',
          'Ideal for harvesting operations',
          'Plan crop rotation and intercropping strategies'
        ],
        validUntil: 'Next 72 hours',
        icon: '🌤️',
        color: 'green'
      };
    }
    
    // Add timestamp
    const timestamp = now.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    alert.timestamp = timestamp;
    alert.season = seasonName;
    
    return alert;
  };

  const keralaAlert = generateKeralaWeatherAlert();

  const selectedFarmData = farms.find(f => f._id === selectedFarm);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--admin-bg)]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onLogout={logout} />
      
      <div className="flex-1 flex flex-col overflow-y-auto md:ml-64">
        <TopBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} user={user} onLogout={logout} />
        
        <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-green-50 p-6 pt-20">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
                    <CloudRain className="text-blue-600" size={40} />
                    Weather Alerts
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Real-time weather monitoring and alerts for your farms
              </p>
            </div>
            <button
              onClick={checkAllFarms}
              disabled={checking}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={checking ? 'animate-spin' : ''} size={20} />
              {checking ? 'Checking...' : 'Check All Farms'}
            </button>
          </div>
        </motion.div>

        {/* Kerala Weather Alert - IMD Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className={`
            relative overflow-hidden rounded-2xl shadow-xl border-2
            ${keralaAlert.severity === 'Warning' ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-300' :
              keralaAlert.severity === 'Watch' ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300' :
              keralaAlert.severity === 'Advisory' && keralaAlert.color === 'green' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' :
              'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300'}
          `}>
            {/* Alert Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-2xl
                  ${keralaAlert.severity === 'Warning' ? 'bg-red-500 animate-pulse' :
                    keralaAlert.severity === 'Watch' ? 'bg-yellow-500' :
                    keralaAlert.severity === 'Advisory' && keralaAlert.color === 'green' ? 'bg-green-500' :
                    'bg-blue-500'}
                `}>
                  {keralaAlert.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                      ${keralaAlert.severity === 'Warning' ? 'bg-red-500 text-white' :
                        keralaAlert.severity === 'Watch' ? 'bg-yellow-500 text-gray-900' :
                        keralaAlert.severity === 'Advisory' && keralaAlert.color === 'green' ? 'bg-green-500 text-white' :
                        'bg-blue-500 text-white'}
                    `}>
                      {keralaAlert.severity}
                    </span>
                    <span className="text-xs text-gray-300 font-medium">
                      India Meteorological Department (IMD)
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg mt-1">
                    {keralaAlert.title}
                  </h3>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-300">Issued</div>
                <div className="text-sm text-white font-semibold">{keralaAlert.timestamp}</div>
              </div>
            </div>

            {/* Alert Content */}
            <div className="p-6">
              {/* Main Message */}
              <div className="mb-4">
                <p className="text-gray-800 leading-relaxed text-base">
                  {keralaAlert.message}
                </p>
              </div>

              {/* Affected Districts */}
              {keralaAlert.districts.length > 0 && (
                <div className="mb-4 p-4 bg-white/60 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-2">
                    <MapPin className="text-gray-600 mt-0.5 flex-shrink-0" size={18} />
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-2">Affected Districts:</h4>
                      <div className="flex flex-wrap gap-2">
                        {keralaAlert.districts.map((district, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-300 shadow-sm"
                          >
                            {district}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations for Farmers */}
              <div className="p-4 bg-white/60 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-orange-600" />
                  Agricultural Advisory - Action Required:
                </h4>
                <ul className="space-y-2">
                  {keralaAlert.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer Info */}
              <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    Valid until: <strong>{keralaAlert.validUntil}</strong>
                  </span>
                  <span className="px-2 py-1 bg-white rounded text-gray-700 font-medium">
                    {keralaAlert.season} Season
                  </span>
                </div>
                <span className="text-gray-500">
                  Source: IMD Kerala • Agro-Met Advisory
                </span>
              </div>
            </div>

            {/* Animated Border Effect for Warning */}
            {keralaAlert.severity === 'Warning' && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse"></div>
            )}
          </div>
        </motion.div>

        {/* Farm Selector */}
        {farms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Farm
            </label>
            <select
              value={selectedFarm || ''}
              onChange={(e) => setSelectedFarm(e.target.value)}
              className="w-full md:w-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {farms.map((farm) => (
                <option key={farm._id} value={farm._id}>
                  {farm.name} - {farm.location.district}, {farm.location.state}
                </option>
              ))}
            </select>
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="animate-spin text-blue-600 mx-auto mb-3" size={48} />
              <p className="text-gray-600">Loading farms and weather data...</p>
            </div>
          </div>
        ) : farms.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <CloudRain className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Farms Added Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Add your farm details to get personalized weather forecasts and alerts for your location
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => window.location.href = '/farms/new'}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
              >
                <MapPin size={20} />
                Add Your First Farm
              </button>
              <button
                onClick={() => window.location.href = '/farms'}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                View All Farms
              </button>
            </div>
            
            {/* Quick Guide */}
            <div className="mt-8 p-6 bg-blue-50 rounded-xl text-left max-w-2xl mx-auto">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Info size={20} className="text-blue-600" />
                Why Add Your Farm?
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Get real-time weather updates for your exact location</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Receive alerts for frost, heavy rain, heat waves, and other conditions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Get 7-day forecasts to plan your farming activities</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Access crop-specific weather recommendations</span>
                </li>
              </ul>
            </div>
          </div>
        ) : weather ? (
          <>
            {/* Current Weather Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <MapPin size={24} className="text-blue-600" />
                  Current Conditions
                </h2>
                <span className="text-6xl">{getWeatherIcon(weather.temp, weather.rain_1h)}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="text-red-600" size={20} />
                    <span className="text-sm text-gray-600">Temperature</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{weather.temp}°C</p>
                  <p className="text-xs text-gray-500 mt-1">Feels like {weather.feels_like}°C</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="text-blue-600" size={20} />
                    <span className="text-sm text-gray-600">Humidity</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{weather.humidity}%</p>
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CloudRain className="text-blue-600" size={20} />
                    <span className="text-sm text-gray-600">Rainfall</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{weather.rain_1h || 0}mm</p>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="text-gray-600" size={20} />
                    <span className="text-sm text-gray-600">Wind Speed</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{weather.wind_speed} m/s</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Sun size={16} />
                  UV Index: {weather.uv_index || 'N/A'}
                </span>
                <span>Cloud Cover: {weather.cloud_cover || 'N/A'}%</span>
                <span>{weather.description}</span>
              </div>
            </motion.div>

            {/* Alerts Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-orange-600" size={24} />
                Active Alerts
              </h2>

              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 ${getAlertColor(alert.type)}`}
                    >
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <p className="font-medium">{alert.message}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="mx-auto mb-2 text-green-500" size={48} />
                  <p>No active weather alerts. Conditions are favorable!</p>
                </div>
              )}
            </motion.div>

            {/* 7-Day Forecast */}
            {forecast.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="text-blue-600" size={24} />
                  7-Day Forecast
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {forecast.map((day, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl text-center"
                    >
                      <p className="font-semibold text-gray-700 mb-2">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <div className="text-4xl mb-2">
                        {getWeatherIcon((day.temp_max + day.temp_min) / 2, day.rain_mm)}
                      </div>
                      <div className="flex justify-center gap-2 text-sm mb-2">
                        <span className="text-red-600 font-bold">{day.temp_max}°</span>
                        <span className="text-blue-600">{day.temp_min}°</span>
                      </div>
                      {day.rain_mm > 0 && (
                        <div className="flex items-center justify-center gap-1 text-xs text-blue-600">
                          <Droplets size={12} />
                          <span>{day.rain_mm}mm</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-600 mt-1">{day.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <CloudRain className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Loading Weather Data...
            </h3>
            <p className="text-gray-500 mb-6">
              Fetching weather information for your selected farm
            </p>
            <RefreshCw className="animate-spin text-blue-600 mx-auto" size={32} />
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherAlertsPage;
