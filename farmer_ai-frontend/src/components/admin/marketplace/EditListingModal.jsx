import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { updateMarketplaceListing, createMarketplaceListing } from '../../../services/adminApi';

const EditListingModal = ({ listing, onClose, onUpdate }) => {
    const isEditMode = !!listing;
    const [formData, setFormData] = useState({
        productType: 'crop',
        quantity: 0,
        unit: 'kg',
        pricePerUnit: 0,
        location: '',
        status: 'active',
        productName: '',
        variety: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (listing) {
            setFormData({
                productType: listing.productType || 'crop',
                quantity: listing.quantity || 0,
                unit: listing.unit || 'kg',
                pricePerUnit: listing.pricePerUnit || 0,
                location: listing.location || '',
                status: listing.status || 'active',
                productName: listing.productRef?.name || '',
                variety: listing.productRef?.variety || '',
            });
        } else {
            // Reset for create mode
            setFormData({
                productType: 'crop',
                quantity: 0,
                unit: 'kg',
                pricePerUnit: 0,
                location: '',
                status: 'active',
                productName: '',
                variety: ''
            });
        }
    }, [listing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const apiData = {
                productType: formData.productType,
                quantity: Number(formData.quantity),
                unit: formData.unit,
                pricePerUnit: Number(formData.pricePerUnit),
                location: formData.location,
                status: formData.status,
                // Construct productRef for both create/update. 
                // Backend expects productRef to differ based on type? 
                // We'll trust the backend handles this schema or we send a unified object.
                productRef: {
                    ...(listing?.productRef || {}),
                    name: formData.productName,
                    variety: formData.variety
                }
            };

            let result;
            if (isEditMode) {
                result = await updateMarketplaceListing(listing._id, apiData);
            } else {
                result = await createMarketplaceListing(apiData);
            }

            // Result is usually response.data or the data object itself depending on interceptor
            // Assuming result.data is the listing, check services/adminApi
            // services/adminApi returns axios response, so result.data
            onUpdate(result.data);
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Failed to save listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-800">
                        {isEditMode ? 'Edit Listing' : 'Add New Product'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                            <select
                                name="productType"
                                value={formData.productType}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            >
                                <option value="crop">Crop</option>
                                <option value="livestock">Livestock</option>
                                <option value="input">Input (Seed/Fertilizer)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            >
                                <option value="active">Active</option>
                                <option value="sold">Sold</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input
                                type="text"
                                name="productName"
                                value={formData.productName}
                                onChange={handleChange}
                                placeholder="e.g. Wheat, Tractor"
                                required
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Variety/Breed/Brand</label>
                            <input
                                type="text"
                                name="variety"
                                value={formData.variety}
                                onChange={handleChange}
                                placeholder="e.g. Basmati, John Deere"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                min="0"
                                required
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                            <input
                                type="text"
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                placeholder="kg, tons, pcs"
                                required
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price/Unit (₹)</label>
                            <input
                                type="number"
                                name="pricePerUnit"
                                value={formData.pricePerUnit}
                                onChange={handleChange}
                                min="0"
                                required
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. Punjab, Warehouse A"
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[var(--admin-accent)] text-white rounded-lg hover:bg-[var(--admin-accent-hover)] transition-colors flex items-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    {isEditMode ? 'Saving...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    {isEditMode ? 'Save Changes' : 'Create Listing'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditListingModal;
