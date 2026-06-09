import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctors, createDoctor, deleteDoctor } from '../../api/doctorApi';
import { Doctor } from '../../types';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Table, { Column } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import PageWrapper from '../../components/layout/PageWrapper';
import { formatTime } from '../../utils/formatters';
import { Search, PlusCircle, Eye, Trash2, AlertTriangle } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DoctorList = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addForm, setAddForm] = useState({
    full_name: '',
    email: '',
    password: '',
    specialization: '',
    license_number: '',
    phone: '',
    available_days: [] as string[],
    start_time: '09:00',
    end_time: '17:00',
    bio: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDoctors({ search: debouncedSearch });
      let rows = [];
      if ((res?.data as any)?.doctors) {
        rows = (res.data as any).doctors;
      } else if (res?.data?.rows) {
        rows = res.data.rows;
      } else if ((res as any)?.rows) {
        rows = (res as any).rows;
      } else if (Array.isArray(res?.data)) {
        rows = res.data;
      } else if (Array.isArray(res)) {
        rows = res;
      }
      setDoctors(rows);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load doctors');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleDeleteClick = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setDeleteModalOpen(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!doctorToDelete) return;
    setDeleting(true);
    try {
      await deleteDoctor(doctorToDelete.id);
      setDeleteModalOpen(false);
      setDoctorToDelete(null);
      fetchDoctors();
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message ?? 'Failed to delete doctor');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDay = (day: string) => {
    setAddForm((prev) => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter((d) => d !== day)
        : [...prev.available_days, day],
    }));
  };

  const handleAddSubmit = async () => {
    setAddError(null);
    if (!addForm.full_name || !addForm.email || !addForm.password || !addForm.specialization || !addForm.license_number || !addForm.phone) {
      setAddError('Please fill in all required fields.');
      return;
    }
    if (addForm.password.length < 8) {
      setAddError('Password must be at least 8 characters.');
      return;
    }
    setAddLoading(true);
    try {
      const regRes = await api.post('/auth/register', {
        full_name: addForm.full_name,
        email: addForm.email,
        password: addForm.password,
        role: 'doctor',
      });
      const userId = regRes.data?.data?.user?.id ?? (regRes.data as any)?.user?.id;
      await createDoctor({
        user_id: userId,
        specialization: addForm.specialization,
        license_number: addForm.license_number,
        phone: addForm.phone,
        available_days: addForm.available_days.join(','),
        start_time: addForm.start_time,
        end_time: addForm.end_time,
        bio: addForm.bio || undefined,
      });
      setAddModalOpen(false);
      setAddForm({
        full_name: '', email: '', password: '', specialization: '', license_number: '',
        phone: '', available_days: [], start_time: '09:00', end_time: '17:00', bio: '',
      });
      fetchDoctors();
    } catch (err: any) {
      setAddError(err?.response?.data?.message ?? 'Failed to add doctor.');
    } finally {
      setAddLoading(false);
    }
  };

  const columns: Column[] = [
    {
      key: 'user',
      header: 'Name',
      render: (row) => {
        const d = row as unknown as Doctor;
        return <span className="font-medium text-gray-900">{d.user?.full_name || '—'}</span>;
      },
    },
    {
      key: 'specialization',
      header: 'Specialization',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {row.specialization as string}
        </span>
      ),
    },
    { key: 'license_number', header: 'License No.', render: (row) => <span className="font-mono text-sm">{row.license_number as string}</span> },
    { key: 'phone', header: 'Phone' },
    {
      key: 'available_days',
      header: 'Availability',
      render: (row) => {
        const d = row as unknown as Doctor;
        return (
          <span className="text-sm text-gray-600">
            {d.available_days || '—'}{d.start_time ? ` · ${formatTime(d.start_time)} - ${formatTime(d.end_time || '')}` : ''}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => {
        const d = row as unknown as Doctor;
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => navigate(`/doctors/${row.id as string}`)}>
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button size="sm" variant="danger" onClick={() => handleDeleteClick(d)}>
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  const tableData: Record<string, unknown>[] = (doctors ?? []).map((d) => ({ ...d }));

  return (
    <PageWrapper title="Doctors">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
            <Button variant="primary" onClick={() => setAddModalOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Doctor
            </Button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Search doctors by name, specialization, or license number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {error && (
            <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          {loading && doctors.length === 0 ? (
            <Spinner />
          ) : (
            <Table
              columns={columns}
              data={tableData}
              loading={loading}
              emptyMessage="No doctors found."
            />
          )}
        </div>
      </div>

      <Modal title="Add New Doctor" isOpen={addModalOpen} onClose={() => setAddModalOpen(false)}>
        <div className="space-y-4">
          {addError && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-200">
              {addError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name *" name="full_name" value={addForm.full_name} onChange={handleAddChange} placeholder="Dr. John Doe" />
            <Input label="Email *" name="email" type="email" value={addForm.email} onChange={handleAddChange} placeholder="doctor@hospital.com" />
            <Input label="Password *" name="password" type="password" value={addForm.password} onChange={handleAddChange} placeholder="Min 8 characters" />
            <Input label="Specialization *" name="specialization" value={addForm.specialization} onChange={handleAddChange} placeholder="Cardiology" />
            <Input label="License Number *" name="license_number" value={addForm.license_number} onChange={handleAddChange} placeholder="LIC-12345" />
            <Input label="Phone *" name="phone" value={addForm.phone} onChange={handleAddChange} placeholder="+237 6XX XXX XXX" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    addForm.available_days.includes(day)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Start Time" name="start_time" type="time" value={addForm.start_time} onChange={handleAddChange} />
            <Input label="End Time" name="end_time" type="time" value={addForm.end_time} onChange={handleAddChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={addForm.bio}
              onChange={handleAddChange}
              rows={3}
              className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Short biography..."
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddSubmit} loading={addLoading}>
              <PlusCircle className="w-4 h-4 mr-1" />
              Add Doctor
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Doctor"
      >
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-center text-lg font-semibold text-gray-900 mb-2">Are you sure?</h3>
          <p className="text-center text-sm text-gray-500 mb-2">
            You are about to permanently delete the doctor profile for:
          </p>
          <p className="text-center font-semibold text-gray-900 mb-1">{doctorToDelete?.user?.full_name}</p>
          <p className="text-center text-sm font-mono text-blue-600 mb-4">{doctorToDelete?.license_number}</p>
          <p className="text-center text-xs text-red-500 mb-6">
            ⚠️ This will also delete all their appointments and prescriptions. This action cannot be undone.
          </p>
          {deleteError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {deleteError}
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} loading={deleting}>
              Yes, Delete Doctor
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
};

export default DoctorList;
