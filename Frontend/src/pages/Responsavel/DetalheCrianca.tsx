import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { PageLayout } from '~/components/layout/PageLayout'
import Header from '~/components/layout/Header'
import { QUERY_KEYS } from '~/api/query-client'
import { vinculacaoAPI } from '~/api/protected/axiosVinculacao'

export default function DetalheCriancaResponsavel() {
  const { id } = useParams<{ id: string }>()
  const criancaId = Number(id)
  const vinculos = useQuery({
    queryKey: [QUERY_KEYS.VINCULOS],
    queryFn: vinculacaoAPI.obterVinculos,
  })
  const crianca = vinculos.data?.find((c) => c.id === criancaId)

  return (
    <PageLayout>
      <Header
        title='Detalhe da criança'
        description='Acompanhamento compartilhado com a família'
      />
      <Link
        to='/responsavel/criancas'
        className='mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900'
      >
        <ArrowLeft className='h-4 w-4' /> Voltar para Minhas crianças
      </Link>

      {vinculos.isLoading && (
        <div
          role='status'
          className='rounded-xl bg-white p-8 text-center text-sm text-gray-500'
        >
          Carregando dados da criança...
        </div>
      )}
      {vinculos.isError && (
        <div
          role='alert'
          className='rounded-xl bg-red-50 p-6 text-center text-sm text-red-700'
        >
          Não foi possível carregar os dados da criança.{' '}
          <button
            onClick={() => vinculos.refetch()}
            className='font-semibold underline'
          >
            Tentar novamente
          </button>
        </div>
      )}
      {vinculos.isSuccess && !crianca && (
        <div className='rounded-xl bg-white p-8 text-center text-sm text-gray-600'>
          Criança não encontrada ou vínculo encerrado.{' '}
          <Link
            to='/responsavel/criancas'
            className='font-semibold text-primary underline'
          >
            Ver Minhas crianças
          </Link>
        </div>
      )}
      {crianca && (
        <article className='rounded-2xl bg-white p-6 shadow-sm'>
          <h2 className='text-xl font-bold text-gray-900'>{crianca.nome}</h2>
          <p className='mt-1 text-sm text-gray-600'>
            {crianca.idade} anos
            {crianca.diagnostico ? ` • ${crianca.diagnostico}` : ''}
          </p>
          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              to='/responsavel/anotacoes'
              className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90'
            >
              Ver anotações compartilhadas
            </Link>
            <Link
              to='/responsavel/dashboard'
              className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
            >
              Voltar ao dashboard
            </Link>
          </div>
          <p className='mt-6 text-xs text-gray-500'>
            O responsável visualiza apenas informações compartilhadas. Ações de
            edição de atividades são exclusivas do profissional autor.
          </p>
        </article>
      )}
    </PageLayout>
  )
}
