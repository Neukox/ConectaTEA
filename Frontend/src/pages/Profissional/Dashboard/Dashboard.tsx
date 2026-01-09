import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../../components/layout/Header'
import { PageLayout } from '~/components/layout/PageLayout'
import { CadastrarCriancaDialog } from '~/features/CadastrarCrianca'
import { CadastrarMetaDialog } from '~/features/Metas'
import { HiPlus } from 'react-icons/hi'
import DashboardStatsProfisional from '~/features/Dashboard/components/profissional/DashboardStatsProfisional'
import DashboardCriancasProfissional from '~/features/Dashboard/components/profissional/DashboardCriancasProfissional'

const metas = [
  {
    id: 1,
    nome: 'Ana Silva',
    meta: 'Melhorar comunicação verbal',
    progresso: 85,
    status: 'Em andamento',
  },
  {
    id: 2,
    nome: 'João Pedro',
    meta: 'Desenvolver habilidades sociais',
    progresso: 60,
    status: 'Em andamento',
  },
  {
    id: 3,
    nome: 'Sofia Costa',
    meta: 'Reduzir comportamentos repetitivos',
    progresso: 92,
    status: 'Quase concluída',
  },
  {
    id: 4,
    nome: 'Lucas Ferreira',
    meta: 'Aumentar tempo de atenção',
    progresso: 45,
    status: 'Em andamento',
  },
]

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false)
  const [showMetaModal, setShowMetaModal] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <PageLayout>
        <Header
          title='Dashboard'
          description='Acompanhe o progresso e gerencie as atividades'
        />

        {/* Cards superiores */}
        <DashboardStatsProfisional />

        {/* Conteúdo principal */}
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
          {/* Crianças Recentes */}
          <div className='rounded-2xl bg-white p-6 shadow-md'>
            <div className='mb-6 flex items-center justify-between'>
              <h2 className='text-lg font-bold'>Crianças Recentes</h2>
              <button
                onClick={() => setShowModal(true)}
                className='flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700'
              >
                <HiPlus className='size-4' />
                Adicionar
              </button>
            </div>

            <DashboardCriancasProfissional />
          </div>

          {/* Metas em Andamento */}
          <div className='rounded-2xl bg-white p-6 shadow-md'>
            <div className='mb-6 flex items-center justify-between'>
              <h2 className='text-lg font-bold'>Metas em Andamento</h2>
              <button
                onClick={() => setShowMetaModal(true)}
                className='flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700'
              >
                <HiPlus className='size-4' />
                Nova Meta
              </button>
            </div>
            <div className='space-y-4'>
              {metas.map((meta, index) => (
                <div
                  key={index}
                  className='cursor-pointer rounded-xl border border-transparent bg-gray-50 px-4 py-3 transition-all duration-200 hover:-translate-y-1 hover:border-green-400 hover:bg-white hover:shadow-md focus:-translate-y-1'
                  tabIndex={0}
                  onClick={() =>
                    navigate(`/profissional/metas/detalhes/${meta.id}`)
                  }
                >
                  <div className='mb-1 flex items-center justify-between'>
                    <div>
                      <p className='text-base font-semibold'>{meta.nome}</p>
                      <p className='text-xs text-gray-500'>{meta.meta}</p>
                    </div>
                    <div className='text-right'>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          meta.status === 'Quase concluída'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {meta.status}
                      </span>
                      <p className='text-base font-bold text-green-600'>
                        {meta.progresso}%
                      </p>
                    </div>
                  </div>
                  <div className='h-3 w-full rounded-full bg-gray-200'>
                    <div
                      className='h-3 rounded-full bg-green-500 transition-all duration-500'
                      style={{ width: `${meta.progresso}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
      <CadastrarCriancaDialog
        open={showModal}
        onOpenChange={setShowModal}
        onSuccess={() => setShowModal(false)}
      />
      <CadastrarMetaDialog
        open={showMetaModal}
        onOpenChange={setShowMetaModal}
      />
    </>
  )
}
