import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAppointments, cancelAppointment } from '../../api/appointmentApi';
import { Appointment } from '../../types';
import Button from '../../components/ui/Button';
import Table, { Column } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import PageWrapper from '../../components/layout/PageWrapper';
import { formatDate, formatTime } from '../../utils/formatters';
import { PlusCircle, Eye, Edit, X, Trash2 } from 'lucide-react';

const STATUSES = ['', 'scheduled', 'confirmed', 'completed', 'cancelled'];

const AppointmentList = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', date: '', doctor_id: '' });
  const [page, setPage] = useState(1);
  const limit = 20;
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { page, limit };
      if (filters.status) params.status = filters.status;
      if (filters.date) params.date = filters.date;
      const res = await getAppointments(params);

      let rows = [];
      let count = 0;
      if ((res?.data as any)?.appointments) {
        rows = (res.data as any).appointments;
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
      setAppointments(rows);
      setTotal(count);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load appointments');
      setAppointments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ status: '', date: '', doctor_id: '' });
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await cancelAppointment(deleteTarget.id);
      setDeleteTarget(null);
      fetchAppointments();
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const columns: Column[] = [
    {
      key: 'appointment_number',
      header: 'Appointment No.',
      render: (row) => <span className="font-mono text-sm text-blue-600">{row.appointment_number as string}</span>,
    },
    {
      key: 'patient',
      header: 'Patient',
      render: (row) => {
        const a = row as unknown as Appointment;
        return <span className="font-medium text-gray-900">{a.patient?.full_name || '—'}</span>;
      },
    },
    {
      key: 'doctor',
      header: 'Doctor',
      render: (row) => {
        const a = row as unknown as Appointment;
        return <span>{a.doctor?.user?.full_name || a.doctor?.user?.email || '—'}</span>;
      },
    },
    {
      key: 'appointment_date',
      header: 'Date',
      render: (row) => <span>{formatDate(row.appointment_date as string)}</span>,
    },
    {
      key: 'start_time',
      header: 'Time',
      render: (row) => <span>{formatTime(row.start_time as string)}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => <span className="capitalize">{(row.type as string).replace(/_/g, ' ')}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge status={row.status as string} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => {
        const a = row as unknown as Appointment;
        return (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => navigate(`/appointments/${a.id}`)}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => navigate(`/appointments/${a.id}/edit`)}>
              <Edit className="w-4 h-4" />
            </Button>
            {a.status !== 'cancelled' && (
              <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(a)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const tableData: Record<string, unknown>[] = (appointments ?? []).map((a) => ({ ...a }));

  return (
    <PageWrapper title="Appointments">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <Button variant="primary" onClick={() => navigate('/appointments/new')}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </div>

          <div className="flex gap-3 flex-wrap mb-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                {STATUSES.filter(Boolean).map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear Filters
            </Button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          {!loading && total > 0 && (
            <p className="text-sm text-gray-500 mb-4">
              Showing {Math.min(page * limit, total)} of {total} appointments
            </p>
          )}

          {loading && appointments.length === 0 ? (
            <Spinner />
          ) : (
            <Table
              columns={columns}
              data={tableData}
              loading={loading}
              emptyMessage="No appointments found."
            />
          )}

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
          <Modal
            title="Cancel Appointment"
            isOpen={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to cancel this appointment{' '}
                <span className="font-semibold">{deleteTarget?.appointment_number}</span>?
              </p>
              <p className="text-xs text-gray-500">This will mark the appointment as cancelled.</p>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                  Keep
                </Button>
                <Button variant="danger" onClick={handleDelete} loading={deleting}>
                  Cancel Appointment
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AppointmentList;
