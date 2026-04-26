import React, { useState, useEffect } from 'react';
import { appointmentsAPI, patientsAPI, doctorsAPI } from '../api';

const STATUS_MAP = {
  waiting:   { label: 'چاوەڕوان', bg: '#fef3c7', color: '#92400e' },
  active:    { label: 'چالاک',    bg: '#d1fae5', color: '#065f46' },
  done:      { label: 'تەواو',    bg: '#f1f5f9', color: '#475569' },
  cancelled: { label: 'هەڵوەشاوە', bg: '#fee2e2', color: '#991b1b' },
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients]         = useState([]);
  const [doctors, setDoctors]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [filterDate, setFilterDate]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({
    patient: '', doctor: '', date: '', time: '',
    notes: '', diagnosis: '', prescription: '', fee: '', is_paid: false,
  });

  useEffect(() => {
    loadAll();
    patientsAPI.getAll().then(r => setPatients(r.data.results || r.data));
    doctorsAPI.getAll().then(r => setDoctors(r.data.results || r.data));
  }, [filterDate, filterStatus]);

  const loadAll = async () => {
    setLoading(true);
    const filters = {};
    if (filterDate)   filters.date   = filterDate;
    if (filterStatus) filters.status = filterStatus;
    const { data } = await appointmentsAPI.getAll(filters);
    setAppointments(data.results || data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await appointmentsAPI.create({ ...form, fee: form.fee || 0 });
    setShowForm(false);
    setForm({ patient: '', doctor: '', date: '', time: '', notes: '', diagnosis: '', prescription: '', fee: '', is_paid: false });
    loadAll();
  };

  const updateStatus = async (id, status) => {
    await appointmentsAPI.update(id, { status });
    loadAll();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={s.page} dir="rtl">
      <div style={s.header}>
        <h2 style={s.title}>کاتژمێرەکان</h2>
        <button style={s.addBtn} onClick={() => { setForm(f => ({ ...f, date: today })); setShowForm(true); }}>
          + کاتژمێری نوێ
        </button>
      </div>

      {/* فیلتەرەکان */}
      <div style={s.filters}>
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
          style={s.filterInput} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={s.filterInput}>
          <option value="">هەموو بارودۆخەکان</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button style={s.todayBtn} onClick={() => { setFilterDate(today); setFilterStatus(''); }}>
          ئەمڕۆ
        </button>
        <button style={s.clearBtn} onClick={() => { setFilterDate(''); setFilterStatus(''); }}>
          پاکخستنەوە
        </button>
      </div>

      {/* فۆرمی نوێ */}
      {showForm && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={{ marginBottom: 16, fontSize: 16 }}>زیادکردنی کاتژمێری نوێ</h3>
            <form onSubmit={handleSubmit}>
              <div style={s.grid2}>
                <div>
                  <label style={s.label}>نەخۆش</label>
                  <select style={s.input} value={form.patient} onChange={e => setForm({ ...form, patient: e.target.value })} required>
                    <option value="">هەڵبژاردن...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>دکتۆر</label>
                  <select style={s.input} value={form.doctor} onChange={e => setForm({ ...form, doctor: e.target.value })} required>
                    <option value="">هەڵبژاردن...</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>بەروار</label>
                  <input type="date" style={s.input} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div>
                  <label style={s.label}>کاتژمێر</label>
                  <input type="time" style={s.input} value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required />
                </div>
                <div>
                  <label style={s.label}>کرێ ($)</label>
                  <input type="number" style={s.input} value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })} placeholder="0" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 20 }}>
                  <input type="checkbox" id="paid" checked={form.is_paid} onChange={e => setForm({ ...form, is_paid: e.target.checked })} />
                  <label htmlFor="paid" style={{ fontSize: 13 }}>پارەدراوە</label>
                </div>
              </div>
              <div>
                <label style={s.label}>تێبینی</label>
                <textarea style={{ ...s.input, resize: 'vertical' }} rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div style={s.grid2}>
                <div>
                  <label style={s.label}>دیاریکردنی نەخۆشی</label>
                  <textarea style={{ ...s.input, resize: 'vertical' }} rows={2} value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} />
                </div>
                <div>
                  <label style={s.label}>دەرمان</label>
                  <textarea style={{ ...s.input, resize: 'vertical' }} rows={2} value={form.prescription} onChange={e => setForm({ ...form, prescription: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button style={s.addBtn} type="submit">پاشەکەوتکردن</button>
                <button style={s.cancelBtn} type="button" onClick={() => setShowForm(false)}>هەڵوەشاندنەوە</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* لیستی کاتژمێرەکان */}
      {loading ? <p style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>بارکردن...</p> : (
        appointments.length === 0
          ? <div style={s.empty}>هیچ کاتژمێرێک نەدۆزرایەوە</div>
          : <div style={s.cards}>
              {appointments.map(a => (
                <div key={a.id} style={s.card}>
                  <div style={s.cardTop}>
                    <div>
                      <div style={s.patientName}>{a.patient_name}</div>
                      <div style={s.doctorName}>{a.doctor_name}</div>
                    </div>
                    <span style={{ ...s.statusBadge, background: STATUS_MAP[a.status].bg, color: STATUS_MAP[a.status].color }}>
                      {STATUS_MAP[a.status].label}
                    </span>
                  </div>
                  <div style={s.cardMid}>
                    <span>📅 {a.date}</span>
                    <span>⏰ {a.time?.slice(0,5)}</span>
                    <span style={{ color: a.is_paid ? '#059669' : '#dc2626' }}>
                      💵 ${a.fee} {a.is_paid ? '✓' : '✗'}
                    </span>
                  </div>
                  {a.notes && <div style={s.notes}>{a.notes}</div>}
                  {a.status !== 'done' && a.status !== 'cancelled' && (
                    <div style={s.actions}>
                      {a.status === 'waiting' && (
                        <button style={s.actionBtn('#d1fae5', '#065f46')} onClick={() => updateStatus(a.id, 'active')}>
                          چالاک بکە
                        </button>
                      )}
                      {a.status === 'active' && (
                        <button style={s.actionBtn('#e0e7ff', '#3730a3')} onClick={() => updateStatus(a.id, 'done')}>
                          تەواو بکە
                        </button>
                      )}
                      <button style={s.actionBtn('#fee2e2', '#991b1b')} onClick={() => updateStatus(a.id, 'cancelled')}>
                        هەڵوەشاندنەوە
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
      )}
    </div>
  );
}

const s = {
  page:        { padding: '1.5rem' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title:       { fontSize: 20, fontWeight: 600, color: '#1a1a2e' },
  addBtn:      { background: '#534AB7', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 14 },
  cancelBtn:   { background: '#f1f5f9', color: '#333', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 14 },
  filters:     { display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  filterInput: { padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, direction: 'rtl' },
  todayBtn:    { padding: '8px 14px', borderRadius: 8, border: '1.5px solid #534AB7', color: '#534AB7', background: 'transparent', cursor: 'pointer', fontSize: 13 },
  clearBtn:    { padding: '8px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', color: '#888', background: 'transparent', cursor: 'pointer', fontSize: 13 },
  overlay:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:       { background: '#fff', borderRadius: 12, padding: '1.5rem', width: 560, maxHeight: '90vh', overflowY: 'auto', direction: 'rtl' },
  grid2:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  label:       { display: 'block', fontSize: 12, color: '#555', marginBottom: 4 },
  input:       { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, boxSizing: 'border-box' },
  cards:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 },
  card:        { background: '#fff', borderRadius: 12, padding: '1rem', border: '1px solid #e2e8f0' },
  cardTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  patientName: { fontWeight: 600, fontSize: 15, color: '#1a1a2e' },
  doctorName:  { fontSize: 12, color: '#888', marginTop: 2 },
  statusBadge: { fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 500 },
  cardMid:     { display: 'flex', gap: 14, fontSize: 12, color: '#555', marginBottom: 8 },
  notes:       { fontSize: 12, color: '#666', background: '#f8fafc', borderRadius: 6, padding: '6px 8px', marginBottom: 8 },
  actions:     { display: 'flex', gap: 8 },
  actionBtn:   (bg, color) => ({ background: bg, color, border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12 }),
  empty:       { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 15 },
};
