import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients, deletePatient } from '../../api/patientApi';
import { Patient } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Table, { Column } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import PageWrapper from '../../components/layout/PageWrapper';
import { calculateAge, formatDate } from '../../utils/formatters';
import { Search, PlusCircle, Eye, Pencil, Trash2, AlertTriangle } from 'lucide-react';

const PatientList = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPatients({ search: debouncedSearch, page, limit });

      let rows = [];
      let count = 0;
      if ((res?.data as any)?.patients) {
        rows = (res.data as any).patients;
        count = (res.data as any).total;
      } else if (res?.data?.rows) {
        rows = res.data.rows;
        count = res.data.count;
      } else if ((res as any)?.rows) {
        rows = (res as any).rows;
        count = (res as any).count;
      } else if (Array.isArray(res?.data)) {
        rows = res.data;
        count = res.data.length;
      } else if (Array.isArray(res)) {
        rows = res;
        count = res.length;
      }
      setPatients(rows);
      setTotal(count);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load patients');
      setPatients([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteModalOpen(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return;
    setDeleting(true);
    try {
      await deletePatient(patientToDelete.id);
      setDeleteModalOpen(false);
      setPatientToDelete(null);
      fetchPatients();
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message ?? 'Failed to delete patient');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const genderBadge = (gender: string) => {
    const colorMap: Record<string, string> = {
      male: 'bg-blue-100 text-blue-700',
      female: 'bg-pink-100 text-pink-700',
      other: 'bg-gray-100 text-gray-600',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[gender] || 'bg-gray-100 text-gray-600'}`}>
        {gender.charAt(0).toUpperCase() + gender.slice(1)}
      </span>
    );
  };

  const columns: Column[] = [
    {
      key: 'patient_number',
      header: 'Patient No.',
      render: (row) => <span className="font-mono text-sm text-blue-600">{row.patient_number as string}</span>,
    },
    {
      key: 'full_name',
      header: 'Full Name',
      render: (row) => (
        <div>
          <span className="font-medium text-gray-900">{row.full_name as string}</span>
          <div className="text-xs text-gray-400">{formatDate((row as any).createdAt)}</div>
        </div>
      ),
    },
    {
      key: 'gender',
      header: 'Gender',
      render: (row) => genderBadge(row.gender as string),
    },
    { key: 'phone', header: 'Phone' },
    {
      key: 'blood_group',
      header: 'Blood Group',
      render: (row) => <span className="font-medium">{row.blood_group ? (row.blood_group as string) : '—'}</span>,
    },
    {
      key: 'date_of_birth',
      header: 'Age',
      render: (row) => <span>{calculateAge(row.date_of_birth as string)} years</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => {
        const p = row as unknown as Patient;
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => navigate(`/patients/${row.id as string}`)}>
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button size="sm" variant="secondary" onClick={() => navigate(`/patients/${row.id as string}/edit`)}>
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
            {hasRole('admin') && (
              <Button size="sm" variant="danger" onClick={() => handleDeleteClick(p)}>
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const tableData: Record<string, unknown>[] = patients.map((p) => ({ ...p }));

  return (
    <PageWrapper title="Patients">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
            {hasRole('admin', 'receptionist') && (
              <Button variant="primary" onClick={() => navigate('/patients/new')}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Register Patient
              </Button>
            )}
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Search by name, phone or patient number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {!loading && total > 0 && (
            <p className="text-sm text-gray-500 mb-4">
              Showing {Math.min(page * limit, total)} of {total} patients
            </p>
          )}

          {error && (
            <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          {loading && patients.length === 0 ? (
            <Spinner />
          ) : (
            <Table
              columns={columns}
              data={tableData}
              loading={loading}
              emptyMessage="No patients found. Try adjusting your search or register a new patient."
            />
          )}

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Patient"
      >
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-center text-lg font-semibold text-gray-900 mb-2">Are you sure?</h3>
          <p className="text-center text-sm text-gray-500 mb-2">
            You are about to permanently delete the patient record for:
          </p>
          <p className="text-center font-semibold text-gray-900 mb-1">{patientToDelete?.full_name}</p>
          <p className="text-center text-sm font-mono text-blue-600 mb-4">{patientToDelete?.patient_number}</p>
          <p className="text-center text-xs text-red-500 mb-6">
            ⚠️ This will also delete all their appointments, prescriptions and medical history. This action cannot be undone.
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
              Yes, Delete Patient
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
};

export default PatientList;
