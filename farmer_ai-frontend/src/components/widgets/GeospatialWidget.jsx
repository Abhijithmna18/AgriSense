import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Map as MapIcon, Layers } from 'lucide-react';
import WidgetWrapper from '../dashboard/WidgetWrapper';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const GeospatialWidget = ({ onRemove, onMinimize }) => {
    // Mock farm locations
    const farms = [
        { id: 1, name: 'Main Farm', lat: 28.6139, lng: 77.2090, health: 94, area: '50 acres' },
        { id: 2, name: 'North Field', lat: 28.7041, lng: 77.1025, health: 87, area: '30 acres' },
        { id: 3, name: 'South Valley', lat: 28.5355, lng: 77.3910, health: 91, area: '40 acres' }
    ];

    const center = [28.6139, 77.2090];

    return (
        <WidgetWrapper
            title="Geospatial Intelligence"
            onRemove={onRemove}
            onMinimize={onMinimize}
            actions={
                <div className="flex items-center gap-2">
                    <Layers size={14} className="text-accent-gold" />
                    <span className="text-xs text-dark-green-text/50">{farms.length} Locations</span>
                </div>
            }
        >
            <div className="h-full min-h-[300px] rounded-lg overflow-hidden">
                <MapContainer
                    center={center}
                    zoom={10}
                    style={{ height: '100%', width: '100%' }}
                    className="rounded-lg"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {farms.map((farm) => (
                        <React.Fragment key={farm.id}>
                            <Marker position={[farm.lat, farm.lng]}>
                                <Popup>
                                    <div className="text-xs">
                                        <div className="font-bold text-sm mb-1">{farm.name}</div>
                                        <div className="text-dark-green-text/70">Area: {farm.area}</div>
                                        <div className="text-dark-green-text/70">Health: {farm.health}%</div>
                                    </div>
                                </Popup>
                            </Marker>
                            <Circle
                                center={[farm.lat, farm.lng]}
                                radius={2000}
                                pathOptions={{
                                    color: farm.health > 90 ? '#D6F9B9' : farm.health > 80 ? '#D4AF37' : '#ef4444',
                                    fillColor: farm.health > 90 ? '#D6F9B9' : farm.health > 80 ? '#D4AF37' : '#ef4444',
                                    fillOpacity: 0.1
                                }}
                            />
                        </React.Fragment>
                    ))}
                </MapContainer>
            </div>
        </WidgetWrapper>
    );
};

export default GeospatialWidget;
