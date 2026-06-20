const request = require('supertest');

process.env.JWT_SECRET = 'test_secret_key_for_testing_minimum_32_chars';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_for_testing';
process.env.NODE_ENV = 'test';

const app = require('../../src/app');
const { sequelize, User, Patient, Doctor, Prescription } = require('../../src/models');

describe('Prescriptions API Integration Tests', () => {
  let adminToken;
  let doctorToken;
  let nurseToken;
  let patientId;
  let doctorId;
  let createdPrescriptionId;

  const adminUser = {
    full_name: 'Rx Admin',
    email: `rx_admin_${Date.now()}@medicare.com`,
    password: 'AdminPass1234!',
    role: 'admin',
  };

  const doctorUser = {
    full_name: 'Rx Doctor',
    email: `rx_doctor_${Date.now()}@medicare.com`,
    password: 'DocPass1234!',
    role: 'doctor',
  };

  const nurseUser = {
    full_name: 'Rx Nurse',
    email: `rx_nurse_${Date.now()}@medicare.com`,
    password: 'NursePass1234!',
    role: 'nurse',
  };

  const testItems = [
    {
      medication_name: 'Amoxicillin',
      dosage: '500mg',
      frequency: '3 times daily',
      duration: '7 days',
      quantity: 21,
    },
  ];

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

    await request(app).post('/api/auth/register').send(nurseUser);
    const nurseRes = await request(app).post('/api/auth/login')
      .send({ email: nurseUser.email, password: nurseUser.password });
    nurseToken = nurseRes.body.data.token;

    // Create a patient
    const patientRes = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        full_name: 'Rx Patient',
        date_of_birth: '1990-01-01',
        gender: 'male',
        phone: '+237600000010',
      });
    patientId = patientRes.body.data.patient.id;

    // Create a doctor profile
    const doc = await Doctor.create({
      user_id: doctorRes.body.data.user.id,
      specialization: 'General Practice',
      license_number: `LIC-RX-${Date.now()}`,
      phone: '+237600000011',
    });
    doctorId = doc.id;
  });

  afterAll(async () => {
    try {
      if (createdPrescriptionId) await Prescription.destroy({ where: { id: createdPrescriptionId } });
      await Patient.destroy({ where: { id: patientId } });
      await Doctor.destroy({ where: { id: doctorId } });
      await User.destroy({ where: { email: adminUser.email } });
      await User.destroy({ where: { email: doctorUser.email } });
      await User.destroy({ where: { email: nurseUser.email } });
    } catch (err) {
      // ignore
    }
    await sequelize.close();
  });

  describe('POST /api/prescriptions', () => {
    test('doctor can create a prescription', async () => {
      const res = await request(app)
        .post('/api/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          patient_id: patientId,
          diagnosis: 'Acute bronchitis',
          items: testItems,
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.prescription.prescription_number).toMatch(/^RX-/);
      createdPrescriptionId = res.body.data.prescription.id;
    });

    test('admin can create a prescription with doctor_id', async () => {
      const res = await request(app)
        .post('/api/prescriptions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          patient_id: patientId,
          doctor_id: doctorId,
          diagnosis: 'Hypertension',
          items: testItems,
        });
      expect(res.status).toBe(201);
      const id = res.body.data.prescription.id;
      await Prescription.destroy({ where: { id } });
    });

    test('returns 400 when items are missing', async () => {
      const res = await request(app)
        .post('/api/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          patient_id: patientId,
          diagnosis: 'Test',
          items: [],
        });
      expect(res.status).toBe(400);
    });

    test('nurse cannot create a prescription', async () => {
      const res = await request(app)
        .post('/api/prescriptions')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          patient_id: patientId,
          diagnosis: 'Test',
          items: testItems,
        });
      expect(res.status).toBe(403);
    });

    test('returns 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/prescriptions')
        .send({
          patient_id: patientId,
          diagnosis: 'Test',
          items: testItems,
        });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/prescriptions', () => {
    test('returns prescriptions list', async () => {
      const res = await request(app)
        .get('/api/prescriptions')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/prescriptions/:id', () => {
    test('returns prescription by id', async () => {
      const res = await request(app)
        .get(`/api/prescriptions/${createdPrescriptionId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.prescription.id).toBe(createdPrescriptionId);
    });

    test('returns 404 for non-existent prescription', async () => {
      const res = await request(app)
        .get('/api/prescriptions/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/prescriptions/:id/dispense', () => {
    test('nurse can dispense an issued prescription', async () => {
      const res = await request(app)
        .put(`/api/prescriptions/${createdPrescriptionId}/dispense`)
        .set('Authorization', `Bearer ${nurseToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.prescription.status).toBe('dispensed');
    });

    test('returns 400 when dispensing already dispensed prescription', async () => {
      const res = await request(app)
        .put(`/api/prescriptions/${createdPrescriptionId}/dispense`)
        .set('Authorization', `Bearer ${nurseToken}`);
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/prescriptions/:id/cancel', () => {
    test('doctor can cancel an issued prescription', async () => {
      // Create a new issued prescription
      const newRx = await Prescription.create({
        patient_id: patientId,
        doctor_id: doctorId,
        diagnosis: 'To cancel',
        prescription_number: `RX-${Date.now()}`,
        status: 'issued',
      });
      const res = await request(app)
        .put(`/api/prescriptions/${newRx.id}/cancel`)
        .set('Authorization', `Bearer ${doctorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.prescription.status).toBe('cancelled');
    });
  });
});
