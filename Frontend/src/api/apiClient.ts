//Cliente HTTP para conexão com API - NOVA VERSÃO SEM CACHE

import axios from 'axios'

// Configuração da API com URL completa
export const api = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Habilita envio de cookies
  withXSRFToken: true,
})

// Interceptor para token JWT
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)
