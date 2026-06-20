const request = require('supertest');
const { sequelize } = require('../../src/models');

// Set test environment BEFORE requiring app
process.env.JWT_SECRET = 'test_secret_key_for_testing_minimum_32_chars';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_for_testing';
process.env.NODE_ENV = 'test';

const app = require('../../src/app');

describe('Auth API Integration Tests', () => {
  let authToken;

  const testUser = {
    full_name: 'Test Admin User',
    email: `testadmin_${Date.now()}@medicare.com`,
    password: 'TestPass1234!',
    role: 'admin',
  };

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    try {
      const { User } = require('../../src/models');
      await User.destroy({ where: { email: testUser.email } });
    } catch (err) {
      // ignore
    }
    await sequelize.close();
  });

  describe('POST /api/auth/register', () => {
    test('successfully registers a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user.password_hash).toBeUndefined();
    });

    test('returns 409 when email already exists', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    test('returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'incomplete@test.com' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('returns 400 when role is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'other@test.com', role: 'superuser' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    test('successfully logs in with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      authToken = res.body.data.token;
    });

    test('returns 401 with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'WrongPass123!' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('returns 401 with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@medicare.com', password: 'SomePass123!' });
      expect(res.status).toBe(401);
    });

    test('returns 400 when fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    test('returns current user when authenticated', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    test('returns 401 when no token provided', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    test('returns 401 when token is invalid', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    test('successfully logs out authenticated user', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
