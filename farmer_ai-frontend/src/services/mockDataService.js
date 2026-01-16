/**
 * Mock Data Service
 * Centralized mock data management with localStorage persistence
 * All data is stored locally and works offline
 */

const STORAGE_KEY = 'agrisense_farm_data';

// Initialize default data structure
const getDefaultData = () => ({
    responsibilities: [],
    lifecycle: [],
    diary: [],
    harvest: []
});

// Load data from localStorage
const loadFromStorage = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
    return getDefaultData();
};

// Save data to localStorage
const saveToStorage = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
};

// In-memory data store
let dataStore = loadFromStorage();

// Generate unique ID
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ============================================
// RESPONSIBILITIES CRUD
// ============================================

export const getResponsibilities = (zoneId) => {
    return dataStore.responsibilities.filter(r => r.zoneId === zoneId);
};

export const createResponsibility = (zoneId, data) => {
    const newResponsibility = {
        id: generateId(),
        zoneId,
        taskName: data.taskName,
        assignedTo: data.assignedTo || 'Self',
        dueDate: data.dueDate,
        status: data.status || 'pending',
        createdAt: new Date().toISOString()
    };

    dataStore.responsibilities.push(newResponsibility);
    saveToStorage(dataStore);
    return newResponsibility;
};

export const updateResponsibility = (id, updates) => {
    const index = dataStore.responsibilities.findIndex(r => r.id === id);
    if (index !== -1) {
        dataStore.responsibilities[index] = {
            ...dataStore.responsibilities[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        saveToStorage(dataStore);
        return dataStore.responsibilities[index];
    }
    return null;
};

export const deleteResponsibility = (id) => {
    const index = dataStore.responsibilities.findIndex(r => r.id === id);
    if (index !== -1) {
        dataStore.responsibilities.splice(index, 1);
        saveToStorage(dataStore);
        return true;
    }
    return false;
};

// ============================================
// LIFECYCLE CRUD
// ============================================

const LIFECYCLE_STAGES = ['Sowing', 'Germination', 'Vegetative', 'Flowering', 'Harvest'];

export const getLifecycle = (zoneId) => {
    let stages = dataStore.lifecycle.filter(l => l.zoneId === zoneId);

    // Initialize default stages if none exist
    if (stages.length === 0) {
        stages = LIFECYCLE_STAGES.map((stage, index) => ({
            id: generateId(),
            zoneId,
            stage,
            date: index === 0 ? new Date().toISOString() : null,
            notes: '',
            aiAdvisory: '',
            isActive: index === 0,
            createdAt: new Date().toISOString()
        }));
        dataStore.lifecycle.push(...stages);
        saveToStorage(dataStore);
    }

    return stages.sort((a, b) =>
        LIFECYCLE_STAGES.indexOf(a.stage) - LIFECYCLE_STAGES.indexOf(b.stage)
    );
};

export const updateLifecycleStage = (id, updates) => {
    const index = dataStore.lifecycle.findIndex(l => l.id === id);
    if (index !== -1) {
        const stage = dataStore.lifecycle[index];

        // If activating this stage, deactivate others in same zone
        if (updates.isActive) {
            dataStore.lifecycle.forEach(l => {
                if (l.zoneId === stage.zoneId && l.id !== id) {
                    l.isActive = false;
                }
            });
        }

        dataStore.lifecycle[index] = {
            ...stage,
            ...updates,
            updatedAt: new Date().toISOString()
        };
        saveToStorage(dataStore);
        return dataStore.lifecycle[index];
    }
    return null;
};

export const setActiveStage = (zoneId, stageName) => {
    const stages = dataStore.lifecycle.filter(l => l.zoneId === zoneId);
    stages.forEach(stage => {
        stage.isActive = stage.stage === stageName;
        if (stage.isActive && !stage.date) {
            stage.date = new Date().toISOString();
        }
    });
    saveToStorage(dataStore);
    return stages.find(s => s.stage === stageName);
};

// ============================================
// DIARY CRUD
// ============================================

export const getDiaryEntries = (zoneId) => {
    return dataStore.diary
        .filter(d => d.zoneId === zoneId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const createDiaryEntry = (zoneId, data) => {
    const newEntry = {
        id: generateId(),
        zoneId,
        date: data.date || new Date().toISOString(),
        type: data.type || 'note',
        content: data.content,
        imageUrl: data.imageUrl || null,
        createdAt: new Date().toISOString()
    };

    dataStore.diary.push(newEntry);
    saveToStorage(dataStore);
    return newEntry;
};

export const updateDiaryEntry = (id, updates) => {
    const index = dataStore.diary.findIndex(d => d.id === id);
    if (index !== -1) {
        dataStore.diary[index] = {
            ...dataStore.diary[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        saveToStorage(dataStore);
        return dataStore.diary[index];
    }
    return null;
};

export const deleteDiaryEntry = (id) => {
    const index = dataStore.diary.findIndex(d => d.id === id);
    if (index !== -1) {
        dataStore.diary.splice(index, 1);
        saveToStorage(dataStore);
        return true;
    }
    return false;
};

// ============================================
// HARVEST CRUD
// ============================================

export const getHarvestLogs = (zoneId) => {
    return dataStore.harvest
        .filter(h => h.zoneId === zoneId)
        .sort((a, b) => new Date(b.harvestDate) - new Date(a.harvestDate));
};

export const createHarvestLog = (zoneId, data) => {
    const expectedYield = parseFloat(data.expectedYield) || 0;
    const actualYield = parseFloat(data.actualYield) || 0;
    const deviation = expectedYield > 0
        ? ((actualYield - expectedYield) / expectedYield) * 100
        : 0;

    const newLog = {
        id: generateId(),
        zoneId,
        expectedYield,
        actualYield,
        qualityGrade: data.qualityGrade || '',
        harvestDate: data.harvestDate || new Date().toISOString(),
        deviation: parseFloat(deviation.toFixed(2)),
        createdAt: new Date().toISOString()
    };

    dataStore.harvest.push(newLog);
    saveToStorage(dataStore);
    return newLog;
};

export const updateHarvestLog = (id, updates) => {
    const index = dataStore.harvest.findIndex(h => h.id === id);
    if (index !== -1) {
        const expectedYield = parseFloat(updates.expectedYield) || dataStore.harvest[index].expectedYield;
        const actualYield = parseFloat(updates.actualYield) || dataStore.harvest[index].actualYield;
        const deviation = expectedYield > 0
            ? ((actualYield - expectedYield) / expectedYield) * 100
            : 0;

        dataStore.harvest[index] = {
            ...dataStore.harvest[index],
            ...updates,
            deviation: parseFloat(deviation.toFixed(2)),
            updatedAt: new Date().toISOString()
        };
        saveToStorage(dataStore);
        return dataStore.harvest[index];
    }
    return null;
};

export const deleteHarvestLog = (id) => {
    const index = dataStore.harvest.findIndex(h => h.id === id);
    if (index !== -1) {
        dataStore.harvest.splice(index, 1);
        saveToStorage(dataStore);
        return true;
    }
    return false;
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const getAllDataForZone = (zoneId) => {
    return {
        responsibilities: getResponsibilities(zoneId),
        lifecycle: getLifecycle(zoneId),
        diary: getDiaryEntries(zoneId),
        harvest: getHarvestLogs(zoneId)
    };
};

export const clearAllData = () => {
    dataStore = getDefaultData();
    saveToStorage(dataStore);
};

export const exportData = () => {
    return JSON.parse(JSON.stringify(dataStore));
};

export const importData = (data) => {
    dataStore = { ...getDefaultData(), ...data };
    saveToStorage(dataStore);
};

// Seed some initial data for demo purposes
export const seedDemoData = (zoneId) => {
    // Add sample responsibility
    createResponsibility(zoneId, {
        taskName: 'Apply organic fertilizer',
        assignedTo: 'Self',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
    });

    createResponsibility(zoneId, {
        taskName: 'Check irrigation system',
        assignedTo: 'Worker',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
    });

    // Add sample diary entry
    createDiaryEntry(zoneId, {
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'note',
        content: 'Applied organic compost to improve soil quality. Observed healthy plant growth.'
    });

    createDiaryEntry(zoneId, {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'incident',
        content: 'Spotted minor aphid infestation on lower leaves. Applied neem oil spray.'
    });

    // Initialize lifecycle stages
    getLifecycle(zoneId);

    console.log('Demo data seeded for zone:', zoneId);
};
