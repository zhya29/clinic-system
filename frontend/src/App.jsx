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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'کاتژمێری ئەمڕۆ', value: stats?.today_total ?? '—', color: '#534AB7' },
          { label: 'چاوەڕوان', value: stats?.today_waiting ?? '—', color: '#d97706' },
          { label: 'تەواوبوو', value: stats?.today_done ?? '—', color: '#059669' },
          { label: 'کۆی نەخۆشەکان', value: stats?.total ?? '—', color: '#0891b2' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '1rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const NAV = [
  { key: 'dashboard',    label: 'داشبۆرد',    icon: '▦' },
  { key: 'patients',     label: 'نەخۆشەکان',  icon: '♡' },
  { key: 'appointments', label: 'کاتژمێر',    icon: '◷' },
  { key: 'doctors',      label: 'دکتۆرەکان',  icon: '✚' },
  { key: 'payments',     label: 'پارەدان',    icon: '$' },
  { key: 'reports',      label: 'راپۆرت',     icon: '▣' },
];

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('access_token'));
  const [page, setPage]     = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const logout = () => { localStorage.clear(); setAuthed(false); };

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

      {/* Sidebar — Desktop */}
      {!isMobile && (
        <div style={{ width: 220, background: '#1a1a2e', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }} dir="rtl">🏥 کلینیکی ژیا</div>
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
            <button onClick={logout} dir="rtl"
              style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 13 }}>
              چوونەدەرەوە
            </button>
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: isMobile ? 70 : 0 }}>
        {/* هێدەری مۆبایل */}
        {isMobile && (
          <div style={{ background: '#1a1a2e', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
            <span style={{ fontSize: 20 }}>🏥</span>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>کلینیکی ژیا</span>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer' }}>خروج</button>
          </div>
        )}
        {renderPage()}
      </div>

      {/* Bottom Nav — مۆبایل */}
      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#1a1a2e', display: 'flex',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          zIndex: 100, height: 65,
        }}>
          {NAV.map(n => (
            <div key={n.key} onClick={() => setPage(n.key)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 2,
                cursor: 'pointer', padding: '6px 2px',
                color: page === n.key ? '#9B8FFF' : 'rgba(255,255,255,0.45)',
                borderTop: page === n.key ? '2px solid #9B8FFF' : '2px solid transparent',
              }}>
              <span style={{ fontSize: 18 }}>{n.icon}</span>
              <span style={{ fontSize: 9 }}>{n.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
