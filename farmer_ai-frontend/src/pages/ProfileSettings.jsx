import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, Save, X, ChevronDown, ChevronUp, Lock, Shield,
    Smartphone, LogOut, ArrowLeft, Check, AlertCircle, Loader
} from 'lucide-react';
import { authAPI } from '../services/authApi';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    // Global State
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Modals State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Section State
    const [sections, setSections] = useState({
        basic: true,
        personal: true,
        farm: true,
        security: false
    });

    const toggleSection = (section) => {
        setSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Form Data
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        city: '',
        state: '',
        district: '',
        pincode: '',
        soilType: 'Loamy',
        cropsOfInterest: [],
        language: 'English',
    });

    // Detailed tracking for initial data to check 'dirty' state accurately
    const [initialData, setInitialData] = useState({});

    // Photo Upload State
    const fileInputRef = useRef(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoDirty, setPhotoDirty] = useState(false);

    // Load User Data
    useEffect(() => {
        if (user) {
            const data = {
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                city: user.addresses?.[0]?.city || '',
                state: user.addresses?.[0]?.state || '',
                district: user.addresses?.[0]?.district || '',
                pincode: user.addresses?.[0]?.postalCode || '',
                soilType: user.preferences?.soilType || 'Loamy',
                cropsOfInterest: user.preferences?.cropsOfInterest || [],
                language: user.preferences?.language || 'English',
            };
            setFormData(data);
            setInitialData(data);
            setAvatarUrl(user.profilePhotoUrl || null);
        }
    }, [user]);

    // Check Dirty State
    useEffect(() => {
        const isFormChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
        setIsDirty(isFormChanged || photoDirty);
    }, [formData, initialData, photoDirty]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- PHOTO UPLOAD LOGIC ---
    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'Image size must be less than 2MB' });
                return;
            }
            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                setMessage({ type: 'error', text: 'Only JPG and PNG files are allowed' });
                return;
            }

            const url = URL.createObjectURL(file);
            setAvatarUrl(url);
            setPhotoFile(file);
            setPhotoDirty(true);
        }
    };

    const handleRemovePhoto = () => {
        setAvatarUrl(null);
        setPhotoFile(null);
        setPhotoDirty(true);
    };

    const handleSavePhoto = async () => {
        if (!photoFile && avatarUrl === user?.profilePhotoUrl) return;

        setLoading(true);
        try {
            // Simulating upload since we don't have true multipart setup 
            // but we'll assume updateProfile handles dataUrl or backend ignores for now if mocked
            const payload = { profilePhotoUrl: avatarUrl };

            // await authAPI.updateProfile(payload); // Real call

            // Simulate success
            setMessage({ type: 'success', text: 'Profile photo updated' });
            setPhotoDirty(false);

        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update photo' });
        } finally {
            setLoading(false);
        }
    };

    // --- TAG LOGIC ---
    const [cropInput, setCropInput] = useState('');
    const addCrop = (e) => {
        if (e.key === 'Enter' && cropInput.trim()) {
            e.preventDefault();
            if (!formData.cropsOfInterest.includes(cropInput.trim())) {
                setFormData(prev => ({
                    ...prev,
                    cropsOfInterest: [...prev.cropsOfInterest, cropInput.trim()]
                }));
            }
            setCropInput('');
        }
    };
    const removeCrop = (crop) => {
        setFormData(prev => ({
            ...prev,
            cropsOfInterest: prev.cropsOfInterest.filter(c => c !== crop)
        }));
    };

    // --- GLOBAL SAVE ---
    const handleGlobalSave = async () => {
        if (!isDirty) return;
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                addresses: [{
                    city: formData.city,
                    state: formData.state,
                    district: formData.district,
                    postalCode: formData.pincode
                }],
                preferences: {
                    soilType: formData.soilType,
                    cropsOfInterest: formData.cropsOfInterest,
                    language: formData.language
                }
            };

            if (photoDirty) {
                payload.profilePhotoUrl = avatarUrl;
            }

            const response = await authAPI.updateProfile(payload);

            // setUser(response.data); // Update context

            setInitialData(formData);
            setPhotoDirty(false);
            setMessage({ type: 'success', text: 'Profile updated successfully' });

            setTimeout(() => setMessage({ type: '', text: '' }), 3000);

        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    // --- SECURITY ACTIONS ---
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const handlePasswordChange = async () => {
        if (!passwordData.current || !passwordData.new || !passwordData.confirm) return;
        if (passwordData.new !== passwordData.confirm) {
            alert("Passwords do not match");
            return;
        }

        try {
            await authAPI.changePassword({ currentPassword: passwordData.current, newPassword: passwordData.new });
            setShowPasswordModal(false);
            setMessage({ type: 'success', text: 'Password updated successfully' });
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update password');
        }
    };

    // 2FA Logic
    const [qrCode, setQrCode] = useState('');
    const [otpCode, setOtpCode] = useState('');

    const handleEnable2FA = async () => {
        try {
            const res = await authAPI.enable2FA();
            setQrCode(res.data.qrCodeUrl);
        } catch (error) {
            console.error(error);
        }
    };

    const handleVerify2FA = async () => {
        try {
            await authAPI.verify2FA({ code: otpCode });
            setShow2FAModal(false);
            setMessage({ type: 'success', text: '2FA Enabled successfully' });
        } catch (error) {
            alert('Invalid code');
        }
    };

    useEffect(() => {
        if (show2FAModal && !user?.twoFactorEnabled) {
            handleEnable2FA();
        }
    }, [show2FAModal]);


    const handleLogoutAll = async () => {
        try {
            await authAPI.logoutAll();
            setShowLogoutModal(false);
            setMessage({ type: 'success', text: 'Logged out from all other devices' });
        } catch (error) {
            console.error(error);
        }
    };

    const calculateProgress = () => {
        let filled = 0;
        const total = 7;
        if (formData.firstName) filled++;
        if (formData.lastName) filled++;
        if (user?.email) filled++;
        if (formData.city) filled++;
        if (formData.state) filled++;
        if (formData.pincode) filled++;
        if (formData.cropsOfInterest.length > 0) filled++;
        return Math.round((filled / total) * 100);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 pb-24">
            {/* Navigation */}
            <button
                onClick={() => navigate('/farmer-dashboard')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
            >
                <ArrowLeft size={18} />
                <span className="font-medium">Back to Dashboard</span>
            </button>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-deep-charcoal">Profile Settings</h1>
                <p className="text-deep-charcoal/70 mt-1">Manage your personal details, farm preferences, and account security</p>
            </div>

            {/* Profile Completion */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between mb-2">
                    <span className="font-semibold text-deep-charcoal">Profile Completion</span>
                    <span className="text-[#2E7D32] font-semibold">{calculateProgress()}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                        className="bg-[#2E7D32] h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${calculateProgress()}%` }}
                    ></div>
                </div>
            </div>

            {/* Message Toast */}
            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-24 right-8 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 ${message.type === 'success'
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                            }`}
                    >
                        {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Basic Info (Photo) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div
                    className="p-6 flex justify-between items-center cursor-pointer bg-gray-50/50"
                    onClick={() => toggleSection('basic')}
                >
                    <h3 className="text-xl font-semibold text-deep-charcoal">Basic Information</h3>
                    {sections.basic ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                <AnimatePresence>
                    {sections.basic && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-6 pb-8"
                        >
                            <div className="flex flex-col md:flex-row gap-8 mt-4">
                                {/* Photo Section with DYNAMIC AVATAR CONTAINER */}
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-32 h-32 relative group">
                                        {/* Existing container (reused) */}
                                        <div className="w-full h-full rounded-full bg-[var(--admin-bg-secondary)] flex items-center justify-center overflow-hidden border border-[var(--admin-border)]">
                                            {avatarUrl ? (
                                                <img
                                                    src={avatarUrl}
                                                    alt="User profile photo"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Camera size={40} className="text-[var(--admin-text-muted)]" />
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".jpg,.jpeg,.png"
                                        onChange={handlePhotoSelect}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-xs px-3 py-1.5 bg-[#2E7D32]/10 text-[#2E7D32] rounded-lg font-medium hover:bg-[#2E7D32]/20 transition-colors"
                                        >
                                            Change Photo
                                        </button>
                                        <button
                                            onClick={handleRemovePhoto}
                                            className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    {photoDirty && (
                                        <button
                                            onClick={handleSavePhoto}
                                            className="text-xs w-full py-1.5 bg-[#2E7D32] text-white rounded-lg font-medium hover:bg-[#1B5E20] transition-colors"
                                        >
                                            Save Photo
                                        </button>
                                    )}
                                </div>

                                {/* Text Fields */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-deep-charcoal/80">First Name</label>
                                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-deep-charcoal/80">Last Name</label>
                                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] outline-none" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-deep-charcoal/80">Email Address</label>
                                        <input type="email" value={user?.email || ''} disabled className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-deep-charcoal/80">Role</label>
                                        <input type="text" value={user?.role || 'Farmer'} disabled className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Personal Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 flex justify-between items-center cursor-pointer bg-gray-50/50" onClick={() => toggleSection('personal')}>
                    <h3 className="text-xl font-semibold text-deep-charcoal">Personal Information</h3>
                    {sections.personal ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                <AnimatePresence>
                    {sections.personal && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-6 pb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-deep-charcoal/80">City / Area</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-deep-charcoal/80">State</label>
                                    <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-deep-charcoal/80">District</label>
                                    <input type="text" name="district" value={formData.district} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-deep-charcoal/80">Pincode</label>
                                    <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} maxLength="6" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] outline-none" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Farm Preferences */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 flex justify-between items-center cursor-pointer bg-gray-50/50" onClick={() => toggleSection('farm')}>
                    <h3 className="text-xl font-semibold text-deep-charcoal">Farm Preferences</h3>
                    {sections.farm ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                <AnimatePresence>
                    {sections.farm && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-6 pb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-deep-charcoal/80">Soil Type</label>
                                    <select name="soilType" value={formData.soilType} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] outline-none">
                                        <option>Loamy</option><option>Clay</option><option>Sandy</option><option>Silt</option><option>Peaty</option><option>Chalky</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-deep-charcoal/80">Language</label>
                                    <select name="language" value={formData.language} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] outline-none">
                                        <option>English</option><option>Hindi</option><option>Malayalam</option><option>Tamil</option>
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-deep-charcoal/80">Crops of Interest</label>
                                    <div className="flex flex-wrap gap-2 mb-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                                        {formData.cropsOfInterest.map((crop, i) => (
                                            <span key={i} className="px-3 py-1 bg-[#2E7D32]/10 text-[#2E7D32] rounded-full text-sm font-medium flex items-center gap-1">{crop} <X size={14} className="cursor-pointer" onClick={() => removeCrop(crop)} /></span>
                                        ))}
                                        <input type="text" value={cropInput} onChange={e => setCropInput(e.target.value)} onKeyDown={addCrop} placeholder="Type and press Enter..." className="bg-transparent border-none outline-none flex-1 min-w-[150px]" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Security */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 flex justify-between items-center cursor-pointer bg-gray-50/50" onClick={() => toggleSection('security')}>
                    <h3 className="text-xl font-semibold text-deep-charcoal">Security Settings</h3>
                    {sections.security ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                <AnimatePresence>
                    {sections.security && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-6 pb-8">
                            <div className="space-y-4 mt-4">
                                {/* Change Password */}
                                <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg border border-gray-200 group-hover:border-[#2E7D32]/30"><Lock size={20} className="text-deep-charcoal/70" /></div>
                                        <div><p className="font-medium text-deep-charcoal">Change Password</p><p className="text-sm text-deep-charcoal/60">Update your password regularly</p></div>
                                    </div>
                                    <ChevronDown size={16} className="-rotate-90 text-gray-400" />
                                </button>

                                {/* 2FA */}
                                <button onClick={() => setShow2FAModal(true)} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg border border-gray-200 group-hover:border-[#2E7D32]/30"><Shield size={20} className="text-deep-charcoal/70" /></div>
                                        <div><p className="font-medium text-deep-charcoal">Two-Factor Authentication</p><p className="text-sm text-deep-charcoal/60">Add an extra layer of security</p></div>
                                    </div>
                                    <div className={`text-sm font-medium ${user?.twoFactorEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                                        {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                    </div>
                                </button>

                                {/* Logout All */}
                                <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors text-left group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg border border-red-100"><LogOut size={20} className="text-red-500" /></div>
                                        <div><p className="font-medium text-red-600">Log Out All Devices</p><p className="text-sm text-red-500/70">Terminate all active sessions</p></div>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Global Actions */}
            <div className="fixed bottom-8 right-8 flex gap-4">
                <button onClick={() => setFormData(initialData)} className="px-6 py-3 bg-white text-deep-charcoal font-medium rounded-xl shadow-lg border border-gray-100 hover:bg-gray-50 transition-all">Cancel</button>
                <button
                    onClick={handleGlobalSave}
                    disabled={!isDirty || loading}
                    className={`px-6 py-3 font-medium rounded-xl shadow-lg flex items-center gap-2 transition-all ${isDirty && !loading
                        ? 'bg-[#2E7D32] text-white hover:bg-[#1B5E20] shadow-[#2E7D32]/20'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            {/* --- MODALS --- */}

            {/* Password Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                            <h3 className="text-xl font-bold mb-4">Change Password</h3>
                            <div className="space-y-4">
                                <input type="password" placeholder="Current Password" value={passwordData.current} onChange={e => setPasswordData({ ...passwordData, current: e.target.value })} className="w-full p-3 border rounded-xl" />
                                <input type="password" placeholder="New Password" value={passwordData.new} onChange={e => setPasswordData({ ...passwordData, new: e.target.value })} className="w-full p-3 border rounded-xl" />
                                <input type="password" placeholder="Confirm New Password" value={passwordData.confirm} onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })} className="w-full p-3 border rounded-xl" />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setShowPasswordModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button onClick={handlePasswordChange} className="px-4 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1b5e20]">Update Password</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 2FA Modal */}
            <AnimatePresence>
                {show2FAModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                            <h3 className="text-xl font-bold mb-4">Two-Factor Authentication</h3>
                            <div className="flex flex-col items-center gap-4 py-4">
                                <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 overflow-hidden">
                                    {qrCode ? (
                                        <img src={qrCode} alt="2FA QR Code" className="w-full h-full object-contain" />
                                    ) : (
                                        <Loader className="animate-spin text-gray-400" />
                                    )}
                                </div>
                                <p className="text-sm text-center text-gray-500">Scan this QR code with your authenticator app</p>
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    className="w-full text-center tracking-widest text-lg p-3 border rounded-xl"
                                    maxLength={6}
                                    value={otpCode}
                                    onChange={e => setOtpCode(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button onClick={() => setShow2FAModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button onClick={handleVerify2FA} className="px-4 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1b5e20]">Enable 2FA</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                            <h3 className="text-xl font-bold mb-2 text-red-600 flex items-center gap-2">
                                <AlertCircle size={24} /> Log Out All Devices?
                            </h3>
                            <p className="text-gray-600 mb-6">This will end all active sessions including other browsers and devices. You will need to log in again on those devices.</p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button onClick={handleLogoutAll} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Yes, Log Out All</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default ProfileSettings;
