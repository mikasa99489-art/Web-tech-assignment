import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { toast } from 'react-toastify';
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';

const RELATION_COLORS = {
  spouse: 'var(--accent-pink)',
  parent: 'var(--accent-blue)',
  child: 'var(--accent-green)',
  sibling: 'var(--accent-purple)',
};

function TagsInput({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState('');
  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) onChange([...value, input.trim()]);
      setInput('');
    }
    if (e.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };
  return (
    <div className="tags-input">
      {value.map((tag, i) => (
        <span className="tag" key={i}>{tag}<button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}>&times;</button></span>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={value.length === 0 ? placeholder : ''} />
    </div>
  );
}

export default function Family() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', relation: '', dateOfBirth: '', bloodGroup: '', allergies: [], conditions: [] });

  const load = () => { api.get('/family').then(setItems).catch(e => toast.error(e.message)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const resetForm = () => { setForm({ name: '', relation: '', dateOfBirth: '', bloodGroup: '', allergies: [], conditions: [] }); setEditing(null); setShowModal(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/family/${editing}`, form); toast.success('Updated'); }
      else { await api.post('/family', form); toast.success('Family member added'); }
      resetForm(); load();
    } catch (err) { toast.error(err.message); }
  };

  const handleEdit = (item) => {
    setForm({ name: item.name, relation: item.relation, dateOfBirth: item.dateOfBirth?.split('T')[0] || '', bloodGroup: item.bloodGroup || '', allergies: item.allergies || [], conditions: item.conditions || [] });
    setEditing(item._id); setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this family member?')) return;
    try { await api.delete(`/family/${id}`); toast.success('Removed'); load(); } catch (err) { toast.error(err.message); }
  };

  if (loading) return <div className="page-loader"><div className="loader" /></div>;

  return (
    <div className="page-family">
      <div className="page-header">
        <div><h1>Family</h1><p className="page-subtitle">Manage family health profiles</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-family-btn"><MdAdd /> Add Member</button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state"><MdAdd style={{ fontSize: '2rem', opacity: 0.3 }} /><h3>No family members</h3><p>Add family members to track their health information</p></div>
      ) : (
        <div className="card-grid">
          {items.map(item => {
            const color = RELATION_COLORS[item.relation?.toLowerCase()] || 'var(--accent-cyan)';
            return (
              <div className="family-card" key={item._id}>
                <div className="data-card-header">
                  <div className="family-card-top">
                    <div className="family-avatar" style={{ background: color }}>{item.name?.charAt(0).toUpperCase()}</div>
                    <div className="family-name-group">
                      <h3>{item.name}</h3>
                      <span className="family-relation">{item.relation}</span>
                    </div>
                  </div>
                  <div className="data-card-actions">
                    <button className="icon-btn" onClick={() => handleEdit(item)}><MdEdit /></button>
                    <button className="icon-btn danger" onClick={() => handleDelete(item._id)}><MdDelete /></button>
                  </div>
                </div>
                <div className="family-details">
                  {item.bloodGroup && <p><span className="detail-label">Blood Group</span> {item.bloodGroup}</p>}
                  {item.dateOfBirth && <p><span className="detail-label">Date of Birth</span> {new Date(item.dateOfBirth).toLocaleDateString()}</p>}
                  {item.allergies?.length > 0 && (
                    <div><span className="detail-label">Allergies</span><div className="medicine-chips">{item.allergies.map((a, i) => <span className="chip" key={i} style={{ background: 'var(--accent-red-soft)', color: 'var(--accent-red)' }}>{a}</span>)}</div></div>
                  )}
                  {item.conditions?.length > 0 && (
                    <div><span className="detail-label">Conditions</span><div className="medicine-chips">{item.conditions.map((c, i) => <span className="chip" key={i} style={{ background: 'var(--accent-orange-soft)', color: 'var(--accent-orange)' }}>{c}</span>)}</div></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editing ? 'Edit' : 'Add'} Family Member</h2><button className="icon-btn" onClick={resetForm}><MdClose /></button></div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group"><label>Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                <div className="form-group"><label>Relation</label><input value={form.relation} onChange={e => setForm(f => ({ ...f, relation: e.target.value }))} required placeholder="e.g. Spouse, Parent, Child" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Date of Birth</label><input type="date" value={form.dateOfBirth} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} /></div>
                <div className="form-group"><label>Blood Group</label><input value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))} placeholder="e.g. A+, O-" /></div>
              </div>
              <div className="form-group"><label>Allergies</label><TagsInput value={form.allergies} onChange={v => setForm(f => ({ ...f, allergies: v }))} placeholder="Type and press Enter" /></div>
              <div className="form-group"><label>Conditions</label><TagsInput value={form.conditions} onChange={v => setForm(f => ({ ...f, conditions: v }))} placeholder="Type and press Enter" /></div>
              <div className="modal-actions"><button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button><button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
