import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { authAPI } from '../services/authApi';
import L from 'leaflet';
import { AlertCircle, Navigation, Map as MapIcon, Loader } from 'lucide-react';

// Fix Leaflet Text Marker Icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const DiseaseMapPage = () => {
    const [alerts, setAlerts] = useState([]);
    const [userLocation, setUserLocation] = useState(null); // { lat, lon }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 1. Get User Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lon: longitude });
                    fetchDiseaseRadar(latitude, longitude);
                },
                (err) => {
                    console.error("Location access denied", err);
                    // Fallback to New Delhi if denied
                    const defaultLat = 28.6139;
                    const defaultLon = 77.2090;
                    setUserLocation({ lat: defaultLat, lon: defaultLon });
                    fetchDiseaseRadar(defaultLat, defaultLon);
                    setError("Location access denied. Showing data for New Delhi.");
                }
            );
        } else {
            // Fallback
            const defaultLat = 28.6139;
            const defaultLon = 77.2090;
            setUserLocation({ lat: defaultLat, lon: defaultLon });
            fetchDiseaseRadar(defaultLat, defaultLon);
        }
    }, []);

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

    if (loading && !userLocation) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <Loader className="animate-spin text-green-600 mx-auto mb-4" size={40} />
                    <p className="text-gray-600">Locating existing threats...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm border-b flex justify-between items-center z-[1000] relative">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <MapIcon className="text-green-600" />
                        Disease Radar
                    </h1>
                    <p className="text-sm text-gray-500">
                        Showing detected diseases within 50km
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        {alerts.length} Threats Detected
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative z-0">
                {userLocation && (
                    <MapContainer
                        center={[userLocation.lat, userLocation.lon]}
                        zoom={10}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* User Location Marker */}
                        <Marker position={[userLocation.lat, userLocation.lon]}>
                            <Popup>
                                <div className="text-center">
                                    <p className="font-bold text-gray-800">Your Farm</p>
                                    <p className="text-xs text-gray-500">You are here</p>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Disease Alert Markers */}
                        {alerts.map((alert) => (
                            <React.Fragment key={alert._id}>
                                <Circle
                                    center={[alert.location.coordinates[1], alert.location.coordinates[0]]}
                                    pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }}
                                    radius={2000} // 2km radius visual
                                />
                                <Marker
                                    position={[alert.location.coordinates[1], alert.location.coordinates[0]]}
                                    icon={L.divIcon({
                                        className: 'custom-div-icon',
                                        html: `<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                                        iconSize: [12, 12],
                                        iconAnchor: [6, 6]
                                    })}
                                >
                                    <Popup>
                                        <div className="p-2 min-w-[200px]">
                                            <div className="flex items-start gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                                                    <AlertCircle size={20} className="text-red-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{alert.diseaseName}</h3>
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium uppercase">
                                                        {alert.severity}
                                                    </span>
                                                </div>
                                            </div>
                                            {alert.imageUrl && (
                                                <img
                                                    src={`http://localhost:5002/${alert.imageUrl}`}
                                                    alt="Disease"
                                                    className="w-full h-32 object-cover rounded-lg mb-2"
                                                />
                                            )}
                                            <p className="text-xs text-gray-500 mb-2">
                                                Detected on {new Date(alert.scannedAt).toLocaleDateString()}
                                            </p>
                                            <button className="w-full py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-black transition-colors">
                                                View Treatment
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            </React.Fragment>
                        ))}

                    </MapContainer>
                )}

                {/* Error Toast */}
                {error && (
                    <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 bg-white p-4 rounded-xl shadow-lg border-l-4 border-red-500 z-[1001] max-w-sm animate-slide-up">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-red-500 shrink-0" size={20} />
                            <div>
                                <h3 className="font-medium text-gray-900">Notice</h3>
                                <p className="text-sm text-gray-600">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiseaseMapPage;
