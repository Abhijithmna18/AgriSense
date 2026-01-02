import React, { useState } from 'react';
import { MapPin, Locate } from 'lucide-react';

const StepLocation = ({ data, updateData }) => {
    const [locating, setLocating] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        updateData(prev => ({
            ...prev,
            location: { ...prev.location, [name]: value }
        }));
    };

    const handleGeolocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                updateData(prev => ({
                    ...prev,
                    location: {
                        ...prev.location,
                        coordinates: [longitude, latitude] // Mongo expects [lng, lat]
                    }
                }));
                // In a real app, we would reverse geocode here to fill State/District
                // For now just setting coordinates success
                setLocating(false);
            },
            (error) => {
                console.error(error);
                let msg = 'Unable to retrieve your location.';
                if (error.code === 1) msg = 'Location permission denied. Please enable it in your browser settings.';
                else if (error.code === 2) msg = 'Position unavailable. Please checks your network or GPS.';
                else if (error.code === 3) msg = 'Location request timed out.';

                alert(msg);
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <MapPin size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[var(--admin-text-primary)]">Location & Geography</h2>
                    <p className="text-sm text-[var(--admin-text-secondary)]">Location data helps us fetch accurate weather and soil insights.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                        State <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="state"
                        value={data.location.state}
                        onChange={handleChange}
                        placeholder="e.g. Kerala"
                        className="w-full px-4 py-3 rounded-xl border border-[var(--admin-border)] focus:border-[var(--admin-accent)] focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                        District <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="district"
                        value={data.location.district}
                        onChange={handleChange}
                        placeholder="e.g. Kozhikode"
                        className="w-full px-4 py-3 rounded-xl border border-[var(--admin-border)] focus:border-[var(--admin-accent)] focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                        Village / Locality (Optional)
                    </label>
                    <input
                        type="text"
                        name="village"
                        value={data.location.village}
                        onChange={handleChange}
                        placeholder="e.g. Village Name"
                        className="w-full px-4 py-3 rounded-xl border border-[var(--admin-border)] focus:border-[var(--admin-accent)] focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                        GPS Location
                    </label>
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-[var(--admin-border)]">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Latitude</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 12.97"
                                    value={data.location.coordinates[1] || ''}
                                    onChange={(e) => {
                                        const lat = parseFloat(e.target.value);
                                        const lng = data.location.coordinates[0] || 0;
                                        updateData(prev => ({
                                            ...prev,
                                            location: { ...prev.location, coordinates: [lng, lat] }
                                        }));
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Longitude</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 77.59"
                                    value={data.location.coordinates[0] || ''}
                                    onChange={(e) => {
                                        const lng = parseFloat(e.target.value);
                                        const lat = data.location.coordinates[1] || 0;
                                        updateData(prev => ({
                                            ...prev,
                                            location: { ...prev.location, coordinates: [lng, lat] }
                                        }));
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] outline-none"
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleGeolocation}
                            disabled={locating}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            {locating ? (
                                <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Locate size={16} />
                            )}
                            {data.location.coordinates.length === 2 ? 'Update GPS' : 'Detect GPS'}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        We use this to get precise weather forecasts and satellite data for your farm.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StepLocation;
