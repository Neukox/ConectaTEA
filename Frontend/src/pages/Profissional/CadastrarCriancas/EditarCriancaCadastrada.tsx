import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  buscarCriancaPorId,
  atualizarCrianca,
  type CriancaListagem,
  type CadastroCriancaFormData,
  type AtualizarCriancaData,
} from '../../../api/protected/axiosCadastroCrianca'
import { useNotificacoesContext } from '../../../api/barraNotificacao'
import { PageLayout } from '~/components/layout'

export default function EditarCriancaCadastrada() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { notificarSucesso, notificarErro } = useNotificacoesContext()
  const [crianca, setCrianca] = useState<CriancaListagem | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Estado do formulário baseado na interface existente
  const [formData, setFormData] = useState<CadastroCriancaFormData>({
    nomeCompleto: '',
    idade: 0,
    dataNascimento: '',
    genero: 'Masculino',
    diagnostico: '',
    diagnosticoOutro: '',
    nomeResponsavel: '',
    telefone: '',
    email: '',
    endereco: '',
    parentesco: 'PAI',
    observacoes: '',
  })

  useEffect(() => {
    const fetchCrianca = async () => {
      try {
        setIsLoading(true)

        if (!id) {
          console.error('ID da criança não fornecido')
          return
        }

        // Buscar criança pelo ID usando a API real
        const criancaData = await buscarCriancaPorId(parseInt(id))
        setCrianca(criancaData)

        // Preencher formulário com dados existentes - criando uma cópia para evitar referências compartilhadas
        const novoFormData = {
          nomeCompleto: String(criancaData.nome || ''),
          idade: Number(criancaData.idade || 0),
          dataNascimento: String(criancaData.dataNascimento || ''),
          genero:
            (criancaData.genero as
              | 'Masculino'
              | 'Feminino'
              | 'Outro'
              | 'Prefiro não informar') || 'Outro',
          diagnostico: String(criancaData.diagnostico || ''),
          diagnosticoOutro: '',
          nomeResponsavel: String(criancaData.responsavel?.nome || ''),
          telefone: String(criancaData.responsavel?.telefone || ''),
          email: String(criancaData.responsavel?.email || ''),
          endereco: String(criancaData.responsavel?.endereco || ''),
          parentesco:
            (criancaData.parentesco as
              | 'PAI'
              | 'MAE'
              | 'AVO'
              | 'AVOA'
              | 'TIO'
              | 'TIA'
              | 'TUTOR'
              | 'OUTRO') || 'OUTRO',
          observacoes: String(criancaData.observacoes || ''),
        }

        setFormData(novoFormData)
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

  // Função para atualizar dados do formulário de forma isolada
  const updateFormData = (
    field: keyof CadastroCriancaFormData,
    value: string | number,
  ) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }))
  }

  // Função para atualizar dados aninhados do responsável
  const updateResponsavelData = (
    field: keyof CadastroCriancaFormData,
    value: string,
  ) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!id || !crianca) {
      notificarErro(
        'Dados não encontrados',
        'Não foi possível encontrar os dados da criança para edição.',
        { duration: 4000 },
      )
      navigate('/profissional/criancas')
      return
    }

    try {
      // Preparar dados para atualização
      const updateData: AtualizarCriancaData = {
        nome: formData.nomeCompleto,
        dataNascimento: formData.dataNascimento,
        genero: formData.genero,
        diagnostico:
          formData.diagnostico === 'Outro'
            ? formData.diagnosticoOutro
            : formData.diagnostico,
        observacoes: formData.observacoes,
        parentesco: formData.parentesco,
        responsavel: {
          nome: formData.nomeResponsavel,
          telefone: formData.telefone,
          email: formData.email,
          endereco: formData.endereco,
        },
      }

      // Atualizar criança usando a API real
      await atualizarCrianca(parseInt(id), updateData)

      notificarSucesso(
        'Dados atualizados!',
        `As informações de ${formData.nomeCompleto} foram atualizadas com sucesso!`,
        { duration: 5000 },
      )
      navigate('/profissional/criancas')
    } catch (error) {
      console.error('Erro ao atualizar criança:', error)
      notificarErro(
        'Erro na atualização',
        'Não foi possível atualizar os dados da criança. Tente novamente.',
        { duration: 5000 },
      )
    }
  }

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-green-600'></div>
          <p className='mt-4 text-gray-600'>Carregando dados da criança...</p>
        </div>
      </div>
    )
  }

  if (!crianca) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <h2 className='mb-2 text-xl font-semibold text-gray-900'>
            Criança não encontrada
          </h2>
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
            <h1 className='text-3xl font-bold text-gray-900'>Editar Criança</h1>
            <p className='mt-1 text-gray-600'>
              Atualize as informações da criança
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className='mx-auto max-w-4xl'>
        <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
          {/* Header do Form */}
          <div className='bg-gradient-to-r from-green-600 to-green-700 px-6 py-6'>
            <div className='flex items-center gap-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-white/20'>
                <svg
                  className='h-6 w-6 text-white'
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
              </div>
              <div>
                <h2 className='text-xl font-bold text-white'>
                  Editando: {crianca.nome}
                </h2>
                <p className='text-green-100'>ID #{crianca.id}</p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className='p-6'
          >
            {/* Informações Básicas */}
            <div className='mb-8'>
              <h3 className='mb-6 text-lg font-semibold text-gray-900'>
                Informações Básicas
              </h3>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>
                    Nome Completo <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.nomeCompleto}
                    onChange={(e) =>
                      updateFormData('nomeCompleto', e.target.value)
                    }
                    className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>
                    Idade <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='number'
                    required
                    min='0'
                    max='18'
                    value={formData.idade}
                    onChange={(e) =>
                      updateFormData('idade', parseInt(e.target.value) || 0)
                    }
                    className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>
                    Data de Nascimento <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='date'
                    required
                    value={formData.dataNascimento}
                    onChange={(e) =>
                      updateFormData('dataNascimento', e.target.value)
                    }
                    className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>
                    Gênero <span className='text-red-500'>*</span>
                  </label>
                  <select
                    required
                    value={formData.genero}
                    onChange={(e) =>
                      updateFormData(
                        'genero',
                        e.target.value as
                          | 'Masculino'
                          | 'Feminino'
                          | 'Outro'
                          | 'Prefiro não informar',
                      )
                    }
                    className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  >
                    <option value='Masculino'>Masculino</option>
                    <option value='Feminino'>Feminino</option>
                    <option value='Outro'>Outro</option>
                    <option value='Prefiro não informar'>
                      Prefiro não informar
                    </option>
                  </select>
                </div>

                <div className='md:col-span-2'>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>
                    Diagnóstico <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.diagnostico}
                    onChange={(e) =>
                      updateFormData('diagnostico', e.target.value)
                    }
                    className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  />
                </div>
              </div>
            </div>

            {/* Informações do Responsável */}
            <div className='mb-8'>
              <h3 className='mb-6 text-lg font-semibold text-gray-900'>
                Informações do Responsável
              </h3>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>
                    Nome do Responsável <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.nomeResponsavel}
                    onChange={(e) =>
                      updateResponsavelData('nomeResponsavel', e.target.value)
                    }
                    className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>
                    Parentesco <span className='text-red-500'>*</span>
                  </label>
                  <select
                    required
                    value={formData.parentesco}
                    onChange={(e) =>
                      updateResponsavelData(
                        'parentesco',
                        e.target.value as
                          | 'PAI'
                          | 'MAE'
                          | 'AVO'
                          | 'AVOA'
                          | 'TIO'
                          | 'TIA'
                          | 'TUTOR'
                          | 'OUTRO',
                      )
                    }
                    className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  >
                    <option value='PAI'>Pai</option>
                    <option value='MAE'>Mãe</option>
                    <option value='AVO'>Avô</option>
                    <option value='AVOA'>Avó</option>
                    <option value='TIO'>Tio</option>
                    <option value='TIA'>Tia</option>
                    <option value='TUTOR'>Tutor/Responsável Legal</option>
                    <option value='OUTRO'>Outro</option>
                  </select>
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>
                    Telefone <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='tel'
                    required
                    value={formData.telefone}
                    onChange={(e) =>
                      updateResponsavelData('telefone', e.target.value)
                    }
                    className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>
                    E-mail
                  </label>
                  <input
                    type='email'
                    value={formData.email}
                    onChange={(e) =>
                      updateResponsavelData('email', e.target.value)
                    }
                    className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className='mb-8'>
              <h3 className='mb-6 text-lg font-semibold text-gray-900'>
                Observações
              </h3>
              <textarea
                value={formData.observacoes}
                onChange={(e) => updateFormData('observacoes', e.target.value)}
                className='w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                rows={4}
                placeholder='Informações adicionais sobre a criança...'
              />
            </div>

            {/* Botões */}
            <div className='flex gap-4 border-t border-gray-200 pt-6'>
              <button
                type='button'
                onClick={() => navigate('/profissional/criancas')}
                className='flex-1 rounded-lg border border-gray-300 px-6 py-3 font-medium transition-colors hover:bg-gray-50'
              >
                Cancelar
              </button>
              <button
                type='submit'
                className='flex-1 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700'
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  )
}
