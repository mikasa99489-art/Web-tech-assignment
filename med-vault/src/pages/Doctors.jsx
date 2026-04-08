import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { toast } from 'react-toastify';
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';

export default function Doctors() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', specialty: '', phone: '', email: '', clinicName: '', clinicAddress: '' });

  const load = () => {
    api.get('/doctors').then(setItems).catch(e => toast.error(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const resetForm = () => {
    setForm({ name: '', specialty: '', phone: '', email: '', clinicName: '', clinicAddress: '' });
    setEditing(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/doctors/${editing}`, form); toast.success('Doctor updated'); }
      else { await api.post('/doctors', form); toast.success('Doctor added'); }
      resetForm(); load();
    } catch (err) { toast.error(err.message); }
  };

  const handleEdit = (item) => {
    setForm({ name: item.name, specialty: item.specialty, phone: item.phone || '', email: item.email || '', clinicName: item.clinicName || '', clinicAddress: item.clinicAddress || '' });
    setEditing(item._id); setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this doctor?')) return;
    try { await api.delete(`/doctors/${id}`); toast.success('Deleted'); load(); } catch (err) { toast.error(err.message); }
  };

  if (loading) return <div className="page-loader"><div className="loader" /></div>;

  return (
    <div className="page-doctors">
      <div className="page-header">
        <div><h1>Doctors</h1><p className="page-subtitle">Your healthcare providers</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-doctor-btn"><MdAdd /> Add Doctor</button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state"><span className="empty-icon"><MdAdd style={{ fontSize: '2rem', opacity: 0.4 }} /></span><h3>No doctors added</h3><p>Add your healthcare providers to keep track</p></div>
      ) : (
        <div className="card-grid">
          {items.map(item => (
            <div className="data-card" key={item._id}>
              <div className="data-card-header">
                <h3>{item.name}</h3>
                <div className="data-card-actions">
                  <button className="icon-btn" onClick={() => handleEdit(item)}><MdEdit /></button>
                  <button className="icon-btn danger" onClick={() => handleDelete(item._id)}><MdDelete /></button>
                </div>
              </div>
              <div className="data-card-body">
                <p className="data-meta">{item.specialty}</p>
                {item.phone && <p>Phone: {item.phone}</p>}
                {item.email && <p>Email: {item.email}</p>}
                {item.clinicName && <p>Clinic: {item.clinicName}</p>}
                {item.clinicAddress && <p className="data-notes">{item.clinicAddress}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editing ? 'Edit' : 'Add'} Doctor</h2><button className="icon-btn" onClick={resetForm}><MdClose /></button></div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group"><label>Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                <div className="form-group"><label>Specialty</label><input value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              </div>
              <div className="form-group"><label>Clinic Name</label><input value={form.clinicName} onChange={e => setForm(f => ({ ...f, clinicName: e.target.value }))} /></div>
              <div className="form-group"><label>Clinic Address</label><textarea value={form.clinicAddress} onChange={e => setForm(f => ({ ...f, clinicAddress: e.target.value }))} rows={2} /></div>
              <div className="modal-actions"><button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button><button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
