import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ئەمەی ئیپی سێرڤەرەکەت لێرە بنووسە
const BASE_URL = 'http://192.168.1.100:8000/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      const refresh = await AsyncStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, { refresh });
          await AsyncStorage.setItem('access_token', data.access);
          err.config.headers.Authorization = `Bearer ${data.access}`;
          return api(err.config);
        } catch {
          await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        }
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (u, p) => axios.post(`${BASE_URL}/auth/login/`, { username: u, password: p }),
};
export const patientsAPI = {
  getAll:  (s = '') => api.get(`/patients/?search=${s}`),
  getOne:  (id)     => api.get(`/patients/${id}/`),
  getStats: ()      => api.get('/patients/stats/'),
};
export const appointmentsAPI = {
  getToday: () => api.get('/appointments/today/'),
  getStats: () => api.get('/appointments/stats/'),
  getAll:   (f = {}) => { const p = new URLSearchParams(f).toString(); return api.get(`/appointments/?${p}`); },
  update:   (id, d)  => api.put(`/appointments/${id}/`, d),
};
export const paymentsAPI = {
  getAll:   () => api.get('/payments/'),
  getStats: () => api.get('/payments/stats/'),
  markPaid: (id) => api.post(`/payments/${id}/mark_paid/`),
};

export default api;
