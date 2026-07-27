const https = require('https');
const http = require('http');

// ── CONFIG ────────────────────────────────────────────────────────────────
const BASE_URL = 'https://medicare-pro-production-7aa9.up.railway.app/api';
const ADMIN_EMAIL = 'admin@medicare.com';
const ADMIN_PASSWORD = 'Admin1234!';

// ── HTTP Helper ───────────────────────────────────────────────────────────
function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    if (body) {
      const data = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function log(emoji, msg) { console.log(`${emoji}  ${msg}`); }
function success(msg) { log('✅', msg); }
function fail(msg) { log('❌', msg); }
function info(msg) { log('ℹ️ ', msg); }
function section(msg) { console.log(`\n${'─'.repeat(60)}\n   ${msg}\n${'─'.repeat(60)}`); }

// ── SEED DATA ─────────────────────────────────────────────────────────────

const STAFF = [
  { full_name: 'Dr. Emmanuel Fon', email: 'dr.fon@medicare.com',       password: 'Doctor1234!', role: 'doctor' },
  { full_name: 'Dr. Aisha Bello',  email: 'dr.bello@medicare.com',     password: 'Doctor1234!', role: 'doctor' },
  { full_name: 'Dr. Paul Nkomo',   email: 'dr.nkomo@medicare.com',     password: 'Doctor1234!', role: 'doctor' },
  { full_name: 'Grace Atanga',     email: 'grace.atanga@medicare.com', password: 'Nurse1234!',  role: 'nurse' },
  { full_name: 'Felix Mbah',       email: 'felix.mbah@medicare.com',   password: 'Nurse1234!',  role: 'nurse' },
  { full_name: 'Sophie Mbarga',    email: 'sophie.mbarga@medicare.com',password: 'Recept1234!', role: 'receptionist' },
  { full_name: 'Carine Talla',     email: 'carine.talla@medicare.com', password: 'Recept1234!', role: 'receptionist' },
];

const DOCTORS = [
  {
    email: 'dr.fon@medicare.com',
    profile: {
      specialization: 'General Practice',
      license_number: 'LIC-2024-001',
      phone: '+237 670 123 456',
      bio: 'Experienced general practitioner with over 10 years of clinical experience.',
      availability: [
        { day: 'Monday',    start_time: '08:00', end_time: '16:00' },
        { day: 'Tuesday',   start_time: '08:00', end_time: '16:00' },
        { day: 'Wednesday', start_time: '08:00', end_time: '16:00' },
        { day: 'Thursday',  start_time: '08:00', end_time: '16:00' },
        { day: 'Friday',    start_time: '08:00', end_time: '13:00' },
      ]
    }
  },
  {
    email: 'dr.bello@medicare.com',
    profile: {
      specialization: 'Cardiology',
      license_number: 'LIC-2024-002',
      phone: '+237 680 234 567',
      bio: 'Board-certified cardiologist specializing in preventive cardiology and heart failure management.',
      availability: [
        { day: 'Monday',    start_time: '09:00', end_time: '17:00' },
        { day: 'Wednesday', start_time: '09:00', end_time: '17:00' },
        { day: 'Friday',    start_time: '09:00', end_time: '15:00' },
      ]
    }
  },
  {
    email: 'dr.nkomo@medicare.com',
    profile: {
      specialization: 'Pediatrics',
      license_number: 'LIC-2024-003',
      phone: '+237 690 345 678',
      bio: 'Dedicated pediatrician with special interest in child nutrition and development.',
      availability: [
        { day: 'Tuesday',   start_time: '08:00', end_time: '16:00' },
        { day: 'Thursday',  start_time: '08:00', end_time: '16:00' },
        { day: 'Saturday',  start_time: '09:00', end_time: '13:00' },
      ]
    }
  }
];

const PATIENTS = [
  {
    full_name: 'John Doe',
    date_of_birth: '1985-03-15',
    gender: 'male',
    blood_type: 'O+',
    phone: '+237 670 111 222',
    email: 'john.doe@email.com',
    address: '12 Bastos Street, Yaoundé',
    emergency_contact_name: 'Jane Doe',
    emergency_contact_phone: '+237 670 333 444',
  },
  {
    full_name: 'Marie Nguema',
    date_of_birth: '1992-07-22',
    gender: 'female',
    blood_type: 'A+',
    phone: '+237 680 222 333',
    email: 'marie.nguema@email.com',
    address: '45 Mvog-Ada, Yaoundé',
    emergency_contact_name: 'Pierre Nguema',
    emergency_contact_phone: '+237 680 444 555',
  },
  {
    full_name: 'Samuel Tchoupo',
    date_of_birth: '1978-11-08',
    gender: 'male',
    blood_type: 'B+',
    phone: '+237 690 333 444',
    email: 'samuel.tchoupo@email.com',
    address: '78 Nlongkak, Yaoundé',
    emergency_contact_name: 'Alice Tchoupo',
    emergency_contact_phone: '+237 690 555 666',
  },
  {
    full_name: 'Fatima Aliyu',
    date_of_birth: '2001-04-30',
    gender: 'female',
    blood_type: 'AB+',
    phone: '+237 677 444 555',
    email: 'fatima.aliyu@email.com',
    address: '23 Omnisports, Yaoundé',
    emergency_contact_name: 'Ibrahim Aliyu',
    emergency_contact_phone: '+237 677 666 777',
  },
  {
    full_name: 'Emmanuel Biya',
    date_of_birth: '1965-09-12',
    gender: 'male',
    blood_type: 'O-',
    phone: '+237 655 555 666',
    email: 'emmanuel.biya@email.com',
    address: '5 Quartier du Lac, Yaoundé',
    emergency_contact_name: 'Hélène Biya',
    emergency_contact_phone: '+237 655 777 888',
  },
];

const MEDICAL_HISTORIES = [
  {
    allergies: 'Penicillin, Peanuts',
    chronic_conditions: 'Hypertension, Type 2 Diabetes',
    current_medications: 'Metformin 500mg, Amlodipine 5mg',
    past_surgeries: 'Appendectomy (2010)',
    family_history: 'Father: hypertension; Mother: diabetes',
    blood_pressure: '140/90',
    notes: 'Patient requires regular BP monitoring. Last HbA1c: 7.2%',
  },
  {
    allergies: 'Sulfonamides',
    chronic_conditions: 'Asthma',
    current_medications: 'Salbutamol inhaler (PRN)',
    past_surgeries: 'None',
    family_history: 'Mother: asthma',
    blood_pressure: '118/75',
    notes: 'Well-controlled asthma. Advise to avoid cold air and exercise-induced triggers.',
  },
  {
    allergies: 'None known',
    chronic_conditions: 'Hyperlipidemia',
    current_medications: 'Atorvastatin 20mg',
    past_surgeries: 'Knee arthroscopy (2019)',
    family_history: 'Father: coronary artery disease',
    blood_pressure: '125/82',
    notes: 'Annual lipid panel recommended. Low-fat diet advised.',
  },
  {
    allergies: 'Latex',
    chronic_conditions: 'None',
    current_medications: 'Oral contraceptives',
    past_surgeries: 'None',
    family_history: 'No significant family history',
    blood_pressure: '110/70',
    notes: 'Healthy young adult. Annual check-up recommended.',
  },
  {
    allergies: 'Aspirin, NSAIDs',
    chronic_conditions: 'Chronic Kidney Disease Stage 2, Hypertension',
    current_medications: 'Losartan 50mg, Furosemide 40mg',
    past_surgeries: 'Coronary bypass (2018)',
    family_history: 'Father: renal failure; Brother: hypertension',
    blood_pressure: '150/95',
    notes: 'Requires nephrology follow-up every 3 months. Strict fluid restriction.',
  },
];

// ── MAIN SEEDER ───────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🏥  MediCare Pro — Live Database Seeder');
  console.log('════════════════════════════════════════\n');

  // ── Step 1: Login as admin ─────────────────────────────────────────────
  section('STEP 1: Admin Authentication');
  const loginRes = await request('POST', '/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });

  if (!loginRes.body.success) {
    fail(`Admin login failed: ${loginRes.body.message}`);
    info('Make sure admin account exists. Run the register command first.');
    process.exit(1);
  }

  const token = loginRes.body.data.token;
  success(`Admin logged in — token acquired`);

  // ── Step 2: Register staff ─────────────────────────────────────────────
  section('STEP 2: Registering Staff Accounts');
  const staffIds = {};

  for (const staff of STAFF) {
    const res = await request('POST', '/auth/register', staff, token);
    if (res.status === 201) {
      success(`Registered: ${staff.full_name} (${staff.role})`);
      staffIds[staff.email] = res.body.data?.user?.id;
    } else if (res.status === 409) {
      info(`Already exists: ${staff.full_name} — skipping`);
    } else {
      fail(`Failed to register ${staff.full_name}: ${res.body.message}`);
    }
  }

  // ── Step 3: Get all staff to find user IDs ─────────────────────────────
  section('STEP 3: Fetching Staff IDs');
  const staffRes = await request('GET', '/auth/staff', null, token);
  const staffRaw = staffRes.body.data; const allStaff = Array.isArray(staffRaw) ? staffRaw : Array.isArray(staffRaw?.rows) ? staffRaw.rows : [];
  success(`Found ${allStaff.length} staff members`);

  // ── Step 4: Create doctor profiles ────────────────────────────────────
  section('STEP 4: Creating Doctor Profiles');
  const doctorIds = {};

  // Get existing doctors first
  const existingDoctorsRes = await request('GET', '/doctors', null, token);
  const existingDoctorsRaw = existingDoctorsRes.body.data;
  const existingDoctors = Array.isArray(existingDoctorsRaw) 
    ? existingDoctorsRaw 
    : Array.isArray(existingDoctorsRaw?.rows) 
      ? existingDoctorsRaw.rows 
      : [];

  for (const doc of DOCTORS) {
    const staffMember = allStaff.find(s => s.email === doc.email);
    if (!staffMember) {
      info(`Staff member ${doc.email} not found — skipping doctor profile`);
      continue;
    }

    // Check if doctor profile already exists
    const existing = existingDoctors.find(d => d.user_id === staffMember.id);
    if (existing) {
      info(`Doctor profile already exists for ${doc.email} — skipping`);
      doctorIds[doc.email] = existing.id;
      continue;
    }

    const res = await request('POST', '/doctors', {
      user_id: staffMember.id,
      ...doc.profile
    }, token);

    if (res.status === 201) {
      success(`Doctor profile created: ${staffMember.full_name} — ${doc.profile.specialization}`);
      doctorIds[doc.email] = res.body.data?.id;
    } else {
      fail(`Failed to create doctor profile for ${doc.email}: ${JSON.stringify(res.body)}`);
    }
  }

  // Refresh doctor list
  const refreshDoctorsRes = await request('GET', '/doctors', null, token);
  const allDoctorsRaw = refreshDoctorsRes.body.data; const allDoctors = Array.isArray(allDoctorsRaw) ? allDoctorsRaw : Array.isArray(allDoctorsRaw?.rows) ? allDoctorsRaw.rows : [];
  success(`Total doctors in system: ${allDoctors.length}`);

  // ── Step 5: Register patients ──────────────────────────────────────────
  section('STEP 5: Registering Patients');
  const patientIds = [];

  // Get existing patients
  const existingPatientsRes = await request('GET', '/patients', null, token);
  const existingPatientsRaw = existingPatientsRes.body.data;
  const existingPatients = Array.isArray(existingPatientsRaw)
    ? existingPatientsRaw
    : Array.isArray(existingPatientsRaw?.rows)
      ? existingPatientsRaw.rows
      : [];

  for (const patient of PATIENTS) {
    const existing = existingPatients.find(p => p.email === patient.email);
    if (existing) {
      info(`Patient already exists: ${patient.full_name} — skipping`);
      patientIds.push(existing.id);
      continue;
    }

    const res = await request('POST', '/patients', patient, token);
    if (res.status === 201) {
      const id = res.body.data?.id;
      patientIds.push(id);
      success(`Registered patient: ${patient.full_name} — ${res.body.data?.patient_number}`);
    } else {
      fail(`Failed to register ${patient.full_name}: ${JSON.stringify(res.body)}`);
    }
  }

  // ── Step 6: Add medical histories ─────────────────────────────────────
  section('STEP 6: Adding Medical Histories');

  // Refresh patient list to get all IDs
  const refreshPatientsRes = await request('GET', '/patients', null, token);
  const allPatientsRaw = refreshPatientsRes.body.data; const allPatients = Array.isArray(allPatientsRaw) ? allPatientsRaw : Array.isArray(allPatientsRaw?.rows) ? allPatientsRaw.rows : [];

  for (let i = 0; i < allPatients.length && i < MEDICAL_HISTORIES.length; i++) {
    const patient = allPatients[i];
    const history = MEDICAL_HISTORIES[i];

    // Try to get existing medical history
    const existingRes = await request('GET', `/patients/${patient.id}`, null, token);
    const existingHistory = existingRes.body.data?.medical_history;

    if (existingHistory) {
      info(`Medical history already exists for ${patient.full_name} — skipping`);
      continue;
    }

    const res = await request('POST', `/patients/${patient.id}/medical-history`, history, token);
    if (res.status === 201 || res.status === 200) {
      success(`Medical history added for: ${patient.full_name}`);
    } else {
      // Try PUT if POST doesn't work
      const putRes = await request('PUT', `/patients/${patient.id}/medical-history`, history, token);
      if (putRes.status === 200 || putRes.status === 201) {
        success(`Medical history added for: ${patient.full_name}`);
      } else {
        fail(`Failed medical history for ${patient.full_name}: ${JSON.stringify(res.body)}`);
      }
    }
  }

  // ── Step 7: Book appointments ──────────────────────────────────────────
  section('STEP 7: Booking Appointments');

  if (allDoctors.length > 0 && allPatients.length > 0) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    const dayAfterStr = dayAfter.toISOString().split('T')[0];

    const APPOINTMENTS = [
      {
        patient_id: allPatients[0]?.id,
        doctor_id: allDoctors[0]?.id,
        scheduled_at: `${tomorrowStr}T09:00:00`,
        duration_minutes: 30,
        type: 'consultation',
        reason: 'Regular blood pressure check and diabetes follow-up',
        notes: 'Patient on Metformin and Amlodipine'
      },
      {
        patient_id: allPatients[1]?.id,
        doctor_id: allDoctors[0]?.id,
        scheduled_at: `${tomorrowStr}T10:00:00`,
        duration_minutes: 30,
        type: 'follow_up',
        reason: 'Asthma review and inhaler technique check',
        notes: 'Last attack was 3 months ago'
      },
      {
        patient_id: allPatients[2]?.id,
        doctor_id: allDoctors.length > 1 ? allDoctors[1]?.id : allDoctors[0]?.id,
        scheduled_at: `${tomorrowStr}T11:00:00`,
        duration_minutes: 45,
        type: 'consultation',
        reason: 'Cardiac evaluation and lipid panel review',
        notes: 'Annual cardiology check-up'
      },
      {
        patient_id: allPatients[3]?.id,
        doctor_id: allDoctors.length > 2 ? allDoctors[2]?.id : allDoctors[0]?.id,
        scheduled_at: `${dayAfterStr}T09:30:00`,
        duration_minutes: 20,
        type: 'consultation',
        reason: 'General wellness check',
        notes: 'First visit to the clinic'
      },
      {
        patient_id: allPatients[4]?.id,
        doctor_id: allDoctors[0]?.id,
        scheduled_at: `${dayAfterStr}T14:00:00`,
        duration_minutes: 60,
        type: 'follow_up',
        reason: 'Kidney function review and medication adjustment',
        notes: 'Critical patient — requires nephrologist referral'
      },
    ];

    for (const apt of APPOINTMENTS) {
      if (!apt.patient_id || !apt.doctor_id) continue;
      const res = await request('POST', '/appointments', apt, token);
      if (res.status === 201) {
        success(`Appointment booked — ${res.body.data?.appointment_number}`);
      } else if (res.status === 409) {
        info(`Appointment conflict detected — skipping`);
      } else {
        fail(`Appointment failed: ${JSON.stringify(res.body)}`);
      }
    }
  } else {
    info('No doctors or patients available for appointments');
  }

  // ── Step 8: Issue prescriptions ────────────────────────────────────────
  section('STEP 8: Issuing Prescriptions');

  // Login as doctor to issue prescriptions
  const drLoginRes = await request('POST', '/auth/login', {
    email: 'dr.fon@medicare.com',
    password: 'Doctor1234!'
  });

  if (drLoginRes.body.success) {
    const drToken = drLoginRes.body.data.token;
    success('Logged in as Dr. Fon to issue prescriptions');

    const freshPatientsRes = await request("GET", "/patients", null, token); const freshPatientsRaw = freshPatientsRes.body.data; const freshPatients = Array.isArray(freshPatientsRaw) ? freshPatientsRaw : Array.isArray(freshPatientsRaw?.rows) ? freshPatientsRaw.rows : [];

    const PRESCRIPTIONS = [
      {
        patient_id: freshPatients[0]?.id,
        diagnosis: 'Hypertension with poorly controlled blood pressure. Type 2 Diabetes Mellitus.',
        notes: 'Monitor BP weekly. Return if readings exceed 160/100.',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          { medication_name: 'Amlodipine',  dosage: '10mg', frequency: 'Once daily',  duration: '30 days', quantity: 30, instructions: 'Take in the morning with water' },
          { medication_name: 'Metformin',   dosage: '500mg', frequency: 'Twice daily', duration: '30 days', quantity: 60, instructions: 'Take with meals to reduce GI side effects' },
          { medication_name: 'Aspirin',     dosage: '75mg',  frequency: 'Once daily',  duration: '30 days', quantity: 30, instructions: 'Take after breakfast' },
        ]
      },
      {
        patient_id: freshPatients[1]?.id,
        diagnosis: 'Acute exacerbation of bronchial asthma. Mild-moderate severity.',
        notes: 'Avoid cold air and exercise triggers. Return immediately if symptoms worsen.',
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          { medication_name: 'Salbutamol inhaler',      dosage: '100mcg', frequency: 'Every 4-6 hours PRN', duration: '14 days', quantity: 1, instructions: '2 puffs as needed. Shake before use.' },
          { medication_name: 'Prednisolone',            dosage: '40mg',   frequency: 'Once daily',           duration: '5 days',  quantity: 5, instructions: 'Take in the morning after breakfast. Do not stop abruptly.' },
          { medication_name: 'Cetirizine',              dosage: '10mg',   frequency: 'Once daily at night',  duration: '14 days', quantity: 14, instructions: 'May cause drowsiness' },
        ]
      },
      {
        patient_id: freshPatients[2]?.id,
        diagnosis: 'Hyperlipidemia. Elevated LDL cholesterol requiring pharmacological management.',
        notes: 'Low-fat, low-cholesterol diet strictly required. Avoid grapefruit with statin.',
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          { medication_name: 'Atorvastatin', dosage: '40mg', frequency: 'Once daily at night', duration: '90 days', quantity: 90, instructions: 'Take at bedtime. Avoid grapefruit juice.' },
          { medication_name: 'Omega-3 fish oil', dosage: '1000mg', frequency: 'Twice daily', duration: '90 days', quantity: 180, instructions: 'Take with meals' },
        ]
      },
    ];

    for (const presc of PRESCRIPTIONS) {
      if (!presc.patient_id) continue;
      const res = await request('POST', '/prescriptions', presc, drToken);
      if (res.status === 201) {
        success(`Prescription issued — ${res.body.data?.prescription_number}`);
      } else {
        fail(`Prescription failed: ${JSON.stringify(res.body)}`);
      }
    }
  } else {
    fail('Could not login as doctor — prescriptions skipped');
    info('Register dr.fon@medicare.com first');
  }

  // ── SUMMARY ───────────────────────────────────────────────────────────
  section('SEEDING COMPLETE — SUMMARY');
  const finalPatients = await request('GET', '/patients', null, token);
  const finalDoctors  = await request('GET', '/doctors', null, token);
  const finalApts     = await request('GET', '/appointments', null, token);
  const finalPrescs   = await request('GET', '/prescriptions', null, token);
  const stats         = await request('GET', '/dashboard/stats', null, token);

  console.log('\n📊  Live Database Summary:');
  console.log(`   👥  Patients:     ${finalPatients.body.data?.count ?? (Array.isArray(finalPatients.body.data) ? finalPatients.body.data.length : finalPatients.body.data?.rows?.length) ?? '?'}`);
  console.log(`   👨‍⚕️  Doctors:      ${finalDoctors.body.data?.count ?? (Array.isArray(finalDoctors.body.data) ? finalDoctors.body.data.length : finalDoctors.body.data?.rows?.length)  ?? '?'}`);
  console.log(`   📅  Appointments: ${finalApts.body.data?.count ?? (Array.isArray(finalApts.body.data) ? finalApts.body.data.length : finalApts.body.data?.rows?.length)     ?? '?'}`);
  console.log(`   💊  Prescriptions:${finalPrescs.body.data?.count ?? (Array.isArray(finalPrescs.body.data) ? finalPrescs.body.data.length : finalPrescs.body.data?.rows?.length)   ?? '?'}`);
  console.log('\n🎉  Your live system is fully seeded!');
  console.log(`\n🌐  Visit: https://medicare-pro-gamma.vercel.app`);
  console.log(`    Login: admin@medicare.com / Admin1234!\n`);
}

seed().catch(err => {
  console.error('Seeder crashed:', err.message);
  process.exit(1);
});
