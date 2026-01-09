// src/App.tsx
import { useLocation } from 'react-router-dom'
import AppRoutes from './routes/routes.tsx'
import { NotificacoesProvider } from './api/barraNotificacao/NotificacoesProvider.tsx'
import { AuthProvider } from './contexts/AuthProvider'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './api/query-client.ts'

export default function App() {
  const location = useLocation()

  console.log('App.tsx - Rota atual:', location.pathname)

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificacoesProvider position='top-right'>
          <AppRoutes />
        </NotificacoesProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
