import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth';
import { api } from '../api/client';
import { toast } from 'react-toastify';
import { MdDownload } from 'react-icons/md';

export default function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', dateOfBirth: '', bloodGroup: '' });
  const [notifPrefs, setNotifPrefs] = useState({ medicine: true, appointment: true, healthCheckup: true });
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth?.split('T')[0] || '',
        bloodGroup: user.bloodGroup || '',
      });
      if (user.notificationPrefs) setNotifPrefs(user.notificationPrefs);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.updateProfile({ ...form, notificationPrefs: notifPrefs });
      toast.success('Profile updated');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await api.get('/export/health-report');
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      let y = 20;

      const addTitle = (text) => { doc.setFontSize(14); doc.setFont(undefined, 'bold'); doc.text(text, 14, y); y += 8; };
      const addLine = (text) => { if (y > 270) { doc.addPage(); y = 20; } doc.setFontSize(10); doc.setFont(undefined, 'normal'); doc.text(text, 14, y); y += 6; };
      const addGap = () => { y += 6; };

      doc.setFontSize(18); doc.setFont(undefined, 'bold');
      doc.text('MedVault Health Report', 14, y); y += 8;
      addLine(`Generated: ${new Date().toLocaleDateString()}`);
      addGap();

      if (data.user) {
        addTitle('Patient Information');
        addLine(`Name: ${data.user.name || '-'}`);
        addLine(`Email: ${data.user.email || '-'}`);
        addLine(`Phone: ${data.user.phone || '-'}`);
        addLine(`Blood Group: ${data.user.bloodGroup || '-'}`);
        addGap();
      }

      if (data.prescriptions?.length) {
        addTitle(`Prescriptions (${data.prescriptions.length})`);
        data.prescriptions.forEach(p => {
          addLine(`${new Date(p.date).toLocaleDateString()} - Dr. ${p.doctorName} | ${p.diagnosis || 'No diagnosis'}`);
          p.medicines?.forEach(m => addLine(`    ${m.name} ${m.dosage} ${m.duration}`));
        });
        addGap();
      }

      if (data.medicines?.length) {
        addTitle(`Medicines (${data.medicines.length})`);
        data.medicines.forEach(m => addLine(`${m.name} - ${m.dosage}, ${m.frequency}`));
        addGap();
      }

      if (data.appointments?.length) {
        addTitle(`Appointments (${data.appointments.length})`);
        data.appointments.forEach(a => addLine(`${new Date(a.date).toLocaleDateString()} ${a.time} - Dr. ${a.doctorName} (${a.status})`));
        addGap();
      }

      if (data.vitals?.length) {
        addTitle(`Vitals (${data.vitals.length})`);
        data.vitals.slice(0, 20).forEach(v => addLine(`${v.type}: ${v.value} ${v.unit || ''} - ${new Date(v.date).toLocaleDateString()}`));
        addGap();
      }

      if (data.doctors?.length) {
        addTitle(`Doctors (${data.doctors.length})`);
        data.doctors.forEach(d => addLine(`Dr. ${d.name} - ${d.specialty} | ${d.phone || ''}`));
        addGap();
      }

      if (data.emergencyCard) {
        addTitle('Emergency Card');
        addLine(`Blood Group: ${data.emergencyCard.bloodGroup || '-'}`);
        if (data.emergencyCard.allergies?.length) addLine(`Allergies: ${data.emergencyCard.allergies.join(', ')}`);
        if (data.emergencyCard.conditions?.length) addLine(`Conditions: ${data.emergencyCard.conditions.join(', ')}`);
        if (data.emergencyCard.currentMedications?.length) addLine(`Medications: ${data.emergencyCard.currentMedications.join(', ')}`);
      }

      doc.save(`medvault-health-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Health report exported as PDF');
    } catch (err) { toast.error(err.message); }
    finally { setExporting(false); }
  };

  return (
    <div className="page-settings">
      <div className="page-header">
        <div><h1>Settings</h1><p className="page-subtitle">Manage your account and preferences</p></div>
      </div>

      <form onSubmit={handleSave}>
        <div className="settings-section">
          <h3>Profile Information</h3>
          <div className="settings-grid">
            <div className="form-group"><label>Full Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="form-group"><label>Phone Number</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="e.g. +91 9876543210" /></div>
            <div className="form-group"><label>Date of Birth</label><input type="date" value={form.dateOfBirth} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} /></div>
            <div className="form-group"><label>Blood Group</label><input value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))} placeholder="e.g. A+, O-" /></div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Notification Preferences</h3>
          <div className="toggle-row">
            <span className="toggle-label">Medicine reminders</span>
            <input type="checkbox" className="toggle-switch" checked={notifPrefs.medicine} onChange={e => setNotifPrefs(p => ({ ...p, medicine: e.target.checked }))} />
          </div>
          <div className="toggle-row">
            <span className="toggle-label">Appointment alerts</span>
            <input type="checkbox" className="toggle-switch" checked={notifPrefs.appointment} onChange={e => setNotifPrefs(p => ({ ...p, appointment: e.target.checked }))} />
          </div>
          <div className="toggle-row">
            <span className="toggle-label">Health checkup reminders</span>
            <input type="checkbox" className="toggle-switch" checked={notifPrefs.healthCheckup} onChange={e => setNotifPrefs(p => ({ ...p, healthCheckup: e.target.checked }))} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <button type="submit" className="btn btn-primary" disabled={saving} id="save-settings-btn">{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </form>

      <div className="settings-section">
        <h3>Data Export</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 16 }}>Download a complete copy of all your health records as a PDF file.</p>
        <button className="btn btn-outline" onClick={handleExport} disabled={exporting} id="export-btn">
          <MdDownload /> {exporting ? 'Exporting...' : 'Export Health Report'}
        </button>
      </div>
    </div>
  );
}
