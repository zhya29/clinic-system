import React, { useState, useEffect } from 'react';
import { appointmentsAPI, patientsAPI, doctorsAPI } from '../api';

const STATUS_MAP = {
  waiting:   { label: 'چاوەڕوان', bg: '#fef3c7', color: '#92400e' },
  active:    { label: 'چالاک',    bg: '#d1fae5', color: '#065f46' },
  done:      { label: 'تەواو',    bg: '#f1f5f9', color: '#475569' },
  cancelled: { label: 'هەڵوەشاوە', bg: '#fee2e2', color: '#991b1b' },
};

const emptyForm = {
  patient: '', doctor: '', date: '', time: '09:00',
  notes: '', diagnosis: '', prescription: '', fee: '0', is_paid: false, status: 'waiting',
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients]         = useState([]);
  const [doctors, setDoctors]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [filterDate, setFilterDate]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm]                 = useState(emptyForm);
  const [error, setError]               = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { loadAll(); }, [filterDate, filterStatus]);

  useEffect(() => {
    patientsAPI.getAll().then(r => setPatients(r.data.results || r.data)).catch(() => {});
    doctorsAPI.getAll().then(r => setDoctors(r.data.results || r.data)).catch(() => {});
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filterDate)   filters.date   = filterDate;
      if (filterStatus) filters.status = filterStatus;
      const { data } = await appointmentsAPI.getAll(filters);
      setAppointments(data.results || data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // دڵنیابە هەموو پێداویستییەکان هەن
    if (!form.patient || !form.doctor || !form.date || !form.time) {
      setError('تکایە هەموو خانە پێویستەکان پڕبکەرەوە');
      return;
    }

    const payload = {
      patient:      parseInt(form.patient),
      doctor:       parseInt(form.doctor),
      date:         form.date,
      time:         form.time + ':00',
      status:       form.status,
      notes:        form.notes,
      diagnosis:    form.diagnosis,
      prescription: form.prescription,
      fee:          parseFloat(form.fee) || 0,
      is_paid:      form.is_paid,
    };

    try {
      await appointmentsAPI.create(payload);
      setShowForm(false);
      setForm(emptyForm);
      loadAll();
    } catch (err) {
      const data = err.response?.data;
      setError(JSON.stringify(data) || 'هەڵەیەک ڕوویدا');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await appointmentsAPI.update(id, { status });
      loadAll();
    } catch (e) { console.log(e); }
  };

  return (
    <div style={s.page} dir="rtl">
      <div style={s.header}>
        <h2 style={s.title}>کاتژمێرەکان</h2>
        <button style={s.addBtn} onClick={() => { setForm({ ...emptyForm, date: today }); setShowForm(true); }}>
          + کاتژمێری نوێ
        </button>
      </div>

      {/* فیلتەرەکان */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
          style={s.filterInput} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={s.filterInput}>
          <option value="">هەموو بارودۆخەکان</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button style={s.todayBtn} onClick={() => { setFilterDate(today); setFilterStatus(''); }}>ئەمڕۆ</button>
        <button style={s.clearBtn} onClick={() => { setFilterDate(''); setFilterStatus(''); }}>پاکخستنەوە</button>
      </div>

      {/* فۆرمی نوێ */}
      {showForm && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>کاتژمێری نوێ</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            {error && (
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={s.grid2}>
                {/* نەخۆش */}
                <div>
                  <label style={s.lbl}>نەخۆش *</label>
                  <select style={s.inp} value={form.patient} onChange={e => setForm(f => ({ ...f, patient: e.target.value }))} required>
                    <option value="">هەڵبژاردن...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                </div>
                {/* دکتۆر */}
                <div>
                  <label style={s.lbl}>دکتۆر *</label>
                  <select style={s.inp} value={form.doctor} onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))} required>
                    <option value="">هەڵبژاردن...</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                  </select>
                </div>
                {/* بەروار */}
                <div>
                  <label style={s.lbl}>بەروار *</label>
                  <input type="date" style={s.inp} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
                {/* کاتژمێر */}
                <div>
                  <label style={s.lbl}>کاتژمێر *</label>
                  <input type="time" style={s.inp} value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} required />
                </div>
                {/* کرێ */}
                <div>
                  <label style={s.lbl}>کرێ ($)</label>
                  <input type="number" style={s.inp} value={form.fee} onChange={e => setForm(f => ({ ...f, fee: e.target.value }))} min="0" />
                </div>
                {/* پارەدراوە */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 22 }}>
                  <input type="checkbox" id="paid" checked={form.is_paid} onChange={e => setForm(f => ({ ...f, is_paid: e.target.checked }))} />
                  <label htmlFor="paid" style={{ fontSize: 13 }}>پارەدراوە</label>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={s.lbl}>تێبینی</label>
                <textarea style={{ ...s.inp, resize: 'vertical' }} rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>

              <div style={s.grid2}>
                <div>
                  <label style={s.lbl}>دیاریکردنی نەخۆشی</label>
                  <textarea style={{ ...s.inp, resize: 'vertical' }} rows={2} value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} />
                </div>
                <div>
                  <label style={s.lbl}>دەرمان</label>
                  <textarea style={{ ...s.inp, resize: 'vertical' }} rows={2} value={form.prescription} onChange={e => setForm(f => ({ ...f, prescription: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="submit" style={s.addBtn}>پاشەکەوتکردن</button>
                <button type="button" onClick={() => setShowForm(false)} style={s.cancelBtn}>هەڵوەشاندنەوە</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* لیستی کاتژمێرەکان */}
      {loading
        ? <p style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>بارکردن...</p>
        : appointments.length === 0
          ? <div style={{ textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 15 }}>هیچ کاتژمێرێک نەدۆزرایەوە</div>
          : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
              {appointments.map(a => {
                const st = STATUS_MAP[a.status] ?? STATUS_MAP.waiting;
                return (
                  <div key={a.id} style={{ background: '#fff', borderRadius: 12, padding: '1rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15, color: '#1a1a2e' }}>{a.patient_name}</div>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{a.doctor_name}</div>
                      </div>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color, fontWeight: 500 }}>
                        {st.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#555', marginBottom: 8 }}>
                      <span>📅 {a.date}</span>
                      <span>⏰ {a.time?.slice(0, 5)}</span>
                      <span style={{ color: a.is_paid ? '#059669' : '#dc2626' }}>💵 ${a.fee}</span>
                    </div>
                    {a.notes && <div style={{ fontSize: 12, color: '#666', background: '#f8fafc', borderRadius: 6, padding: '6px 8px', marginBottom: 8 }}>{a.notes}</div>}
                    {a.status !== 'done' && a.status !== 'cancelled' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        {a.status === 'waiting' && (
                          <button style={{ background: '#d1fae5', color: '#065f46', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}
                            onClick={() => updateStatus(a.id, 'active')}>چالاک بکە</button>
                        )}
                        {a.status === 'active' && (
                          <button style={{ background: '#e0e7ff', color: '#3730a3', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}
                            onClick={() => updateStatus(a.id, 'done')}>تەواو بکە</button>
                        )}
                        <button style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}
                          onClick={() => updateStatus(a.id, 'cancelled')}>هەڵوەشاندنەوە</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
      }
    </div>
  );
}

const s = {
  page:        { padding: '1.5rem' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title:       { fontSize: 20, fontWeight: 600, color: '#1a1a2e' },
  addBtn:      { background: '#534AB7', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 14 },
  cancelBtn:   { background: '#f1f5f9', color: '#333', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 14 },
  filterInput: { padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13 },
  todayBtn:    { padding: '8px 14px', borderRadius: 8, border: '1.5px solid #534AB7', color: '#534AB7', background: 'transparent', cursor: 'pointer', fontSize: 13 },
  clearBtn:    { padding: '8px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', color: '#888', background: 'transparent', cursor: 'pointer', fontSize: 13 },
  overlay:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:       { background: '#fff', borderRadius: 12, padding: '1.5rem', width: 560, maxHeight: '90vh', overflowY: 'auto', direction: 'rtl' },
  grid2:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  lbl:         { display: 'block', fontSize: 12, color: '#555', marginBottom: 4 },
  inp:         { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, boxSizing: 'border-box' },
};
