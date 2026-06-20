const request = require('supertest');

process.env.JWT_SECRET = 'test_secret_key_for_testing_minimum_32_chars';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_for_testing';
process.env.NODE_ENV = 'test';

const app = require('../../src/app');
const { sequelize, User, Patient, Doctor, Appointment } = require('../../src/models');

describe('Appointments API Integration Tests', () => {
  let adminToken;
  let receptionistToken;
  let doctorToken;
  let patientId;
  let doctorId;
  let createdAppointmentId;

  const adminUser = {
    full_name: 'Appt Admin',
    email: `appt_admin_${Date.now()}@medicare.com`,
    password: 'AdminPass1234!',
    role: 'admin',
  };

  const doctorUser = {
    full_name: 'Appt Doctor',
    email: `appt_doctor_${Date.now()}@medicare.com`,
    password: 'DocPass1234!',
    role: 'doctor',
  };

  const receptionistUser = {
    full_name: 'Appt Receptionist',
    email: `appt_recept_${Date.now()}@medicare.com`,
    password: 'ReceptPass1234!',
    role: 'receptionist',
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
    const receptRes = await request(app).post('/api/auth/login')
      .send({ email: receptionistUser.email, password: receptionistUser.password });
    receptionistToken = receptRes.body.data.token;

    // Create a patient
    const patientRes = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        full_name: 'Appointment Patient',
        date_of_birth: '1985-06-15',
        gender: 'female',
        phone: '+237600000001',
      });
    patientId = patientRes.body.data.patient.id;

    // Create a doctor profile
    const doc = await Doctor.create({
      user_id: doctorRes.body.data.user.id,
      specialization: 'Cardiology',
      license_number: `LIC-${Date.now()}`,
      phone: '+237600000002',
      available_days: 'Mon,Tue,Wed,Thu,Fri',
      start_time: '09:00',
      end_time: '17:00',
    });
    doctorId = doc.id;
  });

  afterAll(async () => {
    try {
      if (createdAppointmentId) await Appointment.destroy({ where: { id: createdAppointmentId } });
      await Patient.destroy({ where: { id: patientId } });
      await Doctor.destroy({ where: { id: doctorId } });
      await User.destroy({ where: { email: adminUser.email } });
      await User.destroy({ where: { email: doctorUser.email } });
      await User.destroy({ where: { email: receptionistUser.email } });
    } catch (err) {
      // ignore
    }
    await sequelize.close();
  });

  describe('POST /api/appointments', () => {
    // Pick a Monday (day=1) to match doctor's available_days: Mon,Tue,Wed,Thu,Fri
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + ((8 - nextMonday.getDay()) % 7 || 7));
    const dateStr = nextMonday.toISOString().split('T')[0];

    test('receptionist can create an appointment', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${receptionistToken}`)
        .send({
          patient_id: patientId,
          doctor_id: doctorId,
          appointment_date: dateStr,
          start_time: '10:00',
          end_time: '10:30',
          type: 'consultation',
          reason: 'Chest pain',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.appointment.appointment_number).toMatch(/^APT-/);
      createdAppointmentId = res.body.data.appointment.id;
    });

    test('returns 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .send({
          patient_id: patientId,
          doctor_id: doctorId,
          appointment_date: dateStr,
          start_time: '11:00',
          end_time: '11:30',
          type: 'consultation',
        });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/appointments', () => {
    test('returns paginated appointments', async () => {
      const res = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/appointments');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/appointments/:id', () => {
    test('returns appointment by id', async () => {
      const res = await request(app)
        .get(`/api/appointments/${createdAppointmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.appointment.id).toBe(createdAppointmentId);
    });

    test('returns 404 for non-existent appointment', async () => {
      const res = await request(app)
        .get('/api/appointments/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });
});
