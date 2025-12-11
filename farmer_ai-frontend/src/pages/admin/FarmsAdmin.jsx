import React from 'react';
import DataTable from '../../components/admin/DataTable';

const FarmsAdmin = () => {
    // Placeholder for now
    const columns = [
        { key: 'name', title: 'Farm Name' },
        { key: 'owner', title: 'Owner' },
        { key: 'location', title: 'Location' },
        { key: 'status', title: 'Status' }
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">Farms Management</h1>
            <div className="w-full p-8 text-center text-gray-500 border border-dashed border-gray-700 rounded-lg">
                Farms data integration coming soon.
            </div>
        </div>
    );
};

export default FarmsAdmin;
