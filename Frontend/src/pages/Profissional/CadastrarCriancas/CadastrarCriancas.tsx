// import { useNavigate } from "react-router-dom"; // Removido import duplicado

// ...existing code...

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  cadastrarCrianca,
  listarCriancas,
  excluirCrianca,
  type CadastroCriancaFormData,
  type CriancaListagem,
} from '../../../api/protected/axiosCadastroCrianca'
import { useNotificacoesContext } from '../../../api/barraNotificacao'
import { useConfirmacao } from '../../../hooks/useConfirmacao'
import BarraConfirmacao from '../../../components/ModalConfirmacao'
import LayoutCriancaCadastrada from './LayoutCriancaCadastrada'
import Header from '../../../components/Header'
import PageLayout from '../../../layouts/PageLayout'

// Tipo para dados do profissional (pode ser expandido conforme necessário)
interface ProfissionalInfo {
  nome: string
  email: string
}

export default function CadastrarCriancas() {
  const navigate = useNavigate()
  const { notificarSucesso, notificarErro } = useNotificacoesContext()
  const { confirmacao, mostrarConfirmacao } = useConfirmacao()
  const [criancas, setCriancas] = useState<CriancaListagem[]>([])
  const [criancasFiltradas, setCriancasFiltradas] = useState<CriancaListagem[]>(
    [],
  )
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Obter dados do profissional logado do localStorage
  const getProfissionalInfo = (): ProfissionalInfo => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        return {
          nome: user.name || 'Profissional',
          email: user.email || '',
        }
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error)
      }
    }
    return {
      nome: 'Dr. Maria Silva', // Fallback
      email: 'maria@conectatea.com',
    }
  }

  const [profissional] = useState<ProfissionalInfo>(getProfissionalInfo())

  // Função para criar um estado inicial limpo do formulário
  const getInitialFormData = (): CadastroCriancaFormData => ({
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

  const [formData, setFormData] =
    useState<CadastroCriancaFormData>(getInitialFormData())

  // Função para abrir o modal e garantir formulário limpo
  const abrirModalCadastro = () => {
    setFormData(getInitialFormData())
    setShowModal(true)
  }

  // Função para fechar o modal e limpar formulário
  const fecharModal = () => {
    setFormData(getInitialFormData())
    setShowModal(false)
  }

  // Buscar crianças do profissional
  const fetchCriancas = async () => {
    try {
      setIsLoading(true)
      const response = await listarCriancas()

      console.log('Resposta da API:', response) // Debug

      // A API retorna: { message, criancas: [...], total }
      // A função listarCriancas já retorna response.data, então acessamos diretamente
      const criancasData = response.criancas || []

      console.log('Crianças carregadas:', criancasData) // Debug
      setCriancas(criancasData)
      setCriancasFiltradas(criancasData)
    } catch (error) {
      console.error('Erro ao buscar crianças:', error)
      setCriancas([])
      setCriancasFiltradas([])
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar crianças baseado no termo de busca
  useEffect(() => {
    if (!searchTerm.trim()) {
      setCriancasFiltradas(criancas)
      return
    }

    const filtered = criancas.filter(
      (crianca) =>
        crianca.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crianca.diagnostico.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crianca.responsavel.nome
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    )
    setCriancasFiltradas(filtered)
  }, [searchTerm, criancas])

  useEffect(() => {
    fetchCriancas()
  }, [])

  // Adicionar listener para recarregar quando voltar para a página
  useEffect(() => {
    const handleFocus = () => {
      fetchCriancas()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  // Excluir criança
  const handleExcluirCrianca = async (criancaId: number) => {
    const crianca = criancas.find((c) => c.id === criancaId)
    if (!crianca) return

    mostrarConfirmacao(
      {
        titulo: 'Confirmar Exclusão',
        mensagem: `Tem certeza que deseja excluir a criança "${crianca.nome}"?\n\nEsta ação não poderá ser desfeita.`,
        textoBotaoConfirmar: 'Excluir',
        textoBotaoCancelar: 'Cancelar',
        tipoConfirmacao: 'danger',
      },
      async () => {
        try {
          await excluirCrianca(criancaId)

          // Atualizar lista local removendo a criança excluída
          const novasCriancas = criancas.filter((c) => c.id !== criancaId)
          setCriancas(novasCriancas)
          setCriancasFiltradas(novasCriancas)

          notificarSucesso('Sucesso!', 'Criança excluída com sucesso!', {
            duration: 4000,
          })
        } catch (error) {
          console.error('Erro ao excluir criança:', error)
          notificarErro(
            'Erro ao excluir',
            'Não foi possível excluir a criança. Tente novamente.',
            { duration: 5000 },
          )
        }
      },
    )
  }

  // Cadastrar nova criança
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Debug: verificar dados antes do envio
      console.log('Dados do formulário antes do envio:', formData)

      // Criar uma cópia profunda dos dados para evitar referências
      const dadosParaEnvio = {
        nomeCompleto: String(formData.nomeCompleto).trim(),
        idade: Number(formData.idade) || 0,
        dataNascimento: String(formData.dataNascimento).trim(),
        genero: formData.genero,
        diagnostico: String(formData.diagnostico).trim(),
        diagnosticoOutro: String(formData.diagnosticoOutro || '').trim(),
        nomeResponsavel: String(formData.nomeResponsavel).trim(),
        telefone: String(formData.telefone).trim(),
        email: String(formData.email || '').trim(),
        endereco: String(formData.endereco || '').trim(),
        parentesco: formData.parentesco,
        observacoes: String(formData.observacoes || '').trim(),
      }

      console.log('Dados processados para envio:', dadosParaEnvio)

      // Usar a função de cadastro com tipagem correta
      await cadastrarCrianca(dadosParaEnvio)

      // Limpar formulário e fechar modal
      setFormData(getInitialFormData())
      fecharModal()

      // Recarregar lista
      fetchCriancas()

      // Mostrar mensagem de sucesso
      notificarSucesso(
        'Cadastro realizado!',
        `Criança ${formData.nomeCompleto} foi cadastrada com sucesso!`,
        { duration: 5000 },
      )
    } catch (error: unknown) {
      console.error('Erro ao cadastrar criança:', error)
      let errorMessage = 'Erro ao cadastrar criança.'
      // Type guard para AxiosError
      function isAxiosError(
        err: unknown,
      ): err is { response: { data: { message?: string } } } {
        if (typeof err !== 'object' || err === null) return false
        const maybeResponse = (err as Record<string, unknown>).response
        if (typeof maybeResponse !== 'object' || maybeResponse === null)
          return false
        const maybeData = (maybeResponse as Record<string, unknown>).data
        if (typeof maybeData !== 'object' || maybeData === null) return false
        return true
      }
      if (
        isAxiosError(error) &&
        'message' in error.response.data &&
        typeof error.response.data.message === 'string'
      ) {
        errorMessage = error.response.data.message
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message
      }
      notificarErro('Erro no cadastro', errorMessage, { duration: 6000 })
    }
  }

  return (
    <PageLayout>
      {/* Header com barra de pesquisa */}
      <Header
        title='Crianças'
        description='Gerencie as crianças cadastradas no sistema'
      >
        <div className='flex items-center gap-4'>
          {/* Botão Nova Criança */}
          <button
            onClick={abrirModalCadastro}
            className='flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700'
          >
            <span className='text-lg'>+</span>
            Nova Criança
          </button>
        </div>
      </Header>

      {/* Conteúdo principal */}
      <div className='p-6'>
        {/* Filtros adicionais */}
        <div className='mb-6 flex items-center gap-2'>
          <button className='flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-50'>
            <svg
              className='h-4 w-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z'
              />
            </svg>
            Filtros
          </button>
        </div>

        {/* Lista de Crianças */}
        {isLoading ? (
          <div className='py-8 text-center'>
            <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-green-600'></div>
            <p className='mt-2 text-gray-500'>Carregando crianças...</p>
          </div>
        ) : criancasFiltradas.length === 0 ? (
          <div className='py-8 text-center'>
            {searchTerm ? (
              <p className='text-gray-500'>
                Nenhuma criança encontrada para "{searchTerm}".
              </p>
            ) : (
              <>
                <p className='text-gray-500'>
                  Nenhuma criança cadastrada ainda.
                </p>
                <button
                  onClick={abrirModalCadastro}
                  className='mt-4 text-blue-600 hover:text-blue-800'
                >
                  Cadastrar primeira criança
                </button>
              </>
            )}
          </div>
        ) : (
          <div className='space-y-4'>
            {criancasFiltradas.map((crianca) => (
              <LayoutCriancaCadastrada
                key={crianca.id}
                crianca={crianca}
                profissional={profissional}
                onVerDetalhes={(criancaId) => {
                  navigate(`/profissional/criancas/detalhes/${criancaId}`)
                }}
                onEditar={(criancaId) => {
                  navigate(`/profissional/criancas/editar/${criancaId}`)
                }}
                onExcluir={handleExcluirCrianca}
              />
            ))}
          </div>
        )}

        {/* Modal de Cadastro - NOVO LAYOUT BASEADO NAS IMAGENS */}
        {showModal && (
          <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4'>
            <div className='max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white'>
              {/* Header do Modal */}
              <div className='flex items-center border-b bg-white p-6'>
                <button
                  onClick={fecharModal}
                  className='mr-4 text-xl text-gray-500 hover:text-gray-700'
                >
                  ←
                </button>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900'>
                    Nova Criança
                  </h2>
                  <p className='mt-1 text-sm text-gray-600'>
                    Cadastre uma nova criança no sistema
                  </p>
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
                          setFormData({
                            ...formData,
                            nomeCompleto: e.target.value,
                          })
                        }
                        className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                        placeholder='Digite o nome completo da criança'
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
                          setFormData({
                            ...formData,
                            idade: parseInt(e.target.value) || 0,
                          })
                        }
                        className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                        placeholder='Idade em anos'
                      />
                    </div>

                    <div>
                      <label className='mb-2 block text-sm font-medium text-gray-700'>
                        Data de Nascimento{' '}
                        <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='date'
                        required
                        value={formData.dataNascimento}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dataNascimento: e.target.value,
                          })
                        }
                        className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
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
                          setFormData({
                            ...formData,
                            genero: e.target.value as
                              | 'Masculino'
                              | 'Feminino'
                              | 'Outro'
                              | 'Prefiro não informar',
                          })
                        }
                        className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                      >
                        <option value=''>Selecione o gênero</option>
                        <option value='Masculino'>Masculino</option>
                        <option value='Feminino'>Feminino</option>
                        <option value='Outro'>Outro</option>
                        <option value='Prefiro não informar'>
                          Prefiro não informar
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className='mt-6'>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      Diagnóstico <span className='text-red-500'>*</span>
                    </label>
                    <select
                      required
                      value={formData.diagnostico}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          diagnostico: e.target.value,
                          diagnosticoOutro: '',
                        })
                      }
                      className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                    >
                      <option value=''>Selecione o diagnóstico</option>
                      <option value='TEA - Transtorno do Espectro Autista'>
                        TEA - Transtorno do Espectro Autista
                      </option>
                      <option value='TDAH - Transtorno do Déficit de Atenção com Hiperatividade'>
                        TDAH - Transtorno do Déficit de Atenção com
                        Hiperatividade
                      </option>
                      <option value='Síndrome de Down'>Síndrome de Down</option>
                      <option value='Deficiência Intelectual'>
                        Deficiência Intelectual
                      </option>
                      <option value='Paralisia Cerebral'>
                        Paralisia Cerebral
                      </option>
                      <option value='Síndrome de Asperger'>
                        Síndrome de Asperger
                      </option>
                      <option value='Outro'>Outro</option>
                    </select>
                  </div>

                  {/* Campo condicional para diagnóstico customizado */}
                  {formData.diagnostico === 'Outro' && (
                    <div className='mt-6'>
                      <label className='mb-2 block text-sm font-medium text-gray-700'>
                        Especifique o diagnóstico{' '}
                        <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='text'
                        required
                        value={formData.diagnosticoOutro}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            diagnosticoOutro: e.target.value,
                          })
                        }
                        className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                        placeholder='Digite o diagnóstico específico'
                      />
                    </div>
                  )}
                </div>

                {/* Informações do Responsável */}
                <div className='mb-8'>
                  <h3 className='mb-6 text-lg font-semibold text-gray-900'>
                    Informações do Responsável
                  </h3>
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <div className='md:col-span-2'>
                      <label className='mb-2 block text-sm font-medium text-gray-700'>
                        Nome do Responsável{' '}
                        <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='text'
                        required
                        value={formData.nomeResponsavel}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nomeResponsavel: e.target.value,
                          })
                        }
                        className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                        placeholder='Nome completo do responsável'
                      />
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
                          setFormData({ ...formData, telefone: e.target.value })
                        }
                        className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                        placeholder='(11) 99999-9999'
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
                          setFormData({
                            ...formData,
                            parentesco: e.target.value as
                              | 'PAI'
                              | 'MAE'
                              | 'AVO'
                              | 'AVOA'
                              | 'TIO'
                              | 'TIA'
                              | 'TUTOR'
                              | 'OUTRO',
                          })
                        }
                        className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
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

                    <div className='md:col-span-2'>
                      <label className='mb-2 block text-sm font-medium text-gray-700'>
                        E-mail
                      </label>
                      <input
                        type='email'
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                        placeholder='email@exemplo.com'
                      />
                    </div>

                    <div className='md:col-span-2'>
                      <label className='mb-2 block text-sm font-medium text-gray-700'>
                        Endereço
                      </label>
                      <input
                        type='text'
                        value={formData.endereco}
                        onChange={(e) =>
                          setFormData({ ...formData, endereco: e.target.value })
                        }
                        className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                        placeholder='Endereço completo'
                      />
                    </div>
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className='mb-8'>
                  <h3 className='mb-6 text-lg font-semibold text-gray-900'>
                    Informações Adicionais
                  </h3>
                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      Observações
                    </label>
                    <textarea
                      value={formData.observacoes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          observacoes: e.target.value,
                        })
                      }
                      className='w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                      rows={4}
                      placeholder='Informações adicionais sobre a criança, necessidades especiais, medicamentos, etc.'
                    />
                  </div>
                </div>

                {/* Botões */}
                <div className='flex gap-4 border-t border-gray-200 pt-6'>
                  <button
                    type='button'
                    onClick={fecharModal}
                    className='flex-1 rounded-lg border border-gray-300 px-6 py-3 font-medium transition-colors hover:bg-gray-50'
                  >
                    Cancelar
                  </button>
                  <button
                    type='submit'
                    className='flex-1 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700'
                  >
                    Cadastrar Criança
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Barra de Confirmação */}
        <BarraConfirmacao
          isOpen={confirmacao.isOpen}
          titulo={confirmacao.titulo}
          mensagem={confirmacao.mensagem}
          textoBotaoConfirmar={confirmacao.textoBotaoConfirmar}
          textoBotaoCancelar={confirmacao.textoBotaoCancelar}
          tipoConfirmacao={confirmacao.tipoConfirmacao}
          onConfirmar={confirmacao.onConfirmar}
          onCancelar={confirmacao.onCancelar}
          position='top-center'
        />
      </div>
    </PageLayout>
  )
}
