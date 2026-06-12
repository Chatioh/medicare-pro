import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPrescriptionById } from '../../api/prescriptionApi';
import { Prescription, PrescriptionItem } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table, { Column } from '../../components/ui/Table';
import Spinner from '../../components/ui/Spinner';
import PageWrapper from '../../components/layout/PageWrapper';
import { formatDate } from '../../utils/formatters';
import { ArrowLeft, User, Stethoscope, Calendar, FileText, Pill, AlertCircle } from 'lucide-react';

const PrescriptionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    navigate('/prescriptions');
    return null;
  }

  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      try {
        const res = await getPrescriptionById(id);
        const prescriptionData = res?.data?.prescription;
        setPrescription(prescriptionData);
      } catch (err: any) {
        setError(err?.response?.data?.message ?? 'Failed to load prescription');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <PageWrapper title="Prescription Details">
        <Spinner />
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper title="Prescription Details">
        <div className="p-6">
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="text-red-600 mb-4">{error}</div>
            <Button variant="secondary" onClick={() => navigate('/prescriptions')}>
              Back to Prescriptions
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!prescription) {
    return (
      <PageWrapper title="Prescription Details">
        <div className="p-6">
          <div className="max-w-4xl mx-auto text-center py-12">
            <p className="text-gray-500 mb-4">Prescription not found.</p>
            <Button variant="secondary" onClick={() => navigate('/prescriptions')}>
              Back to Prescriptions
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const columns: Column[] = [
    {
      key: 'medication_name',
      header: 'Medication',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="font-medium text-gray-900">{(row as unknown as PrescriptionItem).medication_name}</span>
        </div>
      ),
    },
    { key: 'dosage', header: 'Dosage', render: (row) => <span className="font-medium">{(row as unknown as PrescriptionItem).dosage}</span> },
    { key: 'frequency', header: 'Frequency', render: (row) => <span>{(row as unknown as PrescriptionItem).frequency}</span> },
    { key: 'duration', header: 'Duration', render: (row) => <span>{(row as unknown as PrescriptionItem).duration}</span> },
    { key: 'quantity', header: 'Qty', render: (row) => <span>{(row as unknown as PrescriptionItem).quantity}</span> },
    {
      key: 'instructions',
      header: 'Instructions',
      render: (row) => {
        const instr = (row as unknown as PrescriptionItem).instructions;
        return <span className="text-gray-500">{instr || '—'}</span>;
      },
    },
  ];

  return (
    <PageWrapper title={`Prescription ${prescription.prescription_number}`}>
      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <button
            onClick={() => navigate('/prescriptions')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Prescriptions
          </button>

          <div className="flex items-center justify-between gap-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <span className="font-mono text-lg text-blue-600 font-bold">{prescription.prescription_number}</span>
              <Badge status={prescription.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Prescription Information">
              <div className="space-y-0">
                <div className="flex justify-between py-2.5 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Patient</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {prescription.patient?.full_name || '—'}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Doctor</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {prescription.doctor?.user?.full_name || '—'}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Issued At</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(prescription.issued_at as string)}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Expires At</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {prescription.expires_at ? formatDate(prescription.expires_at) : 'No expiry'}
                  </span>
                </div>
                <div className="flex justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Diagnosis</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 text-right max-w-[200px]">
                    {prescription.diagnosis}
                  </span>
                </div>
              </div>
            </Card>

            <Card title="Additional Notes">
              <div className="space-y-0">
                <div className="flex justify-between py-2.5 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Status</span>
                  </div>
                  <Badge status={prescription.status} />
                </div>
                <div className="py-2.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Notes</span>
                  <p className="text-sm text-gray-700">
                    {prescription.notes?.trim() ? prescription.notes : <span className="text-gray-400 italic">No notes added</span>}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card title="Medications">
            {prescription.items && prescription.items.length > 0 ? (
              <Table columns={columns} data={prescription.items as unknown as Record<string, any>[]} loading={false} />
            ) : (
              <p className="text-gray-400 text-sm py-4 text-center">No medication items found.</p>
            )}
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

export default PrescriptionDetail;
