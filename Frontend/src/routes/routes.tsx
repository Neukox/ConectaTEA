import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import MetasPage from '../pages/Profissional/Metas/Metas'
import VerDetalhesMeta from '../pages/Profissional/Metas/VerDetalhesMeta'

// Páginas públicas
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import ResetPasswordPage from '../pages/ResetPassword/ResetPasswordPage'

// Páginas do Profissional
import CadastrarCriancas from '../pages/Profissional/CadastrarCriancas/CadastrarCriancas'
import EditarCriancaCadastrada from '../pages/Profissional/CadastrarCriancas/EditarCriancaCadastrada'
import VerDetalhesCriancaCadastrada from '../pages/Profissional/CadastrarCriancas/VerDetalhesCriancaCadastrada'
import DashboardProfissional from '../pages/Profissional/Dashboard/Dashboard'
import PerfilEdit from '../pages/Profissional/Perfil/EditarPerfil'
import PerfilProfissional from '../pages/Profissional/Perfil/VerPerfil'
import Profissionais from '../pages/Profissional/Profissionais/Profissionais'
import Progresso from '../pages/Profissional/Progresso/Progresso'
import Sessoes from '../pages/Profissional/Sessoes/Sessoes'
import Configuracoes from '../pages/Profissional/Configuracoes/Configuracoes'
import AnotacoesProfissional from '../pages/Profissional/Anotacoes/Anotacoes'

// Páginas do Responsável
import VincularCrianca from '../pages/Responsavel/VincularCrianca'
import DashboardResponsavel from '../pages/Responsavel/Dashboard'
import DashboardRedirect from '../components/DashboardRedirect'
import MeusVinculos from '../pages/Responsavel/MeusVinculos'
import AnotacoesResponsavel from '../pages/Responsavel/Anotacoes/Anotacoes'

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
      <Route
        path='/redefinir-senha'
        element={<ResetPasswordPage />}
      />

      {/* Rotas do Profissional */}
      <Route
        path='/profissional/dashboard'
        element={
          <ProtectedRoute allowedRoles={['PROFISSIONAL']}>
            <DashboardProfissional />
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

      <Route
        path='/profissional/anotacoes'
        element={
          <ProtectedRoute allowedRoles={['PROFISSIONAL']}>
            <AnotacoesProfissional />
          </ProtectedRoute>
        }
      />

      {/* Rotas do Responsável */}
      <Route
        path='/responsavel/dashboard'
        element={
          <ProtectedRoute allowedRoles={['RESPONSAVEL']}>
            <DashboardResponsavel />
          </ProtectedRoute>
        }
      />

      <Route
        path='/responsavel/vincular-crianca'
        element={
          <ProtectedRoute allowedRoles={['RESPONSAVEL']}>
            <VincularCrianca />
          </ProtectedRoute>
        }
      />
      <Route
        path='/responsavel/criancas'
        element={
          <ProtectedRoute allowedRoles={['RESPONSAVEL']}>
            <MeusVinculos />
          </ProtectedRoute>
        }
      />

      <Route
        path='/responsavel/anotacoes'
        element={
          <ProtectedRoute allowedRoles={['RESPONSAVEL']}>
            <AnotacoesResponsavel />
          </ProtectedRoute>
        }
      />

      {/* Rota de compatibilidade */}
      <Route
        path='/dashboard'
        element={<DashboardRedirect />}
      />
    </Routes>
  )
}
