import React, { useState } from 'react';
import { User, MapPin, Building, CreditCard, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/authApi';

const VendorProfile = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        businessName: user.vendorProfile?.businessName || '',
        phone: user.phone || '',
        pickupAddress: {
            addressLine: user.vendorProfile?.pickupAddress?.addressLine || '',
            city: user.vendorProfile?.pickupAddress?.city || '',
            state: user.vendorProfile?.pickupAddress?.state || '',
            pinCode: user.vendorProfile?.pickupAddress?.pinCode || ''
        },
        bankDetails: {
            bankName: user.vendorProfile?.bankDetails?.bankName || '',
            accountNumber: user.vendorProfile?.bankDetails?.accountNumber || '',
            ifscCode: user.vendorProfile?.bankDetails?.ifscCode || '',
            upiId: user.vendorProfile?.bankDetails?.upiId || ''
        }
    });

    const [saving, setSaving] = useState(false);

    const handleChange = (section, field, value) => {
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                vendorProfile: {
                    ...user.vendorProfile, // Keep existing fields
                    businessName: formData.businessName,
                    pickupAddress: formData.pickupAddress,
                    bankDetails: formData.bankDetails
                }
            };

            await api.put('/api/auth/updatedetails', payload);
            alert('Profile updated successfully');
        } catch (error) {
            console.error('Update failed', error);
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Store Profile</h1>
                    <p className="text-gray-500">Manage your business details and payout info</p>
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50 shadow-lg shadow-green-200"
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Basic Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
                    <User className="text-blue-500" size={24} />
                    <h3>Business Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Business Name</label>
                        <input
                            className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                            value={formData.businessName}
                            onChange={(e) => handleChange(null, 'businessName', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Address */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
                    <MapPin className="text-orange-500" size={24} />
                    <h3>Pickup Address</h3>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Address Line</label>
                        <input
                            className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                            value={formData.pickupAddress.addressLine}
                            onChange={(e) => handleChange('pickupAddress', 'addressLine', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">City</label>
                            <input
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                                value={formData.pickupAddress.city}
                                onChange={(e) => handleChange('pickupAddress', 'city', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">State</label>
                            <input
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                                value={formData.pickupAddress.state}
                                onChange={(e) => handleChange('pickupAddress', 'state', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Pincode</label>
                            <input
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                                value={formData.pickupAddress.pinCode}
                                onChange={(e) => handleChange('pickupAddress', 'pinCode', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bank Details */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
                    <CreditCard className="text-green-500" size={24} />
                    <h3>Payout Settings</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Bank Name</label>
                        <input
                            className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                            value={formData.bankDetails.bankName}
                            onChange={(e) => handleChange('bankDetails', 'bankName', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Account Number</label>
                        <input
                            type="password"
                            className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                            value={formData.bankDetails.accountNumber}
                            onChange={(e) => handleChange('bankDetails', 'accountNumber', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">IFSC Code</label>
                        <input
                            className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 uppercase"
                            value={formData.bankDetails.ifscCode}
                            onChange={(e) => handleChange('bankDetails', 'ifscCode', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">UPI ID (Optional)</label>
                        <input
                            className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                            value={formData.bankDetails.upiId}
                            onChange={(e) => handleChange('bankDetails', 'upiId', e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </form>
    );
};

export default VendorProfile;
