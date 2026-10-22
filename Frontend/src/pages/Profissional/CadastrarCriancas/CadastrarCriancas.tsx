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
import { queryClient, QUERY_KEYS } from '~/api/query-client'

type FiltroDiagnostico = 'TODOS' | 'COM_DIAGNOSTICO' | 'SEM_DIAGNOSTICO'

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
  const [expiracaoVinculo, setExpiracaoVinculo] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroDiagnostico, setFiltroDiagnostico] =
    useState<FiltroDiagnostico>('TODOS')

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

      const criancasData = response.items
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
    const termo = searchTerm.trim().toLowerCase()
    const filtered = criancas.filter((crianca) => {
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
    setCriancasFiltradas(filtered)
  }, [filtroDiagnostico, searchTerm, criancas])

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
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CRIANCAS] }),
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_PROFISSIONAL] }),
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_PROFISSIONAL_CRIANCAS] }),
          ])

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
      setCodigoVinculo(response.codigo)
      setQrcodeVinculo(response.qrCodeDataUrl)
      setNomeCriancaVinculo(crianca.nome)
      setExpiracaoVinculo(response.expiraEm)
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

      // Usar a função de cadastro com tipagem correta
      await cadastrarCrianca(dadosParaEnvio)

      // Limpar formulário e fechar modal de cadastro IMEDIATAMENTE
      setFormData(getInitialFormData())
      fecharModal()

      // Recarregar lista
      await Promise.all([
        fetchCriancas(),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CRIANCAS] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_PROFISSIONAL] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_PROFISSIONAL_CRIANCAS] }),
      ])

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
          {/* Busca e filtros */}
          <div className='mb-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:flex-row md:items-center'>
            <div className='w-full md:max-w-xl'>
              <label htmlFor='busca-criancas-profissional' className='sr-only'>
                Buscar crianças por nome ou diagnóstico
              </label>
              <input
                id='busca-criancas-profissional'
                type='search'
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder='Buscar por nome ou diagnóstico...'
                className='w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100'
              />
            </div>
            <div>
              <label htmlFor='filtro-criancas-profissional' className='sr-only'>
                Filtrar por diagnóstico
              </label>
              <select
                id='filtro-criancas-profissional'
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

          {/* Lista de Crianças */}
          {isLoading ? (
            <div
              role='status'
              className='py-8 text-center'
            >
              <div
                aria-hidden='true'
                className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-green-600'
              ></div>
              <p className='mt-2 text-gray-500'>Carregando crianças...</p>
            </div>
          ) : criancasFiltradas.length === 0 ? (
            <div className='py-8 text-center'>
              {searchTerm || filtroDiagnostico !== 'TODOS' ? (
                <p className='text-gray-500'>
                  Nenhuma criança encontrada com a busca ou o filtro atual.
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
        onSuccess={() => {
          setShowModal(false)
          void fetchCriancas()
        }}
      />

      {/* Modal com código de vínculo e QR code */}
      <ModalCodigoVinculo
        isOpen={showModalCodigoVinculo}
        codigoVinculo={codigoVinculo}
        qrcodeUrl={qrcodeVinculo}
        nomeCrianca={nomeCriancaVinculo}
        expiraEm={expiracaoVinculo}
        onClose={() => setShowModalCodigoVinculo(false)}
      />
    </>
  )
}
