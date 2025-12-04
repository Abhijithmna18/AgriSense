import api from './api';

const STORAGE_KEY = 'farmer_ai_mock_home';
const VERSION = 1;

/**
 * Default sample mock data for the homepage
 */
const DEFAULT_MOCK_DATA = {
    hero: {
        title: "Cultivate Brilliance — Grow Smarter, Harvest Better",
        subtitle: "AI-guided recommendations • Market connect • Farm to table",
        ctaPrimary: { label: "Explore Crops", href: "/crops" },
        ctaSecondary: { label: "Sell Now", href: "/marketplace" },
        backgroundAccent: "linear-gradient(135deg, #6b21a8 0%, #f97316 100%)",
        weatherFallback: {
            location: "Bengaluru",
            tempC: 27,
            condition: "Sunny",
            iconUrl: ""
        }
    },
    featuredCrops: [
        { _id: "c1", name: "Saffron Bulb", thumbnailUrl: "https://images.unsplash.com/photo-1599909533730-f9d7f79e3e57?w=400", shortDescription: "Premium-grade saffron", avgPrice: 1200 },
        { _id: "c2", name: "Organic Avocado", thumbnailUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400", shortDescription: "Creamy, high-yield", avgPrice: 80 },
        { _id: "c3", name: "Dragon Fruit", thumbnailUrl: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400", shortDescription: "Exotic superfruit", avgPrice: 150 },
        { _id: "c4", name: "Heirloom Tomatoes", thumbnailUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400", shortDescription: "Rich flavor varieties", avgPrice: 60 },
        { _id: "c5", name: "Purple Cauliflower", thumbnailUrl: "https://images.unsplash.com/photo-1568584711271-f9b5f6c0e8e5?w=400", shortDescription: "Nutrient-rich hybrid", avgPrice: 45 },
        { _id: "c6", name: "Golden Beets", thumbnailUrl: "https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=400", shortDescription: "Sweet and earthy", avgPrice: 35 },
        { _id: "c7", name: "Microgreens Mix", thumbnailUrl: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400", shortDescription: "Gourmet salad blend", avgPrice: 120 },
        { _id: "c8", name: "Black Garlic", thumbnailUrl: "https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=400", shortDescription: "Aged delicacy", avgPrice: 200 }
    ],
    marketplaceTop: [
        { _id: "m1", title: "Cold-pressed Sesame Oil", price: 450, imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400", seller: { name: "GreenFarms" }, rating: 4.8 },
        { _id: "m2", title: "Organic Honey (Raw)", price: 320, imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784262?w=400", seller: { name: "BeeHappy Co" }, rating: 4.9 },
        { _id: "m3", title: "Artisan Cheese Selection", price: 680, imageUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400", seller: { name: "DairyDelights" }, rating: 4.7 },
        { _id: "m4", title: "Heritage Grain Flour", price: 180, imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400", seller: { name: "MillMasters" }, rating: 4.6 },
        { _id: "m5", title: "Preserved Lemons", price: 220, imageUrl: "https://images.unsplash.com/photo-1590502593747-42a996133562?w=400", seller: { name: "CitrusGold" }, rating: 4.8 },
        { _id: "m6", title: "Truffle Salt", price: 890, imageUrl: "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=400", seller: { name: "Gourmet Essentials" }, rating: 5.0 }
    ],
    advisories: [
        { _id: "a1", title: "Late blight alert for potatoes", summary: "High humidity increases risk of late blight. Apply preventive fungicides and ensure proper drainage.", createdAt: "2025-11-15", link: "/advisories/a1" },
        { _id: "a2", title: "Optimal sowing window for winter wheat", summary: "Temperature conditions are ideal for winter wheat sowing in northern regions. Prepare fields now.", createdAt: "2025-11-12", link: "/advisories/a2" },
        { _id: "a3", title: "Integrated pest management for aphids", summary: "Aphid populations rising. Consider beneficial insects and neem-based sprays before chemical intervention.", createdAt: "2025-11-10", link: "/advisories/a3" },
        { _id: "a4", title: "Water conservation techniques", summary: "Implement drip irrigation and mulching to reduce water usage by up to 40% during dry season.", createdAt: "2025-11-08", link: "/advisories/a4" },
        { _id: "a5", title: "Soil health assessment reminder", summary: "Annual soil testing recommended before spring planting. Book lab services early to avoid delays.", createdAt: "2025-11-05", link: "/advisories/a5" },
        { _id: "a6", title: "Market trends: Organic produce demand", summary: "Organic certification showing 25% price premium. Consider transition for high-value crops.", createdAt: "2025-11-01", link: "/advisories/a6" }
    ],
    theme: {
        primary: "#6B21A8",
        accent: "#F97316",
        muted: "#F8FAFC"
    }
};

/**
 * Load mock data from localStorage or return defaults
 */
export const loadMockData = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.version === VERSION && parsed.data) {
                return parsed.data;
            }
        }
    } catch (err) {
        console.warn('Failed to load mock data from localStorage:', err);
    }

    // Return defaults and save them
    saveMockData(DEFAULT_MOCK_DATA);
    return DEFAULT_MOCK_DATA;
};

/**
 * Save mock data to localStorage and optionally sync to backend
 */
export const saveMockData = async (data) => {
    const payload = {
        version: VERSION,
        updatedAt: new Date().toISOString(),
        data
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

        // Try to sync to backend if available
        try {
            await api.post('/api/admin/mock-data', payload, { timeout: 3000 });
            return { success: true, synced: true };
        } catch (apiErr) {
            // Backend not available or not authorized, that's okay
            console.log('Backend sync skipped:', apiErr.message);
            return { success: true, synced: false };
        }
    } catch (err) {
        console.error('Failed to save mock data:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Reset mock data to defaults
 */
export const resetMockData = () => {
    localStorage.removeItem(STORAGE_KEY);
    saveMockData(DEFAULT_MOCK_DATA);
    return DEFAULT_MOCK_DATA;
};

/**
 * Get last updated timestamp
 */
export const getLastUpdated = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.updatedAt || null;
        }
    } catch (err) {
        return null;
    }
    return null;
};

/**
 * Check if user is admin
 */
export const isAdmin = () => {
    // Check explicit admin flag
    if (localStorage.getItem('farmer_ai_isAdmin') === 'true') {
        return true;
    }

    // Check JWT token for admin role
    try {
        const token = localStorage.getItem('token');
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.role === 'admin';
        }
    } catch (err) {
        // Invalid token, ignore
    }

    return false;
};

export default {
    loadMockData,
    saveMockData,
    resetMockData,
    getLastUpdated,
    isAdmin
};
