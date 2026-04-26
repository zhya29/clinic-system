import React, { useState, useEffect, useRef } from 'react';
import { paymentsAPI, patientsAPI, appointmentsAPI } from '../api';

const STATUS = {
  paid:     { label: 'پارەدراوە', bg: '#d1fae5', color: '#065f46' },
  pending:  { label: 'چاوەڕوان',  bg: '#fef3c7', color: '#92400e' },
  refunded: { label: 'گەڕاوەتەوە', bg: '#fee2e2', color: '#991b1b' },
};
const METHODS = { cash: 'کاش', card: 'کارتی بانکی', online: 'ئۆنلاین' };

export default function Payments() {
  const [payments, setPayments]     = useState([]);
  const [patients, setPatients]     = useState([]);
  const [appts, setAppts]           = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [invoice, setInvoice]       = useState(null);
  const [form, setForm] = useState({ patient: '', appointment: '', amount: '', method: 'cash', notes: '' });
  const printRef = useRef();

  useEffect(() => {
    load();
    patientsAPI.getAll().then(r => setPatients(r.data.results || r.data));
    paymentsAPI.getStats().then(r => setStats(r.data));
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await paymentsAPI.getAll();
    setPayments(data.results || data);
    setLoading(false);
  };

  const onPatientChange = async (pid) => {
    setForm(f => ({ ...f, patient: pid, appointment: '' }));
    if (pid) {
      const { data } = await appointmentsAPI.getAll({ patient: pid, status: 'done' });
      setAppts(data.results || data);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const { data } = await paymentsAPI.create(form);
    await paymentsAPI.markPaid(data.id);
    setShowForm(false);
    setForm({ patient: '', appointment: '', amount: '', method: 'cash', notes: '' });
    load();
    paymentsAPI.getStats().then(r => setStats(r.data));
  };

  const handleRefund = async (id) => {
    if (window.confirm('دڵنیای لە گەڕاندنەوەی پارە؟')) {
      await paymentsAPI.refund(id);
      load();
    }
  };

  const printInvoice = (p) => {
    setInvoice(p);
    setTimeout(() => {
      const w = window.open('', '_blank', 'width=600,height=700');
      w.document.write(`
        <!DOCTYPE html><html dir="rtl"><head>
        <meta charset="utf-8">
        <title>فاکتوور ${p.invoice_no}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #1a1a2e; }
          .header { text-align: center; border-bottom: 2px solid #534AB7; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 28px; }
          .clinic { font-size: 20px; font-weight: 700; color: #534AB7; margin: 8px 0 4px; }
          .inv-no { font-size: 13px; color: #888; }
          .section { margin-bottom: 20px; }
          .label { font-size: 12px; color: #888; margin-bottom: 4px; }
          .value { font-size: 15px; font-weight: 500; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
          .total { font-size: 20px; font-weight: 700; color: #534AB7; }
          .badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 13px; background: #d1fae5; color: #065f46; }
          .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #aaa; }
          @media print { button { display: none; } }
        </style></head><body>
        <div class="header">
          <div class="logo">🏥</div>
          <div class="clinic">سیستەمی کلینیک</div>
          <div class="inv-no">فاکتوور ${p.invoice_no}</div>
        </div>
        <div class="section">
          <div class="row"><span class="label">ناوی نەخۆش</span><span class="value">${p.patient_name}</span></div>
          <div class="row"><span class="label">دکتۆر</span><span class="value">${p.doctor_name || '—'}</span></div>
          <div class="row"><span class="label">بەروار</span><span class="value">${p.appointment_date || '—'}</span></div>
          <div class="row"><span class="label">شێوازی پارەدان</span><span class="value">${METHODS[p.method]}</span></div>
          <div class="row"><span class="label">بارودۆخ</span><span><span class="badge">${STATUS[p.status].label}</span></span></div>
        </div>
        <div class="row" style="margin-top:16px">
          <span style="font-size:16px;font-weight:600">کۆی گشتی</span>
          <span class="total">$${p.amount}</span>
        </div>
        ${p.notes ? `<div style="margin-top:16px;background:#f8fafc;padding:12px;border-radius:8px;font-size:13px;color:#666">${p.notes}</div>` : ''}
        <div class="footer">سپاس بۆ باوەڕتان — ${new Date().toLocaleDateString('ku')}</div>
        <br><button onclick="window.print()" style="padding:10px 24px;background:#534AB7;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px">🖨️ پرینت</button>
        </body></html>
      `);
      w.document.close();
    }, 100);
  };

  return (
    <div style={{ padding: '1.5rem' }} dir="rtl">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e' }}>پارەدان و فاکتوورەکان</h2>
        <button onClick={() => setShowForm(true)}
          style={{ background: '#534AB7', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 14 }}>
          + پارەدانی نوێ
        </button>
      </div>

      {/* ئامارەکان */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { l: 'داهاتی ئەمڕۆ',    v: `$${stats.today_revenue.toFixed(0)}`, c: '#059669' },
            { l: 'کۆی داهات',       v: `$${stats.total_revenue.toFixed(0)}`, c: '#534AB7' },
            { l: 'پارەدراوە',        v: stats.paid_count,    c: '#0891b2' },
            { l: 'چاوەڕواندەکەن',   v: stats.pending_count, c: '#d97706' },
          ].map(s => (
            <div key={s.l} style={{ background: '#fff', borderRadius: 10, padding: '1rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>
      )}

      {/* فۆرمی نوێ */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', width: 480, direction: 'rtl' }}>
            <h3 style={{ marginBottom: 16 }}>تۆمارکردنی پارەدانی نوێ</h3>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>نەخۆش</label>
                <select style={inp} value={form.patient} onChange={e => onPatientChange(e.target.value)} required>
                  <option value="">هەڵبژاردن...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
              </div>
              {appts.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <label style={lbl}>کاتژمێر (ئارەزوومەندانە)</label>
                  <select style={inp} value={form.appointment} onChange={e => setForm(f => ({ ...f, appointment: e.target.value }))}>
                    <option value="">بەبێ کاتژمێر</option>
                    {appts.map(a => <option key={a.id} value={a.id}>{a.date} — {a.doctor_name}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={lbl}>بڕی پارە ($)</label>
                  <input style={inp} type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required min="0" />
                </div>
                <div>
                  <label style={lbl}>شێوازی پارەدان</label>
                  <select style={inp} value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
                    {Object.entries(METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>تێبینی</label>
                <textarea style={{ ...inp, resize: 'vertical' }} rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" style={{ background: '#534AB7', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 14 }}>پارەدان تۆماربکە</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', color: '#333', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 14 }}>هەڵوەشاندنەوە</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* لیست */}
      {loading ? <p style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>بارکردن...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['فاکتوور', 'نەخۆش', 'بڕ', 'شێواز', 'بارودۆخ', 'بەروار', 'کردارەکان'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'right', color: '#666', fontWeight: 500, borderBottom: '1px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={td}><span style={{ color: '#534AB7', fontWeight: 500 }}>{p.invoice_no}</span></td>
                <td style={td}>{p.patient_name}</td>
                <td style={td}><strong>${p.amount}</strong></td>
                <td style={td}>{METHODS[p.method]}</td>
                <td style={td}><span style={{ ...badge, background: STATUS[p.status].bg, color: STATUS[p.status].color }}>{STATUS[p.status].label}</span></td>
                <td style={td}>{p.created_at?.slice(0, 10)}</td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => printInvoice(p)} style={actBtn('#e0e7ff', '#3730a3')}>🖨️ فاکتوور</button>
                    {p.status === 'paid' && (
                      <button onClick={() => handleRefund(p.id)} style={actBtn('#fee2e2', '#991b1b')}>گەڕاندنەوە</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const lbl = { display: 'block', fontSize: 12, color: '#555', marginBottom: 4 };
const inp = { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, boxSizing: 'border-box' };
const td  = { padding: '10px 12px', color: '#333', verticalAlign: 'middle' };
const badge = { fontSize: 11, padding: '3px 10px', borderRadius: 20 };
const actBtn = (bg, color) => ({ background: bg, color, border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 11 });
