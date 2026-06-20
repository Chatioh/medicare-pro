const request = require('supertest');

process.env.JWT_SECRET = 'test_secret_key_for_testing_minimum_32_chars';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_for_testing';
process.env.NODE_ENV = 'test';

const app = require('../../src/app');
const { sequelize, User, Doctor } = require('../../src/models');

describe('Doctors API Integration Tests', () => {
  let adminToken;
  let doctorToken;
  let createdDoctorId;

  const adminUser = {
    full_name: 'Doc Test Admin',
    email: `doc_admin_${Date.now()}@medicare.com`,
    password: 'AdminPass1234!',
    role: 'admin',
  };

  const doctorUser = {
    full_name: 'Doc Test Doctor',
    email: `doc_doctor_${Date.now()}@medicare.com`,
    password: 'DocPass1234!',
    role: 'doctor',
  };

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    await request(app).post('/api/auth/register').send(adminUser);
    const adminRes = await request(app).post('/api/auth/login')
      .send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminRes.body.data.token;

    await request(app).post('/api/auth/register').send(doctorUser);
    const doctorRes = await request(app).post('/api/auth/login')
      .send({ email: doctorUser.email, password: doctorUser.password });
    doctorToken = doctorRes.body.data.token;
    createdDoctorId = doctorRes.body.data.user.id;
  });

  afterAll(async () => {
    try {
      await User.destroy({ where: { email: adminUser.email } });
      await User.destroy({ where: { email: doctorUser.email } });
    } catch (err) {
      // ignore
    }
    await sequelize.close();
  });

  describe('GET /api/doctors', () => {
    test('returns list of doctors', async () => {
      const res = await request(app)
        .get('/api/doctors')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/doctors');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/doctors/:id', () => {
    test('returns 404 for non-existent doctor', async () => {
      const res = await request(app)
        .get('/api/doctors/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });
});
