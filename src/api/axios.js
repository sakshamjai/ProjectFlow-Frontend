import axios from 'axios';

const api = axios.create({
  baseURL: 'https://projectflow-backend-production.up.railway.app/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthCheck = url.includes('get-me');
    const isOnLoginPage = window.location.pathname === '/login';

    // Only hard-redirect on 401 for protected API calls, never for
    // the bootstrap get-me call (it's expected to 401 when logged out)
    if (error.response?.status === 401 && !isAuthCheck && !isOnLoginPage) {
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;