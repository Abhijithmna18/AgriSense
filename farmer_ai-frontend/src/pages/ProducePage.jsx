import React from 'react';
import { ShoppingBasket } from 'lucide-react';

const ProducePage = () => {
    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 flex items-center gap-3">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                        <ShoppingBasket className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Produce</h1>
                        <p className="text-gray-500">Manage and list your farm produce.</p>
                    </div>
                </div>
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <p className="text-gray-600">This feature is currently under development.</p>
                </div>
            </div>
        </div>
    );
};

export default ProducePage;
