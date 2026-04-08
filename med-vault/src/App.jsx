import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Prescriptions from './pages/Prescriptions';
import MedicineTracker from './pages/MedicineTracker';
import Appointments from './pages/Appointments';
import Doctors from './pages/Doctors';
import Vitals from './pages/Vitals';
import Documents from './pages/Documents';
import Family from './pages/Family';
import EmergencyCard from './pages/EmergencyCard';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="medicine-tracker" element={<MedicineTracker />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="vitals" element={<Vitals />} />
            <Route path="documents" element={<Documents />} />
            <Route path="family" element={<Family />} />
            <Route path="emergency-card" element={<EmergencyCard />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </AuthProvider>
    </BrowserRouter>
  );
}
