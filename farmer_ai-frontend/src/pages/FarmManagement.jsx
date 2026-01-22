import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map } from 'lucide-react';
import { FarmIntelligenceProvider } from '../context/FarmIntelligenceContext';
import IntelligenceDashboard from '../components/farms/IntelligenceDashboard';
import { Toaster } from 'react-hot-toast';
import { farmAPI } from '../services/farmApi';

const FarmManagement = () => {
    const navigate = useNavigate();
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial Load - Fetch List of Farms to populate selector
    useEffect(() => {
        const fetchFarms = async () => {
            try {
                const data = await farmAPI.getFarms();
                setFarms(data.data || data);
            } catch (error) {
                console.error("Error loading farms:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFarms();
    }, [navigate]);

    return (
        <FarmIntelligenceProvider>
            <div className="h-screen w-full flex flex-col bg-gray-50 font-sans overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between z-10 shrink-0">
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
                            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Farm Intelligence Hub</h1>
                            <p className="text-xs text-gray-500">Precision AgricultureOS</p>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        </div>
                    ) : (
                        <IntelligenceDashboard farms={farms} />
                    )}
                </div>
            </div>
            <Toaster position="top-right" />
        </FarmIntelligenceProvider>
    );
};

export default FarmManagement;

