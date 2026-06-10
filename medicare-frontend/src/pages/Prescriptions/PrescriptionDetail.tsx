import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPrescriptionById } from '../../api/prescriptionApi';
import { Prescription, PrescriptionItem } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table, { Column } from '../../components/ui/Table';
import Spinner from '../../components/ui/Spinner';
import PageWrapper from '../../components/layout/PageWrapper';
import { formatDate } from '../../utils/formatters';
import { ArrowLeft } from 'lucide-react';

const PrescriptionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // If no ID is present, redirect to the prescriptions list
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
        <div className="text-red-600 mb-4">{error}</div>
        <Button variant="ghost" onClick={() => navigate('/prescriptions')}>Back to list</Button>
      </PageWrapper>
    );
  }

  if (!prescription) {
    return null;
  }

  const columns: Column[] = [
    { key: 'medication', header: 'Medication', render: (row) => <span>{(row as unknown as PrescriptionItem).medication_name}</span> },
    { key: 'dosage', header: 'Dosage', render: (row) => <span>{(row as unknown as PrescriptionItem).dosage}</span> },
    { key: 'instructions', header: 'Instructions', render: (row) => <span>{(row as unknown as PrescriptionItem).instructions}</span> },
    { key: 'quantity', header: 'Qty', render: (row) => <span>{(row as unknown as PrescriptionItem).quantity}</span> },
  ];

  return (
    <PageWrapper title="Prescription Details">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => navigate('/prescriptions')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Prescription {prescription.prescription_number}</h1>
          </div>

          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="font-medium text-gray-700">Patient</p>
                <p>{prescription.patient?.full_name || '—'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Doctor</p>
                <p>{prescription.doctor?.user?.full_name || '—'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Issued At</p>
                <p>{formatDate(prescription.issued_at as string)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Status</p>
                <p>{prescription.status}</p>
              </div>
            </div>

            <h2 className="text-lg font-semibold mb-2">Items</h2>
            {prescription.items && prescription.items.length > 0 ? (
              <Table columns={columns} data={prescription.items as unknown as Record<string, any>[]} loading={false} />
            ) : (
              <p className="text-gray-500">No items found.</p>
            )}
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

export default PrescriptionDetail;
