// src/pages/Profissionais.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNotificacoesContext } from "../../../api/barraNotificacao";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Linkedin,
  Facebook,
  Instagram,
  Filter,
  Eye,
  MessageSquare,
  Check,
  UserPlus,
} from "lucide-react";
import type { Profissional as ApiProfissional } from "../../../api/protected/axiosProfissionais";

import {
  listarProfissionais,
  obterProfissionalPorUsuarioId,
} from "../../../api/protected/axiosProfissionais";

import {
  enviarSolicitacao,
  aceitarSolicitacao,
  removerSolicitacao,
  listarSolicitacoesRecebidas,
  listarSolicitacoesEnviadas,
  listarConexoesPorProfissional,
  type ConexaoProfissional,
} from "../../../api/protected/axiosAmizade";

// --- Tipagem estendida do profissional para a UI
interface Profissional extends ApiProfissional {
  status: "Online" | "Offline";
  codigo?: string;
  conectado?: boolean;
  requestStatus?: "received" | "sent";
  avatar?: string;
}

function getLoggedUserId(): number | null {
  const userData = localStorage.getItem("user");
  if (userData) {
    try {
      const u = JSON.parse(userData);
      return u?.id ?? u?.userId ?? null;
    } catch {
      return null;
    }
  }
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.id ?? payload?.userId ?? null;
    } catch {
      return null;
    }
  }
  return null;
}

// Retorna a URL de rede social de um profissional
function getRedeUrl(prof: Profissional, tipoBusca: string): string | null {
  const tipo = tipoBusca.toLowerCase();

  if (prof.redes) {
    const val = prof.redes[tipo] ?? prof.redes[tipoBusca];
    if (val) return val;
  }

  const redesArray = prof.redesArray ?? prof.redesSociais ?? [];
  if (Array.isArray(redesArray)) {
    const found = redesArray.find((r) => r.tipo?.toLowerCase().includes(tipo));
    if (found?.url) return found.url;
  }

  return null;
}

// Componente para ícones de redes sociais
function SocialIcons({ prof }: { prof: Profissional }) {
  const redes = [
    { tipo: "linkedin", Icon: Linkedin, color: "text-blue-600" },
    { tipo: "facebook", Icon: Facebook, color: "text-blue-500" },
    { tipo: "instagram", Icon: Instagram, color: "text-pink-500" },
  ];

  return (
    <div className="flex gap-3 mt-1">
      {redes.map(({ tipo, Icon, color }) => {
        const url = getRedeUrl(prof, tipo);
        if (!url) return null;
        return (
          <a key={tipo} href={url} target="_blank" rel="noreferrer">
            <Icon className={`w-5 h-5 ${color}`} />
          </a>
        );
      })}
    </div>
  );
}

