const jwt = require('jsonwebtoken');
const { protect, adminOnly } = require('../../src/middleware/auth');
const User = require('../../src/models/User');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../src/models/User');

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    describe('protect', () => {
        it('should call next if token is valid', async () => {
            req.headers.authorization = 'Bearer validtoken';
            jwt.verify.mockReturnValue({ id: 'userid' });
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue({ id: 'userid', role: 'farmer' }),
            });

            await protect(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(req.user).toBeDefined();
        });

        it('should return 401 if no token', async () => {
            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
        });

        it('should return 401 if token is invalid', async () => {
            req.headers.authorization = 'Bearer invalidtoken';
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized' });
        });
    });

    describe('adminOnly', () => {
        it('should call next if user is admin', () => {
            req.user = { role: 'admin' };
            adminOnly(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should return 403 if user is not admin', () => {
            req.user = { role: 'farmer' };
            adminOnly(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized as an admin' });
        });
    });
});
