import React from 'react';

const FarmsPage = () => {
    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">My Farms</h1>
                    <p className="text-gray-500">View and manage your registered farms.</p>
                </div>
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <p className="text-gray-600">This feature is currently under development. Soon you will be able to see all your farms here.</p>
                </div>
            </div>
        </div>
    );
};

export default FarmsPage;
