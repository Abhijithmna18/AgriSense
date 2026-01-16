import React, { useState, useEffect } from 'react';
import { Check, X, Shield, Clock, MapPin, Building, AlertTriangle } from 'lucide-react';
import api from '../../services/authApi';

const AdminVendorApproval = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // ID of vendor being processed
    const [rejectReason, setRejectReason] = useState('');
    const [rejectModalOpen, setRejectModalOpen] = useState(null); // ID of vendor to reject

    const fetchPendingVendors = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/admin/vendors/pending');
            console.log('Pending Vendors Data:', data.data); // DEBUG
            setVendors(data.data || []);
        } catch (error) {
            console.error('Failed to fetch vendors', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingVendors();
    }, []);

    const handleApprove = async (id) => {
        if (!window.confirm('Are you sure you want to approve this vendor?')) return;

        setActionLoading(id);
        try {
            await api.post(`/api/admin/vendors/${id}/approve`, {});
            // Remove from list
            setVendors(prev => prev.filter(v => v._id !== id));
        } catch (error) {
            console.error('Approval failed', error);
            alert('Failed to approve vendor');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectModalOpen || !rejectReason.trim()) return;

        const id = rejectModalOpen;
        setActionLoading(id);

        try {
            await api.post(`/api/admin/vendors/${id}/reject`, { remarks: rejectReason });
            setVendors(prev => prev.filter(v => v._id !== id));
            setRejectModalOpen(null);
            setRejectReason('');
        } catch (error) {
            console.error('Rejection failed', error);
            alert('Failed to reject vendor');
        } finally {
            setActionLoading(null);
        }
    };


    // Helper to safely render content
    const safeRender = (value) => {
        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
        }
        return value || '';
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading pending applications...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Shield className="text-blue-600" size={24} />
                    Pending Vendor Approvals
                </h2>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {vendors.length} Pending
                </span>
            </div>

            {vendors.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-dashed border-gray-300">
                    <Check className="mx-auto text-green-300 mb-4" size={48} />
                    <p className="text-gray-500 font-medium">No pending vendor applications.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {vendors.map(vendor => (
                        <div key={vendor._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition hover:shadow-md">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                {/* Vendor Details */}
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{safeRender(vendor.vendorProfile?.businessName)}</h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <Building size={14} />
                                                {safeRender(vendor.vendorProfile?.vendorType)?.toString().toUpperCase()}
                                            </p>
                                        </div>
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full flex items-center gap-1">
                                            <Clock size={12} /> Pending
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div>
                                            <p className="font-medium text-gray-900">Contact</p>
                                            <p>{safeRender(vendor.firstName)} {safeRender(vendor.lastName)}</p>
                                            <p>{safeRender(vendor.email)}</p>
                                            <p>{safeRender(vendor.phone)}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Location</p>
                                            <p className="flex items-center gap-1">
                                                <MapPin size={14} className="text-gray-400" />
                                                {safeRender(vendor.vendorProfile?.pickupAddress?.city)}, {safeRender(vendor.vendorProfile?.pickupAddress?.state)}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1 truncate">{safeRender(vendor.vendorProfile?.pickupAddress?.addressLine)}</p>
                                        </div>
                                    </div>

                                    {/* Bank Info */}
                                    <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1">
                                        <p className="font-medium text-gray-700">Bank Details</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <p><span className="text-gray-400">Bank:</span> {safeRender(vendor.vendorProfile?.bankDetails?.bankName)}</p>
                                            <p><span className="text-gray-400">Acct:</span> {safeRender(vendor.vendorProfile?.bankDetails?.accountNumber)}</p>
                                            <p><span className="text-gray-400">IFSC:</span> {safeRender(vendor.vendorProfile?.bankDetails?.ifscCode)}</p>
                                            <p><span className="text-gray-400">GST:</span> {safeRender(vendor.vendorProfile?.gstin || 'N/A')}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-row md:flex-col justify-end gap-3 min-w-[140px]">
                                    <button
                                        onClick={() => handleApprove(vendor._id)}
                                        disabled={actionLoading === vendor._id}
                                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition"
                                    >
                                        <Check size={18} />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => setRejectModalOpen(vendor._id)}
                                        disabled={actionLoading === vendor._id}
                                        className="flex-1 px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium flex items-center justify-center gap-2 transition"
                                    >
                                        <X size={18} />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reject Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-scale-up">
                        <div className="flex items-center gap-3 text-red-600">
                            <AlertTriangle size={24} />
                            <h3 className="text-lg font-bold">Reject Application</h3>
                        </div>
                        <p className="text-gray-600">Please provide a reason for rejection. This will be shown to the user.</p>

                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full h-32 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none"
                            placeholder="Reason for rejection..."
                        />

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => { setRejectModalOpen(null); setRejectReason(''); }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason.trim()}
                                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVendorApproval;
