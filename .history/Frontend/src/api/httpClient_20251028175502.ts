//Algoritmo de base para requisições com axios - ATUALIZADO PARA COOKIES SEGUROS

import axios from 'axios';

// Configuração da API com base URL correta
export const api = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true, // Habilita envio automático de cookies
});

// Interceptor de resposta para lidar com erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado, redirecionar para login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);