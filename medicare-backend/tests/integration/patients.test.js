const request = require('supertest');

process.env.JWT_SECRET = 'test_secret_key_for_testing_minimum_32_chars';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_for_testing';
process.env.NODE_ENV = 'test';

const app = require('../../src/app');
const { sequelize, User, Patient } = require('../../src/models');

describe('Patients API Integration Tests', () => {
  let adminToken;
  let doctorToken;
  let receptionistToken;
  let createdPatientId;

  const adminUser = {
    full_name: 'Test Admin',
    email: `admin_patient_test_${Date.now()}@medicare.com`,
    password: 'AdminPass1234!',
    role: 'admin',
  };

  const doctorUser = {
    full_name: 'Test Doctor',
    email: `doc_patient_test_${Date.now()}@medicare.com`,
    password: 'DocPass1234!',
    role: 'doctor',
  };

  const receptionistUser = {
    full_name: 'Test Receptionist',
    email: `recept_test_${Date.now()}@medicare.com`,
    password: 'ReceptPass1234!',
    role: 'receptionist',
  };

  const testPatient = {
    full_name: 'Test Patient',
    date_of_birth: '1990-01-15',
    gender: 'male',
    phone: '+237677000001',
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

    await request(app).post('/api/auth/register').send(receptionistUser);
    const receptionistRes = await request(app).post('/api/auth/login')
      .send({ email: receptionistUser.email, password: receptionistUser.password });
    receptionistToken = receptionistRes.body.data.token;
  });

  afterAll(async () => {
    try {
      if (createdPatientId) await Patient.destroy({ where: { id: createdPatientId } });
      await User.destroy({ where: { email: adminUser.email } });
      await User.destroy({ where: { email: doctorUser.email } });
      await User.destroy({ where: { email: receptionistUser.email } });
    } catch (err) {
      // ignore
    }
    await sequelize.close();
  });

  describe('POST /api/patients', () => {
    test('admin can create a patient', async () => {
      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testPatient);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.patient.full_name).toBe(testPatient.full_name);
      expect(res.body.data.patient.patient_number).toMatch(/^PAT-/);
      createdPatientId = res.body.data.patient.id;
    });

    test('receptionist can create a patient', async () => {
      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${receptionistToken}`)
        .send({ ...testPatient, phone: '+237677000002' });
      expect(res.status).toBe(201);
      if (res.body.data?.id) await Patient.destroy({ where: { id: res.body.data.id } });
    });

    test('doctor cannot create a patient', async () => {
      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ ...testPatient, phone: '+237677000003' });
      expect(res.status).toBe(403);
    });

    test('returns 400 when required fields missing', async () => {
      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ full_name: 'Incomplete Patient' });
      expect(res.status).toBe(400);
    });

    test('returns 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/patients')
        .send(testPatient);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/patients', () => {
    test('returns paginated list of patients', async () => {
      const res = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    test('supports search query parameter', async () => {
      const res = await request(app)
        .get('/api/patients?search=Test Patient')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    test('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/patients');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/patients/:id', () => {
    test('returns patient by id', async () => {
      const res = await request(app)
        .get(`/api/patients/${createdPatientId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.patient.id).toBe(createdPatientId);
    });

    test('returns 404 for non-existent patient', async () => {
      const res = await request(app)
        .get('/api/patients/non-existent-id-12345')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/patients/:id', () => {
    test('admin can update patient', async () => {
      const res = await request(app)
        .put(`/api/patients/${createdPatientId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ full_name: 'Updated Test Patient', phone: '+237677000099' });
      expect(res.status).toBe(200);
      expect(res.body.data.patient.full_name).toBe('Updated Test Patient');
    });
  });

  describe('DELETE /api/patients/:id', () => {
    test('admin can delete patient', async () => {
      const res = await request(app)
        .delete(`/api/patients/${createdPatientId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      createdPatientId = null;
    });
  });
});
