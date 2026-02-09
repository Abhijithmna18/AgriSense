
const mongoose = require('mongoose');
const { runRecommendation } = require('../src/controllers/recommendationController');

// Mock Mongoose Models
const mockSave = jest.fn().mockResolvedValue({ _id: 'mock_rec_id', results: [] });
jest.mock('../src/models/Recommendation', () => {
    return jest.fn().mockImplementation(() => ({
        save: mockSave
    }));
});

// Mock GoogleGenerativeAI
jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: () => ({
            generateContent: jest.fn().mockResolvedValue({
                response: { text: () => '[]' }
            })
        })
    }))
}));

// Mock Req/Res
const mockReq = {
    body: {
        // Missing location to test crash
        soil: { n: 100, ph: 6.5, texture: 'Loamy' },
        season: 'Winter',
        constraints: { maxWaterUse: 'High' }
    },
    user: { _id: 'mock_user_id' }
};

const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockImplementation((data) => {
        console.log('Response JSON:', data);
    })
};


describe('runRecommendation Validation', () => {
    test('should return 400 for missing location data', async () => {
        console.log('--- Testing runRecommendation with missing location ---');

        // Mock res.status to return this chainable object
        mockRes.status.mockReturnThis();

        try {
            await runRecommendation(mockReq, mockRes);
        } catch (e) {
            console.error('CRASH CAUGHT:', e);
            throw e;
        }

        // Verify that 400 was called
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining('Missing required location data')
        }));
    });
});

