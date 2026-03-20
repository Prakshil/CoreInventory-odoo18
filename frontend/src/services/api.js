import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Show success toast for non-GET requests if there's no custom flag disabling it
    const method = response.config.method?.toLowerCase();
    
    // Ignore auth endpoints from default "Success" generic messages to allow custom handling in UI
    const isAuth = response.config.url?.includes('/auth/');
    
    if (['post', 'put', 'patch', 'delete'].includes(method) && !isAuth) {
      const msg = response.data?.message || 'Operation successful';
      toast.success(msg);
    }
    return response;
  },
  (error) => {
    const errorMsg = error.response?.data?.error || error.message || 'An unexpected error occurred';
    
    // Don't show toast for 401s if we're instantly redirecting
    if (error.response?.status === 401) {
      Cookies.remove('token');
      window.location.href = '/login';
    } else {
      toast.error(errorMsg);
    }
    
    return Promise.reject(error);
  }
);

export default api;
