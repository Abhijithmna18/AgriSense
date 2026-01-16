import React from 'react';
import { Droplets, Thermometer, Sun, CloudRain, Activity, ShieldCheck } from 'lucide-react';

const OverviewTab = ({ zone }) => {
    const sensors = zone.current_sensors || {};

    return (
        <div className="space-y-8 p-1">
            {/* Live Conditions */}
            <div>
                <div className="flex items-center justify-between mb-4 border-l-4 border-green-600 pl-3">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Activity size={24} className="text-green-700" />
                        Live Conditions
                    </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Droplets size={20} className="text-blue-600" />
                            </div>
                            <span className="text-sm font-semibold text-gray-700">Soil Moisture</span>
                        </div>
                        <div className="text-3xl font-extrabold text-blue-700 mt-2">
                            {sensors.soil_moisture || '--'}%
                        </div>
                    </div>

                    <div className="bg-orange-50 p-5 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Thermometer size={20} className="text-orange-600" />
                            </div>
                            <span className="text-sm font-semibold text-gray-700">Temperature</span>
                        </div>
                        <div className="text-3xl font-extrabold text-orange-700 mt-2">
                            {sensors.temperature || '--'}°C
                        </div>
                    </div>

                    <div className="bg-cyan-50 p-5 rounded-xl border border-cyan-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-cyan-100 rounded-lg">
                                <CloudRain size={20} className="text-cyan-600" />
                            </div>
                            <span className="text-sm font-semibold text-gray-700">Rainfall (24h)</span>
                        </div>
                        <div className="text-3xl font-extrabold text-cyan-700 mt-2">12 mm</div>
                    </div>

                    <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Sun size={20} className="text-yellow-600" />
                            </div>
                            <span className="text-sm font-semibold text-gray-700">Sunlight</span>
                        </div>
                        <div className="text-3xl font-extrabold text-yellow-700 mt-2">
                            {sensors.sunlight || '--'} lx
                        </div>
                    </div>
                </div>
            </div>

            {/* Crop Health */}
            <div>
                <div className="flex items-center justify-between mb-4 border-l-4 border-green-600 pl-3">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <ShieldCheck size={24} className="text-green-700" />
                        Crop Health
                    </h3>
                </div>
                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 uppercase tracking-wide font-bold mb-1">Current Stage</p>
                                <p className="text-lg font-bold text-green-700 bg-green-50 inline-block px-3 py-1 rounded-lg border border-green-100">
                                    {zone.crop_stage || 'Vegetative'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 uppercase tracking-wide font-bold mb-1">Irrigation Mode</p>
                                <p className="text-lg font-bold text-gray-800">
                                    {zone.irrigation_type || 'Drip'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-green-50 border-t border-green-100">
                        <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                            <ShieldCheck size={18} className="text-green-600" />
                            System Diagnosis: <span className="font-bold">No diseases detected</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Zone Summary Table */}
            <div>
                <div className="flex items-center justify-between mb-4 border-l-4 border-gray-600 pl-3">
                    <h3 className="text-xl font-bold text-gray-900">Zone Summary</h3>
                </div>
                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <tbody className="divide-y divide-gray-100">
                            <tr className="hover:bg-gray-50">
                                <td className="p-4 text-sm font-medium text-gray-500">Zone Type</td>
                                <td className="p-4 text-sm font-bold text-gray-900 text-right">{zone.type}</td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="p-4 text-sm font-medium text-gray-500">Total Area</td>
                                <td className="p-4 text-sm font-bold text-gray-900 text-right">{zone.area_acres} acres</td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="p-4 text-sm font-medium text-gray-500">Cultivated Crop</td>
                                <td className="p-4 text-sm font-bold text-gray-900 text-right">{zone.crop_name || 'N/A'}</td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="p-4 text-sm font-medium text-gray-500">Overall Status</td>
                                <td className="p-4 text-right">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${zone.status === 'Healthy' ? 'bg-green-100 text-green-800' :
                                        zone.status === 'Risk' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {zone.status}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
