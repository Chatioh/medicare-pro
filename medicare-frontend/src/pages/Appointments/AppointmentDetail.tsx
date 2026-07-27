import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAppointmentById, updateAppointment, cancelAppointment } from '../../api/appointmentApi';
import { Appointment } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import PageWrapper from '../../components/layout/PageWrapper';
import { formatDate, formatTime } from '../../utils/formatters';
import { ArrowLeft, Calendar, Clock, User, Stethoscope, FileText, PlusCircle, Edit, Trash2 } from 'lucide-react';

const STATUS_OPTIONS = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'];

const AppointmentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchAppointment = async () => {
      setLoading(true);
      try {
        const res = await getAppointmentById(id);
        const a = res?.data?.appointment ?? (res as any)?.appointment;
        setAppointment(a ?? null);
        if (a) {
          setNewStatus(a.status || '');
          setNewNotes(a.notes || '');
        }
      } catch {
        // handled below
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!id || !newStatus) return;
    setSavingStatus(true);
    try {
      await updateAppointment(id, { status: newStatus } as unknown as Record<string, unknown>);
      const res = await getAppointmentById(id);
      const a = res?.data?.appointment ?? (res as any)?.appointment;
      setAppointment(a ?? null);
    } catch {
      // silently fail
    } finally {
      setSavingStatus(false);
    }
  };

  const handleNotesSave = async () => {
    if (!id) return;
    setSavingNotes(true);
    try {
      await updateAppointment(id, { notes: newNotes } as unknown as Record<string, unknown>);
    } catch {
      // silently fail
    } finally {
      setSavingNotes(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    setCancelling(true);
    try {
      await cancelAppointment(id);
      const res = await getAppointmentById(id);
      const a = res?.data?.appointment ?? (res as any)?.appointment;
      setAppointment(a ?? null);
      setShowCancelModal(false);
    } catch {
      setShowCancelModal(false);
    } finally {
      setCancelling(false);
    }
  };

  const showPrescriptionButton = appointment && (appointment.status === 'confirmed' || appointment.status === 'completed');

  if (loading) {
    return (
      <PageWrapper title="Appointment Details">
        <Spinner />
      </PageWrapper>
    );
  }

  if (!appointment) {
    return (
      <PageWrapper title="Appointment Details">
        <div className="p-6">
          <div className="max-w-4xl mx-auto text-center py-12">
            <p className="text-gray-500 mb-4">Appointment not found.</p>
            <Button variant="secondary" onClick={() => navigate('/appointments')}>
              Back to Appointments
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={`Appointment ${appointment.appointment_number}`}>
      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <button
            onClick={() => navigate('/appointments')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Appointments
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-mono text-lg text-blue-600 dark:text-blue-400 font-bold">{appointment.appointment_number}</span>
              <Badge status={appointment.status} />
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 capitalize">
                {appointment.type.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => navigate(`/appointments/${id}/edit`)}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              {appointment.status !== 'cancelled' && (
                <Button size="sm" variant="ghost" onClick={() => setShowCancelModal(true)}>
                  <Trash2 className="w-4 h-4 mr-1 text-red-500 dark:text-red-400" />
                  <span className="text-red-500 dark:text-red-400">Cancel</span>
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Appointment Details">
              <div className="space-y-0">
                <div className="flex justify-between py-2.5 border-b border-gray-50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Patient</span>
                  </div>
                  <button
                    onClick={() => navigate(`/patients/${appointment.patient_id}`)}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    {appointment.patient?.full_name || '—'} ({appointment.patient?.patient_number || ''})
                  </button>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Doctor</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {appointment.doctor?.user?.full_name || '—'} ({appointment.doctor?.specialization || ''})
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Date</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(appointment.appointment_date)}</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Time</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatTime(appointment.start_time)} — {formatTime(appointment.end_time)}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {appointment.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Reason</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{appointment.reason || '—'}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <Edit className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Notes</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{appointment.notes || 'No notes added'}</span>
                </div>
              </div>
            </Card>

            <Card title="Actions">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Update Status</label>
                  <div className="flex gap-2">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="flex-1 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select status</option>
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                    <Button size="sm" onClick={handleStatusUpdate} loading={savingStatus} disabled={!newStatus}>
                      Update
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Notes</label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    rows={3}
                    className="block w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    placeholder="Add appointment notes..."
                  />
                  <Button size="sm" variant="secondary" onClick={handleNotesSave} loading={savingNotes}>
                    Save Notes
                  </Button>
                </div>

                {showPrescriptionButton && (
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Button
                      variant="primary"
                      onClick={() =>
                        navigate(
                          `/prescriptions/new?appointment_id=${appointment.id}&patient_id=${appointment.patient_id}&doctor_id=${appointment.doctor_id}`
                        )
                      }
                    >
                      <PlusCircle className="w-4 h-4 mr-1" />
                      Issue Prescription
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
          <Modal
            title="Cancel Appointment"
            isOpen={showCancelModal}
            onClose={() => setShowCancelModal(false)}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to cancel appointment{' '}
                <span className="font-semibold">{appointment.appointment_number}</span>?
              </p>
              <p className="text-xs text-gray-500">This action cannot be undone.</p>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
                  Keep
                </Button>
                <Button variant="danger" onClick={handleCancel} loading={cancelling}>
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

export default AppointmentDetail;
