import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import MetasPage from '../pages/Profissional/Metas/Metas'
import VerDetalhesMeta from '../pages/Profissional/Metas/VerDetalhesMeta'

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
import Progresso from '../pages/Profissional/Progresso/Progresso'
import Sessoes from '../pages/Profissional/Sessoes/Sessoes'
import Configuracoes from '../pages/Profissional/Configuracoes/Configuracoes'

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

      {/* <Route
        path='/profissional/profissionais'
        element={
          <ProtectedRoute allowedRoles={['PROFISSIONAL']}>
            <Profissionais />
          </ProtectedRoute>
        }
      /> */}

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

      <Route
        path='/profissional/metas/detalhes/:id'
        element={
          <ProtectedRoute allowedRoles={['PROFISSIONAL']}>
            <VerDetalhesMeta />
          </ProtectedRoute>
        }
      />

      <Route
        path='/profissional/progresso'
        element={
          <ProtectedRoute allowedRoles={['PROFISSIONAL']}>
            <Progresso />
          </ProtectedRoute>
        }
      />

      <Route
        path='/profissional/sessoes'
        element={
          <ProtectedRoute allowedRoles={['PROFISSIONAL']}>
            <Sessoes />
          </ProtectedRoute>
        }
      />

      <Route
        path='/profissional/configuracoes'
        element={
          <ProtectedRoute allowedRoles={['PROFISSIONAL']}>
            <Configuracoes />
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
