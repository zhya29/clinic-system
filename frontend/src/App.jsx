import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Doctors from './pages/Doctors';
import Reports from './pages/Reports';
import Payments from './pages/Payments';
import { appointmentsAPI, patientsAPI } from './api';

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([appointmentsAPI.getStats(), patientsAPI.getStats()])
      .then(([appt, pat]) => setStats({ ...appt.data, ...pat.data }))
      .catch(() => {});
  }, []);

  return (
    <div style={{ padding: '1.5rem' }} dir="rtl">
      <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', marginBottom: 20 }}>داشبۆردی سەرەکی</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'کاتژمێری ئەمڕۆ', value: stats?.today_total ?? '—', color: '#534AB7' },
          { label: 'چاوەڕوان', value: stats?.today_waiting ?? '—', color: '#d97706' },
          { label: 'تەواوبوو', value: stats?.today_done ?? '—', color: '#059669' },
          { label: 'کۆی نەخۆشەکان', value: stats?.total ?? '—', color: '#0891b2' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: '1px solid #e2e8f0' }}>
        <p style={{ color: '#888', fontSize: 14 }}>بۆ بینینی زانیارییە تەواوەکان، بڕۆ بۆ بەشی نەخۆشەکان یان کاتژمێرەکان.</p>
      </div>
    </div>
  );
}

const NAV = [
  { key: 'dashboard', label: 'داشبۆرد', icon: '▦' },
  { key: 'patients', label: 'نەخۆشەکان', icon: '♡' },
  { key: 'appointments', label: 'کاتژمێرەکان', icon: '◷' },
  { key: 'doctors', label: 'دکتۆرەکان', icon: '✚' },
  { key: 'reports', label: 'راپۆرتەکان', icon: '▣' },
  { key: 'payments', label: 'پارەدانەکان', icon: '$' },
];

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('access_token'));
  const [page, setPage] = useState('dashboard');

  const logout = () => {
    localStorage.clear();
    setAuthed(false);
  };

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  const renderPage = () => {
    if (page === 'dashboard')    return <Dashboard />;
    if (page === 'patients')     return <Patients />;
    if (page === 'appointments') return <Appointments />;
    if (page === 'doctors')      return <Doctors />;
    if (page === 'reports')      return <Reports />;
    if (page === 'payments')     return <Payments />;
    return null;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8', fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: '#1a1a2e', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }} dir="rtl">🏥 کلینیک سیستەم</div>
        </div>
        <nav style={{ flex: 1, padding: '0.5rem 0' }} dir="rtl">
          {NAV.map(n => (
            <div key={n.key} onClick={() => setPage(n.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 1rem', cursor: 'pointer', fontSize: 14,
                color: page === n.key ? '#fff' : 'rgba(255,255,255,0.55)',
                background: page === n.key ? 'rgba(255,255,255,0.08)' : 'transparent',
                borderRight: page === n.key ? '3px solid #7F77DD' : '3px solid transparent',
              }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span> {n.label}
            </div>
          ))}
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={logout}
            style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 13 }}
            dir="rtl">
            چوونەدەرەوە
          </button>
        </div>
      </div>
      {/* Main */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {renderPage()}
      </div>
    </div>
  );
}
