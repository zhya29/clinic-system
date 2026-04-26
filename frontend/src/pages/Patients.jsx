import React, { useState, useEffect } from 'react';
import { patientsAPI } from '../api';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', date_of_birth: '',
    gender: 'M', phone: '', blood_type: '', medical_history: '', allergies: '',
  });

  useEffect(() => {
    loadPatients();
  }, [search]);

  const loadPatients = async () => {
    try {
      const { data } = await patientsAPI.getAll(search);
      setPatients(data.results || data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await patientsAPI.create(form);
    setShowForm(false);
    setForm({ first_name: '', last_name: '', date_of_birth: '', gender: 'M', phone: '', blood_type: '', medical_history: '', allergies: '' });
    loadPatients();
  };

  const handleDelete = async (id) => {
    if (window.confirm('دڵنیای لە سڕینەوەی ئەم نەخۆشە؟')) {
      await patientsAPI.delete(id);
      loadPatients();
    }
  };

  return (
    <div style={styles.page} dir="rtl">
      <div style={styles.header}>
        <h2 style={styles.title}>نەخۆشەکان</h2>
        <button style={styles.addBtn} onClick={() => setShowForm(true)}>+ نەخۆشی نوێ</button>
      </div>

      <input
        style={styles.search}
        placeholder="گەڕان بە ناو یان تەلەفۆن..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {showForm && (
        <div style={styles.modal}>
          <div style={styles.modalCard}>
            <h3 style={{ marginBottom: 16 }}>زیادکردنی نەخۆشی نوێ</h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.grid2}>
                <Field label="ناوی یەکەم" value={form.first_name} onChange={v => setForm({ ...form, first_name: v })} required />
                <Field label="ناوی کۆتایی" value={form.last_name} onChange={v => setForm({ ...form, last_name: v })} required />
                <Field label="بەرواری لەدایکبوون" type="date" value={form.date_of_birth} onChange={v => setForm({ ...form, date_of_birth: v })} required />
                <Field label="تەلەفۆن" value={form.phone} onChange={v => setForm({ ...form, phone: v })} required />
              </div>
              <div style={styles.grid2}>
                <SelectField label="ڕەگەز" value={form.gender} onChange={v => setForm({ ...form, gender: v })}
                  options={[{ value: 'M', label: 'نێر' }, { value: 'F', label: 'مێ' }]} />
                <SelectField label="گرووپی خوێن" value={form.blood_type} onChange={v => setForm({ ...form, blood_type: v })}
                  options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => ({ value: b, label: b }))} />
              </div>
              <TextArea label="مێژووی نەخۆشی" value={form.medical_history} onChange={v => setForm({ ...form, medical_history: v })} />
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button style={styles.addBtn} type="submit">پاشەکەوتکردن</button>
                <button style={styles.cancelBtn} type="button" onClick={() => setShowForm(false)}>هەڵوەشاندنەوە</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <p style={{ textAlign: 'center', color: '#666' }}>بارکردن...</p> : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>ناو</th>
              <th style={styles.th}>تەمەن</th>
              <th style={styles.th}>ڕەگەز</th>
              <th style={styles.th}>تەلەفۆن</th>
              <th style={styles.th}>گرووپی خوێن</th>
              <th style={styles.th}>کردارەکان</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(p => (
              <tr key={p.id} style={styles.tr}>
                <td style={styles.td}><strong>{p.full_name}</strong></td>
                <td style={styles.td}>{p.age}</td>
                <td style={styles.td}>{p.gender === 'M' ? 'نێر' : 'مێ'}</td>
                <td style={styles.td}>{p.phone}</td>
                <td style={styles.td}><span style={styles.badge}>{p.blood_type || '—'}</span></td>
                <td style={styles.td}>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(p.id)}>سڕینەوە</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const Field = ({ label, value, onChange, type = 'text', required }) => (
  <div style={{ marginBottom: 12 }}>
    <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 4 }}>{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, boxSizing: 'border-box' }} />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: 12 }}>
    <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 4 }}>{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const TextArea = ({ label, value, onChange }) => (
  <div style={{ marginBottom: 12 }}>
    <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 4 }}>{label}</label>
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
  </div>
);

const styles = {
  page: { padding: '1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 600, color: '#1a1a2e' },
  addBtn: { background: '#534AB7', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 14 },
  cancelBtn: { background: '#f1f5f9', color: '#333', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 14 },
  search: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, marginBottom: 16, boxSizing: 'border-box', direction: 'rtl' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modalCard: { background: '#fff', borderRadius: 12, padding: '1.5rem', width: 520, maxHeight: '90vh', overflowY: 'auto' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  thead: { background: '#f8fafc' },
  th: { padding: '10px 12px', textAlign: 'right', color: '#666', fontWeight: 500, borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '10px 12px', color: '#333' },
  badge: { background: '#EEEDFE', color: '#534AB7', borderRadius: 20, padding: '2px 10px', fontSize: 12 },
  deleteBtn: { background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12 },
};
