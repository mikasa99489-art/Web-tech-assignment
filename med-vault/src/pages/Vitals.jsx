import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { toast } from 'react-toastify';
import { MdAdd, MdDelete, MdClose } from 'react-icons/md';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const VITAL_TYPES = [
  { key: 'bp', label: 'Blood Pressure', unit: 'mmHg', color: '#3b82f6' },
  { key: 'blood-sugar', label: 'Blood Sugar', unit: 'mg/dL', color: '#f59e0b' },
  { key: 'weight', label: 'Weight', unit: 'kg', color: '#22c55e' },
  { key: 'temperature', label: 'Temperature', unit: '°F', color: '#ef4444' },
];

export default function Vitals() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'bp', value: '', unit: 'mmHg', notes: '' });

  const load = () => {
    const endpoint = filter ? `/vitals?type=${filter}` : '/vitals';
    api.get(endpoint).then(setItems).catch(e => toast.error(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  const resetForm = () => { setShowModal(false); setForm({ type: 'bp', value: '', unit: 'mmHg', notes: '' }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vitals', form);
      toast.success('Vital recorded');
      resetForm(); load();
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try { await api.delete(`/vitals/${id}`); toast.success('Deleted'); load(); } catch (err) { toast.error(err.message); }
  };

  const handleTypeChange = (type) => {
    const vt = VITAL_TYPES.find(v => v.key === type);
    setForm(f => ({ ...f, type, unit: vt?.unit || '' }));
  };

  // Chart data
  const activeType = VITAL_TYPES.find(v => v.key === (filter || 'bp'));
  const chartItems = items.filter(v => v.type === (filter || 'bp')).slice(0, 20).reverse();
  const chartData = {
    labels: chartItems.map(v => new Date(v.date).toLocaleDateString()),
    datasets: [{
      label: activeType?.label || '',
      data: chartItems.map(v => parseFloat(v.value.split('/')[0])),
      borderColor: activeType?.color || '#3b82f6',
      backgroundColor: (activeType?.color || '#3b82f6') + '20',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8b8fa8', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8b8fa8', font: { size: 11 } } },
    },
  };

  if (loading) return <div className="page-loader"><div className="loader" /></div>;

  return (
    <div className="page-vitals">
      <div className="page-header">
        <div><h1>Vitals</h1><p className="page-subtitle">Track and monitor your health metrics</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-vital-btn"><MdAdd /> Record Vital</button>
      </div>

      <div className="vitals-filters">
        <button className={`filter-chip ${filter === '' ? 'active' : ''}`} onClick={() => setFilter('')}>All</button>
        {VITAL_TYPES.map(vt => (
          <button key={vt.key} className={`filter-chip ${filter === vt.key ? 'active' : ''}`} onClick={() => setFilter(vt.key)}>{vt.label}</button>
        ))}
      </div>

      {chartItems.length > 1 && (
        <div className="vitals-chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state"><span className="empty-icon" style={{ fontSize: '2rem', opacity: 0.4 }}>—</span><h3>No vitals recorded</h3><p>Start tracking your health metrics</p></div>
      ) : (
        <div className="vitals-list">
          {items.map(item => {
            const vt = VITAL_TYPES.find(v => v.key === item.type);
            return (
              <div className="vital-item" key={item._id}>
                <div className="vital-info">
                  <h4 style={{ color: vt?.color }}>{vt?.label || item.type}</h4>
                  <div className="vital-value">{item.value}<span className="vital-unit">{item.unit || vt?.unit}</span></div>
                  <div className="vital-date">{new Date(item.date).toLocaleDateString()}{item.notes ? ` — ${item.notes}` : ''}</div>
                </div>
                <button className="icon-btn danger" onClick={() => handleDelete(item._id)}><MdDelete /></button>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Record Vital</h2><button className="icon-btn" onClick={resetForm}><MdClose /></button></div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select value={form.type} onChange={e => handleTypeChange(e.target.value)}>
                    {VITAL_TYPES.map(vt => <option key={vt.key} value={vt.key}>{vt.label}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Value</label><input value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required placeholder={form.type === 'bp' ? '120/80' : ''} /></div>
              </div>
              <div className="form-group"><label>Notes (optional)</label><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
              <div className="modal-actions"><button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button><button type="submit" className="btn btn-primary">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
