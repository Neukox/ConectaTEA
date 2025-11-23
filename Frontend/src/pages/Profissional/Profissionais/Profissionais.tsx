import { useState, useEffect, useRef, useCallback } from 'react'
import { useNotificacoesContext } from '../../../api/barraNotificacao'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Linkedin,
  Facebook,
  Instagram,
  Filter,
  Eye,
  Check,
  UserPlus,
} from 'lucide-react'
import type { Profissional as ApiProfissional } from '../../../api/protected/axiosProfissionais'

import {
  listarProfissionais,
  obterProfissionalPorUsuarioId,
} from '../../../api/protected/axiosProfissionais'

import {
  enviarSolicitacao,
  aceitarSolicitacao,
  removerSolicitacao,
  listarSolicitacoesRecebidas,
  listarSolicitacoesEnviadas,
  listarConexoesPorProfissional,
  type ConexaoProfissional,
} from '../../../api/protected/axiosAmizade'
import Header from '../../../components/Header'

// --- Tipagem estendida do profissional para a UI
interface Profissional extends ApiProfissional {
  status: 'Online' | 'Offline'
  codigo?: string
  conectado?: boolean
  requestStatus?: 'received' | 'sent'
  avatar?: string
  abordagem?: string
}

function getLoggedUserId(): number | null {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      const u = JSON.parse(userData)
      return u?.id ?? u?.userId ?? null
    } catch {
      return null
    }
  }
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload?.id ?? payload?.userId ?? null
    } catch {
      return null
    }
  }
  return null
}

// Retorna a URL de rede social de um profissional
function getRedeUrl(prof: Profissional, tipoBusca: string): string | null {
  const tipo = tipoBusca.toLowerCase()

  if (prof.redes) {
    const val = prof.redes[tipo] ?? prof.redes[tipoBusca]
    if (val) return val
  }

  const redesArray = prof.redesArray ?? prof.redesSociais ?? []
  if (Array.isArray(redesArray)) {
    const found = redesArray.find((r) => r.tipo?.toLowerCase().includes(tipo))
    if (found?.url) return found.url
  }

  return null
}

// Componente para ícones de redes sociais
function SocialIcons({ prof }: { prof: Profissional }) {
  const redes = [
    { tipo: 'linkedin', Icon: Linkedin, color: 'text-blue-600' },
    { tipo: 'facebook', Icon: Facebook, color: 'text-blue-500' },
    { tipo: 'instagram', Icon: Instagram, color: 'text-pink-500' },
  ]

  return (
    <div className='mt-1 flex gap-3'>
      {redes.map(({ tipo, Icon, color }) => {
        const url = getRedeUrl(prof, tipo)
        if (!url) return null
        return (
          <a
            key={tipo}
            href={url}
            target='_blank'
            rel='noreferrer'
          >
            <Icon className={`h-5 w-5 ${color}`} />
          </a>
        )
      })}
    </div>
  )
}

