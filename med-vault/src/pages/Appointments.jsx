import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { toast } from 'react-toastify';
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';

export default function Appointments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ doctorName: '', specialty: '', date: '', time: '', location: '', notes: '', status: 'upcoming' });

  const load = () => { api.get('/appointments').then(setItems).catch(e => toast.error(e.message)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const resetForm = () => { setForm({ doctorName: '', specialty: '', date: '', time: '', location: '', notes: '', status: 'upcoming' }); setEditing(null); setShowModal(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/appointments/${editing}`, form); toast.success('Updated'); }
      else { await api.post('/appointments', form); toast.success('Appointment added'); }
      resetForm(); load();
    } catch (err) { toast.error(err.message); }
  };

  const handleEdit = (item) => {
    setForm({ doctorName: item.doctorName, specialty: item.specialty || '', date: item.date?.split('T')[0] || '', time: item.time, location: item.location || '', notes: item.notes || '', status: item.status });
    setEditing(item._id); setShowModal(true);
  };

  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/appointments/${id}`); toast.success('Deleted'); load(); } catch (err) { toast.error(err.message); } };

  const statusColors = { upcoming: 'var(--accent-blue)', completed: 'var(--accent-green)', cancelled: 'var(--accent-red)' };

  if (loading) return <div className="page-loader"><div className="loader" /></div>;

  return (
    <div className="page-appointments">
      <div className="page-header">
        <div><h1>Appointments</h1><p className="page-subtitle">Schedule and track doctor visits</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-appointment-btn"><MdAdd /> Add Appointment</button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state"><span className="empty-icon" style={{ fontSize: '2rem', opacity: 0.4 }}>—</span><h3>No appointments</h3><p>Schedule your first appointment</p></div>
      ) : (
        <div className="card-grid">
          {items.map(item => (
            <div className="data-card" key={item._id}>
              <div className="data-card-header">
                <h3>{item.doctorName}</h3>
                <div className="data-card-actions">
                  <button className="icon-btn" onClick={() => handleEdit(item)}><MdEdit /></button>
                  <button className="icon-btn danger" onClick={() => handleDelete(item._id)}><MdDelete /></button>
                </div>
              </div>
              <div className="data-card-body">
                <span className="status-badge" style={{ background: statusColors[item.status] }}>{item.status}</span>
                {item.specialty && <p className="data-meta">{item.specialty}</p>}
                <p>{new Date(item.date).toLocaleDateString()} at {item.time}</p>
                {item.location && <p>{item.location}</p>}
                {item.notes && <p className="data-notes">{item.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editing ? 'Edit' : 'Add'} Appointment</h2><button className="icon-btn" onClick={resetForm}><MdClose /></button></div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group"><label>Doctor Name</label><input value={form.doctorName} onChange={e => setForm(f => ({ ...f, doctorName: e.target.value }))} required /></div>
                <div className="form-group"><label>Specialty</label><input value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required /></div>
                <div className="form-group"><label>Time</label><input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} required /></div>
              </div>
              <div className="form-group"><label>Location</label><input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="upcoming">Upcoming</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
              <div className="modal-actions"><button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button><button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
