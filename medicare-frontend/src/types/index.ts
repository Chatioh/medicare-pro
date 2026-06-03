export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist';
  is_active: boolean;
}

export interface Doctor {
  id: string;
  user_id: string;
  specialization: string;
  license_number: string;
  phone?: string;
  bio?: string;
  available_days?: string;
  start_time?: string;
  end_time?: string;
  user?: User;
}

export interface Patient {
  id: string;
  patient_number: string;
  full_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address?: string;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export interface MedicalHistory {
  id: string;
  patient_id: string;
  chronic_conditions?: string;
  allergies?: string;
  past_surgeries?: string;
  current_medications?: string;
  family_history?: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  appointment_number: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  type: 'consultation' | 'follow_up' | 'emergency' | 'routine_checkup';
  reason?: string;
  notes?: string;
  patient?: Patient;
  doctor?: Doctor;
}

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string;
}

export interface Prescription {
  id: string;
  prescription_number: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  diagnosis: string;
  status: 'issued' | 'dispensed' | 'expired' | 'cancelled';
  issued_at: string;
  expires_at?: string;
  notes?: string;
  patient?: Patient;
  doctor?: Doctor;
  items?: PrescriptionItem[];
}

export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  appointmentsToday: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalPrescriptions: number;
  activePrescriptions: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedData<T> {
  rows: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: PaginatedData<T>;
  message: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
