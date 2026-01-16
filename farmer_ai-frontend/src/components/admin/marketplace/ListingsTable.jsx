import React, { useState, useEffect } from 'react';
import { getMarketplaceListings, updateMarketplaceListing, createMarketplaceListing } from '../../../services/adminApi';
import {
    Edit, Trash2, Search, Filter, Plus, ChevronLeft, ChevronRight,
    MoreHorizontal, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

import EditListingModal from './EditListingModal';

const ListingsTable = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [currentListing, setCurrentListing] = useState(null); // For Edit

    const fetchListings = async () => {
        setLoading(true);
        try {
            const res = await getMarketplaceListings({
                page,
                limit: 10,
                search,
                type: typeFilter,
                status: statusFilter
            });
            setListings(res.data.listings);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error("Failed to fetch listings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchListings();
        }, 500);
        return () => clearTimeout(timer);
    }, [page, search, typeFilter, statusFilter]);

    const handleSoftDelete = async (id) => {
        if (window.confirm('Are you sure you want to disable this listing?')) {
            try {
                await updateMarketplaceListing(id, { isDeleted: true });
                fetchListings();
            } catch (error) {
                alert('Failed to delete');
            }
        }
    };

    const handleEditClick = (item) => {
        setCurrentListing(item);
        setShowModal(true);
    };

    const handleEditSuccess = (updatedListing) => {
        setListings(prev => {
            const exists = prev.find(item => item._id === updatedListing._id);
            if (exists) {
                return prev.map(item => item._id === updatedListing._id ? updatedListing : item);
            }
            return [updatedListing, ...prev];
        });
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex gap-2 items-center bg-white p-2 rounded-xl border border-[var(--admin-border)] w-full md:w-96">
                    <Search size={20} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search listings..."
                        className="bg-transparent outline-none w-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => {
                        setCurrentListing(null);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-[var(--admin-accent)] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[var(--admin-accent-hover)] transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Add Product
                </button>
                <div className="flex gap-2">
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="bg-white border border-[var(--admin-border)] rounded-xl px-4 py-2 outline-none"
                    >
                        <option value="">All Types</option>
                        <option value="crop">Crop</option>
                        <option value="livestock">Livestock</option>
                        <option value="input">Input</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border border-[var(--admin-border)] rounded-xl px-4 py-2 outline-none"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="sold">Sold</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-[var(--admin-border)] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-[var(--admin-border)]">
                            <tr>
                                <th className="p-4 font-medium text-gray-500">ID</th>
                                <th className="p-4 font-medium text-gray-500">Seller</th>
                                <th className="p-4 font-medium text-gray-500">Type</th>
                                <th className="p-4 font-medium text-gray-500">Product</th>
                                <th className="p-4 font-medium text-gray-500">Price</th>
                                <th className="p-4 font-medium text-gray-500">Status</th>
                                <th className="p-4 font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-400">Loading...</td></tr>
                            ) : listings.length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-400">No listings found</td></tr>
                            ) : (
                                listings.map((item) => (
                                    <tr key={item.listingId} className="border-b border-[var(--admin-border)] hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-mono text-xs text-gray-500">{item.listingId.split('-')[0]}...</td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{item.seller?.firstName} {item.seller?.lastName}</span>
                                                <span className="text-xs text-gray-400">{item.seller?.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium uppercase tracking-wider
                                                ${item.productType === 'crop' ? 'bg-green-100 text-green-700' :
                                                    item.productType === 'livestock' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-blue-100 text-blue-700'}`
                                            }>
                                                {item.productType}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm max-w-xs truncate">
                                            {/* Ideally parse productRef if it's JSON */}
                                            {typeof item.productRef === 'object' ?
                                                (item.productRef.name || item.productRef.variety || JSON.stringify(item.productRef))
                                                : item.location}
                                        </td>
                                        <td className="p-4 font-medium">₹{item.pricePerUnit} / {item.unit}</td>
                                        <td className="p-4">
                                            <span className={`flex items-center gap-1 text-sm font-medium
                                                ${item.status === 'active' ? 'text-green-600' :
                                                    item.status === 'sold' ? 'text-blue-600' : 'text-gray-400'}`
                                            }>
                                                {item.status === 'active' ? <CheckCircle size={14} /> :
                                                    item.status === 'sold' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                {item.status}
                                            </span>
                                            {item.isDeleted && <span className="text-xs text-red-500 ml-2">(Disabled)</span>}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    className="p-1 hover:bg-gray-100 rounded text-gray-500"
                                                    title="Edit"
                                                    onClick={() => handleEditClick(item)}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                {!item.isDeleted && (
                                                    <button
                                                        className="p-1 hover:bg-red-50 rounded text-red-500"
                                                        title="Disable"
                                                        onClick={() => handleSoftDelete(item._id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 flex items-center justify-between bg-gray-50 border-t border-[var(--admin-border)]">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="flex items-center gap-1 text-sm font-medium text-gray-600 disabled:opacity-50 hover:text-gray-900"
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>
                    <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="flex items-center gap-1 text-sm font-medium text-gray-600 disabled:opacity-50 hover:text-gray-900"
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <EditListingModal
                    listing={currentListing}
                    onClose={() => setShowModal(false)}
                    onUpdate={handleEditSuccess}
                />
            )}
        </div>
    );
};

export default ListingsTable;
