// import { useNavigate } from "react-router-dom"; // Removido import duplicado

// ...existing code...

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotificacoesContext } from '../../../api/barraNotificacao'
import {
  cadastrarCrianca,
  excluirCrianca,
  listarCriancas,
  obterCodigoVinculo,
  type CadastroCriancaFormData,
  type CriancaListagem,
} from '../../../api/protected/axiosCadastroCrianca'
import Header from '../../../components/layout/Header'
import BarraConfirmacao from '../../../components/features/ModalConfirmacao'
import ModalCodigoVinculo from '../../../components/VinculacaoCrianca/ModalCodigoVinculo'
import { useConfirmacao } from '../../../hooks/useConfirmacao'
import { PageLayout } from '~/components/layout'
import LayoutCriancaCadastrada from './LayoutCriancaCadastrada'
import { CadastrarCriancaDialog } from '~/features/CadastrarCrianca'

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
  const [showModalCodigoVinculo, setShowModalCodigoVinculo] = useState(false)
  const [codigoVinculo, setCodigoVinculo] = useState('')
  const [qrcodeVinculo, setQrcodeVinculo] = useState('')
  const [nomeCriancaVinculo, setNomeCriancaVinculo] = useState('')
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

  // Visualizar código de vínculo
  const handleVisualizarCodigoVinculo = async (criancaId: number) => {
    const crianca = criancas.find((c) => c.id === criancaId)
    if (!crianca) return

    try {
      const response = await obterCodigoVinculo(criancaId)
      setCodigoVinculo(response.codigoParaVinculo)
      setQrcodeVinculo(response.qrcodeParaVinculo)
      setNomeCriancaVinculo(crianca.nome)
      setShowModalCodigoVinculo(true)
    } catch (error) {
      console.error('Erro ao obter código de vínculo:', error)
      notificarErro(
        'Erro ao obter código',
        'Não foi possível obter o código de vínculo. Tente novamente.',
        { duration: 5000 },
      )
    }
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
      const response = await cadastrarCrianca(dadosParaEnvio)

      // Limpar formulário e fechar modal de cadastro IMEDIATAMENTE
      setFormData(getInitialFormData())
      fecharModal()

      // Exibir modal com código de vínculo AUTOMATICAMENTE
      if (response.codigoParaVinculo && response.qrcodeParaVinculo) {
        setCodigoVinculo(response.codigoParaVinculo)
        setQrcodeVinculo(response.qrcodeParaVinculo)
        setNomeCriancaVinculo(formData.nomeCompleto)
        setShowModalCodigoVinculo(true)
      }

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
    <>
      <PageLayout>
        {/* Header com barra de pesquisa */}
        <Header
          title='Crianças'
          description='Gerencie as crianças cadastradas no sistema'
          className='xs:flex-row flex-col xs:items-center justify-between gap-2'
        >
          <div className='flex items-center gap-4'>
            {/* Botão Nova Criança */}
            <button
              onClick={abrirModalCadastro}
              className='xs:flex-initial flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700'
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
                  onVisualizarCodigo={handleVisualizarCodigoVinculo}
                />
              ))}
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
      <CadastrarCriancaDialog
        open={showModal}
        onOpenChange={setShowModal}
        onSuccess={() => setShowModal(false)}
      />

      {/* Modal com código de vínculo e QR code */}
      <ModalCodigoVinculo
        isOpen={showModalCodigoVinculo}
        codigoVinculo={codigoVinculo}
        qrcodeUrl={qrcodeVinculo}
        nomeCrianca={nomeCriancaVinculo}
        onClose={() => setShowModalCodigoVinculo(false)}
      />
    </>
  )
}