// --- Componente principal ---
export default function Profissionais() {
  const { notificarSucesso, notificarErro } = useNotificacoesContext()
  const navigate = useNavigate()

  // --- States ---
  const [tab, setTab] = useState<'todos' | 'conexoes'>('todos')
  const [searchInput, setSearchInput] = useState('')
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [conexoes, setConexoes] = useState<ConexaoProfissional[]>([])
  const [loggedProfissionalId, setLoggedProfissionalId] = useState<
    number | null
  >(null)
  // const [showModal, setShowModal] = useState(false); // Unused for now

  const searchDebounceRef = useRef<number | null>(null)
  const loggedUserId = getLoggedUserId()

  // --- Funções de conexão ---
  const handleConectar = async (prof: Profissional) => {
    if (!loggedUserId) return

    try {
      let solicitanteProfId = loggedProfissionalId

      if (!solicitanteProfId) {
        const profLog = await obterProfissionalPorUsuarioId(loggedUserId)
        if (profLog?.id) {
          solicitanteProfId = profLog.id
          setLoggedProfissionalId(profLog.id)
        }
      }

      if (solicitanteProfId)
        await enviarSolicitacao(solicitanteProfId, prof.id, { tipo: 'prof' })
      else await enviarSolicitacao(loggedUserId, prof.usuario_id ?? prof.id)

      setProfissionais((prev) =>
        prev.map((p) =>
          p.id === prof.id ? { ...p, requestStatus: 'sent' } : p,
        ),
      )
      notificarSucesso(
        'Solicitação enviada',
        'Solicitação de amizade enviada com sucesso!',
      )
    } catch (err) {
      console.error('Erro ao enviar solicitação:', err)
      notificarErro(
        'Erro ao enviar solicitação',
        'Não foi possível enviar a solicitação de amizade.',
      )
    }
  }

  const handleAceitar = async (prof: Profissional) => {
    if (!loggedProfissionalId) return

    try {
      // Encontra a conexão recebida específica para este profissional
      const conexaoParaAceitar = conexoes.find(
        (c) =>
          c.solicitante_id === prof.id &&
          c.solicitado_id === loggedProfissionalId &&
          c.status === 'PENDENTE',
      )

      if (!conexaoParaAceitar) {
        notificarErro(
          'Erro',
          'Não foi possível encontrar a solicitação para aceitar.',
        )
        return
      }

      await aceitarSolicitacao(conexaoParaAceitar.id)

      setProfissionais((prev) =>
        prev.map((p) =>
          p.id === prof.id
            ? { ...p, conectado: true, requestStatus: undefined }
            : p,
        ),
      )

      // Atualiza a lista de conexões: remove da pendente e adiciona às aceitas
      const conex = await listarConexoesPorProfissional()

      // Busca as solicitações atualizadas
      const [recebidas, enviadas] = await Promise.all([
        listarSolicitacoesRecebidas(),
        listarSolicitacoesEnviadas(),
      ])

      // Atualiza todas as conexões
      const todasConexoes = [...recebidas, ...enviadas, ...conex]
      setConexoes(todasConexoes)

      const connectedIds = new Set(
        conex.flatMap((c) => [c.solicitante_id, c.solicitado_id]),
      )
      setProfissionais((prev) =>
        prev.map(
          (p) => ({ ...p, conectado: connectedIds.has(p.id) }) as Profissional,
        ),
      )
      notificarSucesso('Solicitação aceita', 'Conexão realizada com sucesso!')
    } catch (err) {
      console.error('Erro ao aceitar solicitação:', err)
      notificarErro(
        'Erro ao aceitar solicitação',
        'Não foi possível aceitar a solicitação de amizade.',
      )
    }
  }

  const handleRecusar = async (prof: Profissional) => {
    if (!loggedProfissionalId) return

    try {
      // Encontra a conexão recebida específica para este profissional
      const conexaoParaRecusar = conexoes.find(
        (c) =>
          c.solicitante_id === prof.id &&
          c.solicitado_id === loggedProfissionalId &&
          c.status === 'PENDENTE',
      )

      if (!conexaoParaRecusar) {
        notificarErro(
          'Erro',
          'Não foi possível encontrar a solicitação para recusar.',
        )
        return
      }

      await removerSolicitacao(conexaoParaRecusar.id)
      setProfissionais((prev) =>
        prev.map((p) =>
          p.id === prof.id ? { ...p, requestStatus: undefined } : p,
        ),
      )

      // Atualiza a lista de conexões removendo a recusada
      setConexoes((prev) => prev.filter((c) => c.id !== conexaoParaRecusar.id))

      notificarSucesso(
        'Solicitação recusada',
        'Solicitação de amizade recusada.',
      )
    } catch (err) {
      console.error('Erro ao recusar solicitação:', err)
      notificarErro(
        'Erro ao recusar solicitação',
        'Não foi possível recusar a solicitação de amizade.',
      )
    }
  }

  // --- Fetch profissionais ---
  const fetchProfissionais = useCallback(
    async (search?: string) => {
      try {
        const dados = await listarProfissionais(search ? { search } : undefined)

        const mapeados: Profissional[] = dados.map((d) => ({
          ...d,
          status: (d as unknown as Profissional).status ?? 'Offline',
          codigo: d.codigoIdentificacao ?? '',
          avatar: d.fotoPerfilUrl ?? undefined,
          conectado: false,
          requestStatus: undefined,
        }))

        // Filtra próprio usuário
        const filtrados = mapeados.filter(
          (p) =>
            !(loggedUserId && p.usuario_id === loggedUserId) &&
            !(loggedProfissionalId && p.id === loggedProfissionalId),
        )
        setProfissionais(filtrados)

        // Marca solicitações e conexões
        if (loggedUserId) {
          const [recebidas, enviadas] = await Promise.all([
            listarSolicitacoesRecebidas(),
            listarSolicitacoesEnviadas(),
          ])

          if (loggedProfissionalId) {
            // Busca todas as conexões (incluindo aceitas) do profissional logado
            const conexoesAceitas = await listarConexoesPorProfissional()

            // Armazena todas as conexões (pendentes + aceitas)
            const todasConexoes = [
              ...recebidas,
              ...enviadas,
              ...conexoesAceitas,
            ]
            setConexoes(todasConexoes)

            const connectedIds = new Set(
              conexoesAceitas.flatMap((c) => [
                c.solicitante_id,
                c.solicitado_id,
              ]),
            )
            setProfissionais((prev) =>
              prev.map(
                (p) =>
                  ({ ...p, conectado: connectedIds.has(p.id) }) as Profissional,
              ),
            )
          } else {
            // Se ainda não temos o ID do profissional, armazena só as pendentes
            const todasConexoes = [...recebidas, ...enviadas]
            setConexoes(todasConexoes)
          }

          const recebidasIds = new Set(recebidas.map((r) => r.solicitante_id))
          const enviadasIds = new Set(enviadas.map((r) => r.solicitado_id))

          setProfissionais((prev) =>
            prev.map((p) => ({
              ...p,
              requestStatus: recebidasIds.has(p.id)
                ? 'received'
                : enviadasIds.has(p.id)
                  ? 'sent'
                  : undefined,
            })),
          )
        }
      } catch (err) {
        console.error('Erro ao buscar profissionais:', err)
      }
    },
    [loggedUserId, loggedProfissionalId],
  )

  // --- Carrega profissionais e resolve o profissional do usuário ao montar ---
  useEffect(() => {
    async function carregar() {
      await fetchProfissionais()
      if (loggedUserId) {
        try {
          const profLog = await obterProfissionalPorUsuarioId(loggedUserId)
          if (profLog?.id) setLoggedProfissionalId(profLog.id)
        } catch (err) {
          console.warn('Erro ao resolver profissional do usuário logado:', err)
        }
      }
    }

    carregar()
  }, [fetchProfissionais, loggedUserId])

  // --- Debounce de busca ---
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = window.setTimeout(
      () => fetchProfissionais(searchInput.trim() || undefined),
      300,
    ) as unknown as number
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [searchInput, fetchProfissionais])

  // --- Dados para renderização ---
  const conexoesCount = profissionais.filter((p) => p.conectado).length
  const displayed =
    tab === 'todos' ? profissionais : profissionais.filter((p) => p.conectado)

  return (
    <div className='h-full bg-[#f8f9fb]'>
      {/* Header com busca e botão de ação */}
      <Header
        title='Profissionais'
        description='Encontre e conecte-se com outros especialistas'
        searchValue={searchInput}
        onSearchChange={(e) => setSearchInput(e.target.value)}
      >
        <button
          // onClick={() => setShowModal(true)}
          className='flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700'
        >
          <span className='text-lg'>+</span>
          Convidar Profissional
        </button>
      </Header>

      {/* Main content */}
      <main className='mx-auto max-w-7xl p-6 px-4'>
        {/* Tabs */}
        <div className='mb-6 flex gap-2'>
          <button
            onClick={() => setTab('todos')}
            className={`rounded-lg border px-4 py-2 transition-colors focus:ring-2 focus:ring-green-200 focus:outline-none ${
              tab === 'todos'
                ? 'border-green-600 bg-green-600 text-white'
                : 'border border-green-200 bg-white text-green-600 hover:bg-green-50'
            }`}
          >
            Todos os Profissionais
          </button>
          <button
            onClick={() => setTab('conexoes')}
            className={`rounded-lg border px-4 py-2 transition-colors focus:ring-2 focus:ring-green-200 focus:outline-none ${
              tab === 'conexoes'
                ? 'border-green-600 bg-green-600 text-white'
                : 'border border-green-200 bg-white text-green-600 hover:bg-green-50'
            }`}
          >
            Minhas Conexões ({conexoesCount})
          </button>
        </div>

        {/* Filtros */}
        <div className='mb-6 flex flex-wrap items-center gap-3 rounded-lg bg-white p-4 shadow'>
          <select className='rounded-lg border px-3 py-2 text-sm'>
            <option>Todas especialidades</option>
          </select>
          <select className='rounded-lg border px-3 py-2 text-sm'>
            <option>Todas cidades</option>
          </select>
          <button className='flex items-center gap-1 rounded-lg border px-3 py-2 text-sm'>
            <Filter className='h-4 w-4' /> Limpar
          </button>
        </div>

        {/* Cards */}
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {displayed.map((prof) => (
            <article
              key={prof.id}
              className='flex flex-col rounded-xl bg-white p-5 shadow'
            >
              <div className='mb-4 flex items-center gap-3'>
                <img
                  src={prof.avatar ?? '/conectatea.svg'}
                  alt={prof.nome ?? ''}
                  className='h-14 w-14 rounded-full border'
                  onError={(e) => {
                    ;(e.currentTarget as HTMLImageElement).src =
                      '/conectatea.svg'
                  }}
                />
                <div>
                  <h2 className='font-semibold'>{`${
                    prof.titulo ? prof.titulo + ' ' : ''
                  }${prof.nome ?? ''}`}</h2>
                  <div className='flex items-center gap-2 text-sm'>
                    <span className='rounded bg-blue-100 px-2 py-0.5 text-blue-700'>
                      {prof.especialidade ?? ''}
                    </span>
                  </div>
                </div>
              </div>

              <div className='mb-4 space-y-1 text-sm text-gray-600'>
                <div className='flex items-center gap-2'>
                  <MapPin className='h-4 w-4 text-gray-400' />
                  <span>
                    {prof.locais?.[0]?.cidade
                      ? `${prof.locais[0].cidade} - ${(prof.locais[0] as any).estado || ''}`
                      : 'Localização não informada'}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='font-medium text-gray-700'>Abordagem:</span>
                  <span>{prof.abordagem ?? '-'}</span>
                </div>
              </div>

              <SocialIcons prof={prof} />

              <div className='mt-auto flex gap-2 pt-4'>
                <button
                  onClick={() => navigate(`/profissional/perfil/${prof.id}`)}
                  className='flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 py-2 text-gray-700 transition hover:bg-gray-50'
                >
                  <Eye className='h-4 w-4' /> Ver Perfil
                </button>

                {prof.conectado ? (
                  <button className='flex flex-1 cursor-default items-center justify-center gap-2 rounded-lg bg-green-100 py-2 text-green-700'>
                    <Check className='h-4 w-4' /> Conectado
                  </button>
                ) : prof.requestStatus === 'sent' ? (
                  <button className='flex flex-1 cursor-default items-center justify-center gap-2 rounded-lg bg-gray-100 py-2 text-gray-500'>
                    <Check className='h-4 w-4' /> Enviado
                  </button>
                ) : prof.requestStatus === 'received' ? (
                  <div className='flex flex-1 gap-1'>
                    <button
                      onClick={() => handleAceitar(prof)}
                      className='flex-1 rounded-lg bg-green-600 py-2 text-xs text-white hover:bg-green-700'
                    >
                      Aceitar
                    </button>
                    <button
                      onClick={() => handleRecusar(prof)}
                      className='flex-1 rounded-lg bg-red-100 py-2 text-xs text-red-600 hover:bg-red-200'
                    >
                      Recusar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConectar(prof)}
                    className='flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 py-2 text-white transition hover:bg-green-700'
                  >
                    <UserPlus className='h-4 w-4' /> Conectar
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}
