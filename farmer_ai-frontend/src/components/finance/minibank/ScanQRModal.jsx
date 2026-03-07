import React, { useState } from 'react';
import { X, QrCode, Camera, Upload, AlertCircle, CheckCircle } from 'lucide-react';

const ScanQRModal = ({ isOpen, onClose, onScan, walletBalance }) => {
    const [qrData, setQrData] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const [errors, setErrors] = useState({});
    const [scanning, setScanning] = useState(false);
    const [processing, setProcessing] = useState(false);

    if (!isOpen) return null;

    // Parse QR code data
    const parseQRData = (data) => {
        try {
            // Try to parse as JSON first
            const parsed = JSON.parse(data);
            return parsed;
        } catch {
            // If not JSON, try to parse as UPI format
            // Format: upi://pay?pa=receiver@bank&pn=ReceiverName&am=100&cu=INR
            if (data.startsWith('upi://')) {
                const url = new URL(data);
                const params = new URLSearchParams(url.search);
                return {
                    type: 'upi',
                    receiverId: params.get('pa'),
                    receiverName: params.get('pn'),
                    amount: params.get('am'),
                    currency: params.get('cu') || 'INR',
                    note: params.get('tn')
                };
            }
            
            // Simple format: RECEIVER_ID:AMOUNT:DESCRIPTION
            const parts = data.split(':');
            if (parts.length >= 2) {
                return {
                    type: 'simple',
                    receiverId: parts[0],
                    amount: parts[1],
                    description: parts[2] || ''
                };
            }
            
            throw new Error('Invalid QR format');
        }
    };

    const handleQRInput = (e) => {
        const value = e.target.value;
        setQrData(value);
        setErrors({});
        setParsedData(null);

        if (value.trim()) {
            try {
                const parsed = parseQRData(value.trim());
                setParsedData(parsed);
            } catch (error) {
                setErrors({ qrData: 'Invalid QR code format' });
            }
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // In a real implementation, you would use a QR code reader library
        // For now, we'll simulate it
        setScanning(true);
        
        setTimeout(() => {
            // Simulate QR code reading
            const simulatedQRData = `USER${Math.floor(Math.random() * 1000)}:${(Math.random() * 1000).toFixed(2)}:Payment for services`;
            setQrData(simulatedQRData);
            
            try {
                const parsed = parseQRData(simulatedQRData);
                setParsedData(parsed);
                setScanning(false);
            } catch (error) {
                setErrors({ qrData: 'Failed to read QR code' });
                setScanning(false);
            }
        }, 1500);
    };

    const handleCameraCapture = () => {
        // In a real implementation, you would open camera and use a QR scanner
        // For now, we'll simulate it
        setScanning(true);
        
        setTimeout(() => {
            const simulatedQRData = JSON.stringify({
                receiverId: `USER${Math.floor(Math.random() * 1000)}`,
                amount: (Math.random() * 500).toFixed(2),
                description: 'Scanned payment'
            });
            setQrData(simulatedQRData);
            
            try {
                const parsed = parseQRData(simulatedQRData);
                setParsedData(parsed);
                setScanning(false);
            } catch (error) {
                setErrors({ qrData: 'Failed to scan QR code' });
                setScanning(false);
            }
        }, 2000);
    };

    const validate = () => {
        const newErrors = {};

        if (!parsedData) {
            newErrors.qrData = 'Please scan or enter a valid QR code';
            setErrors(newErrors);
            return false;
        }

        const amount = parseFloat(parsedData.amount);
        if (!amount || amount <= 0) {
            newErrors.amount = 'Invalid amount in QR code';
        } else if (amount > walletBalance) {
            newErrors.amount = `Insufficient balance. Available: ₹${walletBalance.toLocaleString('en-IN')}`;
        }

        if (!parsedData.receiverId) {
            newErrors.receiverId = 'Invalid receiver information in QR code';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) return;

        setProcessing(true);
        try {
            await onScan({
                qrData: qrData,
                receiverId: parsedData.receiverId,
                amount: parsedData.amount,
                description: parsedData.description || parsedData.note || 'QR Payment'
            });
            
            // Reset form
            setQrData('');
            setParsedData(null);
            setErrors({});
            onClose();
        } catch (error) {
            setErrors({ submit: error.message || 'Failed to process payment' });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <QrCode className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Scan QR Code</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Available Balance */}
                    <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-sm text-purple-600 mb-1">Available Balance</div>
                        <div className="text-2xl font-bold text-purple-900">
                            ₹{walletBalance?.toLocaleString('en-IN') || '0'}
                        </div>
                    </div>

                    {/* Scan Options */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={handleCameraCapture}
                            disabled={scanning}
                            className="flex flex-col items-center gap-2 p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
                        >
                            <Camera className="w-6 h-6 text-purple-600" />
                            <span className="text-sm font-medium text-slate-700">
                                {scanning ? 'Scanning...' : 'Use Camera'}
                            </span>
                        </button>
                        
                        <label className="flex flex-col items-center gap-2 p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer">
                            <Upload className="w-6 h-6 text-purple-600" />
                            <span className="text-sm font-medium text-slate-700">
                                Upload Image
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={scanning}
                            />
                        </label>
                    </div>

                    {/* Manual QR Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Or Enter QR Code Data Manually
                        </label>
                        <textarea
                            value={qrData}
                            onChange={handleQRInput}
                            placeholder="Paste QR code data here..."
                            rows="3"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none font-mono text-sm ${
                                errors.qrData ? 'border-red-500' : 'border-slate-300'
                            }`}
                        />
                        {errors.qrData && (
                            <div className="flex items-start gap-2 mt-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p>{errors.qrData}</p>
                            </div>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                            Supported formats: JSON, UPI, or RECEIVER:AMOUNT:DESCRIPTION
                        </p>
                    </div>

                    {/* Parsed Data Display */}
                    {parsedData && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>QR Code Verified</span>
                            </div>
                            
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Receiver:</span>
                                    <span className="font-medium text-slate-900">
                                        {parsedData.receiverName || parsedData.receiverId}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Amount:</span>
                                    <span className="font-bold text-green-700">
                                        ₹{parseFloat(parsedData.amount).toLocaleString('en-IN')}
                                    </span>
                                </div>
                                {(parsedData.description || parsedData.note) && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Note:</span>
                                        <span className="font-medium text-slate-900">
                                            {parsedData.description || parsedData.note}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Validation Errors */}
                    {(errors.amount || errors.receiverId) && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="text-red-600 text-sm">
                                {errors.amount && <p>{errors.amount}</p>}
                                {errors.receiverId && <p>{errors.receiverId}</p>}
                            </div>
                        </div>
                    )}

                    {/* Submit Error */}
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-red-600 text-sm">{errors.submit}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !parsedData}
                            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <QrCode className="w-4 h-4" />
                                    Pay Now
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScanQRModal;
