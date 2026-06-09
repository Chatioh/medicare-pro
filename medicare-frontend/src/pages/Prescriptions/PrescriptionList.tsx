import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPrescriptions, dispensePrescription } from '../../api/prescriptionApi';
import { Prescription } from '../../types';
import Button from '../../components/ui/Button';
import Table, { Column } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import PageWrapper from '../../components/layout/PageWrapper';
import { formatDate } from '../../utils/formatters';
import { PlusCircle, Eye, CheckCircle } from 'lucide-react';

const STATUSES = ['', 'issued', 'dispensed', 'expired', 'cancelled'];

const PrescriptionList = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

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
          {(row.status as string) === 'issued' && (
            <Button size="sm" variant="success" onClick={() => handleDispense(row.id as string)}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Dispense
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
            <Button variant="primary" onClick={() => navigate('/prescriptions/new')}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Issue Prescription
            </Button>
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
    </PageWrapper>
  );
};

export default PrescriptionList;
