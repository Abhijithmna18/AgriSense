
import React, { useEffect, useState } from 'react';
import { getWarehouses, createWarehouse, updateWarehouse, uploadWarehouseImage, deleteWarehouse } from '../../services/warehouseApi';
import { Plus, Edit, Trash2, Home, X, Upload, Image as ImageIcon } from 'lucide-react';

const AdminWarehousePage = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location: { city: '', state: '', address: '' },
        capacity: { total: 100, available: 100 },
        specifications: { type: 'Dry', supportedCrops: [], facilities: [] },
        pricing: { basePricePerTon: 50 },
        manager: '', // Should be populated from context usually, but backend handles it
        images: []
    });

    useEffect(() => {
        loadWarehouses();
    }, []);

    const loadWarehouses = async () => {
        try {
            const data = await getWarehouses();
            setWarehouses(data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            // Transform supportedCrops from string to array if needed (simple comma separation)
            const payload = {
                ...formData,
                specifications: {
                    ...formData.specifications,
                    supportedCrops: typeof formData.specifications.supportedCrops === 'string'
                        ? formData.specifications.supportedCrops.split(',').map(s => s.trim())
                        : formData.specifications.supportedCrops
                }
            };

            if (editingId) {
                await updateWarehouse(editingId, payload);
            } else {
                await createWarehouse(payload);
            }
            setShowModal(false);
            setEditingId(null);

            // Reload and confirm
            await loadWarehouses();
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to save: ' + (error.message || 'Unknown error'));
        }
    };

    const handleEdit = (warehouse) => {
        setEditingId(warehouse._id);
        setFormData({
            name: warehouse.name || '',
            location: {
                city: warehouse.location?.city || '',
                state: warehouse.location?.state || '',
                address: warehouse.location?.address || ''
            },
            capacity: {
                total: warehouse.capacity?.total || 100,
                available: warehouse.capacity?.available || 100
            },
            specifications: {
                type: warehouse.specifications?.type || 'Dry',
                supportedCrops: warehouse.specifications?.supportedCrops?.join(', ') || '',
                facilities: warehouse.specifications?.facilities || []
            },
            pricing: {
                basePricePerTon: warehouse.pricing?.basePricePerTon || 0
            },
            manager: warehouse.manager || '',
            images: warehouse.images || []
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to deactivate this warehouse?')) {
            try {
                await deleteWarehouse(id);
                loadWarehouses();
            } catch (error) {
                alert('Delete failed: ' + error.message);
            }
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const data = new FormData();
        data.append('image', file);

        try {
            setUploading(true);
            // Default VITE_API_URL is http://localhost:5000 usually
            // but the uploaded URL is relative e.g. /uploads/image-123.jpg
            // We want to store the full path or relative?
            // Usually valid src should be absolute if backend is on different port.
            // Backend returns `imageUrl: /uploads/...`
            const res = await uploadWarehouseImage(data);

            // We need to prepend backend URL if it's relative and we are on different port?
            // For now, let's store what backend gives, and handle display logic.
            // Actually, best to store relative path in DB, and prepend BASE_URL on display.
            // BUT, for simplicity in `img src`, let's just make sure we handle it.
            // The backend returns `/ uploads / filename`.

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, res.imageUrl]
            }));
        } catch (error) {
            alert('Upload failed: ' + error);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    // Helper to get full image URL
    // Ideally this should be a utility, but placing here for now.
    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return `${BASE_URL}${path} `;
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Warehouse Management</h1>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({
                            name: '',
                            location: { city: '', state: '', address: '' },
                            capacity: { total: 100, available: 100 },
                            specifications: { type: 'Dry', supportedCrops: [], facilities: [] },
                            pricing: { basePricePerTon: 50 },
                            manager: '',
                            images: []
                        });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    <Plus className="w-4 h-4" /> Add Warehouse
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {warehouses.map(w => (
                    <div key={w._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
                        {/* Image Preview in Card */}
                        <div className="h-40 w-full bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
                            {w.images && w.images.length > 0 ? (
                                <img
                                    src={getImageUrl(w.images[0])}
                                    alt={w.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E"
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ImageIcon className="w-12 h-12" />
                                </div>
                            )}
                            <span className={`absolute top - 2 right - 2 px - 2 py - 1 text - xs rounded - full font - bold ${w.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} `}>
                                {w.status}
                            </span>
                        </div>

                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-lg">{w.name}</h3>
                                <p className="text-sm text-gray-500">{w.location.city}, {w.location.state}</p>
                            </div>
                        </div>
                        <div className="mb-4 text-sm text-gray-600 flex-1">
                            <div>Type: {w.specifications?.type || 'N/A'}</div>
                            <div>Capacity: {w.capacity?.available}/{w.capacity?.total} tons</div>
                            <div className="line-clamp-2">Crops: {w.specifications?.supportedCrops?.join(', ') || 'None'}</div>
                        </div>
                        <div className="flex justify-end gap-2 mt-auto">
                            <button
                                onClick={() => handleEdit(w)}
                                className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                                onClick={() => handleDelete(w._id)}
                                className="p-2 bg-red-50 rounded hover:bg-red-100"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Simple Modal logic omitted for brevity in this specific artifact, but assumed fully functional for editing */}
            {/* In a real app, I'd implement the full form modal here. For this task, focusing on read/write logic validation */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white p-6 rounded-xl w-full max-w-lg my-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{editingId ? 'Edit' : 'Add'} Warehouse</h2>
                            <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            {/* Image Upload Section */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Images</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {formData.images.map((img, index) => (
                                        <div key={index} className="relative w-20 h-20 rounded border overflow-hidden group">
                                            <img src={getImageUrl(img)} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-0 right-0 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                                        {uploading ? (
                                            <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full" />
                                        ) : (
                                            <>
                                                <Upload className="w-5 h-5 text-gray-400" />
                                                <span className="text-[10px] text-gray-500 mt-1">Upload</span>
                                            </>
                                        )}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                    </label>
                                </div>
                            </div>

                            <input
                                className="w-full p-2 border rounded"
                                placeholder="Warehouse Name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    className="p-2 border rounded"
                                    placeholder="City"
                                    value={formData.location.city}
                                    onChange={e => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                                    required
                                />
                                <input
                                    className="p-2 border rounded"
                                    placeholder="State"
                                    value={formData.location.state}
                                    onChange={e => setFormData({ ...formData, location: { ...formData.location, state: e.target.value } })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    className="p-2 border rounded"
                                    placeholder="Total Capacity (tons)"
                                    value={formData.capacity.total}
                                    onChange={e => setFormData({ ...formData, capacity: { total: e.target.value, available: e.target.value } })}
                                    required
                                />
                                <input
                                    type="number"
                                    className="p-2 border rounded"
                                    placeholder="Base Price (₹)"
                                    value={formData.pricing.basePricePerTon}
                                    onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing, basePricePerTon: e.target.value } })}
                                    required
                                />
                            </div>
                            <input
                                className="w-full p-2 border rounded"
                                placeholder="Supported Crops (comma separated)"
                                value={formData.specifications.supportedCrops}
                                onChange={e => setFormData({ ...formData, specifications: { ...formData.specifications, supportedCrops: e.target.value } })}
                                required
                            />

                            <div className="flex gap-2 mt-4 pt-4 border-t">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-200 rounded">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded">Save Warehouse</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminWarehousePage;
