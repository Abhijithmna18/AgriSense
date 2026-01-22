import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const FarmIntelligenceContext = createContext();

export const useFarmIntelligence = () => useContext(FarmIntelligenceContext);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002'; // Corrected port & env

export const FarmIntelligenceProvider = ({ children }) => {
    const [selectedFarm, setSelectedFarm] = useState(null);
    const [intelligence, setIntelligence] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Helper for auth headers
    const getAuthHeader = () => {
        const token = localStorage.getItem('auth_token'); // Corrected key
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // Fetch Intelligence for a specific farm
    const fetchFarmIntelligence = useCallback(async (farmId) => {
        if (!farmId) return;
        setLoading(true);
        setError(null);
        try {
            const config = { headers: getAuthHeader() };

            const res = await axios.get(`${API_URL}/api/farms/${farmId}/intelligence`, config);
            setIntelligence(res.data.data);

            // Allow updating selected farm if we just fetched it
            if (!selectedFarm || selectedFarm._id !== res.data.data.farmProfile._id) {
                setSelectedFarm(res.data.data.farmProfile);
            }

        } catch (err) {
            console.error("Error fetching farm intelligence:", err);
            setError(err.response?.data?.message || "Failed to load farm data");
            toast.error("Failed to load farm intelligence");
        } finally {
            setLoading(false);
        }
    }, [selectedFarm]);

    // Update Farm Profile
    const updateFarmProfile = async (farmId, updateData) => {
        try {
            const config = { headers: getAuthHeader() };

            const res = await axios.put(`${API_URL}/api/farms/${farmId}`, updateData, config);

            // Update local state
            setIntelligence(prev => ({
                ...prev,
                farmProfile: res.data.data
            }));
            setSelectedFarm(res.data.data);
            toast.success("Farm profile updated");
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed");
            return false;
        }
    };

    // Add Crop Cycle
    const addCropCycle = async (cycleData) => {
        try {
            const config = { headers: getAuthHeader() };

            await axios.post(`${API_URL}/api/farms/${selectedFarm._id}/crop-cycles`, cycleData, config);

            // Refresh Intelligence to get sorting/aggregation right
            fetchFarmIntelligence(selectedFarm._id);
            toast.success("Crop cycle added");
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add cycle");
            return false;
        }
    };

    // Log Action
    const logAction = async (entityId, entityType, action, notes = '') => {
        try {
            const config = { headers: getAuthHeader() };

            await axios.post(`${API_URL}/api/farms/${selectedFarm._id}/actions`, {
                entityId,
                entityType,
                action,
                notes
            }, config);
            // No need to refresh entire state for a log usually, unless we show logs
        } catch (err) {
            console.error("Action log failed", err);
        }
    };

    const value = {
        selectedFarm,
        setSelectedFarm,
        intelligence,
        loading,
        error,
        fetchFarmIntelligence,
        updateFarmProfile,
        addCropCycle,
        logAction
    };

    return (
        <FarmIntelligenceContext.Provider value={value}>
            {children}
        </FarmIntelligenceContext.Provider>
    );
};
