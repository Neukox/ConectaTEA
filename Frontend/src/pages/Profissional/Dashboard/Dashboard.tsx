import { useState } from 'react'
import Header from '../../../components/layout/Header'
import { PageLayout } from '~/components/layout/PageLayout'
import { CadastrarCriancaDialog } from '~/features/CadastrarCrianca'
import { CadastrarMetaDialog } from '~/features/Metas'
import { HiPlus } from 'react-icons/hi'
import DashboardStatsProfisional from '~/features/Dashboard/components/profissional/DashboardStatsProfisional'
import DashboardCriancasProfissional from '~/features/Dashboard/components/profissional/DashboardCriancasProfissional'
import DashboardMetasProfissional from '~/features/Dashboard/components/profissional/DashboardMetasProfissional'

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false)
  const [showMetaModal, setShowMetaModal] = useState(false)

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

            <DashboardMetasProfissional />
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
