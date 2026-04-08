import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { toast } from 'react-toastify';
import { MdEdit, MdClose, MdShare } from 'react-icons/md';

function TagsInput({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState('');
  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) onChange([...value, input.trim()]);
      setInput('');
    }
    if (e.key === 'Backspace' && !input && value.length) onChange(value.slice(0, -1));
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

export default function EmergencyCard() {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bloodGroup: '', allergies: [], conditions: [], currentMedications: [], emergencyContacts: [{ name: '', relation: '', phone: '' }] });

  const load = () => {
    api.get('/emergency').then(data => {
      setCard(data);
      setForm({
        bloodGroup: data.bloodGroup || '',
        allergies: data.allergies || [],
        conditions: data.conditions || [],
        currentMedications: data.currentMedications || [],
        emergencyContacts: data.emergencyContacts?.length ? data.emergencyContacts : [{ name: '', relation: '', phone: '' }],
      });
    }).catch(e => toast.error(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.put('/emergency', form);
      setCard(updated);
      setEditing(false);
      toast.success('Emergency card updated');
    } catch (err) { toast.error(err.message); }
  };

  const addContact = () => setForm(f => ({ ...f, emergencyContacts: [...f.emergencyContacts, { name: '', relation: '', phone: '' }] }));
  const updateContact = (idx, field, value) => {
    const contacts = [...form.emergencyContacts];
    contacts[idx][field] = value;
    setForm(f => ({ ...f, emergencyContacts: contacts }));
  };
  const removeContact = (idx) => setForm(f => ({ ...f, emergencyContacts: f.emergencyContacts.filter((_, i) => i !== idx) }));

  const handleShare = () => {
    const url = `${window.location.origin}/api/emergency/share/${card?.userId}`;
    navigator.clipboard.writeText(url).then(() => toast.success('Share link copied to clipboard'));
  };

  if (loading) return <div className="page-loader"><div className="loader" /></div>;

  return (
    <div className="page-emergency-card">
      <div className="page-header">
        <div><h1>Emergency Card</h1><p className="page-subtitle">Critical information for emergencies</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={handleShare} id="share-emergency-btn"><MdShare /> Share</button>
          <button className="btn btn-primary" onClick={() => setEditing(true)} id="edit-emergency-btn"><MdEdit /> Edit</button>
        </div>
      </div>

      {/* Preview Card */}
      <div className="emergency-preview">
        <h2>Emergency Medical Information</h2>
        <p className="emergency-subtitle">Present this card to first responders or medical professionals</p>
        <div className="emergency-info-grid">
          <div className="emergency-field">
            <span className="field-label">Blood Group</span>
            <span className="field-value">{card?.bloodGroup || 'Not set'}</span>
          </div>
          <div className="emergency-field">
            <span className="field-label">Allergies</span>
            {card?.allergies?.length > 0 ? (
              <div className="emergency-chips">{card.allergies.map((a, i) => <span className="emergency-chip" key={i}>{a}</span>)}</div>
            ) : <span className="field-value">None listed</span>}
          </div>
          <div className="emergency-field">
            <span className="field-label">Conditions</span>
            {card?.conditions?.length > 0 ? (
              <div className="emergency-chips">{card.conditions.map((c, i) => <span className="emergency-chip" key={i}>{c}</span>)}</div>
            ) : <span className="field-value">None listed</span>}
          </div>
          <div className="emergency-field">
            <span className="field-label">Current Medications</span>
            {card?.currentMedications?.length > 0 ? (
              <div className="emergency-chips">{card.currentMedications.map((m, i) => <span className="emergency-chip" key={i}>{m}</span>)}</div>
            ) : <span className="field-value">None listed</span>}
          </div>
        </div>
        {card?.emergencyContacts?.length > 0 && card.emergencyContacts.some(c => c.name) && (
          <div className="emergency-contacts">
            <h4>Emergency Contacts</h4>
            {card.emergencyContacts.filter(c => c.name).map((c, i) => (
              <div className="contact-item" key={i}>
                <span>{c.name} ({c.relation})</span>
                <span>{c.phone}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Edit Emergency Card</h2><button className="icon-btn" onClick={() => setEditing(false)}><MdClose /></button></div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group"><label>Blood Group</label><input value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))} placeholder="e.g. A+, O-" /></div>
              <div className="form-group"><label>Allergies</label><TagsInput value={form.allergies} onChange={v => setForm(f => ({ ...f, allergies: v }))} placeholder="Type and press Enter" /></div>
              <div className="form-group"><label>Medical Conditions</label><TagsInput value={form.conditions} onChange={v => setForm(f => ({ ...f, conditions: v }))} placeholder="Type and press Enter" /></div>
              <div className="form-group"><label>Current Medications</label><TagsInput value={form.currentMedications} onChange={v => setForm(f => ({ ...f, currentMedications: v }))} placeholder="Type and press Enter" /></div>
              <div className="form-group">
                <label>Emergency Contacts</label>
                {form.emergencyContacts.map((c, idx) => (
                  <div className="contact-edit-row" key={idx}>
                    <input placeholder="Name" value={c.name} onChange={e => updateContact(idx, 'name', e.target.value)} />
                    <input placeholder="Relation" value={c.relation} onChange={e => updateContact(idx, 'relation', e.target.value)} />
                    <input placeholder="Phone" value={c.phone} onChange={e => updateContact(idx, 'phone', e.target.value)} />
                    {form.emergencyContacts.length > 1 && <button type="button" className="icon-btn danger" onClick={() => removeContact(idx)}><MdClose /></button>}
                  </div>
                ))}
                <button type="button" className="btn btn-outline btn-sm" onClick={addContact}>+ Add contact</button>
              </div>
              <div className="modal-actions"><button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
