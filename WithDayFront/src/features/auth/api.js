import axios from 'axios';
import { useAuthStore } from './store/authStore';

const BASE_URL = import.meta.env.VITE_BACKSERVER;

export const api = axios.create({
  baseURL: `http://${BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const signupUser = async (formData) => {
  // 💡 주소 변경: /api/users/signup -> /users/signup
  const response = await api.post(`/users/signup`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const loginUser = async (loginData) => {
  // 💡 주소 변경: /api/users/login -> /users/login
  const response = await api.post(`/users/login`, loginData);
  return response.data;
};

export const fetchTerms = async () => {
  // 💡 주소 변경: /api/users/terms -> /users/terms
  const response = await api.get(`/users/terms`);
  return response.data;
};

export const googleLoginUser = async (googleData) => {
  const response = await api.post(`/users/google-login`, googleData);
  return response.data;
};