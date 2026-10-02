import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { obterMeuPerfilProfissional, obterProfissionalPorId, type Profissional } from '~/api/protected/axiosProfissionais'
import { getApiErrorMessage } from '~/api/errors'
import Header from '~/components/layout/Header'
import { PageLayout } from '~/components/layout'
import { useNotificacoesContext } from '~/api/barraNotificacao'

export default function VerPerfil() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notificarErro } = useNotificacoesContext()
  const [perfil, setPerfil] = useState<Profissional | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregar = async () => {
      try {
        setPerfil(id ? await obterProfissionalPorId(Number(id)) : await obterMeuPerfilProfissional())
      } catch (error) {
        notificarErro('Erro ao carregar perfil', getApiErrorMessage(error))
      } finally {
        setLoading(false)
      }
    }
    void carregar()
  }, [id, notificarErro])

  return (
    <PageLayout>
      <Header title='Perfil profissional' description='Informações profissionais cadastradas' />
      {loading && <p className='text-gray-600'>Carregando perfil...</p>}
      {!loading && !perfil && <p className='rounded-xl bg-white p-6 text-gray-600'>Perfil não encontrado.</p>}
      {perfil && (
        <div className='mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm'>
          <div className='flex flex-col gap-2 border-b pb-6 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>{perfil.name}</h2>
              <p className='text-gray-600'>{perfil.titulo || perfil.especialidade || 'Profissional'}</p>
            </div>
            {!id && (
              <button onClick={() => navigate('/profissional/perfil/editar')} className='rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700'>
                Editar perfil
              </button>
            )}
          </div>
          <dl className='mt-6 grid gap-6 sm:grid-cols-2'>
            <div><dt className='text-sm text-gray-500'>Especialidade</dt><dd className='font-medium'>{perfil.especialidade || 'Não informada'}</dd></div>
            <div><dt className='text-sm text-gray-500'>Registro profissional</dt><dd className='font-medium'>{perfil.registroProfissional || 'Não informado'}</dd></div>
            <div><dt className='text-sm text-gray-500'>Formação acadêmica</dt><dd className='font-medium'>{perfil.formacaoAcademica || 'Não informada'}</dd></div>
            <div><dt className='text-sm text-gray-500'>Código de identificação</dt><dd className='font-medium'>{perfil.codigoIdentificacao || 'Não informado'}</dd></div>
            <div className='sm:col-span-2'><dt className='text-sm text-gray-500'>Sobre</dt><dd className='mt-1 text-gray-700'>{perfil.sobre || 'Nenhuma apresentação cadastrada.'}</dd></div>
          </dl>
          <p className='mt-8 rounded-lg bg-amber-50 p-4 text-sm text-amber-900'>Locais de atendimento, redes sociais e áreas de atuação permanecem temporariamente no sistema legado e não são exibidos por esta API.</p>
        </div>
      )}
    </PageLayout>
  )
}
