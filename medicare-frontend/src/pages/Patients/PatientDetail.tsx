import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { getPatientById, getMedicalHistory, updateMedicalHistory } from '../../api/patientApi';
import { getAppointments } from '../../api/appointmentApi';
import { getPrescriptions } from '../../api/prescriptionApi';
import { Patient, MedicalHistory, Appointment, Prescription } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Table, { Column } from '../../components/ui/Table';
import PageWrapper from '../../components/layout/PageWrapper';
import PatientReportPrintView from '../../components/ui/PatientReportPrintView';
import { formatDate, formatTime, calculateAge } from '../../utils/formatters';
import { ArrowLeft, Edit, Calendar, Phone, Mail, MapPin, User, Heart, AlertCircle, Pill, Printer, Download } from 'lucide-react';

/* ── Print portal helpers ───────────────────────────────────────── */
const PORTAL_ID = 'prescription-print-portal';

function mountPrintPortal(
  patient: Patient,
  history: MedicalHistory | null,
  appointments: Appointment[],
  prescriptions: Prescription[]
): HTMLDivElement {
  let portal = document.getElementById(PORTAL_ID) as HTMLDivElement | null;
  if (!portal) {
    portal = document.createElement('div');
    portal.id = PORTAL_ID;
    document.body.appendChild(portal);
  }
  portal.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;background:white;z-index:9999;overflow:auto;display:none;';
  ReactDOM.render(
    <PatientReportPrintView
      patient={patient}
      history={history}
      appointments={appointments}
      prescriptions={prescriptions}
    />,
    portal
  );
  return portal;
}

function unmountPrintPortal() {
  const portal = document.getElementById(PORTAL_ID);
  if (portal) {
    ReactDOM.unmountComponentAtNode(portal);
    portal.remove();
  }
}


const historyFields: { label: string; key: keyof MedicalHistory }[] = [
  { label: 'Chronic Conditions', key: 'chronic_conditions' },
  { label: 'Allergies', key: 'allergies' },
  { label: 'Past Surgeries', key: 'past_surgeries' },
  { label: 'Current Medications', key: 'current_medications' },
  { label: 'Family History', key: 'family_history' },
  { label: 'Notes', key: 'notes' },
];

const PatientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<MedicalHistory | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyForm, setHistoryForm] = useState({
    chronic_conditions: '',
    allergies: '',
    past_surgeries: '',
    current_medications: '',
    family_history: '',
    notes: '',
  });
  const [savingHistory, setSavingHistory] = useState(false);
  const [printing, setPrinting] = useState(false);
  const printingRef = useRef(false);

  // Cleanup portal on unmount
  useEffect(() => {
    return () => {
      unmountPrintPortal();
    };
  }, []);

  const handlePrint = () => {
    if (!patient || printingRef.current) return;
    printingRef.current = true;
    setPrinting(true);

    const originalTitle = document.title;
    document.title = `Medical-Report-${patient.patient_number}-${new Date().getTime()}`;

    mountPrintPortal(patient, history, appointments, prescriptions);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();

        const cleanup = () => {
          document.title = originalTitle;
          unmountPrintPortal();
          printingRef.current = false;
          setPrinting(false);
          window.removeEventListener('afterprint', cleanup);
        };
        window.addEventListener('afterprint', cleanup);

        setTimeout(() => {
          if (printingRef.current) cleanup();
        }, 3000);
      });
    });
  };


  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [patientRes, historyRes, appointmentsRes, prescriptionsRes] = await Promise.all([
          getPatientById(id),
          getMedicalHistory(id).catch(() => null),
          getAppointments({ patient_id: id }),
          getPrescriptions({ patient_id: id }).catch(() => null),
        ]);
        const patient = patientRes?.data?.patient ?? (patientRes as any)?.patient;
        setPatient(patient ?? null);
        const history = historyRes?.data?.medicalHistory ?? (historyRes as any)?.medicalHistory ?? historyRes;
        if (history) {
          setHistory(history);
          setHistoryForm({
            chronic_conditions: history.chronic_conditions || '',
            allergies: history.allergies || '', 
            past_surgeries: history.past_surgeries || '',
            current_medications: history.current_medications || '',
            family_history: history.family_history || '',
            notes: history.notes || '',
          });
        }
        const appts = (appointmentsRes?.data as any)?.appointments ?? appointmentsRes?.data?.rows ?? appointmentsRes?.data ?? appointmentsRes ?? [];
        setAppointments(Array.isArray(appts) ? appts : []);

        let rxList = [];
        if (prescriptionsRes) {
          if ((prescriptionsRes?.data as any)?.prescriptions) {
            rxList = (prescriptionsRes.data as any).prescriptions;
          } else if (prescriptionsRes?.data?.rows) {
            rxList = prescriptionsRes.data.rows;
          } else if ((prescriptionsRes as any)?.rows) {
            rxList = (prescriptionsRes as any).rows;
          } else if (Array.isArray(prescriptionsRes?.data)) {
            rxList = prescriptionsRes.data;
          } else if (Array.isArray(prescriptionsRes)) {
            rxList = prescriptionsRes;
          }
        }
        setPrescriptions(rxList);
      } catch {
        // handled below via patient check
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const openHistoryModal = () => {
    if (history) {
      setHistoryForm({
        chronic_conditions: history.chronic_conditions || '',
        allergies: history.allergies || '',
        past_surgeries: history.past_surgeries || '',
        current_medications: history.current_medications || '',
        family_history: history.family_history || '',
        notes: history.notes || '',
      });
    }
    setHistoryModalOpen(true);
  };

  const handleHistoryChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHistoryForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleHistorySave = async () => {
    if (!id) return;
    setSavingHistory(true);
    try {
      await updateMedicalHistory(id, historyForm);
      const res = await getMedicalHistory(id);
      setHistory(res.data.medicalHistory);
      setHistoryModalOpen(false);
    } catch {
      // silently fail
    } finally {
      setSavingHistory(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Patient Profile">
        <Spinner />
      </PageWrapper>
    );
  }

  if (!patient) {
    return (
      <PageWrapper title="Patient Profile">
        <div className="p-6">
          <div className="max-w-4xl mx-auto text-center py-12">
            <p className="text-gray-500 mb-4">Patient not found.</p>
            <Button variant="secondary" onClick={() => navigate('/patients')}>
              Back to Patients
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const initials = patient.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const genderBadgeColor =
    patient.gender === 'male'
      ? 'bg-blue-100 text-blue-700'
      : patient.gender === 'female'
        ? 'bg-pink-100 text-pink-700'
        : 'bg-gray-100 text-gray-600';

  const appointmentColumns: Column[] = [
    {
      key: 'appointment_date',
      header: 'Date',
      render: (row) => <span>{formatDate(row.appointment_date as string)}</span>,
    },
    {
      key: 'start_time',
      header: 'Time',
      render: (row) => {
        const a = row as unknown as Appointment;
        return <span>{formatTime(a.start_time)} - {formatTime(a.end_time)}</span>;
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
    <PageWrapper title={patient.full_name}>
      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <button
            onClick={() => navigate('/patients')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Patients
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-gray-900">{patient.full_name}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${genderBadgeColor}`}>
                    {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
                  </span>
                  {patient.blood_group && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      {patient.blood_group}
                    </span>
                  )}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {calculateAge(patient.date_of_birth)} years
                  </span>
                </div>
                <p className="text-sm text-gray-500 font-mono">{patient.patient_number}</p>
                <p className="text-sm text-gray-400">Registered on {formatDate((patient as any).createdAt)}</p>
              </div>
            </div>

            {/* Export / Print Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0 self-start md:self-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrint}
                loading={printing}
                disabled={printing}
                title="Print medical report"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                Print Report
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePrint}
                loading={printing}
                disabled={printing}
                title="Save report as PDF"
              >
                <Download className="w-4 h-4 mr-1.5" />
                Export PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Patient Information">
              <div className="space-y-0">
                <div className="flex justify-between py-2.5 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Date of Birth</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(patient.date_of_birth)} ({calculateAge(patient.date_of_birth)} years)
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Gender</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 capitalize">{patient.gender}</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Phone</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{patient.phone}</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Email</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{patient.email || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Address</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{patient.address || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Blood Group</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{patient.blood_group || 'Not recorded'}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Emergency Contact</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {patient.emergency_contact_name
                      ? `${patient.emergency_contact_name} · ${patient.emergency_contact_phone || ''}`
                      : 'Not provided'}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button variant="secondary" onClick={() => navigate(`/patients/${patient.id}/edit`)} className="w-full">
                  Edit Patient
                </Button>
              </div>
            </Card>

            <Card title="Medical History">
              <div className="flex items-center justify-between mb-3">
                <div />
                <Button size="sm" variant="secondary" onClick={openHistoryModal}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit History
                </Button>
              </div>
              <div className="space-y-0">
                {historyFields.map(({ label, key }) => {
                  const value = (history as Record<string, string | undefined> | null)?.[key];
                  return (
                    <div key={key} className="border-b border-gray-100 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
                      <p className="text-sm text-gray-700 mt-1">
                        {value?.trim() ? value : <span className="text-gray-400 italic">None recorded</span>}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <Card title="Appointment History">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => navigate(`/prescriptions/new?patient_id=${patient.id}`)}>
                  <Pill className="w-4 h-4 mr-1" />
                  Issue Prescription
                </Button>
              </div>
              <Button size="sm" variant="primary" onClick={() => navigate(`/appointments/new?patient_id=${patient.id}`)}>
                <Calendar className="w-4 h-4 mr-1" />
                Book Appointment
              </Button>
            </div>
            <Table
              columns={appointmentColumns}
              data={appointmentData}
              emptyMessage="No appointments yet"
            />
          </Card>

          <Modal title="Edit Medical History" isOpen={historyModalOpen} onClose={() => setHistoryModalOpen(false)}>
            {/* Scrollable fields */}
            <div className="space-y-4">
              {historyFields.map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <textarea
                    name={key}
                    value={historyForm[key as keyof typeof historyForm]}
                    onChange={handleHistoryChange}
                    rows={3}
                    className="block w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                </div>
              ))}
              {/* Sticky action row pinned to the bottom of the scrollable area */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 sticky bottom-0 bg-white pb-1">
                <Button variant="secondary" onClick={() => setHistoryModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleHistorySave} loading={savingHistory}>
                  Save
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </PageWrapper>
  );
};

export default PatientDetail;