// --- Componente principal ---
export default function Profissionais() {
  const { notificarSucesso, notificarErro } = useNotificacoesContext();
  const navigate = useNavigate();

  // --- States ---
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"todos" | "conexoes">("todos");
  const [searchInput, setSearchInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [conexoes, setConexoes] = useState<ConexaoProfissional[]>([]);
  const [loggedProfissionalId, setLoggedProfissionalId] = useState<
    number | null
  >(null);

  const searchDebounceRef = useRef<number | null>(null);
  const loggedUserId = getLoggedUserId();

  // --- Funções de conexão ---
  const handleConectar = async (prof: Profissional) => {
    if (!loggedUserId) return;

    try {
      let solicitanteProfId = loggedProfissionalId;

      if (!solicitanteProfId) {
        const profLog = await obterProfissionalPorUsuarioId(loggedUserId);
        if (profLog?.id) {
          solicitanteProfId = profLog.id;
          setLoggedProfissionalId(profLog.id);
        }
      }

      if (solicitanteProfId)
        await enviarSolicitacao(solicitanteProfId, prof.id, { tipo: "prof" });
      else await enviarSolicitacao(loggedUserId, prof.usuario_id ?? prof.id);

      setProfissionais((prev) =>
        prev.map((p) =>
          p.id === prof.id ? { ...p, requestStatus: "sent" } : p
        )
      );
      notificarSucesso(
        "Solicitação enviada",
        "Solicitação de amizade enviada com sucesso!"
      );
    } catch (err) {
      console.error("Erro ao enviar solicitação:", err);
      notificarErro(
        "Erro ao enviar solicitação",
        "Não foi possível enviar a solicitação de amizade."
      );
    }
  };

  const handleAceitar = async (prof: Profissional) => {
    if (!loggedProfissionalId) return;

    try {
      // Encontra a conexão recebida específica para este profissional
      const conexaoParaAceitar = conexoes.find(
        (c) =>
          c.solicitante_id === prof.id &&
          c.solicitado_id === loggedProfissionalId &&
          c.status === "PENDENTE"
      );

      if (!conexaoParaAceitar) {
        notificarErro(
          "Erro",
          "Não foi possível encontrar a solicitação para aceitar."
        );
        return;
      }

      await aceitarSolicitacao(conexaoParaAceitar.id);

      setProfissionais((prev) =>
        prev.map((p) =>
          p.id === prof.id
            ? { ...p, conectado: true, requestStatus: undefined }
            : p
        )
      );

      // Atualiza a lista de conexões: remove da pendente e adiciona às aceitas
      const conex = await listarConexoesPorProfissional();

      // Busca as solicitações atualizadas
      const [recebidas, enviadas] = await Promise.all([
        listarSolicitacoesRecebidas(),
        listarSolicitacoesEnviadas(),
      ]);

      // Atualiza todas as conexões
      const todasConexoes = [...recebidas, ...enviadas, ...conex];
      setConexoes(todasConexoes);

      const connectedIds = new Set(
        conex.flatMap((c) => [c.solicitante_id, c.solicitado_id])
      );
      setProfissionais((prev) =>
        prev.map(
          (p) => ({ ...p, conectado: connectedIds.has(p.id) } as Profissional)
        )
      );
      notificarSucesso("Solicitação aceita", "Conexão realizada com sucesso!");
    } catch (err) {
      console.error("Erro ao aceitar solicitação:", err);
      notificarErro(
        "Erro ao aceitar solicitação",
        "Não foi possível aceitar a solicitação de amizade."
      );
    }
  };

  const handleRecusar = async (prof: Profissional) => {
    if (!loggedProfissionalId) return;

    try {
      // Encontra a conexão recebida específica para este profissional
      const conexaoParaRecusar = conexoes.find(
        (c) =>
          c.solicitante_id === prof.id &&
          c.solicitado_id === loggedProfissionalId &&
          c.status === "PENDENTE"
      );

      if (!conexaoParaRecusar) {
        notificarErro(
          "Erro",
          "Não foi possível encontrar a solicitação para recusar."
        );
        return;
      }

      await removerSolicitacao(conexaoParaRecusar.id);
      setProfissionais((prev) =>
        prev.map((p) =>
          p.id === prof.id ? { ...p, requestStatus: undefined } : p
        )
      );

      // Atualiza a lista de conexões removendo a recusada
      setConexoes((prev) => prev.filter((c) => c.id !== conexaoParaRecusar.id));

      notificarSucesso(
        "Solicitação recusada",
        "Solicitação de amizade recusada."
      );
    } catch (err) {
      console.error("Erro ao recusar solicitação:", err);
      notificarErro(
        "Erro ao recusar solicitação",
        "Não foi possível recusar a solicitação de amizade."
      );
    }
  };

  // --- Fetch profissionais ---
  const fetchProfissionais = useCallback(
    async (search?: string) => {
      setSearching(!!search);
      try {
        const dados = await listarProfissionais(
          search ? { search } : undefined
        );

        const mapeados: Profissional[] = dados.map((d) => ({
          ...d,
          status: (d as unknown as Profissional).status ?? "Offline",
          codigo: d.codigoIdentificacao ?? "",
          avatar: d.fotoPerfilUrl ?? undefined,
          conectado: false,
          requestStatus: undefined,
        }));

        // Filtra próprio usuário
        const filtrados = mapeados.filter(
          (p) =>
            !(loggedUserId && p.usuario_id === loggedUserId) &&
            !(loggedProfissionalId && p.id === loggedProfissionalId)
        );
        setProfissionais(filtrados);

        // Marca solicitações e conexões
        if (loggedUserId) {
          const [recebidas, enviadas] = await Promise.all([
            listarSolicitacoesRecebidas(),
            listarSolicitacoesEnviadas(),
          ]);

          if (loggedProfissionalId) {
            // Busca todas as conexões (incluindo aceitas) do profissional logado
            const conexoesAceitas = await listarConexoesPorProfissional();

            // Armazena todas as conexões (pendentes + aceitas)
            const todasConexoes = [
              ...recebidas,
              ...enviadas,
              ...conexoesAceitas,
            ];
            setConexoes(todasConexoes);

            const connectedIds = new Set(
              conexoesAceitas.flatMap((c) => [
                c.solicitante_id,
                c.solicitado_id,
              ])
            );
            setProfissionais((prev) =>
              prev.map(
                (p) =>
                  ({ ...p, conectado: connectedIds.has(p.id) } as Profissional)
              )
            );
          } else {
            // Se ainda não temos o ID do profissional, armazena só as pendentes
            const todasConexoes = [...recebidas, ...enviadas];
            setConexoes(todasConexoes);
          }

          const recebidasIds = new Set(recebidas.map((r) => r.solicitante_id));
          const enviadasIds = new Set(enviadas.map((r) => r.solicitado_id));

          setProfissionais((prev) =>
            prev.map((p) => ({
              ...p,
              requestStatus: recebidasIds.has(p.id)
                ? "received"
                : enviadasIds.has(p.id)
                ? "sent"
                : undefined,
            }))
          );
        }
      } catch (err) {
        console.error("Erro ao buscar profissionais:", err);
      } finally {
        setSearching(false);
      }
    },
    [loggedUserId, loggedProfissionalId]
  );

  // --- Carrega profissionais e resolve o profissional do usuário ao montar ---
  useEffect(() => {
    async function carregar() {
      await fetchProfissionais();
      if (loggedUserId) {
        try {
          const profLog = await obterProfissionalPorUsuarioId(loggedUserId);
          if (profLog?.id) setLoggedProfissionalId(profLog.id);
        } catch (err) {
          console.warn("Erro ao resolver profissional do usuário logado:", err);
        }
      }
    }

    carregar();
  }, [fetchProfissionais, loggedUserId]);

  // --- Debounce de busca ---
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = window.setTimeout(
      () => fetchProfissionais(searchInput.trim() || undefined),
      300
    ) as unknown as number;
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchInput, fetchProfissionais]);

  // --- Dados para renderização ---
  const conexoesCount = profissionais.filter((p) => p.conectado).length;
  const displayed =
    tab === "todos" ? profissionais : profissionais.filter((p) => p.conectado);

  return (
    <div className="h-full bg-[#f8f9fb]">
      {/* Top header bar (title + actions) */}
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          {/* Title + subtitle in header */}
          <div>
            <h1 className="text-2xl font-bold">Rede de Profissionais</h1>
            <p className="text-sm text-gray-500 mt-1">
              Conecte-se e colabore com outros profissionais de saúde
            </p>
          </div>

          {/* Actions on the right */}
          <div className="flex items-center gap-4">
            <button
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              onClick={() => {
                if (searchInputRef.current) {
                  searchInputRef.current.focus();
                }
              }}
            >
              <span className="text-lg">+</span>
              Adicionar
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v18H3V3h6z"
                />
              </svg>
            </button>
            <div className="relative flex items-center gap-2 group/profile">
              <button
                className="flex items-center gap-2 focus:outline-none"
                tabIndex={0}
              >
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="avatar"
                  className="w-10 h-10 rounded-full border-2 border-green-500"
                />
                <div className="text-right hidden sm:block">
                  <p className="font-semibold text-sm leading-4">
                    Gabriel Falcão da Cruz
                  </p>
                  <span className="text-green-600 text-xs font-bold">
                    PROFISSIONAL
                  </span>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 ml-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {/* Dropdown */}
              <div className="absolute right-0 top-14 z-20 min-w-[160px] bg-white border border-gray-200 rounded-xl shadow-lg py-2 opacity-0 pointer-events-none group-hover/profile:opacity-100 group-hover/profile:pointer-events-auto group-focus-within/profile:opacity-100 group-focus-within/profile:pointer-events-auto transition-all duration-200">
                <a
                  href="#"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                >
                  Configurações
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                >
                  Perfil
                </a>
                <button
                  onClick={() => {
                    localStorage.clear();
                    if (typeof window !== "undefined")
                      window.location.href = "/login";
                  }}
                  className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("todos")}
            className={`px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-green-200 ${
              tab === "todos"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-green-600 border border-green-200 hover:bg-green-50"
            }`}
          >
            Todos os Profissionais
          </button>
          <button
            onClick={() => setTab("conexoes")}
            className={`px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-green-200 ${
              tab === "conexoes"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-green-600 border border-green-200 hover:bg-green-50"
            }`}
          >
            Minhas Conexões ({conexoesCount})
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 items-center mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400 w-5 h-5" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={
                searching
                  ? "Buscando..."
                  : "Buscar por nome ou especialidade..."
              }
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm"
            />
            {/* Sugestões de busca (aparecem apenas quando há texto no input) */}
            {searchInput.trim().length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow z-40">
                {searching ? (
                  <div className="p-3 text-sm text-gray-600">Buscando...</div>
                ) : profissionais.length === 0 ? (
                  <div className="p-3 text-sm text-gray-600">
                    Nenhum profissional encontrado
                  </div>
                ) : (
                  <ul className="max-h-56 overflow-auto">
                    {profissionais.slice(0, 6).map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between px-3 py-2 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={p.avatar ?? "/conectatea.svg"}
                            alt={p.nome ?? ""}
                            className="w-8 h-8 rounded-full"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "/conectatea.svg";
                            }}
                          />
                          <div className="text-sm">
                            <div className="font-medium">{p.nome ?? ""}</div>
                            <div className="text-xs text-gray-500">
                              {p.especialidade ?? ""}
                            </div>
                          </div>
                        </div>
                        <div>
                          <button
                            onClick={() => handleConectar(p)}
                            className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg"
                          >
                            Adicionar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>Todas especialidades</option>
          </select>
          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>Todas cidades</option>
          </select>
          <button className="flex items-center gap-1 border rounded-lg px-3 py-2 text-sm">
            <Filter className="w-4 h-4" /> Limpar
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((prof) => (
            <article
              key={prof.id}
              className="bg-white rounded-xl shadow p-5 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={prof.avatar ?? "/conectatea.svg"}
                  alt={prof.nome ?? ""}
                  className="w-14 h-14 rounded-full border"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "/conectatea.svg";
                  }}
                />
                <div>
                  <h2 className="font-semibold">{`${
                    prof.titulo ? prof.titulo + " " : ""
                  }${prof.nome ?? ""}`}</h2>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      {prof.especialidade ?? ""}
                    </span>
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {prof.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {prof.registro_profissional ? (
                      <span className="mr-2">{prof.registro_profissional}</span>
                    ) : null}
                    {prof.codigo ? <span>{prof.codigo}</span> : null}
                  </div>
                  {prof.formacaoAcademica && (
                    <div className="text-sm text-gray-600 mt-1">
                      {prof.formacaoAcademica}
                    </div>
                  )}
                  {prof.sobre && (
                    <p className="text-sm text-gray-700 mt-2">
                      {prof.sobre.length > 140
                        ? prof.sobre.slice(0, 137) + "..."
                        : prof.sobre}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-3 text-sm">
                <h3 className="font-medium">Locais de atendimento</h3>
                {(prof.locais ?? []).map((local, i) => (
                  <p key={i} className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                      {typeof local === "string" ? local : local.nome}
                    </span>
                    {typeof local !== "string" && local.cidade && (
                      <span className="ml-2 text-gray-400">{local.cidade}</span>
                    )}
                  </p>
                ))}
              </div>

              <div className="mb-3 text-sm">
                <h3 className="font-medium">Redes sociais</h3>
                <SocialIcons prof={prof} />
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {(prof.areas ?? []).map((area, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-gray-100 rounded-lg text-xs"
                  >
                    {typeof area === "string" ? area : area.nome}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto pt-3 border-t">
                <div className="flex items-center gap-3">
                  <button
                    className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2 bg-white hover:bg-gray-50"
                    onClick={() => navigate(`/profissional/perfil/${prof.id}`)}
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                    Ver Perfil
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {prof.conectado ? (
                    <div className="flex items-center gap-2 bg-green-500 text-white rounded-lg px-4 py-2">
                      <Check className="w-4 h-4" />
                      <span className="text-sm">Conectado</span>
                      <button
                        title="Desfazer conexão"
                        onClick={async () => {
                          try {
                            if (!loggedProfissionalId) return;

                            // Debug: log das conexões disponíveis
                            console.log("Conexões disponíveis:", conexoes);
                            console.log(
                              "Usuário logado ID:",
                              loggedProfissionalId
                            );
                            console.log("Profissional alvo ID:", prof.id);

                            // Encontra a conexão aceita para remover
                            const conexaoParaRemover = conexoes.find((c) => {
                              console.log("Verificando conexão:", c);
                              return (
                                ((c.solicitante_id === loggedProfissionalId &&
                                  c.solicitado_id === prof.id) ||
                                  (c.solicitante_id === prof.id &&
                                    c.solicitado_id ===
                                      loggedProfissionalId)) &&
                                c.status === "ACEITO"
                              );
                            });

                            console.log(
                              "Conexão para remover:",
                              conexaoParaRemover
                            );

                            if (!conexaoParaRemover) {
                              notificarErro(
                                "Erro",
                                "Não foi possível encontrar a conexão para remover."
                              );
                              return;
                            }

                            await removerSolicitacao(conexaoParaRemover.id);
                            setProfissionais((prev) =>
                              prev.map((p) =>
                                p.id === prof.id
                                  ? {
                                      ...p,
                                      conectado: false,
                                      requestStatus: undefined,
                                    }
                                  : p
                              )
                            );

                            // Remove da lista de conexões
                            setConexoes((prev) =>
                              prev.filter((c) => c.id !== conexaoParaRemover.id)
                            );

                            notificarSucesso(
                              "Conexão excluída",
                              "Conexão excluída com sucesso!"
                            );
                          } catch (e) {
                            console.error("Erro ao desfazer conexão:", e);
                            notificarErro(
                              "Erro ao excluir conexão",
                              "Não foi possível excluir a conexão."
                            );
                          }
                        }}
                        className="ml-2 text-white hover:text-gray-100"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  ) : prof.requestStatus === "received" ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAceitar(prof)}
                        className="flex items-center gap-2 border border-green-200 text-green-600 rounded-lg px-4 py-2 hover:bg-green-50"
                      >
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Aceitar</span>
                      </button>
                      <button
                        onClick={() => handleRecusar(prof)}
                        className="flex items-center gap-2 border border-red-200 text-red-600 rounded-lg px-3 py-2 hover:bg-red-50"
                      >
                        <span className="text-sm">Recusar</span>
                      </button>
                    </div>
                  ) : prof.requestStatus === "sent" ? (
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-orange-600 px-3">
                        Pendente
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConectar(prof)}
                      className="flex items-center gap-2 border border-green-200 text-green-600 rounded-lg px-4 py-2 hover:bg-green-50"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="text-sm">Conectar</span>
                    </button>
                  )}

                  <button className="w-9 h-9 rounded-full border border-green-200 flex items-center justify-center text-green-600 hover:bg-green-50">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
