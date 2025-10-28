//Algoritmo de base para requisições com axios - ARQUIVO NOVO PARA RESOLVER CACHE

import axios from 'axios';

// Configuração da API com base URL correta
export const api = axios.create({
  baseURL: (import.meta as as).env?.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true, // Habilita envio de cookies
});

// Interceptor para adicionar automaticamente o token de autenticação
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