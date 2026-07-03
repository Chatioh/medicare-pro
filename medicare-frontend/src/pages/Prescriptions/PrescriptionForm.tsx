import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPrescription } from '../../api/prescriptionApi';
import { getPatients } from '../../api/patientApi';
import { getDoctors } from '../../api/doctorApi';
import { Patient, Doctor } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import PageWrapper from '../../components/layout/PageWrapper';
import { ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';

interface PrescriptionItemForm {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
}

const PrescriptionForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prePatientId = searchParams.get('patient_id') || '';
  const preDoctorId = searchParams.get('doctor_id') || '';
  const preAppointmentId = searchParams.get('appointment_id') || '';

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    patient_id: prePatientId,
    doctor_id: preDoctorId,
    appointment_id: preAppointmentId,
    diagnosis: '',
    expires_at: '',
    notes: '',
  });
  const [items, setItems] = useState<PrescriptionItemForm[]>([
    { medication_name: '', dosage: '', frequency: '', duration: '', quantity: 1, instructions: '' },
  ]);

  useEffect(() => {
    const fetchPatientsList = async () => {
      try {
        const res = await getPatients({});
        const rows = (res?.data as any)?.patients ?? res?.data?.rows ?? res?.data ?? (res as any)?.rows ?? res ?? [];
        setPatients(Array.isArray(rows) ? rows : []);
      } catch {
        setPatients([]);
      }
    };
    const fetchDoctorsList = async () => {
      try {
        const res = await getDoctors({});
        const rows = (res?.data as any)?.doctors ?? res?.data?.rows ?? res?.data ?? (res as any)?.rows ?? res ?? [];
        setDoctors(Array.isArray(rows) ? rows : []);
      } catch {
        setDoctors([]);
      }
    };
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchPatientsList(), fetchDoctorsList()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: keyof PrescriptionItemForm, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev];
      (updated[index] as any)[field] = value;
      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { medication_name: '', dosage: '', frequency: '', duration: '', quantity: 1, instructions: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!formData.patient_id || !formData.doctor_id || !formData.diagnosis || !formData.expires_at) {
      setSubmitError('Please fill in all required fields.');
      return;
    }
    const validItems = items.filter((i) => i.medication_name && i.dosage && i.frequency && i.duration);
    if (validItems.length === 0) {
      setSubmitError('Please add at least one medication item.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        ...formData,
        appointment_id: formData.appointment_id || null,
        items: items.map((i) => ({
          medication_name: i.medication_name,
          dosage: i.dosage,
          frequency: i.frequency,
          duration: i.duration,
          quantity: i.quantity,
          instructions: i.instructions || undefined,
        })),
      };
      console.log('Prescription payload:', JSON.stringify(payload));
      const res = await createPrescription(payload);
      navigate(`/prescriptions/${res.data?.prescription?.id ?? (res as any)?.prescription?.id}`);
    } catch (err: any) {
      console.log('Prescription error response:', err?.response?.data);
      const errData = err?.response?.data;
      if (errData?.errors?.length > 0) {
        setSubmitError('Validation error: ' + errData.errors.map((e: any) => e.message).join('; '));
      } else {
        setSubmitError(errData?.message ?? 'Failed to create prescription.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Issue Prescription">
        <Spinner />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Issue Prescription">
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => navigate('/prescriptions')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Issue Prescription</h1>
          </div>

          <Card>
            {submitError && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm border border-red-200 dark:border-red-800">
                {submitError}
              </div>
            )}

            <div className="space-y-5">
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Prescription Details</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Patient *</label>
                  <select
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleFormChange}
                    className="block w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select patient</option>
                    {(patients ?? []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.patient_number} — {p.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Doctor *</label>
                  <select
                    name="doctor_id"
                    value={formData.doctor_id}
                    onChange={handleFormChange}
                    className="block w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select doctor</option>
                    {(doctors ?? []).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.user?.full_name || 'Unknown'} — {d.specialization}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Input label="Diagnosis *" name="diagnosis" value={formData.diagnosis} onChange={handleFormChange} placeholder="Enter diagnosis" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Expires At *" name="expires_at" type="date" value={formData.expires_at} onChange={handleFormChange} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows={2}
                  className="block w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Medications</p>
                  <Button size="sm" variant="secondary" onClick={addItem}>
                    <PlusCircle className="w-4 h-4 mr-1" />
                    Add Medication
                  </Button>
                </div>

                {(items ?? []).map((item, index) => (
                  <div key={index} className="p-4 mb-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Medication #{index + 1}</span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        label="Medication Name *"
                        value={item.medication_name}
                        onChange={(e) => handleItemChange(index, 'medication_name', e.target.value)}
                        placeholder="e.g. Amoxicillin"
                      />
                      <Input
                        label="Dosage *"
                        value={item.dosage}
                        onChange={(e) => handleItemChange(index, 'dosage', e.target.value)}
                        placeholder="e.g. 500mg"
                      />
                      <Input
                        label="Frequency *"
                        value={item.frequency}
                        onChange={(e) => handleItemChange(index, 'frequency', e.target.value)}
                        placeholder="e.g. 3x daily"
                      />
                      <Input
                        label="Duration *"
                        value={item.duration}
                        onChange={(e) => handleItemChange(index, 'duration', e.target.value)}
                        placeholder="e.g. 7 days"
                      />
                      <Input
                        label="Quantity"
                        type="number"
                        value={item.quantity.toString()}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                      <Input
                        label="Instructions"
                        value={item.instructions}
                        onChange={(e) => handleItemChange(index, 'instructions', e.target.value)}
                        placeholder="e.g. After meals"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button variant="secondary" onClick={() => navigate('/prescriptions')}>Cancel</Button>
                <Button variant="primary" type="button" onClick={handleSubmit} loading={submitting}>
                  <PlusCircle className="w-4 h-4 mr-1" />
                  Issue Prescription
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

export default PrescriptionForm;
