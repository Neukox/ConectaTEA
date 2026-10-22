import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { ArrowLeft, Calendar, FileText, Target } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { QUERY_KEYS } from '~/api/query-client'
import { listarMetas } from '~/api/protected/axiosMetas'
import { vinculacaoAPI } from '~/api/protected/axiosVinculacao'
import Header from '~/components/layout/Header'
import { PageLayout } from '~/components/layout/PageLayout'
import { anotacoesGateway } from '~/features/Anotacoes/services'
import { StatusMeta } from '~/features/Metas/types'
import { getSessoes } from '~/features/Sessoes/services'

export default function DetalheCriancaResponsavel() {
  const { id } = useParams<{ id: string }>()
  const criancaId = Number(id)
  const idValido = Number.isFinite(criancaId) && criancaId > 0

  const vinculos = useQuery({
    queryKey: [QUERY_KEYS.VINCULOS],
    queryFn: vinculacaoAPI.obterVinculos,
  })
  const crianca = vinculos.data?.find((item) => item.id === criancaId)

  const metas = useQuery({
    queryKey: [QUERY_KEYS.METAS, 'crianca', criancaId],
    queryFn: () => listarMetas({ criancaId }),
    enabled: idValido,
  })
  const sessoes = useQuery({
    queryKey: ['sessoes', 'crianca', criancaId],
    queryFn: () => getSessoes({ criancaId }),
    enabled: idValido,
  })
  const anotacoes = useQuery({
    queryKey: ['anotacoes', 'responsavel', criancaId],
    queryFn: () =>
      anotacoesGateway.listar(
        {
          papel: 'RESPONSAVEL',
          criancaId,
          visibilidade: 'COMPARTILHADA',
          ordenacao: 'RECENTES',
        },
        [criancaId],
      ),
    enabled: idValido,
  })

  const proximasSessoes = (sessoes.data ?? [])
    .filter((sessao) => new Date(sessao.dataHora).getTime() >= Date.now())
    .slice(0, 3)
  const metasEmAndamento = (metas.data ?? []).filter(
    (meta) => meta.status === 'EM_ANDAMENTO',
  ).length
  const metasConcluidas = (metas.data ?? []).filter(
    (meta) => meta.status === 'CONCLUIDA',
  ).length

  return (
    <PageLayout>
      <Header
        title={crianca?.nome ?? 'Detalhe da criança'}
        description='Acompanhamento compartilhado com a família'
      />
      <Link
        to='/responsavel/criancas'
        className='mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900'
      >
        <ArrowLeft className='h-4 w-4' /> Voltar para Minhas crianças
      </Link>

      {vinculos.isLoading && (
        <div role='status' className='rounded-xl bg-white p-8 text-center text-sm text-gray-500'>
          Carregando dados da criança...
        </div>
      )}
      {vinculos.isError && (
        <div role='alert' className='rounded-xl bg-red-50 p-6 text-center text-sm text-red-700'>
          Não foi possível carregar os dados da criança.{' '}
          <button onClick={() => vinculos.refetch()} className='font-semibold underline'>
            Tentar novamente
          </button>
        </div>
      )}
      {vinculos.isSuccess && !crianca && (
        <div className='rounded-xl bg-white p-8 text-center text-sm text-gray-600'>
          Criança não encontrada ou vínculo encerrado.{' '}
          <Link to='/responsavel/criancas' className='font-semibold text-primary underline'>
            Ver Minhas crianças
          </Link>
        </div>
      )}
      {crianca && (
        <>
          <article className='rounded-2xl bg-white p-6 shadow-sm'>
            <h2 className='text-2xl font-bold text-gray-900'>{crianca.nome}</h2>
            <p className='mt-1 text-sm text-gray-600'>
              {crianca.idade} anos
              {crianca.diagnostico ? ` • ${crianca.diagnostico}` : ''}
            </p>
          </article>

          <div className='mt-4 grid gap-4 sm:grid-cols-3'>
            <div className='rounded-xl bg-white p-5 shadow-sm'>
              <p className='text-xs font-medium text-gray-500'>Metas</p>
              <p className='mt-1 text-2xl font-bold text-gray-900'>
                {metas.data?.length ?? 0}
              </p>
              <p className='mt-1 text-xs text-gray-500'>
                {metasEmAndamento} em andamento • {metasConcluidas} concluídas
              </p>
            </div>
            <div className='rounded-xl bg-white p-5 shadow-sm'>
              <p className='text-xs font-medium text-gray-500'>Sessões</p>
              <p className='mt-1 text-2xl font-bold text-gray-900'>
                {sessoes.data?.length ?? 0}
              </p>
              <p className='mt-1 text-xs text-gray-500'>
                {proximasSessoes.length} próxima(s)
              </p>
            </div>
            <div className='rounded-xl bg-white p-5 shadow-sm'>
              <p className='text-xs font-medium text-gray-500'>
                Anotações compartilhadas
              </p>
              <p className='mt-1 text-2xl font-bold text-gray-900'>
                {anotacoes.data?.length ?? 0}
              </p>
              <p className='mt-1 text-xs text-gray-500'>Visíveis para a família</p>
            </div>
          </div>

          <section className='mt-6 rounded-2xl bg-white p-6 shadow-sm'>
            <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
              <Target className='h-5 w-5 text-green-600' /> Metas
            </h3>
            {metas.isLoading && (
              <p className='mt-3 text-sm text-gray-500'>Carregando metas...</p>
            )}
            {metas.isError && (
              <p className='mt-3 text-sm text-red-700'>
                Não foi possível carregar as metas.
              </p>
            )}
            {metas.isSuccess && metas.data.length === 0 && (
              <p className='mt-3 text-sm text-gray-500'>Nenhuma meta cadastrada.</p>
            )}
            <ul className='mt-4 space-y-3'>
              {metas.data?.slice(0, 5).map((meta) => (
                <li
                  key={meta.id}
                  className='rounded-xl border border-gray-100 p-4'
                >
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <p className='text-sm font-semibold text-gray-900'>
                      {meta.titulo}
                    </p>
                    <span className='rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700'>
                      {StatusMeta[meta.status]}
                    </span>
                  </div>
                  <div className='mt-3 flex items-center gap-3'>
                    <div className='h-2 flex-1 rounded-full bg-gray-200'>
                      <div
                        className='h-2 rounded-full bg-green-500'
                        style={{ width: `${meta.progresso}%` }}
                      />
                    </div>
                    <span className='text-xs font-semibold text-green-700'>
                      {meta.progresso}%
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className='mt-6 rounded-2xl bg-white p-6 shadow-sm'>
            <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
              <Calendar className='h-5 w-5 text-green-600' /> Próximas sessões
            </h3>
            {sessoes.isLoading && (
              <p className='mt-3 text-sm text-gray-500'>Carregando sessões...</p>
            )}
            {sessoes.isError && (
              <p className='mt-3 text-sm text-red-700'>
                Não foi possível carregar as sessões.
              </p>
            )}
            {sessoes.isSuccess && proximasSessoes.length === 0 && (
              <p className='mt-3 text-sm text-gray-500'>
                Nenhuma sessão futura agendada.
              </p>
            )}
            <ul className='mt-4 space-y-3'>
              {proximasSessoes.map((sessao) => (
                <li
                  key={sessao.id}
                  className='flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-100 p-4'
                >
                  <div>
                    <p className='text-sm font-semibold text-gray-900'>
                      {format(parseISO(sessao.dataHora), "dd/MM/yyyy 'às' HH:mm")}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {sessao.tipo} • {sessao.duracao} min
                    </p>
                  </div>
                  <span className='rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700'>
                    {sessao.status}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className='mt-6 rounded-2xl bg-white p-6 shadow-sm'>
            <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
              <FileText className='h-5 w-5 text-green-600' /> Anotações compartilhadas
            </h3>
            {anotacoes.isLoading && (
              <p className='mt-3 text-sm text-gray-500'>Carregando anotações...</p>
            )}
            {anotacoes.isError && (
              <p className='mt-3 text-sm text-red-700'>
                Não foi possível carregar as anotações.
              </p>
            )}
            {anotacoes.isSuccess && anotacoes.data.length === 0 && (
              <p className='mt-3 text-sm text-gray-500'>
                Nenhuma anotação compartilhada.
              </p>
            )}
            <ul className='mt-4 space-y-3'>
              {anotacoes.data?.slice(0, 3).map((anotacao) => (
                <li
                  key={anotacao.id}
                  className='rounded-xl border border-gray-100 p-4'
                >
                  <p className='text-sm font-semibold text-gray-900'>
                    {anotacao.titulo}
                  </p>
                  <p className='mt-1 text-xs text-gray-500'>
                    {anotacao.autorNome} •{' '}
                    {format(parseISO(anotacao.createdAt), 'dd/MM/yyyy')}
                  </p>
                  <p className='mt-2 line-clamp-3 text-sm text-gray-600'>
                    {anotacao.conteudo}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </PageLayout>
  )
}
