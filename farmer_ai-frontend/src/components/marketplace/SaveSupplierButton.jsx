import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import api from '../../services/authApi';

const SaveSupplierButton = ({ supplierId, supplierName, onSaveChange }) => {
    const [isSaved, setIsSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkIfSaved();
    }, [supplierId]);

    const checkIfSaved = async () => {
        try {
            const { data } = await api.get(`/api/marketplace/saved-suppliers/check/${supplierId}`);
            setIsSaved(data.isSaved);
        } catch (error) {
            console.error('Failed to check saved status', error);
        }
    };

    const handleToggleSave = async () => {
        if (loading) return;

        setLoading(true);
        const previousState = isSaved;

        // Optimistic UI update
        setIsSaved(!isSaved);

        try {
            if (isSaved) {
                // Unsave
                await api.delete(`/api/marketplace/saved-suppliers/${supplierId}`);
                if (onSaveChange) onSaveChange(false);
            } else {
                // Save
                await api.post('/api/marketplace/saved-suppliers', { supplierId });
                if (onSaveChange) onSaveChange(true);
            }
        } catch (error) {
            // Rollback on error
            setIsSaved(previousState);
            console.error('Failed to toggle save', error);

            if (error.response?.status === 409) {
                alert('Supplier already saved');
            } else if (error.response?.status === 403) {
                alert(error.response.data.message || 'Cannot save this supplier');
            } else {
                alert('Failed to save supplier. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggleSave}
            disabled={loading}
            className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                ${isSaved
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title={isSaved ? 'Remove from saved suppliers' : 'Save supplier'}
        >
            <Bookmark
                size={18}
                className={isSaved ? 'fill-green-700' : ''}
            />
            <span className="text-sm">
                {loading ? 'Saving...' : isSaved ? 'Saved' : 'Save Supplier'}
            </span>
        </button>
    );
};

export default SaveSupplierButton;
