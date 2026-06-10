import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { createAppointment, updateAppointment, getAppointmentById, checkConflict } from '../../api/appointmentApi';
import { getDoctors } from '../../api/doctorApi';
import { getPatients } from '../../api/patientApi';
import { Doctor, Patient } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import PageWrapper from '../../components/layout/PageWrapper';
import { ArrowLeft } from 'lucide-react';

const APPOINTMENT_TYPES = ['consultation', 'follow_up', 'emergency', 'routine_checkup'];

const AppointmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preSelectedPatientId = searchParams.get('patient_id') || '';
  const isEditMode = !!id;

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [conflictMsg, setConflictMsg] = useState<{ available: boolean; message: string } | null>(null);
  const [formData, setFormData] = useState({
    patient_id: preSelectedPatientId,
    doctor_id: '',
    appointment_date: '',
    start_time: '',
    end_time: '',
    type: '',
    reason: '',
  });

  useEffect(() => {
    const fetchPatientsList = async () => {
      try {
        const res = await getPatients({});
        const rows = (res?.data as any)?.patients ?? res?.data?.rows ?? res?.data ?? (res as any)?.rows ?? res ?? [];
        setPatients(Array.isArray(rows) ? rows : []);
      } catch {
        setPatients([]);
      }
    };
    const fetchDoctorsList = async () => {
      try {
        const res = await getDoctors({});
        const rows = (res?.data as any)?.doctors ?? res?.data?.rows ?? res?.data ?? (res as any)?.rows ?? res ?? [];
        setDoctors(Array.isArray(rows) ? rows : []);
      } catch {
        setDoctors([]);
      }
    };
    const fetchAppointment = async () => {
      if (!id) return;
      try {
        const res = await getAppointmentById(id);
        const a = res?.data?.appointment ?? (res as any)?.appointment;
        if (a) {
          setFormData({
            patient_id: a.patient_id || '',
            doctor_id: a.doctor_id || '',
            appointment_date: a.appointment_date || '',
            start_time: a.start_time || '',
            end_time: a.end_time || '',
            type: a.type || '',
            reason: a.reason || '',
          });
        }
      } catch {
        // silently fail
      }
    };
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchPatientsList(), fetchDoctorsList(), fetchAppointment()]);
      setLoading(false);
    };
    init();
  }, [id]);

  useEffect(() => {
    if (!formData.doctor_id || !formData.appointment_date || !formData.start_time || !formData.end_time) {
      setConflictMsg(null);
      return;
    }

    const selectedDoctor = doctors.find(d => d.id === formData.doctor_id);
    console.log('Doctor available days:', selectedDoctor?.available_days);
    console.log('Selected date day:', new Date(formData.appointment_date + 'T00:00:00').getDay());

    if (selectedDoctor && !checkDoctorAvailability(selectedDoctor, formData.appointment_date)) {
      setConflictMsg({ available: false, message: 'Doctor not available on this day' });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const params: Record<string, string> = {
          doctor_id: formData.doctor_id,
          date: formData.appointment_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
        };
        if (isEditMode && id) {
          params.appointment_id = id;
        }
        const res = await checkConflict(params);
        const available = res?.data?.available ?? (res as any)?.available;
        const conflicting = res?.data?.conflictingAppointment;
        if (available) {
          setConflictMsg({ available: true, message: 'Time slot available' });
        } else {
          setConflictMsg({ available: false, message: conflicting ? 'Conflict detected with an existing appointment' : 'Time slot not available' });
        }
      } catch {
        setConflictMsg({ available: false, message: 'Could not verify availability' });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.doctor_id, formData.appointment_date, formData.start_time, formData.end_time, doctors]);

  const checkDoctorAvailability = (doctor: Doctor, date: string) => {
    if (!doctor?.available_days || !date) return true;

    const dateObj = new Date(date + 'T00:00:00');
    const dayIndex = dateObj.getDay();

    const dayShortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayFullNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayShort = dayShortNames[dayIndex];
    const dayFull = dayFullNames[dayIndex];

    const availableDays = doctor.available_days.split(',').map(d => d.trim());

    return availableDays.some(d =>
      d === dayShort ||
      d === dayFull ||
      d.toLowerCase() === dayShort.toLowerCase() ||
      d.toLowerCase() === dayFull.toLowerCase()
    );
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!formData.patient_id || !formData.doctor_id || !formData.appointment_date || !formData.start_time || !formData.end_time || !formData.type || !formData.reason.trim()) {
      setSubmitError('Please fill in all required fields.');
      return;
    }

    const selectedDoctor = doctors.find(d => d.id === formData.doctor_id);
    console.log('Doctor available days:', selectedDoctor?.available_days);
    console.log('Selected date day:', new Date(formData.appointment_date + 'T00:00:00').getDay());

    if (selectedDoctor && !checkDoctorAvailability(selectedDoctor, formData.appointment_date)) {
      setSubmitError('⚠️ The selected doctor is not available on this day. Please choose another date or doctor.');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Submitting appointment payload:', formData);
      if (isEditMode && id) {
        await updateAppointment(id, formData as unknown as Record<string, unknown>);
        navigate(`/appointments/${id}`);
      } else {
        const res = await createAppointment(formData as unknown as Record<string, unknown>);
        navigate(`/appointments/${res.data?.appointment?.id ?? (res as any)?.appointment?.id}`);
      }
    } catch (err: any) {
      console.log('Submit error response:', err?.response?.data);
      const errData = err?.response?.data;
      if (errData?.errors?.length > 0) {
        setSubmitError('Validation error: ' + errData.errors.map((e: any) => e.message).join('; '));
      } else {
        setSubmitError(errData?.message ?? 'Failed to book appointment.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title={isEditMode ? 'Edit Appointment' : 'Book Appointment'}>
        <Spinner />
      </PageWrapper>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <PageWrapper title={isEditMode ? 'Edit Appointment' : 'Book Appointment'}>
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => navigate('/appointments')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Appointment' : 'Book Appointment'}</h1>
          </div>

          <Card>
            {submitError && (
              <div className="mb-6 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-200">
                {submitError}
              </div>
            )}

            <div className="space-y-5">
              <p className="text-lg font-semibold text-gray-700 mb-4">Appointment Details</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
                  <select
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select patient</option>
                    {(patients ?? []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.patient_number} — {p.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
                  <select
                    name="doctor_id"
                    value={formData.doctor_id}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select doctor</option>
                    {(doctors ?? []).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.user?.full_name || 'Unknown'} — {d.specialization}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Appointment Date *"
                  name="appointment_date"
                  type="date"
                  value={formData.appointment_date}
                  onChange={handleChange}
                  min={today}
                />
                <Input
                  label="Start Time *"
                  name="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={handleChange}
                />
                <Input
                  label="End Time *"
                  name="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={handleChange}
                />
              </div>

              {conflictMsg && (
                <div className={`px-4 py-3 rounded-lg text-sm border ${
                  conflictMsg.available
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {conflictMsg.available ? '✓ ' : '✗ '}{conflictMsg.message}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    {APPOINTMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={3}
                  className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the reason for the appointment..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <Button variant="secondary" onClick={() => navigate('/appointments')}>Cancel</Button>
                <Button variant="primary" type="button" onClick={handleSubmit} loading={submitting}>
                  {isEditMode ? 'Update Appointment' : 'Book Appointment'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AppointmentForm;
