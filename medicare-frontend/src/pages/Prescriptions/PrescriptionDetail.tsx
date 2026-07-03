import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { getPrescriptionById } from '../../api/prescriptionApi';
import { Prescription, PrescriptionItem } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table, { Column } from '../../components/ui/Table';
import Spinner from '../../components/ui/Spinner';
import PageWrapper from '../../components/layout/PageWrapper';
import PrescriptionPrintView from '../../components/ui/PrescriptionPrintView';
import { formatDate } from '../../utils/formatters';
import {
  ArrowLeft,
  User,
  Stethoscope,
  Calendar,
  FileText,
  Pill,
  AlertCircle,
  Printer,
  Download,
} from 'lucide-react';

/* ── Print portal helpers ─────────────────────────────────────────
   We use a lightweight portal trick:
   1. Mount <PrescriptionPrintView> into a dedicated #prescription-print-portal div
      appended to <body>.
   2. Call window.print() — the @media print CSS in index.css hides everything EXCEPT
      that portal div, producing a clean A4 document.
   3. Remove the portal div after the print dialog closes.
──────────────────────────────────────────────────────────────────── */
const PORTAL_ID = 'prescription-print-portal';

function mountPrintPortal(prescription: Prescription): HTMLDivElement {
  let portal = document.getElementById(PORTAL_ID) as HTMLDivElement | null;
  if (!portal) {
    portal = document.createElement('div');
    portal.id = PORTAL_ID;
    document.body.appendChild(portal);
  }
  // Inline styles so it sits off-screen before print dialog opens
  portal.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;background:white;z-index:9999;overflow:auto;display:none;';
  ReactDOM.render(<PrescriptionPrintView prescription={prescription} />, portal);
  return portal;
}

function unmountPrintPortal() {
  const portal = document.getElementById(PORTAL_ID);
  if (portal) {
    ReactDOM.unmountComponentAtNode(portal);
    portal.remove();
  }
}

/* ── Component ────────────────────────────────────────────────── */
const PrescriptionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);
  const printingRef = useRef(false);

  useEffect(() => {
    if (!id) {
      navigate('/prescriptions');
    }
  }, [id, navigate]);

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

  // Cleanup portal on unmount
  useEffect(() => {
    return () => {
      unmountPrintPortal();
    };
  }, []);

  /* ── Print / PDF handler ────────────────────────────────────── */
  const handlePrint = () => {
    if (!prescription || printingRef.current) return;
    printingRef.current = true;
    setPrinting(true);

    const originalTitle = document.title;
    document.title = `Prescription-${prescription.prescription_number}-${new Date().getTime()}`;

    mountPrintPortal(prescription);

    // Brief delay for React to render into the portal before print dialog
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();

        // Clean up after dialog closes (afterprint fires when user dismisses)
        const cleanup = () => {
          document.title = originalTitle;
          unmountPrintPortal();
          printingRef.current = false;
          setPrinting(false);
          window.removeEventListener('afterprint', cleanup);
        };
        window.addEventListener('afterprint', cleanup);

        // Fallback cleanup if afterprint never fires (some browsers)
        setTimeout(() => {
          if (printingRef.current) cleanup();
        }, 3000);
      });
    });
  };

  /* ── Loading / error states ─────────────────────────────────── */
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

  /* ── Medication table columns ─────────────────────────────── */
  const columns: Column[] = [
    {
      key: 'medication_name',
      header: 'Medication',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {(row as unknown as PrescriptionItem).medication_name}
          </span>
        </div>
      ),
    },
    {
      key: 'dosage',
      header: 'Dosage',
      render: (row) => (
        <span className="font-medium text-blue-600 dark:text-blue-400">
          {(row as unknown as PrescriptionItem).dosage}
        </span>
      ),
    },
    {
      key: 'frequency',
      header: 'Frequency',
      render: (row) => <span>{(row as unknown as PrescriptionItem).frequency}</span>,
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (row) => <span>{(row as unknown as PrescriptionItem).duration}</span>,
    },
    {
      key: 'quantity',
      header: 'Qty',
      render: (row) => (
        <span className="font-semibold">{(row as unknown as PrescriptionItem).quantity}</span>
      ),
    },
    {
      key: 'instructions',
      header: 'Instructions',
      render: (row) => {
        const instr = (row as unknown as PrescriptionItem).instructions;
        return (
          <span className={instr ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500 italic'}>{instr || '—'}</span>
        );
      },
    },
  ];

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <PageWrapper title={`Prescription ${prescription.prescription_number}`}>
      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Back nav */}
          <button
            onClick={() => navigate('/prescriptions')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Prescriptions
          </button>

          {/* ── Header action bar ─────────────────────────────── */}
          <div className="flex items-center justify-between gap-4 p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-lg text-blue-600 dark:text-blue-400 font-bold truncate">
                {prescription.prescription_number}
              </span>
              <Badge status={prescription.status} />
            </div>

            {/* Print / Export PDF buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Print — opens the browser print dialog */}
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrint}
                loading={printing}
                disabled={printing}
                title="Print prescription"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                Print
              </Button>

              {/* Export PDF — same action; browsers save-as-PDF from the print dialog */}
              <Button
                variant="primary"
                size="sm"
                onClick={handlePrint}
                loading={printing}
                disabled={printing}
                title="Save as PDF — choose 'Save as PDF' in the print dialog"
              >
                <Download className="w-4 h-4 mr-1.5" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* ── Info cards ────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Prescription Information">
              <div className="space-y-0">
                <div className="flex justify-between py-2.5 border-b border-gray-50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Patient</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {prescription.patient?.full_name || '—'}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Doctor</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {prescription.doctor?.user?.full_name || '—'}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">License No.</span>
                  </div>
                  <span className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">
                    {prescription.doctor?.license_number || '—'}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Issued At</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(prescription.issued_at as string)}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Expires At</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {prescription.expires_at ? formatDate(prescription.expires_at) : 'No expiry'}
                  </span>
                </div>
                <div className="flex justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Diagnosis</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right max-w-[200px]">
                    {prescription.diagnosis}
                  </span>
                </div>
              </div>
            </Card>

            <Card title="Additional Notes">
              <div className="space-y-0">
                <div className="flex justify-between py-2.5 border-b border-gray-50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                  </div>
                  <Badge status={prescription.status} />
                </div>
                <div className="py-2.5">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                    Notes
                  </span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {prescription.notes?.trim() ? (
                      prescription.notes
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 italic">No notes added</span>
                    )}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* ── Medications ───────────────────────────────────── */}
          <Card title={`Medications (${prescription.items?.length ?? 0})`}>
            {prescription.items && prescription.items.length > 0 ? (
              <Table
                columns={columns}
                data={prescription.items as unknown as Record<string, any>[]}
                loading={false}
              />
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
