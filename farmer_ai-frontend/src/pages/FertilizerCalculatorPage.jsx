import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sprout,
  Calculator,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  RefreshCw,
  MapPin,
  Calendar,
  DollarSign,
  Leaf,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import { useAuth } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const FertilizerCalculatorPage = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Form state
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [acres, setAcres] = useState('');
  
  // Data state
  const [soilData, setSoilData] = useState(null);
  const [calculation, setCalculation] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [errors, setErrors] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
  const API_BASE = API_URL.replace(/\/api$/, '') + '/api';

  useEffect(() => {
    fetchFarms();
    fetchCrops();
  }, []);

  useEffect(() => {
    if (selectedFarm) {
      fetchSoilData(selectedFarm);
    }
  }, [selectedFarm]);

  const fetchFarms = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/fertilizer-calculator/farms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFarms(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch farms:', error);
      toast.error('Failed to load farms');
    }
  };

  const fetchCrops = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/fertilizer-calculator/crops`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCrops(response.data.data.crops || []);
    } catch (error) {
      console.error('Failed to fetch crops:', error);
      toast.error('Failed to load crops');
    }
  };

  const fetchSoilData = async (farmId) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/fertilizer-calculator/soil-data/${farmId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSoilData(response.data.data.soilTest);
      setErrors(prev => ({ ...prev, soilTest: null }));
    } catch (error) {
      console.error('Failed to fetch soil data:', error);
      if (error.response?.status === 404 || error.response?.data?.requiresSoilTest) {
        setErrors(prev => ({ 
          ...prev, 
          soilTest: error.response?.data?.message || 'No soil test data found for this farm. Please conduct a soil test first.'
        }));
        setSoilData(null);
      } else {
        // Don't show error for other cases, just log it
        console.warn('Soil data fetch failed:', error.response?.data);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedFarm) {
      newErrors.farm = 'Please select a farm';
    }

    if (!selectedCrop) {
      newErrors.crop = 'Please select a crop';
    }

    if (!acres || acres.trim() === '') {
      newErrors.acres = 'Please enter farm area';
    } else if (isNaN(acres) || parseFloat(acres) <= 0) {
      newErrors.acres = 'Please enter a valid positive number';
    } else if (parseFloat(acres) > 10000) {
      newErrors.acres = 'Area seems unrealistic. Please verify.';
    }

    if (!soilData) {
      newErrors.soilTest = 'Soil test data is required for this farm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before calculating');
      return;
    }

    setCalculating(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE}/fertilizer-calculator/calculate`,
        {
          farmId: selectedFarm,
          cropName: selectedCrop,
          acres: parseFloat(acres)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setCalculation(response.data.data);
      toast.success('Fertilizer requirement calculated successfully!');
    } catch (error) {
      console.error('Calculation failed:', error);
      toast.error(error.response?.data?.message || 'Failed to calculate fertilizer requirement');
    } finally {
      setCalculating(false);
    }
  };

  const handleReset = () => {
    setSelectedFarm('');
    setSelectedCrop('');
    setAcres('');
    setSoilData(null);
    setCalculation(null);
    setErrors({});
  };

  // Prepare chart data
  const getChartData = () => {
    if (!calculation) return [];

    return [
      {
        nutrient: 'Nitrogen (N)',
        'Soil Available': calculation.soilStatus.nitrogen,
        'Crop Required': calculation.cropRequirement.nitrogen,
        'Deficit': calculation.nutrientDeficit.nitrogen
      },
      {
        nutrient: 'Phosphorus (P)',
        'Soil Available': calculation.soilStatus.phosphorus,
        'Crop Required': calculation.cropRequirement.phosphorus,
        'Deficit': calculation.nutrientDeficit.phosphorus
      },
      {
        nutrient: 'Potassium (K)',
        'Soil Available': calculation.soilStatus.potassium,
        'Crop Required': calculation.cropRequirement.potassium,
        'Deficit': calculation.nutrientDeficit.potassium
      }
    ];
  };

  const selectedFarmData = farms.find(f => f._id === selectedFarm);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--admin-bg)]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onLogout={logout} />
      
      <div className="flex-1 flex flex-col overflow-y-auto md:ml-64">
        <TopBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} user={user} onLogout={logout} />
        
        <div className="flex-1 bg-gradient-to-br from-green-50 via-white to-blue-50 p-6 pt-20">
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
                    <Calculator className="text-green-600" size={40} />
                    Fertilizer Calculator
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Calculate precise fertilizer requirements based on soil test data
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Input Form */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-6 sticky top-24"
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Sprout className="text-green-600" size={24} />
                    Input Details
                  </h2>

                  {/* Farm Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Farm *
                    </label>
                    <select
                      value={selectedFarm}
                      onChange={(e) => setSelectedFarm(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.farm ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Choose a farm...</option>
                      {farms.map((farm) => (
                        <option key={farm._id} value={farm._id}>
                          {farm.name} {!farm.hasSoilTest && '(No soil test)'}
                        </option>
                      ))}
                    </select>
                    {errors.farm && (
                      <p className="text-red-500 text-sm mt-1">{errors.farm}</p>
                    )}
                  </div>

                  {/* Soil Data Display */}
                  {selectedFarm && soilData && (
                    <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                      <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <CheckCircle size={16} />
                        Soil Test Data Available
                      </h3>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">N</p>
                          <p className="font-bold text-gray-800">{soilData.nitrogen} kg/acre</p>
                        </div>
                        <div>
                          <p className="text-gray-600">P</p>
                          <p className="font-bold text-gray-800">{soilData.phosphorus} kg/acre</p>
                        </div>
                        <div>
                          <p className="text-gray-600">K</p>
                          <p className="font-bold text-gray-800">{soilData.potassium} kg/acre</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {errors.soilTest && (
                    <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-red-800 text-sm flex items-start gap-2">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        {errors.soilTest}
                      </p>
                    </div>
                  )}

                  {/* Crop Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Crop *
                    </label>
                    <select
                      value={selectedCrop}
                      onChange={(e) => setSelectedCrop(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.crop ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Choose a crop...</option>
                      {crops.map((crop) => (
                        <option key={crop.id} value={crop.id}>
                          {crop.name} ({crop.category})
                        </option>
                      ))}
                    </select>
                    {errors.crop && (
                      <p className="text-red-500 text-sm mt-1">{errors.crop}</p>
                    )}
                  </div>

                  {/* Acres Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Farm Area (Acres) *
                    </label>
                    <input
                      type="number"
                      value={acres}
                      onChange={(e) => setAcres(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === ' ') e.preventDefault();
                      }}
                      placeholder="Enter area in acres"
                      min="0"
                      step="0.1"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.acres ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.acres && (
                      <p className="text-red-500 text-sm mt-1">{errors.acres}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleCalculate}
                      disabled={calculating}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {calculating ? (
                        <>
                          <RefreshCw className="animate-spin" size={20} />
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Calculator size={20} />
                          Calculate
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                    >
                      Reset
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Results */}
              <div className="lg:col-span-2">
                {calculation ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Fertilizer Requirements Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Leaf className="text-green-600" size={28} />
                        Fertilizer Requirements
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {/* Urea */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
                          <h3 className="text-sm font-semibold text-blue-800 mb-2">UREA</h3>
                          <p className="text-3xl font-bold text-blue-900 mb-1">
                            {calculation.fertilizerTotal.urea} kg
                          </p>
                          <p className="text-sm text-blue-700">
                            {calculation.fertilizerPerAcre.urea} kg/acre
                          </p>
                          <p className="text-xs text-blue-600 mt-2">46% Nitrogen</p>
                        </div>

                        {/* DAP */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200">
                          <h3 className="text-sm font-semibold text-purple-800 mb-2">DAP</h3>
                          <p className="text-3xl font-bold text-purple-900 mb-1">
                            {calculation.fertilizerTotal.dap} kg
                          </p>
                          <p className="text-sm text-purple-700">
                            {calculation.fertilizerPerAcre.dap} kg/acre
                          </p>
                          <p className="text-xs text-purple-600 mt-2">18% N, 46% P</p>
                        </div>

                        {/* MOP */}
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border-2 border-orange-200">
                          <h3 className="text-sm font-semibold text-orange-800 mb-2">MOP</h3>
                          <p className="text-3xl font-bold text-orange-900 mb-1">
                            {calculation.fertilizerTotal.mop} kg
                          </p>
                          <p className="text-sm text-orange-700">
                            {calculation.fertilizerPerAcre.mop} kg/acre
                          </p>
                          <p className="text-xs text-orange-600 mt-2">60% Potassium</p>
                        </div>
                      </div>

                      {/* Cost Estimate */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-green-800 mb-1 flex items-center gap-2">
                              <DollarSign size={16} />
                              Estimated Total Cost
                            </h3>
                            <p className="text-4xl font-bold text-green-900">
                              ₹{calculation.costEstimate.total.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right text-sm text-green-700">
                            <p>Urea: ₹{calculation.costEstimate.urea.toLocaleString()}</p>
                            <p>DAP: ₹{calculation.costEstimate.dap.toLocaleString()}</p>
                            <p>MOP: ₹{calculation.costEstimate.mop.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* NPK Analysis Chart */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <BarChart3 className="text-blue-600" size={28} />
                        Nutrient Analysis
                      </h2>

                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getChartData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="nutrient" />
                          <YAxis label={{ value: 'kg/acre', angle: -90, position: 'insideLeft' }} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="Soil Available" fill="#10b981" />
                          <Bar dataKey="Crop Required" fill="#3b82f6" />
                          <Bar dataKey="Deficit" fill="#ef4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Application Schedule */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Calendar className="text-purple-600" size={28} />
                        Application Schedule
                      </h2>

                      <div className="space-y-4">
                        {calculation.applicationSchedule.map((schedule, index) => (
                          <div key={index} className="border-l-4 border-purple-500 pl-4 py-3 bg-purple-50 rounded-r-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-bold text-gray-800">{schedule.stage}</h3>
                                <p className="text-sm text-gray-600">{schedule.timing}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-sm mb-2">
                              <div>
                                <span className="text-gray-600">Urea:</span>
                                <span className="font-semibold text-gray-800 ml-2">{schedule.fertilizers.urea} kg/acre</span>
                              </div>
                              <div>
                                <span className="text-gray-600">DAP:</span>
                                <span className="font-semibold text-gray-800 ml-2">{schedule.fertilizers.dap} kg/acre</span>
                              </div>
                              <div>
                                <span className="text-gray-600">MOP:</span>
                                <span className="font-semibold text-gray-800 ml-2">{schedule.fertilizers.mop} kg/acre</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 italic">{schedule.notes}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Info className="text-blue-600" size={28} />
                        Recommendations
                      </h2>

                      <ul className="space-y-3">
                        {calculation.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                            <ArrowRight className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                            <span className="text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <Calculator className="mx-auto mb-4 text-gray-400" size={64} />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No Calculation Yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Fill in the form and click "Calculate" to get fertilizer recommendations
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FertilizerCalculatorPage;
