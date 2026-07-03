import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPatient, getPatientById, updatePatient } from '../../api/patientApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import PageWrapper from '../../components/layout/PageWrapper';
import { ArrowLeft } from 'lucide-react';

interface FormData {
  full_name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  blood_group: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

const fieldClass =
  'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 hover:border-gray-300 dark:hover:border-gray-500';
const fieldErrorClass =
  'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent border-red-500';
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

const GENDERS = ['male', 'female', 'other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const PatientForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    blood_group: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditMode || !id) return;
    const fetchPatient = async () => {
      setFetching(true);
      try {
        const res = await getPatientById(id);
        const p = res.data.patient;
        setFormData({
          full_name: p.full_name || '',
          date_of_birth: p.date_of_birth ? p.date_of_birth.split('T')[0] : '',
          gender: p.gender || '',
          phone: p.phone || '',
          email: p.email || '',
          address: p.address || '',
          blood_group: p.blood_group || '',
          emergency_contact_name: p.emergency_contact_name || '',
          emergency_contact_phone: p.emergency_contact_phone || '',
        });
      } catch {
        setSubmitError('Failed to load patient data.');
      } finally {
        setFetching(false);
      }
    };
    fetchPatient();
  }, [isEditMode, id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEditMode && id) {
        await updatePatient(id, formData as unknown as Record<string, unknown>);
        navigate('/patients');
      } else {
        const res = await createPatient(formData as unknown as Record<string, unknown>);
        navigate(`/patients/${res.data.patient.id}`);
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'An error occurred. Please try again.';
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <PageWrapper title="Edit Patient">
        <Spinner />
      </PageWrapper>
    );
  }

  const renderField = (name: keyof FormData, label: string, type: string = 'text', required: boolean = false) => (
    <Input
      label={`${label}${required ? ' *' : ''}`}
      name={name}
      type={type}
      value={formData[name]}
      onChange={handleChange}
      error={errors[name]}
      required={required}
      placeholder={label === 'Phone Number' ? '+237 6XX XXX XXX' : `Enter ${label.toLowerCase()}`}
    />
  );

  return (
    <PageWrapper title={isEditMode ? 'Edit Patient' : 'Register New Patient'}>
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => navigate('/patients')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Patient' : 'Register New Patient'}
            </h1>
          </div>

          <Card>
            {submitError && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm border border-red-200 dark:border-red-800">
                {submitError}
              </div>
            )}

            <div>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Personal Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {renderField('full_name', 'Full Name', 'text', true)}
                {renderField('date_of_birth', 'Date of Birth', 'date', true)}

                <div>
                  <label className={labelClass}>Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={errors.gender ? fieldErrorClass : fieldClass}
                  >
                    <option value="">Select gender</option>
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender}</p>}
                </div>

                {renderField('phone', 'Phone Number', 'text', true)}

                {renderField('email', 'Email Address', 'email')}

                <div>
                  <label className={labelClass}>Blood Group</label>
                  <select
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                    className={fieldClass}
                  >
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Address</p>
              <div className="mb-6">
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className={fieldClass}
                  placeholder="Enter residential address"
                />
              </div>

              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Emergency Contact</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {renderField('emergency_contact_name', 'Emergency Contact Name')}
                {renderField('emergency_contact_phone', 'Emergency Contact Phone')}
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                <Button variant="secondary" onClick={() => navigate('/patients')}>
                  Cancel
                </Button>
                <Button variant="primary" type="button" onClick={handleSubmit} loading={loading}>
                  {isEditMode ? 'Update Patient' : 'Register Patient'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

export default PatientForm;
