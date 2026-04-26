import React, { useState } from 'react';
import { authAPI } from '../api';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await authAPI.login(form.username, form.password);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      onLogin();
    } catch {
      setError('ناوی بەکارهێنەر یان پاسوۆرد هەڵەیە');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🏥</div>
        <h1 style={styles.title}>سیستەمی کلینیک</h1>
        <p style={styles.sub}>تکایە زانیارییەکانت داخڵ بکە</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>ناوی بەکارهێنەر</label>
            <input
              style={styles.input}
              type="text"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="username"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>پاسوۆرد</label>
            <input
              style={styles.input}
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'چاوەڕوان بە...' : 'چوونەژوورەوە'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#f0f4f8', direction: 'rtl',
  },
  card: {
    background: '#fff', borderRadius: 16, padding: '2.5rem',
    width: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    textAlign: 'center',
  },
  logo: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 600, color: '#1a1a2e', margin: '0 0 6px' },
  sub: { color: '#666', fontSize: 14, marginBottom: 24 },
  error: {
    background: '#fee2e2', color: '#dc2626', borderRadius: 8,
    padding: '10px 14px', fontSize: 13, marginBottom: 16,
  },
  field: { marginBottom: 16, textAlign: 'right' },
  label: { display: 'block', fontSize: 13, color: '#444', marginBottom: 6, fontWeight: 500 },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none',
    boxSizing: 'border-box', direction: 'ltr',
  },
  btn: {
    width: '100%', padding: '12px', borderRadius: 8,
    background: '#534AB7', color: '#fff', border: 'none',
    fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8,
  },
};
