import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { vinculacaoAPI } from '~/api/protected/axiosVinculacao'
import { QUERY_KEYS, queryClient } from '~/api/query-client'
import { useNotificacoesContext } from '~/api/barraNotificacao'
import { getApiErrorMessage } from '~/api/errors'
import { PageLayout } from '~/components/layout'
import Header from '~/components/layout/Header'

type FiltroDiagnostico = 'TODOS' | 'COM_DIAGNOSTICO' | 'SEM_DIAGNOSTICO'

export default function MeusVinculos() {
  const { notificarErro, notificarSucesso } = useNotificacoesContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroDiagnostico, setFiltroDiagnostico] =
    useState<FiltroDiagnostico>('TODOS')

  const vinculos = useQuery({
    queryKey: [QUERY_KEYS.VINCULOS],
    queryFn: vinculacaoAPI.obterVinculos,
  })
  const desvincular = useMutation({
    mutationFn: vinculacaoAPI.desvincularCrianca,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VINCULOS] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CRIANCAS] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_RESPONSAVEL] }),
      ])
      notificarSucesso('Vínculo encerrado', 'A criança foi desvinculada da sua conta.')
    },
    onError: (error) => notificarErro('Erro ao desvincular', getApiErrorMessage(error)),
  })

  const criancasFiltradas = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase()
    return (vinculos.data ?? []).filter((crianca) => {
      const combinaBusca =
        !termo ||
        crianca.nome.toLowerCase().includes(termo) ||
        (crianca.diagnostico ?? '').toLowerCase().includes(termo)
      const temDiagnostico = Boolean(crianca.diagnostico?.trim())
      const combinaFiltro =
        filtroDiagnostico === 'TODOS' ||
        (filtroDiagnostico === 'COM_DIAGNOSTICO' && temDiagnostico) ||
        (filtroDiagnostico === 'SEM_DIAGNOSTICO' && !temDiagnostico)
      return combinaBusca && combinaFiltro
    })
  }, [filtroDiagnostico, searchTerm, vinculos.data])

  return (
    <PageLayout>
      <Header
        title='Minhas crianças'
        description='Crianças vinculadas à sua conta'
      />
      <div className='mt-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between'>
        <div className='relative w-full md:max-w-xl'>
          <label htmlFor='busca-criancas' className='sr-only'>
            Buscar crianças por nome ou diagnóstico
          </label>
          <Search className='pointer-events-none absolute top-3 left-3 h-5 w-5 text-gray-400' />
          <input
            id='busca-criancas'
            type='search'
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder='Buscar por nome ou diagnóstico...'
            className='w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-10 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100'
          />
        </div>
        <div>
          <label htmlFor='filtro-diagnostico' className='sr-only'>
            Filtrar por diagnóstico
          </label>
          <select
            id='filtro-diagnostico'
            value={filtroDiagnostico}
            onChange={(event) =>
              setFiltroDiagnostico(event.target.value as FiltroDiagnostico)
            }
            className='w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 md:w-auto'
          >
            <option value='TODOS'>Todos</option>
            <option value='COM_DIAGNOSTICO'>Com diagnóstico</option>
            <option value='SEM_DIAGNOSTICO'>Sem diagnóstico</option>
          </select>
        </div>
      </div>
      {vinculos.isLoading && <p role='status'>Carregando vínculos...</p>}
      {vinculos.isError && (
        <div role='alert' className='mt-4 rounded-xl bg-red-50 p-5 text-red-700'>
          Não foi possível carregar os vínculos.{' '}
          <button
            onClick={() => vinculos.refetch()}
            className='font-semibold underline'
          >
            Tentar novamente
          </button>
        </div>
      )}
      {vinculos.isSuccess && vinculos.data.length === 0 && (
        <div className='mt-4 rounded-xl bg-white p-8 text-center text-gray-600'>
          Nenhuma criança vinculada ainda.
        </div>
      )}
      {vinculos.isSuccess &&
        vinculos.data.length > 0 &&
        criancasFiltradas.length === 0 && (
          <div className='mt-4 rounded-xl bg-white p-8 text-center text-gray-600'>
            Nenhuma criança encontrada com essa busca ou filtro.
          </div>
        )}
      <div className='mt-4 grid gap-4 md:grid-cols-2'>
        {criancasFiltradas.map((crianca) => (
          <article
            key={crianca.id}
            className='rounded-xl bg-white p-6 shadow-sm'
          >
            <h2 className='text-lg font-bold'>{crianca.nome}</h2>
            <p className='text-sm text-gray-600'>
              {crianca.idade} anos •{' '}
              {crianca.diagnostico || 'Diagnóstico não informado'}
            </p>
            <div className='mt-4 flex gap-3'>
              <Link
                to={`/responsavel/criancas/${crianca.id}`}
                className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90'
              >
                Ver detalhes
              </Link>
              <button
                disabled={desvincular.isPending}
                onClick={() => desvincular.mutate(crianca.id)}
                className='rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50'
              >
                Desvincular
              </button>
            </div>
          </article>
        ))}
      </div>
    </PageLayout>
  )
}
