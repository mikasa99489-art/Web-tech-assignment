import { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { toast } from 'react-toastify';
import { MdAdd, MdDelete, MdClose, MdUploadFile, MdInsertDriveFile } from 'react-icons/md';

const CATEGORIES = ['lab-report', 'x-ray', 'insurance', 'prescription', 'other'];
const categoryColors = {
  'lab-report': 'var(--accent-blue)',
  'x-ray': 'var(--accent-purple)',
  insurance: 'var(--accent-green)',
  prescription: 'var(--accent-orange)',
  other: 'var(--text-muted)',
};

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export default function Documents() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('other');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const load = () => {
    api.get('/documents').then(setItems).catch(e => toast.error(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const resetForm = () => { setShowModal(false); setTitle(''); setCategory('other'); setFile(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.warn('Please select a file');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name);
      formData.append('category', category);
      await api.post('/documents', formData);
      toast.success('Document uploaded');
      resetForm(); load();
    } catch (err) { toast.error(err.message); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return;
    try { await api.delete(`/documents/${id}`); toast.success('Deleted'); load(); } catch (err) { toast.error(err.message); }
  };

  if (loading) return <div className="page-loader"><div className="loader" /></div>;

  return (
    <div className="page-documents">
      <div className="page-header">
        <div><h1>Documents</h1><p className="page-subtitle">Upload and manage your medical documents</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="upload-doc-btn"><MdAdd /> Upload</button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state"><MdInsertDriveFile style={{ fontSize: '2.5rem', opacity: 0.3 }} /><h3>No documents yet</h3><p>Upload your first medical document</p></div>
      ) : (
        <div className="card-grid">
          {items.map(item => (
            <div className="document-card" key={item._id}>
              <div className="doc-icon" style={{ background: (categoryColors[item.category] || 'var(--text-muted)') + '20', color: categoryColors[item.category] || 'var(--text-muted)' }}>
                <MdInsertDriveFile />
              </div>
              <div className="doc-info">
                <h4>{item.title}</h4>
                <div className="doc-meta">
                  <span className="doc-category" style={{ background: (categoryColors[item.category] || 'var(--text-muted)') + '20', color: categoryColors[item.category] }}>{item.category}</span>
                  <span>{formatSize(item.fileSize)}</span>
                  <span>{new Date(item.uploadDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="doc-actions">
                <button className="icon-btn danger" onClick={() => handleDelete(item._id)}><MdDelete /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Upload Document</h2><button className="icon-btn" onClick={resetForm}><MdClose /></button></div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="file-upload-zone" onClick={() => fileRef.current?.click()}>
                <MdUploadFile className="upload-icon" style={{ fontSize: '2rem', color: 'var(--text-muted)' }} />
                <p>{file ? '' : 'Click to select a file'}</p>
                {file && <p className="file-name">{file.name}</p>}
                <input ref={fileRef} type="file" hidden onChange={e => setFile(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
              </div>
              <div className="form-group"><label>Title</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Document title (optional)" /></div>
              <div className="form-group">
                <label>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('-', ' ')}</option>)}
                </select>
              </div>
              <div className="modal-actions"><button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button><button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
