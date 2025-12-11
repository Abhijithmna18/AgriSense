import React from 'react';

const RecommendationsAdmin = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">Model & Recommendations</h1>
            <div className="bg-[#111827] border border-[#374151] rounded-lg p-6 max-w-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Retrain Model</h3>
                <p className="text-gray-400 mb-6">Trigger a new training job for the recommendation engine.</p>
                <button className="admin-button admin-btn-primary opacity-50 cursor-not-allowed">Start Training Job</button>
            </div>
        </div>
    );
};

export default RecommendationsAdmin;
