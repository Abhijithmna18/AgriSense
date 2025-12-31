import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import pointerIcon from 'leaflet/dist/images/marker-icon.png';
import shadowIcon from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default icon issue
const customIcon = new Icon({
    iconUrl: pointerIcon,
    shadowUrl: shadowIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const FieldIntelligence = ({ data }) => {
    if (!data) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'stressed': return '#ef4444'; // red-500
            case 'warning': return '#f97316'; // orange-500
            default: return '#22c55e'; // green-500
        }
    };

    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-inner border border-stone-200 dark:border-white/10 relative z-0">
            <MapContainer
                center={data.mapCenter}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {data.fields.map(field => (
                    <React.Fragment key={field.id}>
                        <Marker position={field.coords} icon={customIcon}>
                            <Popup>
                                <div className="font-sans">
                                    <h3 className="font-bold">{field.name}</h3>
                                    <p>Status: <span className="font-semibold capitalize">{field.status}</span></p>
                                    <p>Stress Level: {field.stress}</p>
                                </div>
                            </Popup>
                        </Marker>
                        <Circle
                            center={field.coords}
                            radius={300}
                            pathOptions={{
                                color: getStatusColor(field.status),
                                fillColor: getStatusColor(field.status),
                                fillOpacity: 0.2
                            }}
                        />
                    </React.Fragment>
                ))}
            </MapContainer>

            {/* Legend Override */}
            <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 p-3 rounded-lg shadow-lg z-[1000] text-xs">
                <h4 className="font-bold mb-2 text-dark-green-text dark:text-warm-ivory">Field Status</h4>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-gray-700 dark:text-gray-300">Stressed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-gray-700 dark:text-gray-300">Warning</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-gray-700 dark:text-gray-300">Healthy</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FieldIntelligence;
