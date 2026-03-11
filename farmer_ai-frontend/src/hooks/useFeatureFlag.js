import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Custom hook to check if a feature flag is enabled
 * @param {string} flagKey - The feature flag key to check
 * @returns {boolean} - Whether the feature is enabled
 */
export const useFeatureFlag = (flagKey) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkFlag = async () => {
            try {
                const response = await api.get(`/feature-flags/check/${flagKey}`);
                setIsEnabled(response.data.enabled);
            } catch (error) {
                console.error(`Failed to check feature flag: ${flagKey}`, error);
                setIsEnabled(false);
            } finally {
                setLoading(false);
            }
        };

        if (flagKey) {
            checkFlag();
        }
    }, [flagKey]);

    return { isEnabled, loading };
};

/**
 * Component wrapper for feature flags
 * @param {string} flagKey - The feature flag key
 * @param {React.ReactNode} children - Content to render if flag is enabled
 * @param {React.ReactNode} fallback - Content to render if flag is disabled
 */
export const FeatureFlag = ({ flagKey, children, fallback = null }) => {
    const { isEnabled, loading } = useFeatureFlag(flagKey);

    if (loading) {
        return null; // or a loading spinner
    }

    return isEnabled ? children : fallback;
};

export default useFeatureFlag;
