import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({ baseURL: API_URL });

// JWT token بەکاربهێنە بە ئۆتۆماتیک
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ئەگەر token بەسەرچووبێ، نوێی بکەرەوە
api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh/`, { refresh });
          localStorage.setItem('access_token', data.access);
          err.config.headers.Authorization = `Bearer ${data.access}`;
          return api(err.config);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (username, password) =>
    axios.post(`${API_URL}/auth/login/`, { username, password }),
};

export const patientsAPI = {
  getAll: (search = '') => api.get(`/patients/?search=${search}`),
  getOne: (id) => api.get(`/patients/${id}/`),
  create: (data) => api.post('/patients/', data),
  update: (id, data) => api.put(`/patients/${id}/`, data),
  delete: (id) => api.delete(`/patients/${id}/`),
  getStats: () => api.get('/patients/stats/'),
};

export const appointmentsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/appointments/?${params}`);
  },
  getToday: () => api.get('/appointments/today/'),
  create: (data) => api.post('/appointments/', data),
  update: (id, data) => api.put(`/appointments/${id}/`, data),
  getStats: () => api.get('/appointments/stats/'),
};

export const doctorsAPI = {
  getAll: () => api.get('/doctors/'),
  getClinics: () => api.get('/doctors/clinics/'),
};

export const paymentsAPI = {
  getAll:   (filters = {}) => { const p = new URLSearchParams(filters).toString(); return api.get(`/payments/?${p}`); },
  create:   (data) => api.post('/payments/', data),
  markPaid: (id)   => api.post(`/payments/${id}/mark_paid/`),
  refund:   (id)   => api.post(`/payments/${id}/refund/`),
  getStats: ()     => api.get('/payments/stats/'),
};

export default api;
