const jwt = require('jsonwebtoken');
const authMiddleware = require('../src/middleware/auth.middleware');

// Mock the JWT secret
process.env.JWT_SECRET = 'test-secret';

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return 401 if no token is provided', () => {
    req.header.mockReturnValue(undefined);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No token, authorization denied',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 if token is invalid', () => {
    req.header.mockReturnValue('Bearer invalid-token');

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token is not valid',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should call next() and set req.user if token is valid', () => {
    const payload = { userId: 123 };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    req.header.mockReturnValue(`Bearer ${token}`);

    authMiddleware(req, res, next);

    expect(req.user).toEqual(expect.objectContaining({ userId: 123 }));
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should handle token without Bearer prefix', () => {
    const payload = { userId: 456 };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    req.header.mockReturnValue(token); // Token without "Bearer " prefix

    authMiddleware(req, res, next);

    // The middleware calls next() because the token is valid even without Bearer
    // The replace() returns empty string when there's no "Bearer " to replace
    expect(req.user).toEqual(expect.objectContaining({ userId: 456 }));
    expect(next).toHaveBeenCalled();
  });
});
