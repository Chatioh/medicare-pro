const request = require('supertest');

process.env.JWT_SECRET = 'test_secret_key_for_testing_minimum_32_chars';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_for_testing';
process.env.NODE_ENV = 'test';

const app = require('../../src/app');
const { sequelize, User } = require('../../src/models');

describe('Dashboard API Integration Tests', () => {
  let adminToken;
  let nurseToken;

  const adminUser = {
    full_name: 'Dashboard Test Admin',
    email: `dashboard_admin_${Date.now()}@medicare.com`,
    password: 'AdminPass1234!',
    role: 'admin',
  };

  const nurseUser = {
    full_name: 'Dashboard Test Nurse',
    email: `dashboard_nurse_${Date.now()}@medicare.com`,
    password: 'NursePass1234!',
    role: 'nurse',
  };

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    await request(app).post('/api/auth/register').send(adminUser);
    const adminRes = await request(app).post('/api/auth/login')
      .send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminRes.body.data.token;

    await request(app).post('/api/auth/register').send(nurseUser);
    const nurseRes = await request(app).post('/api/auth/login')
      .send({ email: nurseUser.email, password: nurseUser.password });
    nurseToken = nurseRes.body.data.token;
  });

  afterAll(async () => {
    try {
      await User.destroy({ where: { email: adminUser.email } });
      await User.destroy({ where: { email: nurseUser.email } });
    } catch (err) {
      // ignore
    }
    await sequelize.close();
  });

  describe('GET /api/dashboard/stats', () => {
    test('admin can access dashboard stats', async () => {
      const res = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalPatients');
      expect(res.body.data).toHaveProperty('totalDoctors');
      expect(res.body.data).toHaveProperty('totalAppointments');
      expect(res.body.data).toHaveProperty('appointmentsToday');
      expect(res.body.data).toHaveProperty('totalPrescriptions');
      expect(res.body.data).toHaveProperty('activePrescriptions');
    });

    test('nurse can access dashboard stats', async () => {
      const res = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${nurseToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/dashboard/appointments-today', () => {
    test('admin can access today appointments', async () => {
      const res = await request(app)
        .get('/api/dashboard/appointments-today')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.appointments)).toBe(true);
    });

    test('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/dashboard/appointments-today');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/dashboard/recent-patients', () => {
    test('admin can access recent patients', async () => {
      const res = await request(app)
        .get('/api/dashboard/recent-patients')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/dashboard/recent-patients');
      expect(res.status).toBe(401);
    });
  });
});
