import React, { useState, useEffect } from 'react';
import { doctorsAPI } from '../api';
import api from '../api';

export default function Doctors() {
  const [departments, setDepts]   = useState([]);
  const [doctors, setDoctors]     = useState([]);
  const [clinics, setClinics]     = useState([]);
  const [selDept, setSelDept]     = useState(null);
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [showDocForm, setShowDocForm]   = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', clinic: '', description: '' });
  const [docForm, setDocForm]   = useState({ first_name: '', last_name: '', specialty: '', phone: '', email: '', clinic: '', department: '' });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [cl, de, do_] = await Promise.all([
      doctorsAPI.getClinics(),
      api.get('/doctors/departments/'),
      doctorsAPI.getAll(),
    ]);
    setClinics(cl.data.results || cl.data);
    setDepts(de.data.results || de.data);
    setDoctors(do_.data.results || do_.data);
  };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    await api.post('/doctors/departments/', deptForm);
    setShowDeptForm(false);
    setDeptForm({ name: '', clinic: '', description: '' });
    loadAll();
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    await api.post('/doctors/', { ...docForm, department: selDept?.id || docForm.department });
    setShowDocForm(false);
    setDocForm({ first_name: '', last_name: '', specialty: '', phone: '', email: '', clinic: '', department: '' });
    loadAll();
  };

  const specialties = ['نەخۆشی گشتی', 'نەخۆشی منداڵان', 'نەخۆشی دڵ', 'نەخۆشی چاو', 'نەخۆشی دەندان', 'نەخۆشی پێست', 'نەخۆشی هەڵقەلکی', 'کەسایەتی'];
  const deptDoctors = selDept ? doctors.filter(d => d.department === selDept.id) : [];

  return (
    <div style={{ padding: '1.5rem' }} dir="rtl">

      {/* سەردێڕ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e' }}>
          {selDept ? `بەشی ${selDept.name}` : 'نەخۆشخانە — بەشەکان'}
        </h2>
        <div style={{ display: 'flex', gap: 10 }}>
          {selDept && <button onClick={() => setSelDept(null)} style={btn('#f1f5f9', '#333')}>← گەڕانەوە</button>}
          {!selDept && <button onClick={() => setShowDeptForm(true)} style={btn('#534AB7', '#fff')}>+ بەشی نوێ</button>}
          {selDept && (
            <button onClick={() => {
              setDocForm(f => ({ ...f, department: selDept.id, clinic: selDept.clinic }));
              setShowDocForm(true);
            }} style={btn('#534AB7', '#fff')}>+ دکتۆری نوێ</button>
          )}
        </div>
      </div>

      {/* بەشەکان */}
      {!selDept && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {departments.map(d => (
            <div key={d.id} onClick={() => setSelDept(d)}
              style={{ background: '#fff', borderRadius: 14, padding: '1.5rem', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🏥</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 }}>{d.name}</div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>{d.clinic_name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#534AB7', background: '#EEEDFE', padding: '3px 10px', borderRadius: 20 }}>
                  {d.doctor_count} دکتۆر
                </span>
                <span style={{ fontSize: 12, color: '#888' }}>کلیک بکە ←</span>
              </div>
            </div>
          ))}
          {departments.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#aaa', padding: '3rem' }}>
              هیچ بەشێک نییە — بەشی نوێ زیاد بکە
            </div>
          )}
        </div>
      )}

      {/* دکتۆرەکانی بەش */}
      {selDept && (
        <div>
          <div style={{ background: '#EEEDFE', borderRadius: 10, padding: '1rem', marginBottom: 20, display: 'flex', gap: 20 }}>
            <span style={{ fontSize: 13, color: '#534AB7' }}>🏥 {selDept.clinic_name}</span>
            <span style={{ fontSize: 13, color: '#534AB7' }}>👨‍⚕️ {deptDoctors.length} دکتۆر</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {deptDoctors.map(d => (
              <div key={d.id} style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#534AB7', fontWeight: 600 }}>
                    {d.first_name?.[0]}{d.last_name?.[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{d.full_name}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{d.specialty}</div>
                  </div>
                </div>
                {d.phone && <div style={{ fontSize: 12, color: '#555' }}>📞 {d.phone}</div>}
                {d.email && <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>✉️ {d.email}</div>}
              </div>
            ))}
            {deptDoctors.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#aaa', padding: '2rem' }}>
                هیچ دکتۆرێک لەم بەشەدا نییە — دکتۆری نوێ زیاد بکە
              </div>
            )}
          </div>
        </div>
      )}

      {/* فۆرمی بەشی نوێ */}
      {showDeptForm && (
        <Modal onClose={() => setShowDeptForm(false)} title="زیادکردنی بەشی نوێ">
          <form onSubmit={handleDeptSubmit}>
            <Field label="ناوی بەش" value={deptForm.name} onChange={v => setDeptForm(f => ({ ...f, name: v }))} required />
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>کلینیک</label>
              <select style={inp} value={deptForm.clinic} onChange={e => setDeptForm(f => ({ ...f, clinic: e.target.value }))} required>
                <option value="">هەڵبژاردن...</option>
                {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Field label="وەسف (ئارەزوومەندانە)" value={deptForm.description} onChange={v => setDeptForm(f => ({ ...f, description: v }))} />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="submit" style={btn('#534AB7', '#fff')}>پاشەکەوتکردن</button>
              <button type="button" onClick={() => setShowDeptForm(false)} style={btn('#f1f5f9', '#333')}>هەڵوەشاندنەوە</button>
            </div>
          </form>
        </Modal>
      )}

      {/* فۆرمی دکتۆری نوێ */}
      {showDocForm && (
        <Modal onClose={() => setShowDocForm(false)} title={`زیادکردنی دکتۆر — ${selDept?.name ?? ''}`}>
          <form onSubmit={handleDocSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <Field label="ناوی یەکەم" value={docForm.first_name} onChange={v => setDocForm(f => ({ ...f, first_name: v }))} required />
              <Field label="ناوی کۆتایی" value={docForm.last_name} onChange={v => setDocForm(f => ({ ...f, last_name: v }))} required />
              <Field label="تەلەفۆن" value={docForm.phone} onChange={v => setDocForm(f => ({ ...f, phone: v }))} />
              <Field label="ئیمەیل" value={docForm.email} onChange={v => setDocForm(f => ({ ...f, email: v }))} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>پسپۆڕی</label>
              <select style={inp} value={docForm.specialty} onChange={e => setDocForm(f => ({ ...f, specialty: e.target.value }))} required>
                <option value="">هەڵبژاردن...</option>
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {!selDept && (
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>بەش</label>
                <select style={inp} value={docForm.department} onChange={e => setDocForm(f => ({ ...f, department: e.target.value }))}>
                  <option value="">هەڵبژاردن...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="submit" style={btn('#534AB7', '#fff')}>پاشەکەوتکردن</button>
              <button type="button" onClick={() => setShowDocForm(false)} style={btn('#f1f5f9', '#333')}>هەڵوەشاندنەوە</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ onClose, title, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '1.5rem', width: 500, maxHeight: '90vh', overflowY: 'auto', direction: 'rtl' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, required, type = 'text' }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={lbl}>{label}</label>
      <input type={type} style={inp} value={value} onChange={e => onChange(e.target.value)} required={required} />
    </div>
  );
}

const lbl = { display: 'block', fontSize: 12, color: '#555', marginBottom: 4 };
const inp = { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, boxSizing: 'border-box' };
const btn = (bg, color) => ({ background: bg, color, border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 14 });
