import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Map, Settings, Wind, CloudRain, AlertOctagon, Leaf, ArrowLeft } from 'lucide-react';
import ZoneMap from '../components/farms/ZoneMap';
import ZoneDrawer from '../components/farms/ZoneDrawer';
import { seedDemoData, getAllDataForZone } from '../services/mockDataService';

// Mock Config - In product this comes from env
const FASTAPI_URL = 'http://localhost:8000/api/v1';
const NODE_API_URL = 'http://localhost:5000/api';

const FarmManagement = () => {
    const navigate = useNavigate();
    const [farms, setFarms] = useState([]);
    const [selectedFarm, setSelectedFarm] = useState(null);
    const [zones, setZones] = useState([]);
    const [selectedZone, setSelectedZone] = useState(null);
    const [highlightedZones, setHighlightedZones] = useState([]); // State for alert highlighting
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleAlertClick = (zoneIds) => {
        setHighlightedZones(zoneIds);
        setTimeout(() => setHighlightedZones([]), 5000);
    };

    const handleZoneSelect = (zone) => {
        if (!zone) {
            setDrawerOpen(false);
            setSelectedZone(null);
            return;
        }

        setSelectedZone(zone);
        setDrawerOpen(true);

        // Check if THIS SPECIFIC ZONE has data
        const zoneData = getAllDataForZone(zone._id);
        const hasZoneData = zoneData.responsibilities.length > 0 ||
            zoneData.diary.length > 0 ||
            zoneData.harvest.length > 0;

        // Seed demo data only if this zone is empty
        if (!hasZoneData) {
            seedDemoData(zone._id);
        }
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
    };

    // Initial Load - Fetch Farms
    useEffect(() => {
        const fetchFarms = async () => {
            try {
                // Assuming we use the auth token from localStorage
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Fetch farms from Node backend
                // Fallback to mock if API fails for demo
                try {
                    const res = await axios.get(`${NODE_API_URL}/farms`, config);
                    setFarms(res.data.data || res.data); // Adjust based on actual response structure
                    if (res.data.length > 0 || res.data.data?.length > 0) {
                        const farmList = res.data.data || res.data;
                        setSelectedFarm(farmList[0]);
                    }
                } catch (e) {
                    console.warn("Using mock farms due to API error", e);
                    setFarms([{ _id: '1', name: 'Green Valley Farm', location: { coordinates: [78.9, 20.5] } }]);
                    setSelectedFarm({ _id: '1', name: 'Green Valley Farm' });
                }

            } catch (error) {
                console.error("Error loading farms:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFarms();
    }, []);

    // Load Zones when Farm changes
    useEffect(() => {
        if (!selectedFarm) return;

        const fetchZones = async () => {
            try {
                // Fetch zones from FastAPI
                // Ensure we handle the case where FastAPI might be down
                const res = await axios.get(`${FASTAPI_URL}/zones/${selectedFarm._id}`);
                setZones(res.data);
            } catch (error) {
                console.warn("API unavailable, using mock zones:", error.message);

                // Mock Zone Data if microservice is down
                if (zones.length === 0) {
                    setZones([
                        {
                            _id: 'z1',
                            name: 'North Sector A',
                            type: 'Cultivation',
                            status: 'Healthy',
                            area_acres: 12.5,
                            crop_name: 'Wheat',
                            coordinates: {
                                type: 'Polygon',
                                coordinates: [[
                                    [77.20, 28.60], [77.21, 28.60], [77.21, 28.61], [77.20, 28.61], [77.20, 28.60] // Placeholder coords
                                ]]
                            },
                            current_sensors: {
                                temperature: 24,
                                humidity: 65,
                                soil_moisture: 72,
                                sunlight: 850
                            }
                        },
                        {
                            _id: 'z2',
                            name: 'East Ridge',
                            type: 'Orchard',
                            status: 'Risk',
                            area_acres: 8.2,
                            crop_name: 'Apple',
                            coordinates: {
                                type: 'Polygon',
                                coordinates: [[
                                    [77.22, 28.60], [77.23, 28.60], [77.23, 28.61], [77.22, 28.61], [77.22, 28.60]
                                ]]
                            },
                            current_sensors: {
                                temperature: 22,
                                humidity: 88, // High humidity risk
                                soil_moisture: 80,
                                sunlight: 400
                            }
                        }
                    ]);
                }
            }
        };

        fetchZones();
    }, [selectedFarm]);

    const handleGetAdvice = async () => {
        if (!selectedZone) return;
        setAiAdvice(null);
        setShowAIModal(true);
        try {
            const res = await axios.post(`${FASTAPI_URL}/ai/analyze`, {
                zone_id: selectedZone._id,
                context: "General advisory request"
            });
            setAiAdvice(res.data);
        } catch (error) {
            console.error("AI Error", error);
            setAiAdvice({
                recommendation: "Unable to connect to AI Service. Please ensure various microservices are running.",
                risk_level: "Unknown",
                confidence: 0
            });
        }
    };

    return (
        <div className="h-screen w-full flex flex-col bg-gray-100 font-sans">
            {/* A. HEADER */}
            <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between z-[2000] shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="bg-green-600 text-white p-2 rounded-lg">
                        <Map size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Farm Management</h1>
                        <p className="text-xs text-gray-500">Precision AgricultureOS</p>
                    </div>

                    {/* Farm Selector */}
                    <div className="ml-8 border-l border-gray-200 pl-4">
                        <select
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 outline-none"
                            value={selectedFarm?._id || ''}
                            onChange={(e) => setSelectedFarm(farms.find(f => f._id === e.target.value))}
                        >
                            {farms.map(f => (
                                <option key={f._id} value={f._id}>{f.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                        <CloudRain size={16} className="text-blue-500" />
                        <span>Precipitation: 12mm (24h)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                        <AlertOctagon size={16} className="text-orange-500" />
                        <span>Pest Alert: Low</span>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT - SCROLLABLE PAGE */}
            <div className="flex-1 overflow-y-auto scroll-smooth">
                <div className="flex flex-col min-h-full">

                    {/* TOP: MAP SECTION */}
                    <div className={`w-full transition-all duration-500 ease-in-out relative shrink-0 ${drawerOpen && selectedZone ? 'h-[50vh]' : 'h-[85vh]'}`}>
                        <div className="absolute inset-0 p-4">
                            <ZoneMap
                                zones={zones}
                                selectedZoneId={selectedZone?._id}
                                highlightedZoneIds={highlightedZones}
                                onZoneSelect={handleZoneSelect}
                            />

                            {/* Floating Map Controls */}
                            <div className="absolute top-8 right-8 bg-white p-2 rounded-lg shadow-md z-[400] flex flex-col gap-2">
                                <button className="p-2 hover:bg-gray-100 rounded" title="Layers"><Settings size={20} /></button>
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM: PANEL SECTION */}
                    {drawerOpen && selectedZone && (
                        <div
                            ref={(el) => {
                                if (el && drawerOpen) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }}
                            className="bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-20 min-h-[60vh] animate-in slide-in-from-bottom-10 fade-in duration-500"
                        >
                            <ZoneDrawer
                                zone={selectedZone}
                                isOpen={drawerOpen}
                                onClose={handleCloseDrawer}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FarmManagement;
