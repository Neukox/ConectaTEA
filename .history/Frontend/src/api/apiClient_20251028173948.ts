//Cliente HTTP para conexão com API - NOVA VERSÃO SEM CACHE

import axios from 'axios';

// Configuração da API com URL completa
export const api = axios.create({
  baseURL: 'http://localhost:3000/api', // URL FIXA para forçar atualização
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }, 
  withCredentials: true,
});

// Interceptor para token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
