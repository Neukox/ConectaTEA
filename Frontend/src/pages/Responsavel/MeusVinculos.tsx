import { useMutation, useQuery } from '@tanstack/react-query'
import { vinculacaoAPI } from '~/api/protected/axiosVinculacao'
import { QUERY_KEYS, queryClient } from '~/api/query-client'
import { useNotificacoesContext } from '~/api/barraNotificacao'
import { getApiErrorMessage } from '~/api/errors'
import { PageLayout } from '~/components/layout'
import Header from '~/components/layout/Header'

export default function MeusVinculos() {
  const { notificarErro, notificarSucesso } = useNotificacoesContext()
  const vinculos = useQuery({ queryKey: [QUERY_KEYS.VINCULOS], queryFn: vinculacaoAPI.obterVinculos })
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

  return <PageLayout><Header title='Minhas crianças' description='Crianças vinculadas à sua conta' />
    {vinculos.isLoading && <p>Carregando vínculos...</p>}
    {vinculos.isError && <div className='rounded-xl bg-red-50 p-5 text-red-700'>Não foi possível carregar os vínculos. <button onClick={() => vinculos.refetch()} className='font-semibold underline'>Tentar novamente</button></div>}
    {vinculos.data?.length === 0 && <div className='rounded-xl bg-white p-8 text-center text-gray-600'>Nenhuma criança vinculada ainda.</div>}
    <div className='grid gap-4 md:grid-cols-2'>{vinculos.data?.map((crianca) => <article key={crianca.id} className='rounded-xl bg-white p-6 shadow-sm'><h2 className='text-lg font-bold'>{crianca.nome}</h2><p className='text-sm text-gray-600'>{crianca.idade} anos • {crianca.diagnostico || 'Diagnóstico não informado'}</p><button disabled={desvincular.isPending} onClick={() => desvincular.mutate(crianca.id)} className='mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50'>Desvincular</button></article>)}</div>
  </PageLayout>
}
