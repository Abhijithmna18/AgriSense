const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const userRoutes = require('../../src/routes/userRoutes');
const User = require('../../src/models/User');
const connectDB = require('../../src/config/db');

// Mock app
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

// Mock process.env
process.env.JWT_SECRET = 'testsecret';

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGO_URI = uri;
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await User.deleteMany({});
});

describe('User Auth Integration', () => {
    const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        password: 'password123',
        role: 'farmer'
    };

    it('should register a user and return token', async () => {
        const res = await request(app)
            .post('/api/users/register')
            .send(userData);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.email).toEqual(userData.email);
    });

    it('should login a user and return token', async () => {
        // Register first
        await User.create(userData);

        const res = await request(app)
            .post('/api/users/login')
            .send({
                email: userData.email,
                password: userData.password
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should fetch current user with token', async () => {
        // Register and get token
        const registerRes = await request(app)
            .post('/api/users/register')
            .send(userData);
        
        const token = registerRes.body.token;

        const res = await request(app)
            .get('/api/users/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.email).toEqual(userData.email);
    });
});
