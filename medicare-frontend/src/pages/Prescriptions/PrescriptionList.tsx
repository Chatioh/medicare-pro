import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPrescriptions, dispensePrescription, cancelPrescription } from '../../api/prescriptionApi';
import { Prescription } from '../../types';
import Button from '../../components/ui/Button';
import Table, { Column } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import PageWrapper from '../../components/layout/PageWrapper';
import Modal from '../../components/ui/Modal';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { PlusCircle, Eye, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const STATUSES = ['', 'issued', 'dispensed', 'expired', 'cancelled'];

const PrescriptionList = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [prescriptionToCancel, setPrescriptionToCancel] = useState<Prescription | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = {};
      if (statusFilter) params.status = statusFilter;
      const res = await getPrescriptions(params);

      let rows = [];
      if ((res?.data as any)?.prescriptions) {
        rows = (res.data as any).prescriptions;
      } else if (res?.data?.rows) {
        rows = res.data.rows;
      } else if ((res as any)?.rows) {
        rows = (res as any).rows;
      } else if (Array.isArray(res?.data)) {
        rows = res.data;
      } else if (Array.isArray(res)) {
        rows = res;
      }
      setPrescriptions(rows);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load prescriptions');
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const handleDispense = async (id: string) => {
    try {
      await dispensePrescription(id);
      fetchPrescriptions();
    } catch {
      // silently fail
    }
  };

  const handleCancelClick = (prescription: Prescription) => {
    setPrescriptionToCancel(prescription);
    setCancelModalOpen(true);
    setCancelError(null);
  };

  const handleCancelConfirm = async () => {
    if (!prescriptionToCancel) return;
    setCancelling(true);
    try {
      await cancelPrescription(prescriptionToCancel.id);
      setCancelModalOpen(false);
      setPrescriptionToCancel(null);
      fetchPrescriptions();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 400) {
        setCancelError(err?.response?.data?.message ?? 'Cannot cancel this prescription');
      } else {
        setCancelError('Failed to cancel prescription. Please try again.');
      }
    } finally {
      setCancelling(false);
    }
  };

  const columns: Column[] = [
    {
      key: 'prescription_number',
      header: 'Prescription No.',
      render: (row) => <span className="font-mono text-sm text-blue-600">{row.prescription_number as string}</span>,
    },
    {
      key: 'patient',
      header: 'Patient',
      render: (row) => {
        const p = row as unknown as Prescription;
        return <span className="font-medium text-gray-900">{p.patient?.full_name || '—'}</span>;
      },
    },
    {
      key: 'doctor',
      header: 'Doctor',
      render: (row) => {
        const p = row as unknown as Prescription;
        return <span>{p.doctor?.user?.full_name || p.doctor?.user?.email || '—'}</span>;
      },
    },
    {
      key: 'diagnosis',
      header: 'Diagnosis',
      render: (row) => <span className="max-w-[150px] truncate block">{row.diagnosis as string}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge status={row.status as string} />,
    },
    {
      key: 'issued_at',
      header: 'Issued Date',
      render: (row) => <span>{formatDate(row.issued_at as string)}</span>,
    },
    {
      key: 'expires_at',
      header: 'Expires',
      render: (row) => <span>{row.expires_at ? formatDate(row.expires_at as string) : '—'}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => navigate(`/prescriptions/${row.id as string}`)}>
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          {(row.status as string) === 'issued' && hasRole('admin', 'nurse') && (
            <Button size="sm" variant="success" onClick={() => handleDispense(row.id as string)}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Dispense
            </Button>
          )}
          {(row.status as string) === 'issued' && hasRole('admin', 'doctor') && (
            <Button size="sm" variant="danger" onClick={() => handleCancelClick(row as unknown as Prescription)}>
              <XCircle className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  const tableData: Record<string, unknown>[] = (prescriptions ?? []).map((p) => ({ ...p }));

  return (
    <PageWrapper title="Prescriptions">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
            {hasRole('admin', 'doctor') && (
              <Button variant="primary" onClick={() => navigate('/prescriptions/new')}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Issue Prescription
              </Button>
            )}
          </div>

          <div className="flex gap-3 flex-wrap mb-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === '' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          {loading && prescriptions.length === 0 ? (
            <Spinner />
          ) : (
            <Table
              columns={columns}
              data={tableData}
              loading={loading}
              emptyMessage="No prescriptions found."
            />
          )}
        </div>
      </div>

      <Modal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Cancel Prescription">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-center text-lg font-semibold text-gray-900 mb-2">
            Cancel Prescription?
          </h3>
          <p className="text-center text-sm text-gray-500 mb-2">
            You are about to cancel prescription:
          </p>
          <p className="text-center font-mono font-semibold text-blue-600 mb-1">
            {prescriptionToCancel?.prescription_number}
          </p>
          <p className="text-center text-sm text-gray-700 mb-4">
            Patient: <span className="font-medium">{prescriptionToCancel?.patient?.full_name}</span>
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-amber-700 text-center">
              ⚠️ This action cannot be undone. The prescription will be permanently marked as cancelled.
              If needed, a new prescription must be issued.
            </p>
          </div>
          {cancelError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center">
              {cancelError}
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={() => setCancelModalOpen(false)}
              disabled={cancelling}
            >
              Keep Prescription
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelConfirm}
              loading={cancelling}
            >
              Yes, Cancel Prescription
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
};

export default PrescriptionList;
