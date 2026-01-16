import React from 'react';
import { Heart, ShoppingBag, ArrowRight, AlertTriangle } from 'lucide-react';

const SavedSuppliersWidget = () => {
    const suppliers = [
        { id: 1, name: 'Farm Alpha', product: 'Premium Oranges', price: '₹400/ton', stock: 'In Stock', rating: 4.8 },
        { id: 2, name: 'Eco Harvest', product: 'Wheat (Grade A)', price: '₹310/ton', stock: 'Low Stock', rating: 4.5, alert: true },
        { id: 3, name: 'Nature Best', product: 'Fresh Tomatoes', price: '₹120/ton', stock: 'In Stock', rating: 4.9 },
    ];

    return (
        <div className="admin-card h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Heart className="text-pink-600 fill-pink-600" size={20} />
                        Saved Suppliers
                    </h3>
                    <p className="text-sm text-gray-500">Quick access to favorites</p>
                </div>
                <button className="text-sm font-medium text-pink-600 hover:text-pink-700">View All</button>
            </div>

            <div className="space-y-4 flex-1">
                {suppliers.map((s) => (
                    <div key={s.id} className="p-3 rounded-xl bg-white border border-gray-100 flex items-center justify-between hover:shadow-sm transition-all cursor-pointer group">
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm group-hover:text-pink-600 transition-colors">{s.name}</h4>
                            <p className="text-xs text-gray-500">{s.product}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">{s.price}</p>
                            <div className="flex items-center justify-end gap-1">
                                {s.alert && <AlertTriangle size={10} className="text-amber-500" />}
                                <span className={`text-[10px] ${s.alert ? 'text-amber-600' : 'text-green-600'} font-medium`}>
                                    {s.stock}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 py-2 bg-pink-50 text-pink-600 rounded-lg font-medium hover:bg-pink-100 transition-colors flex items-center justify-center gap-2 text-sm">
                <ShoppingBag size={14} /> Buy Now
            </button>
        </div>
    );
};

export default SavedSuppliersWidget;
