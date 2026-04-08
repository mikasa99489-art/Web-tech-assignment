import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { toast } from 'react-toastify';
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';

export default function Prescriptions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ doctorName: '', date: '', diagnosis: '', medicines: [{ name: '', dosage: '', duration: '' }], notes: '' });

  const load = () => {
    api.get('/prescriptions')
      .then(setItems)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const resetForm = () => {
    setForm({ doctorName: '', date: '', diagnosis: '', medicines: [{ name: '', dosage: '', duration: '' }], notes: '' });
    setEditing(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/prescriptions/${editing}`, form);
        toast.success('Prescription updated');
      } else {
        await api.post('/prescriptions', form);
        toast.success('Prescription added');
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (item) => {
    setForm({
      doctorName: item.doctorName,
      date: item.date?.split('T')[0] || '',
      diagnosis: item.diagnosis,
      medicines: item.medicines?.length ? item.medicines : [{ name: '', dosage: '', duration: '' }],
      notes: item.notes,
    });
    setEditing(item._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this prescription?')) return;
    try {
      await api.delete(`/prescriptions/${id}`);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const addMedicineRow = () => setForm(f => ({ ...f, medicines: [...f.medicines, { name: '', dosage: '', duration: '' }] }));
  const updateMedicine = (idx, field, value) => {
    const meds = [...form.medicines];
    meds[idx][field] = value;
    setForm(f => ({ ...f, medicines: meds }));
  };
  const removeMedicine = (idx) => setForm(f => ({ ...f, medicines: f.medicines.filter((_, i) => i !== idx) }));

  if (loading) return <div className="page-loader"><div className="loader" /></div>;

  return (
    <div className="page-prescriptions">
      <div className="page-header">
        <div>
          <h1>Prescriptions</h1>
          <p className="page-subtitle">Manage your doctor prescriptions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-prescription-btn">
          <MdAdd /> Add Prescription
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" style={{ fontSize: '2rem', opacity: 0.4 }}>—</span>
          <h3>No prescriptions yet</h3>
          <p>Add your first prescription to get started</p>
        </div>
      ) : (
        <div className="card-grid">
          {items.map((item) => (
            <div className="data-card" key={item._id}>
              <div className="data-card-header">
                <h3>{item.doctorName}</h3>
                <div className="data-card-actions">
                  <button className="icon-btn" onClick={() => handleEdit(item)}><MdEdit /></button>
                  <button className="icon-btn danger" onClick={() => handleDelete(item._id)}><MdDelete /></button>
                </div>
              </div>
              <div className="data-card-body">
                <p className="data-meta">{new Date(item.date).toLocaleDateString()}</p>
                {item.diagnosis && <p><strong>Diagnosis:</strong> {item.diagnosis}</p>}
                {item.medicines?.length > 0 && (
                  <div className="medicine-chips">
                    {item.medicines.map((m, i) => (
                      <span className="chip" key={i}>{m.name} {m.dosage && `(${m.dosage})`}</span>
                    ))}
                  </div>
                )}
                {item.notes && <p className="data-notes">{item.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Prescription' : 'Add Prescription'}</h2>
              <button className="icon-btn" onClick={resetForm}><MdClose /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Doctor Name</label>
                  <input type="text" value={form.doctorName} onChange={e => setForm(f => ({ ...f, doctorName: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
              </div>
              <div className="form-group">
                <label>Diagnosis</label>
                <input type="text" value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Medicines</label>
                {form.medicines.map((med, idx) => (
                  <div className="medicine-row" key={idx}>
                    <input placeholder="Medicine name" value={med.name} onChange={e => updateMedicine(idx, 'name', e.target.value)} />
                    <input placeholder="Dosage" value={med.dosage} onChange={e => updateMedicine(idx, 'dosage', e.target.value)} />
                    <input placeholder="Duration" value={med.duration} onChange={e => updateMedicine(idx, 'duration', e.target.value)} />
                    {form.medicines.length > 1 && <button type="button" className="icon-btn danger" onClick={() => removeMedicine(idx)}><MdClose /></button>}
                  </div>
                ))}
                <button type="button" className="btn btn-outline btn-sm" onClick={addMedicineRow}>+ Add medicine</button>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
