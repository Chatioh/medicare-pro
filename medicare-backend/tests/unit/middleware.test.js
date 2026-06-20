const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test_secret_key_for_testing';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';

const authMiddleware = require('../../src/middleware/auth');
const authorize = require('../../src/middleware/rbac');

describe('Auth Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { headers: {}, cookies: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  test('returns 401 if no token provided', () => {
    authMiddleware(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('returns 401 if token is invalid', () => {
    mockReq.headers.authorization = 'Bearer invalidtoken';
    authMiddleware(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  test('calls next() with valid token', () => {
    const token = jwt.sign(
      { userId: 'test-id', role: 'admin', email: 'test@test.com' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    mockReq.headers.authorization = `Bearer ${token}`;
    authMiddleware(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toBeDefined();
    expect(mockReq.user.role).toBe('admin');
  });

  test('attaches user data to req.user', () => {
    const payload = { userId: 'abc-123', role: 'doctor', email: 'doc@test.com' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    mockReq.headers.authorization = `Bearer ${token}`;
    authMiddleware(mockReq, mockRes, mockNext);
    expect(mockReq.user.userId).toBe('abc-123');
    expect(mockReq.user.role).toBe('doctor');
  });
});

describe('RBAC Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { user: { role: 'admin' } };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  test('allows access when role is authorized', () => {
    const middleware = authorize('admin', 'doctor');
    middleware(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  test('denies access when role is not authorized', () => {
    mockReq.user.role = 'receptionist';
    const middleware = authorize('admin', 'doctor');
    middleware(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('allows nurse when nurse is in allowed roles', () => {
    mockReq.user.role = 'nurse';
    const middleware = authorize('nurse', 'admin');
    middleware(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  test('returns 403 with proper error message', () => {
    mockReq.user.role = 'receptionist';
    const middleware = authorize('admin');
    middleware(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});
