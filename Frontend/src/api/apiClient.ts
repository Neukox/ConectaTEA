import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  withXSRFToken: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const publicPaths = ['/', '/login', '/register']
    if (
      error.response?.status === 401 &&
      !publicPaths.includes(window.location.pathname) &&
      error.config?.url !== '/auth/me'
    ) {
      window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)

export default api
