import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/authApi';
import { useAuth } from './AuthContext';

const FarmContext = createContext(null);

export const FarmProvider = ({ children }) => {
    const { isAuthenticated, activeRole } = useAuth();
    const [farms, setFarms] = useState([]);
    const [activeFarmId, setActiveFarmId] = useState('');
    const [loadingFarms, setLoadingFarms] = useState(false);

    useEffect(() => {
        // Only fetch farms if the user is authenticated and is a farmer
        if (isAuthenticated && activeRole === 'farmer') {
            fetchUserFarms();
        } else {
            setFarms([]);
            setActiveFarmId('');
        }
    }, [isAuthenticated, activeRole]);

    const fetchUserFarms = async () => {
        setLoadingFarms(true);
        try {
            const res = await api.get('/api/farms');
            const userFarms = res.data?.data || [];
            setFarms(userFarms);

            // Set the first farm as active by default if none is selected
            if (userFarms.length > 0 && !activeFarmId) {
                setActiveFarmId(userFarms[0]._id);
            }
        } catch (error) {
            console.error("Failed to load farms:", error);
        } finally {
            setLoadingFarms(false);
        }
    };

    return (
        <FarmContext.Provider value={{
            farms,
            activeFarmId,
            setActiveFarmId,
            loadingFarms,
            refreshFarms: fetchUserFarms
        }}>
            {children}
        </FarmContext.Provider>
    );
};

export const useFarm = () => useContext(FarmContext);
