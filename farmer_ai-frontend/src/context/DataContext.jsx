import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within DataProvider');
    }
    return context;
};

// Initial mock data
const INITIAL_DATA = {
    hero: {
        title: 'Cultivate Brilliance',
        subtitle: 'Grow Smarter, Harvest Better',
        cta: 'Sell Now',
    },
    featuredCrops: [
        {
            id: 1,
            name: 'Saffron Bulb',
            grade: 'Premium Grade',
            price: 1200,
            currency: '₹',
            image: 'https://images.unsplash.com/photo-1599909533730-f9d49c0c2e8d?w=800&q=80',
            description: 'Premium Kashmir saffron bulbs, hand-harvested at dawn.',
        },
        {
            id: 2,
            name: 'Heirloom Tomatoes',
            grade: 'Organic',
            price: 45,
            currency: '₹',
            image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80',
            description: 'Organic heirloom varieties with rich, complex flavors.',
        },
        {
            id: 3,
            name: 'Microgreens Mix',
            grade: 'Fresh',
            price: 85,
            currency: '₹',
            image: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=800&q=80',
            description: 'Nutrient-dense microgreens harvested daily.',
        },
    ],
    advisories: [
        {
            id: 1,
            title: 'Late Blight Alert',
            description: 'Late blight alert for potatoes in northern regions. Immediate action recommended.',
            date: 'Dec 3, 2025',
            type: 'alert',
        },
        {
            id: 2,
            title: 'Winter Wheat Sowing',
            description: 'Optimal sowing window for winter wheat is now open. Soil temperature ideal.',
            date: 'Dec 1, 2025',
            type: 'success',
        },
    ],
    premiumTiers: [
        {
            id: 1,
            name: 'Sprout',
            subtitle: 'Free',
            price: 0,
            popular: false,
            features: [
                'Basic crop listings',
                'Weather updates',
                'Community forum access',
            ],
        },
        {
            id: 2,
            name: 'Harvest',
            subtitle: 'Pro',
            price: 999,
            popular: true,
            features: [
                'AI Disease Detection',
                'Market Price Prediction',
                'Priority Support',
                'Advanced Analytics',
            ],
        },
        {
            id: 3,
            name: 'Estate',
            subtitle: 'Enterprise',
            price: 2499,
            popular: false,
            features: [
                'AI Disease Detection',
                'Market Price Prediction',
                'Priority Supply Chain',
                'Dedicated Account Manager',
                'Custom Integration',
            ],
        },
    ],
    marketplaceProducts: [
        {
            id: 1,
            name: 'Organic Avocado',
            price: 120,
            currency: '₹',
            image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&q=80',
        },
        {
            id: 2,
            name: 'Dragon Fruit',
            price: 150,
            currency: '₹',
            image: 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=800&q=80',
        },
        {
            id: 3,
            name: 'Artisan Cheese',
            price: 65,
            currency: '₹',
            image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&q=80',
        },
        {
            id: 4,
            name: 'Organic Honey',
            price: 42,
            currency: '₹',
            image: 'https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=800&q=80',
        },
    ],
};

export const DataProvider = ({ children }) => {
    const [adminMode, setAdminMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load data from localStorage or use initial data
    const loadData = () => {
        const saved = localStorage.getItem('farmerAI_data');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse saved data:', e);
            }
        }
        return INITIAL_DATA;
    };

    const [data, setData] = useState(loadData);

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('farmerAI_data', JSON.stringify(data));
        }
    }, [data, isLoading]);

    const updateData = (path, value) => {
        setData(prev => {
            const newData = { ...prev };
            const keys = path.split('.');
            let current = newData;

            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    const toggleAdminMode = () => {
        setAdminMode(prev => !prev);
    };

    const resetData = () => {
        setData(INITIAL_DATA);
        localStorage.removeItem('farmerAI_data');
    };

    const value = {
        data,
        adminMode,
        isLoading,
        updateData,
        toggleAdminMode,
        resetData,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
