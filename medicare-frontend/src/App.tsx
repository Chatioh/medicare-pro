import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ReactNode } from 'react';
import Spinner from './components/ui/Spinner';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/Patients/PatientList';
import PatientForm from './pages/Patients/PatientForm';
import PatientDetail from './pages/Patients/PatientDetail';
import AppointmentList from './pages/Appointments/AppointmentList';
import AppointmentForm from './pages/Appointments/AppointmentForm';
import AppointmentDetail from './pages/Appointments/AppointmentDetail';
import DoctorList from './pages/Doctors/DoctorList';
import DoctorProfile from './pages/Doctors/DoctorProfile';
import PrescriptionList from './pages/Prescriptions/PrescriptionList';
import PrescriptionForm from './pages/Prescriptions/PrescriptionForm';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/patients" element={<ProtectedRoute><PatientList /></ProtectedRoute>} />
      <Route path="/patients/new" element={<ProtectedRoute><PatientForm /></ProtectedRoute>} />
      <Route path="/patients/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
      <Route path="/patients/:id/edit" element={<ProtectedRoute><PatientForm /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute><AppointmentList /></ProtectedRoute>} />
      <Route path="/appointments/new" element={<ProtectedRoute><AppointmentForm /></ProtectedRoute>} />
      <Route path="/appointments/:id" element={<ProtectedRoute><AppointmentDetail /></ProtectedRoute>} />
      <Route path="/doctors" element={<ProtectedRoute><DoctorList /></ProtectedRoute>} />
      <Route path="/doctors/:id" element={<ProtectedRoute><DoctorProfile /></ProtectedRoute>} />
      <Route path="/prescriptions" element={<ProtectedRoute><PrescriptionList /></ProtectedRoute>} />
      <Route path="/prescriptions/new" element={<ProtectedRoute><PrescriptionForm /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
