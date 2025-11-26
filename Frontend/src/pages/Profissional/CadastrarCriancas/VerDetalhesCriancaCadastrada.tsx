import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  buscarCriancaPorId,
  type CriancaListagem,
} from '../../../api/protected/axiosCadastroCrianca'
import { useNotificacoesContext } from '../../../api/barraNotificacao'
import { PageLayout } from '~/components/layout'

export default function VerDetalhesCriancaCadastrada() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { notificarErro } = useNotificacoesContext()
  const [crianca, setCrianca] = useState<CriancaListagem | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCrianca = async () => {
      try {
        setIsLoading(true)

        if (!id) {
          notificarErro(
            'ID não fornecido',
            'ID da criança não foi fornecido na URL.',
            { duration: 4000 },
          )
          navigate('/profissional/criancas')
          return
        }

        // Buscar criança pelo ID usando a API real
        const criancaData = await buscarCriancaPorId(parseInt(id))
        setCrianca(criancaData)
      } catch (error) {
        console.error('Erro ao buscar criança:', error)
        notificarErro(
          'Erro ao carregar dados',
          'Não foi possível carregar os dados da criança. Redirecionando...',
          { duration: 4000 },
        )
        navigate('/profissional/criancas')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchCrianca()
    }
  }, [id, navigate, notificarErro])

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-green-600'></div>
          <p className='mt-4 text-gray-600'>
            Carregando detalhes da criança...
          </p>
        </div>
      </div>
    )
  }

  if (!crianca) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
            <svg
              className='h-8 w-8 text-red-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h2 className='mb-2 text-xl font-semibold text-gray-900'>
            Criança não encontrada
          </h2>
          <p className='mb-6 text-gray-600'>
            Não foi possível encontrar os dados desta criança.
          </p>
          <button
            onClick={() => navigate('/profissional/criancas')}
            className='rounded-lg bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700'
          >
            Voltar para Lista
          </button>
        </div>
      </div>
    )
  }

  return (
    <PageLayout>
      {/* Header */}
      <div className='mb-8'>
        <div className='mb-4 flex items-center gap-4'>
          <button
            onClick={() => navigate('/profissional/criancas')}
            className='text-gray-500 transition-colors hover:text-gray-700'
          >
            <svg
              className='h-6 w-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
          </button>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Detalhes da Criança
            </h1>
            <p className='mt-1 text-gray-600'>
              Visualize todas as informações cadastrais
            </p>
          </div>
        </div>
      </div>

      {/* Container Principal */}
      <div className='mx-auto max-w-4xl'>
        <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
          {/* Header do Card */}
          <div className='bg-gradient-to-r from-green-600 to-green-700 px-6 py-8'>
            <div className='flex items-center gap-4'>
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-white/20'>
                <svg
                  className='h-8 w-8 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                  />
                </svg>
              </div>
              <div>
                <h2 className='text-2xl font-bold text-white'>
                  {crianca.nome}
                </h2>
                <p className='text-green-100'>
                  {crianca.idade} anos • ID #{crianca.id}
                </p>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className='p-6'>
            {/* Informações Básicas */}
            <div className='mb-8'>
              <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900'>
                <svg
                  className='h-5 w-5 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                  />
                </svg>
                Informações da Criança
              </h3>

              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='rounded-lg bg-gray-50 p-4'>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Nome Completo
                  </label>
                  <p className='font-medium text-gray-900'>{crianca.nome}</p>
                </div>

                <div className='rounded-lg bg-gray-50 p-4'>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Idade
                  </label>
                  <p className='font-medium text-gray-900'>
                    {crianca.idade} anos
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-4'>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Data de Nascimento
                  </label>
                  <p className='font-medium text-gray-900'>
                    {crianca.dataNascimento
                      ? new Date(crianca.dataNascimento).toLocaleDateString(
                          'pt-BR',
                        )
                      : 'Não informado'}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-4'>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Gênero
                  </label>
                  <p className='font-medium text-gray-900'>
                    {crianca.genero || 'Não informado'}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-4 md:col-span-2'>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Diagnóstico
                  </label>
                  <p className='font-medium text-gray-900'>
                    {crianca.diagnostico}
                  </p>
                </div>
              </div>
            </div>

            {/* Informações do Responsável */}
            <div className='mb-8'>
              <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900'>
                <svg
                  className='h-5 w-5 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                  />
                </svg>
                Responsável
              </h3>

              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='rounded-lg bg-gray-50 p-4'>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Nome do Responsável
                  </label>
                  <p className='font-medium text-gray-900'>
                    {crianca.responsavel.nome}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-4'>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Parentesco
                  </label>
                  <p className='font-medium text-gray-900'>
                    {crianca.parentesco
                      ? crianca.parentesco.charAt(0) +
                        crianca.parentesco.slice(1).toLowerCase()
                      : 'Não informado'}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-4'>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Telefone
                  </label>
                  <p className='font-medium text-gray-900'>
                    {crianca.responsavel.telefone || 'Não informado'}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-4'>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    E-mail
                  </label>
                  <p className='font-medium text-gray-900'>
                    {crianca.responsavel.email || 'Não informado'}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-4 md:col-span-2'>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Endereço
                  </label>
                  <p className='font-medium text-gray-900'>
                    {crianca.responsavel.endereco || 'Não informado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Observações */}
            {crianca.observacoes && (
              <div className='mb-8'>
                <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900'>
                  <svg
                    className='h-5 w-5 text-orange-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                  Observações Adicionais
                </h3>

                <div className='rounded-lg bg-gray-50 p-4'>
                  <p className='leading-relaxed text-gray-900'>
                    {crianca.observacoes}
                  </p>
                </div>
              </div>
            )}

            {/* Ações */}
            <div className='flex gap-4 border-t border-gray-200 pt-6'>
              <button
                onClick={() =>
                  navigate(`/profissional/criancas/editar/${crianca.id}`)
                }
                className='flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700'
              >
                <svg
                  className='h-5 w-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                  />
                </svg>
                Editar Informações
              </button>

              <button
                onClick={() => navigate('/profissional/criancas')}
                className='flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50'
              >
                <svg
                  className='h-5 w-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
                Voltar para Lista
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
