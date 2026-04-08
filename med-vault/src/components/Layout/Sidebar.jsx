import { NavLink } from 'react-router-dom';
import {
  MdDashboard, MdMedication, MdCalendarMonth,
  MdLocalHospital, MdMonitorHeart, MdFolder,
  MdPeople, MdEmergency, MdSettings, MdLocalPharmacy,
} from 'react-icons/md';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <MdDashboard /> },
  { path: '/prescriptions', label: 'Prescriptions', icon: <MdLocalPharmacy /> },
  { path: '/medicine-tracker', label: 'Medicine Tracker', icon: <MdMedication /> },
  { path: '/appointments', label: 'Appointments', icon: <MdCalendarMonth /> },
  { path: '/doctors', label: 'Doctors', icon: <MdLocalHospital /> },
  { path: '/vitals', label: 'Vitals', icon: <MdMonitorHeart /> },
  { path: '/documents', label: 'Documents', icon: <MdFolder /> },
  { path: '/family', label: 'Family', icon: <MdPeople /> },
  { path: '/emergency-card', label: 'Emergency Card', icon: <MdEmergency /> },
  { path: '/settings', label: 'Settings', icon: <MdSettings /> },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-icon" style={{ fontSize: '1.4rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>M</span>
          <h1>MedVault</h1>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{icon}</span>
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
