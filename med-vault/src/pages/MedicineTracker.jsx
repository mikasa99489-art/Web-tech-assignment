import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { toast } from 'react-toastify';
import { MdAdd, MdEdit, MdDelete, MdClose, MdCheckCircle } from 'react-icons/md';

export default function MedicineTracker() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', dosage: '', frequency: 'daily', times: ['08:00'], startDate: '', endDate: '' });

  const load = () => {
    api.get('/medicines').then(setItems).catch(e => toast.error(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const resetForm = () => {
    setForm({ name: '', dosage: '', frequency: 'daily', times: ['08:00'], startDate: '', endDate: '' });
    setEditing(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/medicines/${editing}`, form);
        toast.success('Medicine updated');
      } else {
        await api.post('/medicines', form);
        toast.success('Medicine added');
      }
      resetForm(); load();
    } catch (err) { toast.error(err.message); }
  };

  const handleEdit = (item) => {
    setForm({ name: item.name, dosage: item.dosage, frequency: item.frequency, times: item.times?.length ? item.times : ['08:00'], startDate: item.startDate?.split('T')[0] || '', endDate: item.endDate?.split('T')[0] || '' });
    setEditing(item._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this medicine?')) return;
    try { await api.delete(`/medicines/${id}`); toast.success('Deleted'); load(); } catch (err) { toast.error(err.message); }
  };

  const markTaken = async (id, time) => {
    try {
      await api.post(`/medicines/${id}/take`, { date: new Date().toISOString(), time });
      toast.success('Marked as taken!');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const today = new Date().toDateString();
  const isTakenToday = (med, time) => med.taken?.some(t => new Date(t.date).toDateString() === today && t.time === time);
  const isActive = (med) => !med.endDate || new Date(med.endDate) >= new Date();

  if (loading) return <div className="page-loader"><div className="loader" /></div>;

  const activeMeds = items.filter(isActive);
  const pastMeds = items.filter(m => !isActive(m));

  return (
    <div className="page-medicine-tracker">
      <div className="page-header">
        <div><h1>Medicine Tracker</h1><p className="page-subtitle">Track your daily medication schedule</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-medicine-btn"><MdAdd /> Add Medicine</button>
      </div>

      {activeMeds.length === 0 && pastMeds.length === 0 ? (
        <div className="empty-state"><span className="empty-icon" style={{ fontSize: '2rem', opacity: 0.4 }}>—</span><h3>No medicines tracked</h3><p>Add medicines to start tracking your schedule</p></div>
      ) : (
        <>
          {activeMeds.length > 0 && (
            <>
              <h2 className="section-title">Today's Schedule</h2>
              <div className="medicine-schedule">
                {activeMeds.map(med => (
                  <div className="medicine-card" key={med._id}>
                    <div className="medicine-card-header">
                      <div>
                        <h3>{med.name}</h3>
                        <p className="data-meta">{med.dosage} • {med.frequency}</p>
                      </div>
                      <div className="data-card-actions">
                        <button className="icon-btn" onClick={() => handleEdit(med)}><MdEdit /></button>
                        <button className="icon-btn danger" onClick={() => handleDelete(med._id)}><MdDelete /></button>
                      </div>
                    </div>
                    <div className="medicine-times">
                      {med.times?.map(time => (
                        <button
                          key={time}
                          className={`time-chip ${isTakenToday(med, time) ? 'taken' : ''}`}
                          onClick={() => !isTakenToday(med, time) && markTaken(med._id, time)}
                          disabled={isTakenToday(med, time)}
                        >
                          {isTakenToday(med, time) && <MdCheckCircle />}
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {pastMeds.length > 0 && (
            <>
              <h2 className="section-title" style={{ marginTop: '2rem' }}>Past Medicines</h2>
              <div className="card-grid">
                {pastMeds.map(med => (
                  <div className="data-card faded" key={med._id}>
                    <div className="data-card-header">
                      <h3>{med.name}</h3>
                      <button className="icon-btn danger" onClick={() => handleDelete(med._id)}><MdDelete /></button>
                    </div>
                    <p className="data-meta">{med.dosage} • ended {new Date(med.endDate).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editing ? 'Edit Medicine' : 'Add Medicine'}</h2><button className="icon-btn" onClick={resetForm}><MdClose /></button></div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group"><label>Name</label><input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                <div className="form-group"><label>Dosage</label><input type="text" value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} required placeholder="e.g. 500mg" /></div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Frequency</label>
                  <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                    <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="as-needed">As Needed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Times</label>
                  {form.times.map((t, i) => (
                    <div className="time-input-row" key={i}>
                      <input type="time" value={t} onChange={e => { const ts = [...form.times]; ts[i] = e.target.value; setForm(f => ({ ...f, times: ts })); }} />
                      {form.times.length > 1 && <button type="button" className="icon-btn danger" onClick={() => setForm(f => ({ ...f, times: f.times.filter((_, j) => j !== i)})) }><MdClose /></button>}
                    </div>
                  ))}
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setForm(f => ({ ...f, times: [...f.times, '12:00'] }))}>+ Add time</button>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Start Date</label><input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required /></div>
                <div className="form-group"><label>End Date (optional)</label><input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
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
