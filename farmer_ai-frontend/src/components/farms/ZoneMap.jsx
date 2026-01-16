import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet icon issue
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const StatusColorMap = {
    'Healthy': 'green',
    'Risk': 'yellow',
    'Critical': 'red'
};

function SetMapBounds({ zones }) {
    const map = useMap();
    useEffect(() => {
        if (zones && zones.length > 0) {
            const bounds = zones.map(z => z.coordinates.coordinates[0].map(coord => [coord[1], coord[0]]));
            // Flatten to get all points
            const allPoints = bounds.flat();
            if (allPoints.length > 0) map.fitBounds(allPoints);
        }
    }, [zones, map]);
    return null;
}

// Handle map clicks to deselect (close drawer)
function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click: () => onMapClick(null),
    });
    return null;
}

const ZoneMap = ({ zones, onZoneSelect, selectedZoneId, highlightedZoneIds = [] }) => {
    // Default center (can be user's location or first farm)
    const [center, setCenter] = useState([20.5937, 78.9629]); // India center

    return (
        <div className="h-full w-full rounded-lg overflow-hidden shadow-lg border border-gray-200">
            <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
                <MapClickHandler onMapClick={onZoneSelect} />
                <TileLayer
                    url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                    maxZoom={20}
                    subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                    attribution="&copy; Google Satellite"
                />

                {zones && zones.map((zone) => {
                    // GeoJSON coords are [lon, lat], Leaflet needs [lat, lon]
                    const positions = zone.coordinates.coordinates[0].map(c => [c[1], c[0]]);
                    const isHighlighted = highlightedZoneIds.includes(zone._id);
                    const isSelected = selectedZoneId === zone._id;

                    const fillColor = StatusColorMap[zone.status] || 'blue';
                    // Highlight logic: thicker border, specific color if highlighted
                    const weight = isSelected || isHighlighted ? 4 : 1;
                    const fillOpacity = isSelected ? 0.6 : (isHighlighted ? 0.8 : 0.4);
                    const borderColor = isHighlighted ? 'orange' : (StatusColorMap[zone.status] || 'blue');
                    const dashArray = isHighlighted ? "5, 5" : null;

                    return (
                        <Polygon
                            key={zone._id}
                            positions={positions}
                            pathOptions={{
                                color: borderColor,
                                fillColor: fillColor,
                                fillOpacity: fillOpacity,
                                weight: weight,
                                dashArray: dashArray,
                                interactive: true
                            }}
                            eventHandlers={{
                                click: (e) => {
                                    L.DomEvent.stopPropagation(e); // Prevent map click from firing MapClickHandler
                                    onZoneSelect(zone);
                                }
                            }}
                        >
                            <Tooltip sticky direction="top" offset={[0, -10]} opacity={1}>
                                <div className="text-sm p-1">
                                    <p className="font-bold text-base mb-1">{zone.name}</p>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                        <span className="text-gray-500">Crop:</span>
                                        <span className="font-medium">{zone.crop_name || 'N/A'}</span>
                                        <span className="text-gray-500">Moisture:</span>
                                        <span className="font-medium">{zone.current_sensors?.soil_moisture || '--'}%</span>
                                        <span className="text-gray-500">Risk:</span>
                                        <span className={`font-bold text-${StatusColorMap[zone.status]}-600 uppercase`}>{zone.status}</span>
                                    </div>
                                    <div className="mt-2 text-xs text-blue-600 font-medium text-center">
                                        Click to Manage
                                    </div>
                                </div>
                            </Tooltip>
                        </Polygon>
                    );
                })}

                <SetMapBounds zones={zones} />
            </MapContainer>
        </div>
    );
};

export default ZoneMap;
