import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ReactNode } from 'react';
import Spinner from './components/ui/Spinner';

import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
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
import PrescriptionDetail from './pages/Prescriptions/PrescriptionDetail';
import StaffList from './pages/Staff/StaffList';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const RoleRoute = ({ children, roles }: { children: ReactNode; roles: string[] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900"><Spinner /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!roles.includes(user?.role ?? '')) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const RootRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900"><Spinner /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  switch (user?.role) {
    case 'admin': return <Navigate to="/dashboard" replace />;
    case 'doctor': return <Navigate to="/appointments" replace />;
    case 'nurse': return <Navigate to="/patients" replace />;
    case 'receptionist': return <Navigate to="/appointments" replace />;
    default: return <Navigate to="/login" replace />;
  }
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<RootRedirect />} />

      <Route path="/dashboard" element={<RoleRoute roles={['admin']}><Dashboard /></RoleRoute>} />

      <Route path="/patients" element={<ProtectedRoute><PatientList /></ProtectedRoute>} />
      <Route path="/patients/new" element={<RoleRoute roles={['admin', 'receptionist']}><PatientForm /></RoleRoute>} />
      <Route path="/patients/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
      <Route path="/patients/:id/edit" element={<RoleRoute roles={['admin', 'doctor', 'nurse', 'receptionist']}><PatientForm /></RoleRoute>} />

      <Route path="/appointments" element={<ProtectedRoute><AppointmentList /></ProtectedRoute>} />
      <Route path="/appointments/new" element={<RoleRoute roles={['admin', 'receptionist']}><AppointmentForm /></RoleRoute>} />
      <Route path="/appointments/:id" element={<ProtectedRoute><AppointmentDetail /></ProtectedRoute>} />
      <Route path="/appointments/:id/edit" element={<RoleRoute roles={['admin', 'receptionist']}><AppointmentForm /></RoleRoute>} />

      <Route path="/doctors" element={<RoleRoute roles={['admin']}><DoctorList /></RoleRoute>} />
      <Route path="/doctors/:id" element={<RoleRoute roles={['admin', 'doctor']}><DoctorProfile /></RoleRoute>} />

      <Route path="/prescriptions" element={<RoleRoute roles={['admin', 'doctor', 'nurse']}><PrescriptionList /></RoleRoute>} />
      <Route path="/prescriptions/new" element={<RoleRoute roles={['admin', 'doctor']}><PrescriptionForm /></RoleRoute>} />
      <Route path="/prescriptions/:id" element={<RoleRoute roles={['admin', 'doctor', 'nurse']}><PrescriptionDetail /></RoleRoute>} />

      <Route path="/staff" element={<RoleRoute roles={['admin']}><StaffList /></RoleRoute>} />

      <Route path="*" element={<Navigate to="/unauthorized" replace />} />
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
