import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { updateMarketplaceListing, createMarketplaceListing } from '../../../services/adminApi';

const EditListingModal = ({ listing, onClose, onUpdate }) => {
    const isEditMode = !!listing;
    const [formData, setFormData] = useState({
        productType: 'crop',
        category: 'inputs',
        quantity: 0,
        unit: 'kg',
        pricePerUnit: 0,
        location: '',
        status: 'active',
        productName: '',
        variety: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(listing?.images?.[0] || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (listing) {
            setFormData({
                productType: listing.productType || 'crop',
                category: listing.category || 'inputs',
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
                category: 'inputs',
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
        // Prevent strictly leading spaces
        if (value.length > 0 && value[0] === ' ') {
            return;
        }
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        console.log('[EditListingModal] handleImageChange triggered');
        console.log('[EditListingModal] e.target.files:', e.target.files);
        const file = e.target.files[0];
        console.log('[EditListingModal] Selected file:', file);

        // TEMPORARY: Alert to verify code is loaded
        alert(`File selected: ${file ? file.name : 'No file'}`);

        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            console.log('[EditListingModal] Image file set successfully');
        } else {
            console.log('[EditListingModal] No file selected');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formPayload = new FormData();
            formPayload.append('productType', formData.productType);
            formPayload.append('category', formData.category);
            formPayload.append('quantity', formData.quantity);
            formPayload.append('unit', formData.unit);
            formPayload.append('pricePerUnit', formData.pricePerUnit);
            formPayload.append('location', formData.location);
            formPayload.append('status', formData.status);

            // Construct productRef object and stringify it for backend parsing
            const productRefData = {
                ...(listing?.productRef || {}),
                name: formData.productName,
                variety: formData.variety
            };
            formPayload.append('productRef', JSON.stringify(productRefData));

            console.log('[EditListingModal] imageFile:', imageFile);
            if (imageFile) {
                formPayload.append('image', imageFile);
                console.log('[EditListingModal] Image appended to FormData');
            } else {
                console.log('[EditListingModal] No image file selected');
            }

            let result;
            if (isEditMode) {
                // For update, we might need a different route or ensure PUT supports FormData/file update
                // The current task was adding upload option to 'Add New Product'. 
                // We'll focus on support for creation primarily, but keeping update flow consistent is good.
                // However, backend updateListing uses findByIdAndUpdate with req.body. 
                // It won't parse FormData automatically unless we add middleware there too.
                // For now, let's keep isEditMode using JSON payload unless the user requested update support.
                // User asked: "Add an option to upload a photo in the Add New Product box"
                // So I will only use FormData for NEW products for now to avoid breaking Edit.
                // Actually, let's stick to the prompt. "Add New Product box".

                if (imageFile) {
                    // Update currently doesn't support file upload in this plan (middleware only on POST)
                    // Fallback to JSON for now to be safe, or alert user?
                    // Better: Send alert if they try to upload on edit? 
                    // Or just ignore image on edit.
                }

                const apiData = {
                    productType: formData.productType,
                    quantity: Number(formData.quantity),
                    unit: formData.unit,
                    pricePerUnit: Number(formData.pricePerUnit),
                    location: formData.location,
                    status: formData.status,
                    productRef: productRefData
                };
                result = await updateMarketplaceListing(listing._id, apiData);
            } else {
                result = await createMarketplaceListing(formPayload);
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            >
                                <option value="inputs">Farming Inputs</option>
                                <option value="rentals">Tools & Rentals</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                            <input
                                list="productTypeOptions"
                                name="productType"
                                value={formData.productType}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="Select or type..."
                                required
                            />
                            <datalist id="productTypeOptions">
                                <option value="crop" />
                                <option value="livestock" />
                                <option value="input" />
                                <option value="rent" />
                                <option value="machinery" />
                            </datalist>
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

                    {/* Image Upload */}
                    {!isEditMode && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                            <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="text-gray-400" size={24} />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                                <div className="text-xs text-gray-500">
                                    <p>Click to upload</p>
                                    <p>JPG, PNG, WebP (Max 5MB)</p>
                                </div>
                            </div>
                        </div>
                    )}

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
