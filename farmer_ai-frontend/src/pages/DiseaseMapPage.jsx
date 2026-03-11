import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { authAPI } from '../services/authApi';
import L from 'leaflet';
import { AlertCircle, Navigation, Map as MapIcon, Loader, Clock, Crosshair, ChevronRight, Shield, Wind, Droplets, ThermometerSun } from 'lucide-react';

// Fix Leaflet Default Marker Icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper: Fly the map to a position
const MapFlyTo = ({ position, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, zoom || 13, { duration: 1.2 });
        }
    }, [position, zoom, map]);
    return null;
};

// Helper: Calculate distance between two coordinates (km)
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Severity config
const severityConfig = {
    critical: { color: '#dc2626', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', fill: '#dc2626', label: 'Critical' },
    high: { color: '#ea580c', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', fill: '#ea580c', label: 'High' },
    medium: { color: '#ca8a04', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', fill: '#ca8a04', label: 'Medium' },
    low: { color: '#16a34a', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', fill: '#16a34a', label: 'Low' },
};

const getSeverity = (sev) => severityConfig[sev?.toLowerCase()] || severityConfig.medium;

const DiseaseMapPage = () => {
    const [alerts, setAlerts] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [flyTarget, setFlyTarget] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');

    const fetchDiseaseRadar = async (lat, lon) => {
        try {
            setLoading(true);
            const { data } = await authAPI.getDiseaseRadar({ lat, lon, radius: 50 });
            if (data.success) {
                setAlerts(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch radar data", err);
            setError("Failed to load disease data.");
        } finally {
            setLoading(false);
        }
    };

    const fetchLocationFallback = async () => {
        const defaultLat = 28.6139;
        const defaultLon = 77.2090;

        const ipServices = [
            {
                url: 'https://ipinfo.io/json',
                parse: (data) => {
                    if (data.loc) {
                        const [lat, lon] = data.loc.split(',').map(Number);
                        return { lat, lon, city: data.city || data.region };
                    }
                    return null;
                }
            },
            {
                url: 'https://ipapi.co/json/',
                parse: (data) => {
                    if (data.latitude && data.longitude) {
                        return { lat: data.latitude, lon: data.longitude, city: data.city || data.region_name };
                    }
                    return null;
                }
            },
            {
                url: 'https://ip-api.com/json/?fields=lat,lon,city,regionName',
                parse: (data) => {
                    if (data.lat && data.lon) {
                        return { lat: data.lat, lon: data.lon, city: data.city || data.regionName };
                    }
                    return null;
                }
            }
        ];

        for (const service of ipServices) {
            try {
                const response = await fetch(service.url);
                if (response.ok) {
                    const data = await response.json();
                    const result = service.parse(data);
                    if (result) {
                        setUserLocation({ lat: result.lat, lon: result.lon });
                        fetchDiseaseRadar(result.lat, result.lon);
                        setError(`Using approximate location: ${result.city || 'your area'}.`);
                        return;
                    }
                }
            } catch (err) {
                console.warn(`${service.url} failed, trying next...`, err);
            }
        }

        setUserLocation({ lat: defaultLat, lon: defaultLon });
        fetchDiseaseRadar(defaultLat, defaultLon);
        setError("Could not determine location. Showing data for New Delhi.");
    };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lon: longitude });
                    fetchDiseaseRadar(latitude, longitude);
                },
                () => {
                    fetchLocationFallback();
                },
                { timeout: 10000 }
            );
        } else {
            fetchLocationFallback();
        }
    }, []);

    const handleCardClick = (alert) => {
        setSelectedAlert(alert._id);
        setFlyTarget([alert.location.coordinates[1], alert.location.coordinates[0]]);
    };

    const handleRecenter = () => {
        if (userLocation) {
            setFlyTarget([userLocation.lat, userLocation.lon]);
            setSelectedAlert(null);
        }
    };

    // Filter alerts
    const filteredAlerts = activeFilter === 'all'
        ? alerts
        : alerts.filter(a => a.severity?.toLowerCase() === activeFilter);

    // Sort by distance
    const sortedAlerts = userLocation
        ? [...filteredAlerts].sort((a, b) => {
            const distA = getDistanceKm(userLocation.lat, userLocation.lon, a.location.coordinates[1], a.location.coordinates[0]);
            const distB = getDistanceKm(userLocation.lat, userLocation.lon, b.location.coordinates[1], b.location.coordinates[0]);
            return distA - distB;
        })
        : filteredAlerts;

    if (loading && !userLocation) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-center">
                    <Loader className="animate-spin text-green-400 mx-auto mb-4" size={48} />
                    <p className="text-gray-400 text-lg font-medium">Scanning for threats...</p>
                    <p className="text-gray-500 text-sm mt-1">Detecting location & fetching radar data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-900">
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-700/50 px-4 py-3 flex justify-between items-center z-[1000] relative">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                        <Shield className="text-red-400" size={22} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white flex items-center gap-2">
                            Disease Radar
                            <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">Live</span>
                        </h1>
                        <p className="text-xs text-gray-400">
                            Monitoring threats within 50km radius
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Severity Filter Pills */}
                    <div className="hidden md:flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'critical', label: 'Critical', dot: '#dc2626' },
                            { key: 'high', label: 'High', dot: '#ea580c' },
                            { key: 'medium', label: 'Medium', dot: '#ca8a04' },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setActiveFilter(f.key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeFilter === f.key
                                        ? 'bg-gray-600 text-white shadow'
                                        : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                {f.dot && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.dot }} />}
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium border border-red-500/30">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        {filteredAlerts.length} Threats
                    </div>

                    <button
                        onClick={handleRecenter}
                        className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700"
                        title="Recenter on your location"
                    >
                        <Crosshair size={18} />
                    </button>
                </div>
            </div>

            {/* Main Content: Map + Side Panel */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Map Section */}
                <div className="flex-1 relative z-0">
                    {userLocation && (
                        <MapContainer
                            center={[userLocation.lat, userLocation.lon]}
                            zoom={10}
                            style={{ height: "100%", width: "100%" }}
                            zoomControl={false}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />

                            {/* Fly to target */}
                            {flyTarget && <MapFlyTo position={flyTarget} zoom={14} />}

                            {/* User Location */}
                            <Marker
                                position={[userLocation.lat, userLocation.lon]}
                                icon={L.divIcon({
                                    className: 'custom-div-icon',
                                    html: `<div style="position:relative;">
                                        <div style="width:16px;height:16px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 12px rgba(59,130,246,0.6);"></div>
                                        <div style="position:absolute;top:-4px;left:-4px;width:24px;height:24px;background:rgba(59,130,246,0.2);border-radius:50%;animation:ping 2s infinite;"></div>
                                    </div>`,
                                    iconSize: [16, 16],
                                    iconAnchor: [8, 8]
                                })}
                            >
                                <Popup>
                                    <div className="text-center p-1">
                                        <p className="font-bold text-gray-800">📍 Your Location</p>
                                        <p className="text-xs text-gray-500">{userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}</p>
                                    </div>
                                </Popup>
                            </Marker>

                            {/* Disease Alert Markers */}
                            {sortedAlerts.map((alert) => {
                                const sev = getSeverity(alert.severity);
                                const isSelected = selectedAlert === alert._id;
                                return (
                                    <React.Fragment key={alert._id}>
                                        <Circle
                                            center={[alert.location.coordinates[1], alert.location.coordinates[0]]}
                                            pathOptions={{
                                                color: sev.color,
                                                fillColor: sev.fill,
                                                fillOpacity: isSelected ? 0.35 : 0.15,
                                                weight: isSelected ? 2 : 1
                                            }}
                                            radius={isSelected ? 3000 : 2000}
                                        />
                                        <Marker
                                            position={[alert.location.coordinates[1], alert.location.coordinates[0]]}
                                            icon={L.divIcon({
                                                className: 'custom-div-icon',
                                                html: `<div style="
                                                    background:${sev.color};
                                                    width:${isSelected ? '18px' : '12px'};
                                                    height:${isSelected ? '18px' : '12px'};
                                                    border-radius:50%;
                                                    border:${isSelected ? '3px' : '2px'} solid white;
                                                    box-shadow:0 0 ${isSelected ? '16px' : '8px'} ${sev.color}80;
                                                    transition:all 0.3s;
                                                "></div>`,
                                                iconSize: [isSelected ? 18 : 12, isSelected ? 18 : 12],
                                                iconAnchor: [isSelected ? 9 : 6, isSelected ? 9 : 6]
                                            })}
                                        >
                                            <Popup>
                                                <div className="p-2 min-w-[220px]">
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className={`w-10 h-10 rounded-lg ${sev.bg} flex items-center justify-center shrink-0`}>
                                                            <AlertCircle size={20} className={sev.text} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-gray-900">{alert.diseaseName}</h3>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${sev.bg} ${sev.text} font-bold uppercase`}>
                                                                {alert.severity}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {alert.imageUrl && (
                                                        <img
                                                            src={`http://localhost:5002/${alert.imageUrl}`}
                                                            alt="Disease"
                                                            className="w-full h-28 object-cover rounded-lg mb-2"
                                                        />
                                                    )}
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                                        <Clock size={12} />
                                                        Detected {new Date(alert.scannedAt).toLocaleDateString()}
                                                    </div>
                                                    {userLocation && (
                                                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                                                            <Navigation size={12} />
                                                            {getDistanceKm(userLocation.lat, userLocation.lon, alert.location.coordinates[1], alert.location.coordinates[0]).toFixed(1)} km away
                                                        </div>
                                                    )}
                                                    <button className="w-full py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors">
                                                        View Treatment Plan
                                                    </button>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    </React.Fragment>
                                );
                            })}
                        </MapContainer>
                    )}

                    {/* Error Toast */}
                    {error && (
                        <div className="absolute bottom-4 left-4 bg-gray-800 p-3 rounded-xl shadow-2xl border border-gray-700 z-[1001] max-w-xs">
                            <div className="flex items-start gap-2">
                                <Navigation className="text-blue-400 shrink-0 mt-0.5" size={16} />
                                <p className="text-xs text-gray-300">{error}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Side Panel - Alert Cards */}
                <div className="hidden md:flex flex-col w-[380px] bg-gray-900 border-l border-gray-700/50 z-10">
                    {/* Panel Header */}
                    <div className="p-4 border-b border-gray-700/50">
                        <h2 className="text-sm font-bold text-white mb-1">Detected Threats</h2>
                        <p className="text-xs text-gray-500">{sortedAlerts.length} outbreak{sortedAlerts.length !== 1 ? 's' : ''} found near you</p>
                    </div>

                    {/* Alert Cards List */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4b5563 transparent' }}>
                        {sortedAlerts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <Shield size={48} className="text-green-500/30 mb-4" />
                                <p className="text-gray-400 font-medium">All Clear!</p>
                                <p className="text-xs text-gray-500 mt-1">No threats detected in your area.</p>
                            </div>
                        ) : (
                            sortedAlerts.map((alert) => {
                                const sev = getSeverity(alert.severity);
                                const isSelected = selectedAlert === alert._id;
                                const dist = userLocation
                                    ? getDistanceKm(userLocation.lat, userLocation.lon, alert.location.coordinates[1], alert.location.coordinates[0])
                                    : null;

                                return (
                                    <div
                                        key={alert._id}
                                        onClick={() => handleCardClick(alert)}
                                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 group border cursor-pointer ${isSelected
                                                ? 'bg-gray-800 border-gray-600 shadow-lg ring-1 ring-gray-600'
                                                : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Severity Dot */}
                                            <div className={`mt-1 w-3 h-3 rounded-full shrink-0 ${isSelected ? 'animate-pulse' : ''}`}
                                                style={{ backgroundColor: sev.color, boxShadow: `0 0 8px ${sev.color}60` }}
                                            />

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="text-sm font-semibold text-white truncate">{alert.diseaseName}</h3>
                                                    <ChevronRight size={14} className={`text-gray-500 transition-transform ${isSelected ? 'rotate-90 text-gray-300' : 'group-hover:translate-x-0.5'}`} />
                                                </div>

                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${sev.bg} ${sev.text} font-bold uppercase`}>
                                                        {alert.severity}
                                                    </span>
                                                    {dist !== null && (
                                                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                            <Navigation size={9} />
                                                            {dist.toFixed(1)} km
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                                    <Clock size={10} />
                                                    {new Date(alert.scannedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>

                                                {/* Expanded detail on selection */}
                                                {isSelected && (
                                                    <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-2">
                                                        {alert.imageUrl && (
                                                            <img
                                                                src={`http://localhost:5002/${alert.imageUrl}`}
                                                                alt="Disease"
                                                                className="w-full h-24 object-cover rounded-lg"
                                                            />
                                                        )}
                                                        <div className="flex gap-2">
                                                            <button className="flex-1 py-1.5 bg-white text-gray-900 rounded-lg text-[11px] font-semibold hover:bg-gray-100 transition-colors">
                                                                View Treatment
                                                            </button>
                                                            <button className="flex-1 py-1.5 bg-gray-700 text-gray-200 rounded-lg text-[11px] font-semibold hover:bg-gray-600 transition-colors">
                                                                Report Similar
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Weather Context Footer */}
                    <div className="p-4 border-t border-gray-700/50 bg-gray-800/50">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">Weather Context</p>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-gray-800 rounded-lg p-2 text-center border border-gray-700/50">
                                <Droplets size={14} className="text-blue-400 mx-auto mb-1" />
                                <p className="text-xs font-bold text-white">82%</p>
                                <p className="text-[9px] text-gray-500">Humidity</p>
                            </div>
                            <div className="bg-gray-800 rounded-lg p-2 text-center border border-gray-700/50">
                                <ThermometerSun size={14} className="text-orange-400 mx-auto mb-1" />
                                <p className="text-xs font-bold text-white">28°C</p>
                                <p className="text-[9px] text-gray-500">Temp</p>
                            </div>
                            <div className="bg-gray-800 rounded-lg p-2 text-center border border-gray-700/50">
                                <Wind size={14} className="text-cyan-400 mx-auto mb-1" />
                                <p className="text-xs font-bold text-white">12 km/h</p>
                                <p className="text-[9px] text-gray-500">Wind</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-yellow-500/80 mt-2 flex items-center gap-1">
                            <AlertCircle size={10} />
                            High humidity increases risk of fungal diseases
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiseaseMapPage;
