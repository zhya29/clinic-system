import React, { useState, useEffect } from 'react';
import { doctorsAPI } from '../api';
import api from '../api';

export default function Doctors() {
  const [doctors, setDoctors]   = useState([]);
  const [clinics, setClinics]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', specialty: '', phone: '', email: '', clinic: '' });

  useEffect(() => {
    doctorsAPI.getAll().then(r => { setDoctors(r.data.results || r.data); setLoading(false); });
    doctorsAPI.getClinics().then(r => setClinics(r.data.results || r.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/doctors/', form);
    setShowForm(false);
    setForm({ first_name: '', last_name: '', specialty: '', phone: '', email: '', clinic: '' });
    doctorsAPI.getAll().then(r => setDoctors(r.data.results || r.data));
  };

  const specialties = ['نەخۆشی گشتی', 'نەخۆشی منداڵان', 'نەخۆشی دڵ', 'نەخۆشی چاو', 'نەخۆشی دەندان', 'نەخۆشی پێست', 'نەخۆشی هەڵقەلکی', 'کەسایەتی'];

  return (
    <div style={{ padding: '1.5rem' }} dir="rtl">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e' }}>دکتۆرەکان</h2>
        <button onClick={() => setShowForm(true)}
          style={{ background: '#534AB7', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 14 }}>
          + دکتۆری نوێ
        </button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', width: 480, direction: 'rtl' }}>
            <h3 style={{ marginBottom: 16 }}>زیادکردنی دکتۆری نوێ</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                {[['ناوی یەکەم','first_name'],['ناوی کۆتایی','last_name'],['تەلەفۆن','phone'],['ئیمەیل','email']].map(([lbl, key]) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 4 }}>{lbl}</label>
                    <input style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, boxSizing: 'border-box' }}
                      value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required={key === 'first_name' || key === 'last_name'} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 4 }}>پسپۆڕی</label>
                <select style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }}
                  value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} required>
                  <option value="">هەڵبژاردن...</option>
                  {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 4 }}>کلینیک</label>
                <select style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }}
                  value={form.clinic} onChange={e => setForm({ ...form, clinic: e.target.value })} required>
                  <option value="">هەڵبژاردن...</option>
                  {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" style={{ background: '#534AB7', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 14 }}>پاشەکەوتکردن</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', color: '#333', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 14 }}>هەڵوەشاندنەوە</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <p style={{ textAlign: 'center', color: '#888' }}>بارکردن...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {doctors.map(d => (
            <div key={d.id} style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#534AB7', fontWeight: 600 }}>
                  {d.first_name?.[0]}{d.last_name?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{d.full_name}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{d.clinic_name}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#555', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span>🩺 {d.specialty}</span>
                {d.phone && <span>📞 {d.phone}</span>}
                {d.email && <span>✉️ {d.email}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
