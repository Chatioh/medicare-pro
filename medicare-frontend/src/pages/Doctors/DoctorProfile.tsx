import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDoctorById, updateDoctor } from '../../api/doctorApi';
import { getAppointments } from '../../api/appointmentApi';
import { Doctor, Appointment } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Table, { Column } from '../../components/ui/Table';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/ui/Input';
import { formatDate, formatTime } from '../../utils/formatters';
import { ArrowLeft, Edit, Phone, Mail, Stethoscope, Clock, BookOpen } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DoctorProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    specialization: '',
    phone: '',
    available_days: '',
    start_time: '',
    end_time: '',
    bio: '',
  });

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [docRes, apptRes] = await Promise.all([
          getDoctorById(id),
          getAppointments({ doctor_id: id }),
        ]);
        const d = docRes?.data?.doctor ?? (docRes as any)?.doctor;
        setDoctor(d ?? null);
        const appts = (apptRes?.data as any)?.appointments ?? apptRes?.data?.rows ?? apptRes?.data ?? apptRes ?? [];
        setAppointments(Array.isArray(appts) ? appts : []);
        if (d) {
          setEditForm({
            full_name: d.user?.full_name || '',
            specialization: d.specialization || '',
            phone: d.phone || '',
            available_days: d.available_days || '',
            start_time: d.start_time || '',
            end_time: d.end_time || '',
            bio: d.bio || '',
          });
        }
      } catch {
        // handled below
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const openEditModal = () => {
    if (!doctor) return;
    setEditForm({
      full_name: doctor.user?.full_name || '',
      specialization: doctor.specialization || '',
      phone: doctor.phone || '',
      available_days: doctor.available_days || '',
      start_time: doctor.start_time || '',
      end_time: doctor.end_time || '',
      bio: doctor.bio || '',
    });
    setEditModalOpen(true);
  };

  const handleEditChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleEditDay = (day: string) => {
    const current = editForm.available_days ? editForm.available_days.split(',').map((d) => d.trim()) : [];
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    setEditForm((prev) => ({ ...prev, available_days: updated.join(',') }));
  };

  const handleEditSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await updateDoctor(id, editForm as unknown as Record<string, unknown>);
      const res = await getDoctorById(id);
      const d = res?.data?.doctor ?? (res as any)?.doctor;
      setDoctor(d ?? null);
      setEditModalOpen(false);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Doctor Profile">
        <Spinner />
      </PageWrapper>
    );
  }

  if (!doctor) {
    return (
      <PageWrapper title="Doctor Profile">
        <div className="p-6">
          <div className="max-w-4xl mx-auto text-center py-12">
            <p className="text-gray-500 mb-4">Doctor not found.</p>
            <Button variant="secondary" onClick={() => navigate('/doctors')}>
              Back to Doctors
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const initials = doctor.user?.full_name
    ? doctor.user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'DR';

  const availableDaysArr = doctor.available_days ? doctor.available_days.split(',').map((d) => d.trim()) : [];

  const appointmentColumns: Column[] = [
    {
      key: 'appointment_date',
      header: 'Date',
      render: (row) => <span>{formatDate(row.appointment_date as string)}</span>,
    },
    {
      key: 'patient',
      header: 'Patient',
      render: (row) => {
        const a = row as unknown as Appointment;
        return <span>{a.patient?.full_name || '—'}</span>;
      },
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => {
        const t = row.type as string;
        return <span className="capitalize">{t.replace(/_/g, ' ')}</span>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge status={row.status as string} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Button size="sm" variant="ghost" onClick={() => navigate(`/appointments/${row.id as string}`)}>
          View
        </Button>
      ),
    },
  ];

  const appointmentData: Record<string, unknown>[] = (appointments ?? []).map((a) => ({ ...a }));

  return (
    <PageWrapper title={doctor.user?.full_name || 'Doctor Profile'}>
      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <button
            onClick={() => navigate('/doctors')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Doctors
          </button>

          <div className="flex items-center gap-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{doctor.user?.full_name || 'Unknown Doctor'}</h1>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  <Stethoscope className="w-3 h-3 mr-1" />
                  {doctor.specialization}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{doctor.license_number}</p>
            </div>
            <Button size="sm" variant="secondary" onClick={openEditModal}>
              <Edit className="w-4 h-4 mr-1" />
              Edit Profile
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Doctor Information">
              <div className="space-y-0">
                <div className="flex justify-between py-2.5 border-b border-gray-50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Phone</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{doctor.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Email</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{doctor.user?.email || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Specialization</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{doctor.specialization}</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">License Number</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">{doctor.license_number}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <Edit className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Bio</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 max-w-[200px] text-right">{doctor.bio || 'No bio provided'}</span>
                </div>
              </div>
            </Card>

            <Card title="Availability Schedule">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Available Days</span>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => (
                      <span
                        key={day}
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                          availableDaysArr.includes(day)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Working Hours</span>
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    {doctor.start_time ? (
                      <span className="font-medium">{formatTime(doctor.start_time)} — {formatTime(doctor.end_time || '')}</span>
                    ) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card title="Appointment History">
            <Table
              columns={appointmentColumns}
              data={appointmentData}
              emptyMessage="No appointments yet"
            />
          </Card>
        </div>
      </div>

      <Modal title="Edit Doctor Profile" isOpen={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <div className="space-y-4">
          <Input label="Full Name" name="full_name" value={editForm.full_name} onChange={handleEditChange} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Specialization" name="specialization" value={editForm.specialization} onChange={handleEditChange} />
            <Input label="Phone" name="phone" value={editForm.phone} onChange={handleEditChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const current = editForm.available_days ? editForm.available_days.split(',').map((d) => d.trim()) : [];
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleEditDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      current.includes(day)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Start Time" name="start_time" type="time" value={editForm.start_time} onChange={handleEditChange} />
            <Input label="End Time" name="end_time" type="time" value={editForm.end_time} onChange={handleEditChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
            <textarea
              name="bio"
              value={editForm.bio}
              onChange={handleEditChange}
              rows={3}
              className="block w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Short biography..."
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleEditSave} loading={saving}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
};

export default DoctorProfile;
