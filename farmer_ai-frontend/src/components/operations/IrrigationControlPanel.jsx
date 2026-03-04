import React, { useState, useEffect } from 'react';
import { Droplets, Thermometer, Wind, Power } from 'lucide-react';
import api from '../../services/authApi';

export default function IrrigationControlPanel({ farmId }) {
    const [readings, setReadings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pumpActive, setPumpActive] = useState(false);

    useEffect(() => {
        if (farmId) fetchLatestReadings();
    }, [farmId]);

    const fetchLatestReadings = async () => {
        setLoading(true);
        try {
            // In a real app, this polls or uses WebSockets. For Phase 4, we mock the last reading
            // const res = await api.get(`/api/sensors/farm/${farmId}/latest`);
            // setReadings(res.data.data[0]);

            // Mocking ESP32 payload
            setReadings({
                metrics: { soilMoisture: 32, temperature: 29.5, humidity: 65 },
                pumpStatus: 'OFF',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const togglePump = async () => {
        // Mocking the toggle action
        setPumpActive(!pumpActive);
    };

    if (loading) return <div className="p-10 text-center animate-pulse">Loading IoT Sensors...</div>;

    if (!readings) return (
        <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center">
            <h3 className="text-xl font-bold text-slate-800">No IoT Hardware Detected</h3>
            <p className="text-slate-500 mt-2">Associate an ESP32 device with this farm to view real-time telemetry.</p>
        </div>
    );

    const { soilMoisture, temperature, humidity } = readings.metrics;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Droplets className="text-blue-500" />
                        Smart Irrigation Console
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                        Live ESP32 Telemetry • Last Sync: {new Date(readings.timestamp).toLocaleTimeString()}
                    </p>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                {/* Moisture Gauge */}
                <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex flex-col items-center">
                    <Droplets size={24} className="text-blue-500 mb-2" />
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Soil Moisture</h4>
                    <div className="mt-3 text-4xl font-black text-slate-800">
                        {soilMoisture}%
                    </div>
                    {soilMoisture < 30 && <p className="text-xs text-amber-600 font-bold mt-2">LOW MOISTURE ALERT</p>}
                </div>

                {/* Temperature */}
                <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex flex-col items-center">
                    <Thermometer size={24} className="text-orange-500 mb-2" />
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Soil Temp</h4>
                    <div className="mt-3 text-4xl font-black text-slate-800">
                        {temperature}°C
                    </div>
                </div>

                {/* Automation Override */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-900 text-white shadow-sm flex flex-col items-center justify-center">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Pump Relay Control</h4>

                    <button
                        onClick={togglePump}
                        className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-300 ${pumpActive
                                ? 'bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.5)]'
                                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                            }`}
                    >
                        <Power size={32} className={pumpActive ? 'text-white' : 'text-slate-400'} />
                        <span className="text-xs font-bold mt-1 tracking-widest">{pumpActive ? 'ON' : 'OFF'}</span>
                    </button>

                    <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-widest">Manual Override Active</p>
                </div>
            </div>
        </div>
    );
}
