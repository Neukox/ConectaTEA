import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import MetasPage from '../pages/Profissional/Metas/Metas'

// Páginas públicas
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'

// Páginas do Profissional
import CadastrarCriancas from '../pages/Profissional/CadastrarCriancas/CadastrarCriancas'
import EditarCriancaCadastrada from '../pages/Profissional/CadastrarCriancas/EditarCriancaCadastrada'
import VerDetalhesCriancaCadastrada from '../pages/Profissional/CadastrarCriancas/VerDetalhesCriancaCadastrada'
import Dashboard from '../pages/Profissional/Dashboard/Dashboard'
import PerfilEdit from '../pages/Profissional/Perfil/EditarPerfil'
import PerfilProfissional from '../pages/Profissional/Perfil/VerPerfil'
import Profissionais from '../pages/Profissional/Profissionais/Profissionais'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route
        path='/'
        element={<Home />}
      />
      <Route
        path='/login'
        element={<Login />}
      />
      <Route
        path='/register'
        element={<Register />}
      />

      {/* Rotas do Profissional */}
      <Route
        path='/profissional/dashboard'
        element={
          <ProtectedRoute allowedRoles={['PROFISSIONAL']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path='/profissional/criancas'
        element={
          <ProtectedRoute allowedRoles={['PROFISSIONAL']}>
            <CadastrarCriancas />
          </ProtectedRoute>
        }
      />
      <Route
        path='/profissional/criancas/detalhes/:id'
        element={
          <ProtectedRoute allowedRoles={['PROFISSIONAL']}>
            <VerDetalhesCriancaCadastrada />
          </ProtectedRoute>
        }
      />
      <Route
        path='/profissional/criancas/editar/:id'
        element={
          <ProtectedRoute allowedRoles={['PROFISSIONAL']}>
            <EditarCriancaCadastrada />
          </ProtectedRoute>
        }
      />

      <Route
        path='/profissional/profissionais'
        element={
          <ProtectedRoute allowedRoles={['PROFISSIONAL']}>
            <Profissionais />
          </ProtectedRoute>
        }
      />

      <Route
        path='/profissional/perfil'
        element={
          <ProtectedRoute allowedRoles={['PROFISSIONAL']}>
            <PerfilProfissional />
          </ProtectedRoute>
        }
      />

      <Route
        path='/profissional/perfil/:id'
        element={
          <ProtectedRoute allowedRoles={['PROFISSIONAL']}>
            <PerfilProfissional />
          </ProtectedRoute>
        }
      />

      <Route
        path='/profissional/perfil/:id'
        element={
          <ProtectedRoute allowedRoles={['PROFISSIONAL']}>
            <PerfilProfissional />
          </ProtectedRoute>
        }
      />

      <Route
        path='/profissional/perfil/editar'
        element={
          <ProtectedRoute allowedRoles={['PROFISSIONAL']}>
            <PerfilEdit />
          </ProtectedRoute>
        }
      />

      <Route
        path='/profissional/metas'
        element={
          <ProtectedRoute allowedRoles={['PROFISSIONAL']}>
            <MetasPage />
          </ProtectedRoute>
        }
      />

      {/* Rotas do Responsável */}
      <Route
        path='/responsavel/dashboard'
        element={
          <ProtectedRoute allowedRoles={['RESPONSAVEL']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Rota de compatibilidade */}
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute allowedRoles={['PROFISSIONAL', 'RESPONSAVEL']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
