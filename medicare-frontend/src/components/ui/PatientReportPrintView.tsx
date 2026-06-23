import { forwardRef } from 'react';
import { Patient, MedicalHistory, Appointment, Prescription } from '../../types';
import { formatDate, formatTime, calculateAge } from '../../utils/formatters';

interface PatientReportPrintViewProps {
  patient: Patient;
  history: MedicalHistory | null;
  appointments: Appointment[];
  prescriptions: Prescription[];
}

const PatientReportPrintView = forwardRef<HTMLDivElement, PatientReportPrintViewProps>(
  ({ patient, history, appointments, prescriptions }, ref) => {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const activePrescriptions = prescriptions.filter(p => p.status === 'issued');

    return (
      <div
        ref={ref}
        className="prescription-print-root"
        style={{
          fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
          color: '#1a1a2e',
          background: '#ffffff',
          width: '210mm',
          minHeight: '297mm',
          margin: '0 auto',
          padding: '12mm 14mm',
          boxSizing: 'border-box',
          fontSize: '11px',
          lineHeight: '1.5',
        }}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '3px solid #1d4ed8',
            paddingBottom: '10px',
            marginBottom: '14px',
          }}
        >
          {/* Clinic brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#1d4ed8', letterSpacing: '-0.5px' }}>
                MediCare Pro
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '10px', color: '#64748b' }}>
              Healthcare Management System
            </p>
          </div>

          {/* Report ID + Title */}
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'inline-block',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                padding: '4px 12px',
                marginBottom: '4px',
              }}
            >
              <span style={{ fontSize: '10px', color: '#1e40af', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                CONFIDENTIAL MEDICAL REPORT
              </span>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
              {patient.patient_number}
            </div>
            <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>
              Generated: {today}
            </div>
          </div>
        </div>

        {/* ── Demographics Section ──────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          {/* Patient Details */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <div
              style={{
                background: '#1d4ed8',
                color: 'white',
                padding: '6px 12px',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              Patient Demographics
            </div>
            <div style={{ padding: '10px 12px' }}>
              <Row label="Full Name" value={patient.full_name} bold />
              <Row label="Patient ID" value={patient.patient_number} mono />
              <Row label="Date of Birth" value={formatDate(patient.date_of_birth)} />
              <Row label="Age" value={`${calculateAge(patient.date_of_birth)} Years`} />
              <Row label="Gender" value={patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)} />
              <Row label="Blood Group" value={patient.blood_group || '—'} last />
            </div>
          </div>

          {/* Contact Details */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <div
              style={{
                background: '#0f172a',
                color: 'white',
                padding: '6px 12px',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              Contact & Emergency Info
            </div>
            <div style={{ padding: '10px 12px' }}>
              <Row label="Phone" value={patient.phone} />
              <Row label="Email" value={patient.email || '—'} />
              <Row label="Address" value={patient.address || '—'} />
              <Row label="Emergency Name" value={patient.emergency_contact_name || '—'} />
              <Row label="Emergency Phone" value={patient.emergency_contact_phone || '—'} last />
            </div>
          </div>
        </div>

        {/* ── Medical History Section ────────────────────────── */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
          <div
            style={{
              background: '#374151',
              color: 'white',
              padding: '6px 12px',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Medical History
          </div>
          <div style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <Block label="Chronic Conditions" value={history?.chronic_conditions} />
              <Block label="Allergies" value={history?.allergies} />
              <Block label="Past Surgeries" value={history?.past_surgeries} />
            </div>
            <div>
              <Block label="Current Medications" value={history?.current_medications} />
              <Block label="Family History" value={history?.family_history} />
              <Block label="Notes / Clinical Notes" value={history?.notes} />
            </div>
          </div>
        </div>

        {/* ── Active Prescriptions Section ────────────────────── */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
          <div
            style={{
              background: '#b91c1c',
              color: 'white',
              padding: '6px 12px',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Active Prescriptions ({activePrescriptions.length})
          </div>
          <div style={{ padding: '10px 12px' }}>
            {activePrescriptions.length === 0 ? (
              <div style={{ fontStyle: 'italic', color: '#64748b' }}>No active prescriptions on file.</div>
            ) : (
              activePrescriptions.map((prescription, idx) => (
                <div key={prescription.id} style={{ borderBottom: idx < activePrescriptions.length - 1 ? '1px solid #e2e8f0' : 'none', paddingBottom: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                    <span>Prescription {prescription.prescription_number} ({prescription.diagnosis})</span>
                    <span style={{ fontSize: '9px', color: '#64748b' }}>Issued by {prescription.doctor?.user?.full_name} on {formatDate(prescription.issued_at)}</span>
                  </div>
                  {prescription.items && prescription.items.length > 0 ? (
                    <div style={{ paddingLeft: '8px', fontSize: '10px', color: '#475569' }}>
                      {prescription.items.map((item) => (
                        <div key={item.id}>
                          • <span style={{ fontWeight: 600 }}>{item.medication_name}</span> - {item.dosage} ({item.frequency} for {item.duration}) - Qty: {item.quantity} {item.instructions && <span style={{ fontStyle: 'italic', color: '#64748b' }}>({item.instructions})</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontStyle: 'italic', color: '#94a3b8', paddingLeft: '8px' }}>No items listed.</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Appointment Timeline Section ────────────────────── */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
          <div
            style={{
              background: '#059669',
              color: 'white',
              padding: '6px 12px',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Appointment History Timeline
          </div>
          <div style={{ padding: '10px 12px' }}>
            {appointments.length === 0 ? (
              <div style={{ fontStyle: 'italic', color: '#64748b' }}>No appointments scheduled.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', fontSize: '9px', textTransform: 'uppercase', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '4px 6px' }}>Date</th>
                    <th style={{ padding: '4px 6px' }}>Time</th>
                    <th style={{ padding: '4px 6px' }}>Physician</th>
                    <th style={{ padding: '4px 6px' }}>Type</th>
                    <th style={{ padding: '4px 6px' }}>Reason</th>
                    <th style={{ padding: '4px 6px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 8).map((appt) => (
                    <tr key={appt.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '10px' }}>
                      <td style={{ padding: '6px' }}>{formatDate(appt.appointment_date)}</td>
                      <td style={{ padding: '6px' }}>{formatTime(appt.start_time)}</td>
                      <td style={{ padding: '6px' }}>{appt.doctor?.user?.full_name || '—'}</td>
                      <td style={{ padding: '6px', textTransform: 'capitalize' }}>{appt.type.replace(/_/g, ' ')}</td>
                      <td style={{ padding: '6px', color: '#475569' }}>{appt.reason || '—'}</td>
                      <td style={{ padding: '6px', textTransform: 'capitalize', fontWeight: 600, color: appt.status === 'completed' ? '#059669' : '#d97706' }}>
                        {appt.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Signature + Stamp area ────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginTop: 'auto',
            paddingTop: '16px',
            borderTop: '1px dashed #cbd5e1',
          }}
        >
          {/* Physician review signature */}
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '40px' }}>
              Authorized Medical Practitioner
            </div>
            <div style={{ borderTop: '1.5px solid #1e293b', paddingTop: '6px' }}>
              <div style={{ fontWeight: 700, fontSize: '11px', color: '#1e293b' }}>
                Signature & License ID
              </div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>MediCare Pro Affiliated Staff</div>
            </div>
          </div>

          {/* Clinic stamp */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              Official Clinic Stamp
            </div>
            <div
              style={{
                width: '110px',
                height: '60px',
                border: '2px dashed #cbd5e1',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#cbd5e1',
                fontSize: '9px',
                textAlign: 'center',
                padding: '4px',
                marginLeft: 'auto',
              }}
            >
              Stamp / Seal
            </div>
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────── */}
        <div
          style={{
            marginTop: '16px',
            paddingTop: '10px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '9px',
            color: '#94a3b8',
          }}
        >
          <span>MediCare Pro — Confidential Medical Summary</span>
          <span>Contains sensitive healthcare records subject to privacy acts.</span>
        </div>
      </div>
    );
  }
);

PatientReportPrintView.displayName = 'PatientReportPrintView';
export default PatientReportPrintView;

/* ── Inline Helpers ────────────────────────────────────────── */
interface RowProps {
  label: string;
  value: string;
  bold?: boolean;
  mono?: boolean;
  last?: boolean;
}

const Row = ({ label, value, bold, mono, last }: RowProps) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingBottom: last ? 0 : '4px',
      marginBottom: last ? 0 : '4px',
      borderBottom: last ? 'none' : '1px solid #f1f5f9',
    }}
  >
    <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', flexShrink: 0, marginRight: '8px' }}>
      {label}
    </span>
    <span
      style={{
        fontSize: '10px',
        fontWeight: bold ? 700 : 500,
        color: '#1e293b',
        textAlign: 'right',
        fontFamily: mono ? 'monospace' : 'inherit',
      }}
    >
      {value}
    </span>
  </div>
);

interface BlockProps {
  label: string;
  value?: string;
}

const Block = ({ label, value }: BlockProps) => (
  <div style={{ marginBottom: '8px' }}>
    <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '2px' }}>
      {label}
    </div>
    <div style={{ fontSize: '10px', color: '#1e293b', background: '#f8fafc', padding: '6px 8px', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
      {value?.trim() ? value : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>None recorded</span>}
    </div>
  </div>
);
