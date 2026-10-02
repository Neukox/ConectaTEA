import { useEffect, useState } from 'react'
import { listarProfissionais, type Profissional } from '~/api/protected/axiosProfissionais'
import { enviarSolicitacao } from '~/api/protected/axiosAmizade'
import { useNotificacoesContext } from '~/api/barraNotificacao'
import { getApiErrorMessage } from '~/api/errors'
import { PageLayout } from '~/components/layout'
import Header from '~/components/layout/Header'

export default function Profissionais() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingId, setSendingId] = useState<number | null>(null)
  const { notificarErro, notificarSucesso } = useNotificacoesContext()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true)
      void listarProfissionais(search ? { search } : undefined).then(setProfissionais).catch((error) => notificarErro('Erro ao listar profissionais', getApiErrorMessage(error))).finally(() => setLoading(false))
    }, 250)
    return () => window.clearTimeout(timer)
  }, [search, notificarErro])

  const conectar = async (id: number) => {
    setSendingId(id)
    try { await enviarSolicitacao(id); notificarSucesso('Solicitação enviada', 'O profissional receberá sua solicitação.') }
    catch (error) { notificarErro('Erro ao conectar', getApiErrorMessage(error)) }
    finally { setSendingId(null) }
  }

  return <PageLayout><Header title='Profissionais' description='Encontre profissionais e crie conexões' />
    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder='Buscar por nome, especialidade ou título' className='mb-6 w-full max-w-xl rounded-lg border bg-white px-4 py-3' />
    {loading ? <p>Carregando...</p> : profissionais.length === 0 ? <p className='rounded-xl bg-white p-6'>Nenhum profissional encontrado.</p> : <div className='grid gap-4 md:grid-cols-2'>{profissionais.map((profissional) => <article key={profissional.id} className='rounded-xl bg-white p-6 shadow-sm'><h2 className='text-lg font-bold'>{profissional.name}</h2><p className='text-gray-600'>{profissional.titulo || profissional.especialidade || 'Profissional'}</p><p className='mt-3 text-sm text-gray-600'>{profissional.sobre || 'Sem apresentação cadastrada.'}</p><button disabled={sendingId === profissional.id} onClick={() => conectar(profissional.id)} className='mt-4 rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50'>{sendingId === profissional.id ? 'Enviando...' : 'Conectar'}</button></article>)}</div>}
  </PageLayout>
}
