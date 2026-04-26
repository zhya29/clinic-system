import React, { useState, useEffect, useRef } from 'react';
import { appointmentsAPI, patientsAPI } from '../api';

export default function Reports() {
  const [stats, setStats]         = useState(null);
  const [patStats, setPatStats]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const barRef  = useRef(null);
  const pieRef  = useRef(null);
  const barChart = useRef(null);
  const pieChart = useRef(null);

  useEffect(() => {
    Promise.all([appointmentsAPI.getStats(), patientsAPI.getStats()])
      .then(([a, p]) => {
        setStats(a.data);
        setPatStats(p.data);
      })
      .finally(() => setLoading(false));
  }, []);

  // بار چارت — کاتژمێرەکانی ئەمڕۆ بە بارودۆخ
  useEffect(() => {
    if (!stats || !barRef.current) return;
    if (barChart.current) barChart.current.destroy();
    const ctx = barRef.current.getContext('2d');
    barChart.current = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['چاوەڕوان', 'تەواوبوو', 'کۆی ئەمڕۆ'],
        datasets: [{
          label: 'کاتژمێر',
          data: [stats.today_waiting, stats.today_done, stats.today_total],
          backgroundColor: ['#fbbf24', '#34d399', '#818cf8'],
          borderRadius: 8,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    });
  }, [stats]);

  // پای چارت — نەخۆش بە ڕەگەز
  useEffect(() => {
    if (!patStats || !pieRef.current) return;
    if (pieChart.current) pieChart.current.destroy();
    const ctx = pieRef.current.getContext('2d');
    pieChart.current = new window.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['نێر', 'مێ'],
        datasets: [{
          data: [patStats.male, patStats.female],
          backgroundColor: ['#818cf8', '#f472b6'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        cutout: '65%',
        plugins: { legend: { position: 'bottom' } },
      },
    });
  }, [patStats]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }} dir="rtl">بارکردن...</div>;

  const cards = [
    { label: 'کۆی نەخۆشەکان',      value: patStats?.total ?? 0,        color: '#534AB7' },
    { label: 'نەخۆشی ئەم مانگە',    value: patStats?.new_this_month ?? 0, color: '#0891b2' },
    { label: 'کاتژمێری ئەمڕۆ',      value: stats?.today_total ?? 0,     color: '#059669' },
    { label: 'داهاتی ئەمڕۆ ($)',     value: `$${stats?.today_revenue ?? 0}`, color: '#d97706' },
  ];

  return (
    <div style={{ padding: '1.5rem' }} dir="rtl">
      <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', marginBottom: 20 }}>راپۆرت و ئامارەکان</h2>

      {/* کارتی ژمارەکان */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* چارتەکان */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: '#555', marginBottom: 16 }}>کاتژمێرەکانی ئەمڕۆ بە بارودۆخ</h3>
          <canvas ref={barRef} height={200} />
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: '#555', marginBottom: 16 }}>نەخۆشەکان بە ڕەگەز</h3>
          <canvas ref={pieRef} height={200} />
        </div>
      </div>

      {/* تێبینی */}
      <div style={{ marginTop: 20, background: '#fffbeb', borderRadius: 10, padding: '1rem', border: '1px solid #fde68a', fontSize: 13, color: '#92400e' }}>
        💡 بۆ راپۆرتی زیاتر (هەفتانە، مانگانە، ساڵانە) پەیوەستمان پێ بکە تا زیاد بکەین.
      </div>
    </div>
  );
}
