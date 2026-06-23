import { forwardRef } from 'react';
import { Prescription, PrescriptionItem } from '../../types';
import { formatDate } from '../../utils/formatters';

interface PrescriptionPrintViewProps {
  prescription: Prescription;
}

const PrescriptionPrintView = forwardRef<HTMLDivElement, PrescriptionPrintViewProps>(
  ({ prescription }, ref) => {
    const doctor = prescription.doctor;
    const patient = prescription.patient;
    const items: PrescriptionItem[] = prescription.items ?? [];
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

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
                {/* Cross / plus icon */}
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

          {/* Prescription ID + status badge */}
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
                PRESCRIPTION
              </span>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 800, color: '#1d4ed8' }}>
              {prescription.prescription_number}
            </div>
            <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>
              Printed: {today}
            </div>
          </div>
        </div>

        {/* ── Date / Status strip ────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '16px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '10px 14px',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
              Date Issued
            </div>
            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '12px' }}>
              {formatDate(prescription.issued_at as string)}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
              Expiry Date
            </div>
            <div style={{ fontWeight: 700, color: prescription.expires_at ? '#dc2626' : '#64748b', fontSize: '12px' }}>
              {prescription.expires_at ? formatDate(prescription.expires_at) : 'No expiry date'}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
              Status
            </div>
            <div
              style={{
                display: 'inline-block',
                background:
                  prescription.status === 'issued' ? '#f3e8ff' :
                  prescription.status === 'dispensed' ? '#dcfce7' :
                  prescription.status === 'expired' ? '#ffedd5' : '#fee2e2',
                color:
                  prescription.status === 'issued' ? '#7e22ce' :
                  prescription.status === 'dispensed' ? '#15803d' :
                  prescription.status === 'expired' ? '#c2410c' : '#b91c1c',
                borderRadius: '20px',
                padding: '1px 10px',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'capitalize',
              }}
            >
              {prescription.status}
            </div>
          </div>
        </div>

        {/* ── Patient + Doctor cards ──────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          {/* Patient */}
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
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
              Patient Information
            </div>
            <div style={{ padding: '10px 12px' }}>
              <Row label="Full Name" value={patient?.full_name ?? '—'} bold />
              <Row label="Patient ID" value={(patient as any)?.patient_number ?? '—'} />
              <Row label="Date of Birth" value={patient?.date_of_birth ? formatDate(patient.date_of_birth) : '—'} />
              <Row label="Gender" value={patient?.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : '—'} last />
            </div>
          </div>

          {/* Doctor */}
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
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
              Issuing Physician
            </div>
            <div style={{ padding: '10px 12px' }}>
              <Row label="Doctor" value={doctor?.user?.full_name ?? '—'} bold />
              <Row label="Specialization" value={doctor?.specialization ?? '—'} />
              <Row label="License No." value={doctor?.license_number ?? '—'} mono />
              <Row label="Contact" value={doctor?.phone ?? '—'} last />
            </div>
          </div>
        </div>

        {/* ── Diagnosis ─────────────────────────────────────── */}
        <div
          style={{
            border: '1px solid #fde68a',
            borderRadius: '8px',
            background: '#fffbeb',
            padding: '10px 14px',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontSize: '9px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            Diagnosis / Clinical Indication
          </div>
          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '12px' }}>{prescription.diagnosis}</div>
          {prescription.notes?.trim() && (
            <div style={{ marginTop: '6px', fontSize: '10px', color: '#78350f' }}>
              <span style={{ fontWeight: 700 }}>Notes: </span>{prescription.notes}
            </div>
          )}
        </div>

        {/* ── Medication Table ──────────────────────────────── */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#1e293b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ display: 'inline-block', width: '3px', height: '14px', background: '#1d4ed8', borderRadius: '2px' }} />
            Prescribed Medications ({items.length} item{items.length !== 1 ? 's' : ''})
          </div>

          {items.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', border: '1px dashed #e2e8f0', borderRadius: '8px' }}>
              No medication items recorded
            </div>
          ) : (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '10px',
              }}
            >
              <thead>
                <tr style={{ background: '#1e293b', color: 'white' }}>
                  {['#', 'Medication Name', 'Dosage', 'Frequency', 'Duration', 'Qty', 'Instructions'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '7px 10px',
                        textAlign: 'left',
                        fontWeight: 700,
                        fontSize: '9px',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{ background: idx % 2 === 0 ? '#f8fafc' : '#ffffff' }}
                  >
                    <td style={tdStyle}>{idx + 1}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#1e293b' }}>{item.medication_name}</td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#1d4ed8' }}>{item.dosage}</td>
                    <td style={tdStyle}>{item.frequency}</td>
                    <td style={tdStyle}>{item.duration}</td>
                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                    <td style={{ ...tdStyle, color: '#64748b', fontStyle: item.instructions ? 'normal' : 'italic' }}>
                      {item.instructions || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Signature + Stamp area ────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginTop: '8px',
            paddingTop: '16px',
            borderTop: '1px dashed #cbd5e1',
          }}
        >
          {/* Doctor signature */}
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '40px' }}>
              Doctor's Signature
            </div>
            <div style={{ borderTop: '1.5px solid #1e293b', paddingTop: '6px' }}>
              <div style={{ fontWeight: 700, fontSize: '11px', color: '#1e293b' }}>
                {doctor?.user?.full_name ?? '________________________'}
              </div>
              {doctor?.specialization && (
                <div style={{ fontSize: '9px', color: '#64748b' }}>{doctor.specialization}</div>
              )}
              {doctor?.license_number && (
                <div style={{ fontSize: '9px', color: '#64748b', fontFamily: 'monospace' }}>
                  Lic. No: {doctor.license_number}
                </div>
              )}
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
                height: '80px',
                border: '2px dashed #cbd5e1',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#cbd5e1',
                fontSize: '9px',
                textAlign: 'center',
                padding: '4px',
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
          <span>MediCare Pro — Confidential Medical Document</span>
          <span>This prescription is valid only when bearing an authorised signature and clinic stamp.</span>
        </div>
      </div>
    );
  }
);

PrescriptionPrintView.displayName = 'PrescriptionPrintView';
export default PrescriptionPrintView;

/* ── Helpers ─────────────────────────────────────────────── */
const tdStyle: React.CSSProperties = {
  padding: '7px 10px',
  borderBottom: '1px solid #e2e8f0',
  verticalAlign: 'top',
};

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
      paddingBottom: last ? 0 : '5px',
      marginBottom: last ? 0 : '5px',
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
