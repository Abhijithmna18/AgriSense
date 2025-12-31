export const mockDashboardData = {
    user: {
        name: "Rajesh Kumar",
        farmName: "Green Valley Farms",
        location: "Punjab, India",
        totalAcres: 45
    },
    alerts: [
        {
            id: 1,
            type: 'pest',
            severity: 'high',
            title: 'Locust Swarm Detected',
            message: 'High probability of locust activity in North Field (Sector 4).',
            confidence: 92,
            impact: 'Est. 40% Yield Loss',
            action: 'Schedule Spray',
            date: '2025-12-15T08:00:00'
        },
        {
            id: 2,
            type: 'water',
            severity: 'medium',
            title: 'Water Stress Warning',
            message: 'Soil moisture critical in Wheat Block A.',
            confidence: 85,
            impact: 'Stunted Growth Risk',
            action: 'Activate Irrigation',
            date: '2025-12-14T14:30:00'
        }
    ],
    snapshot: [
        {
            id: 101,
            crop: 'Wheat (HD-3086)',
            stage: 'Flowering',
            health: 'Good (88%)',
            moisture: 'Low (22%)',
            orders: '2 Active',
            schemes: 'PM-Kisan Eligible'
        },
        {
            id: 102,
            crop: 'Mustard (Pusa-31)',
            stage: 'Vegetative',
            health: 'Excellent (95%)',
            moisture: 'Optimal (45%)',
            orders: 'No Active Orders',
            schemes: 'Soil Card Pending'
        },
        {
            id: 103,
            crop: 'Potato (Kufri)',
            stage: 'Harvest Ready',
            health: 'Fair (76%)',
            moisture: 'High (60%)',
            orders: '5 Pending',
            schemes: 'Storage Subsidy'
        }
    ],
    fieldIntelligence: {
        mapCenter: [30.7333, 76.7794], // Chandigarh coordinates as generic base
        fields: [
            { id: 'f1', name: 'North Field', status: 'stressed', coords: [30.735, 76.780], stress: 'High' },
            { id: 'f2', name: 'South Block', status: 'healthy', coords: [30.730, 76.790], stress: 'None' },
            { id: 'f3', name: 'East Patch', status: 'warning', coords: [30.732, 76.775], stress: 'Moderate' }
        ]
    },
    commerce: {
        recommendations: [
            { id: 'p1', name: 'Urea (Neem Coated)', type: 'Fertilizer', price: '₹266/bag', urgency: 'High' },
            { id: 'p2', name: 'Coragen Insecticide', type: 'Pest Control', price: '₹1850/btl', urgency: 'Medium' }
        ],
        marketplace: [
            { id: 'm1', item: 'Wheat Grade A', rate: '₹2,125/Qtl', trend: 'up' },
            { id: 'm2', item: 'Mustard Oil Seeds', rate: '₹5,450/Qtl', trend: 'stable' }
        ]
    },
    finance: {
        creditScore: 745,
        loans: [
            { id: 'l1', provider: 'SBI KCC', amount: '₹3,00,000', status: 'Active', nextEmi: '15 Jan 2026' }
        ],
        schemes: [
            { id: 's1', name: 'PM Fasal Bima Yojana', benefit: 'Insurance Cover', deadline: '31 Dec 2025' },
            { id: 's2', name: 'Solar Pump Subsidy', benefit: '60% Off', deadline: '28 Feb 2026' }
        ]
    }
};
