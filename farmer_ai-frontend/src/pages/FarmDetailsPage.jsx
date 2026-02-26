import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Activity, Thermometer, Droplets } from 'lucide-react';

const FarmDetailsPage = () => {
    const { id } = useParams();

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <Link to="/farms" className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700 mb-2">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Farms
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Farm Details</h1>
                    <p className="text-gray-500 mt-1 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" /> Farm ID: {id}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
                        <p className="text-gray-600 mb-4">
                            Detailed view for this farm is currently under development. Here you will see crop status, recent activities, and more.
                        </p>
                    </div>
                </div>

                <div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>

                        <div className="space-y-4">
                            <div className="flex items-center p-3 bg-blue-50/50 rounded-lg">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-3">
                                    <Droplets className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Soil Moisture</p>
                                    <p className="text-lg font-semibold text-gray-900">Optimal</p>
                                </div>
                            </div>

                            <div className="flex items-center p-3 bg-red-50/50 rounded-lg">
                                <div className="p-2 bg-red-100 text-red-600 rounded-lg mr-3">
                                    <Thermometer className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Temperature</p>
                                    <p className="text-lg font-semibold text-gray-900">24°C</p>
                                </div>
                            </div>

                            <div className="flex items-center p-3 bg-green-50/50 rounded-lg">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg mr-3">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Crop Health</p>
                                    <p className="text-lg font-semibold text-gray-900">Good</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmDetailsPage;
