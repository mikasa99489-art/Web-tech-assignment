import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { toast } from 'react-toastify';
import {
  MdLocalPharmacy, MdMedication, MdCalendarMonth,
  MdMonitorHeart, MdNotifications
} from 'react-icons/md';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(setSummary)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="loader" /></div>;

  const cards = [
    { label: 'Prescriptions', value: summary?.totalPrescriptions || 0, icon: <MdLocalPharmacy />, color: 'var(--accent-blue)' },
    { label: 'Active Medicines', value: summary?.activeMedicines || 0, icon: <MdMedication />, color: 'var(--accent-green)' },
    { label: 'Upcoming Appts', value: summary?.upcomingAppointments?.length || 0, icon: <MdCalendarMonth />, color: 'var(--accent-purple)' },
    { label: 'Unread Alerts', value: summary?.unreadReminders?.length || 0, icon: <MdNotifications />, color: 'var(--accent-orange)' },
  ];

  return (
    <div className="page-dashboard">
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="page-subtitle">Here's your health overview</p>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((card) => (
          <div className="stat-card" key={card.label}>
            <div className="stat-icon" style={{ background: card.color }}>{card.icon}</div>
            <div className="stat-info">
              <span className="stat-value">{card.value}</span>
              <span className="stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Upcoming Appointments</h3>
          {summary?.upcomingAppointments?.length > 0 ? (
            <ul className="dash-list">
              {summary.upcomingAppointments.map((appt) => (
                <li key={appt._id}>
                  <strong>{appt.doctorName}</strong>
                  <span>{new Date(appt.date).toLocaleDateString()} at {appt.time}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-text">No upcoming appointments</p>
          )}
        </div>

        <div className="dashboard-card">
          <h3>Recent Alerts</h3>
          {summary?.unreadReminders?.length > 0 ? (
            <ul className="dash-list">
              {summary.unreadReminders.map((rem) => (
                <li key={rem._id}>
                  <strong>{rem.title}</strong>
                  <span>{new Date(rem.dateTime).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-text">No new alerts</p>
          )}
        </div>

        <div className="dashboard-card">
          <h3>Recent Vitals</h3>
          {summary?.recentVitals?.length > 0 ? (
            <ul className="dash-list">
              {summary.recentVitals.slice(0, 5).map((v) => (
                <li key={v._id}>
                  <strong>{v.type.toUpperCase()}</strong>
                  <span>{v.value} {v.unit} — {new Date(v.date).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-text">No vitals recorded yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
