import React from 'react';

const SettingsAdmin = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">Admin Settings</h1>
            <div className="bg-[#111827] border border-[#374151] rounded-lg p-6 max-w-xl">
                <h3 className="text-lg font-bold text-white mb-4">Environment Information</h3>
                <div className="space-y-2 text-gray-300">
                    <div className="flex justify-between">
                        <span>Environment</span>
                        <span className="font-mono text-white">{import.meta.env.MODE}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>API Base URL</span>
                        <span className="font-mono text-white">{import.meta.env.VITE_API_URL || 'Localhost'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Version</span>
                        <span className="font-mono text-white">v1.2.0-admin-beta</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsAdmin;
