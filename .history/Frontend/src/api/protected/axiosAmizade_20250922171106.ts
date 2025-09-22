// Cliente axios para ações de amizade (conexões profissionais)

import { api } from "../apiClient";

export type StatusConexao = "PENDENTE" | "ACEITO" | "RECUSADO";

export interface ConexaoProfissional {
  id: number;
  solicitante_id: number; // profissional.id do solicitante
  solicitado_id: number; // profissional.id do solicitado
  status: StatusConexao;
  criado_em?: string;
}

function extractErrorMessage(e: unknown): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err: any = e;
  if (err?.response?.data?.error) return String(err.response.data.error);
  if (err?.response?.data?.message) return String(err.response.data.message);
  if (err?.message) return String(err.message);
  return "Erro desconhecido";
}

// Envia uma solicitação de conexão
export async function enviarSolicitacao(_solicitanteId: number, solicitadoId: number, options?: { tipo?: 'user' | 'prof' }): Promise<ConexaoProfissional> {
  try {
    let body: { profissionalDestinoId: number };
    if (options?.tipo === 'prof') {
      body = { profissionalDestinoId: solicitadoId };
    } else {
      // Se for user ID, precisamos converter para profissional ID no frontend
      // Por enquanto vamos assumir que é prof ID
      body = { profissionalDestinoId: solicitadoId };
    }
    const { data } = await api.post<{ message: string; data: ConexaoProfissional }>("/conexoes/enviar", body);
    return data.data;
  } catch (e) {
    throw new Error(extractErrorMessage(e));
  }
}

// Aceita uma solicitação existente usando o ID da conexão
export async function aceitarSolicitacao(conexaoId: number): Promise<ConexaoProfissional> {
  try {
    const body = { acao: "ACEITAR" };
    const { data } = await api.put<{ message: string; data: ConexaoProfissional }>(`/conexoes/${conexaoId}/responder`, body);
    return data.data;
  } catch (e) {
    throw new Error(extractErrorMessage(e));
  }
}

// Recusa uma solicitação existente usando o ID da conexão
export async function recusarSolicitacao(conexaoId: number): Promise<ConexaoProfissional> {
  try {
    const body = { acao: "RECUSAR" };
    const { data } = await api.put<{ message: string; data: ConexaoProfissional }>(`/conexoes/${conexaoId}/responder`, body);
    return data.data;
  } catch (e) {
    throw new Error(extractErrorMessage(e));
  }
}

// Remove (cancela) uma conexão
export async function removerSolicitacao(conexaoId: number): Promise<void> {
  try {
    await api.delete(`/conexoes/${conexaoId}`);
  } catch (e) {
    throw new Error(extractErrorMessage(e));
  }
}

// Listar solicitações enviadas por um usuário (backend obtém usuário do JWT)
export async function listarSolicitacoesEnviadas(): Promise<ConexaoProfissional[]> {
  try {
    const { data } = await api.get<{ message: string; data: ConexaoProfissional[] }>(`/conexoes/enviadas`);
    return data.data;
  } catch (e) {
    throw new Error(extractErrorMessage(e));
  }
}

// Listar solicitações recebidas por um usuário (backend obtém usuário do JWT)
export async function listarSolicitacoesRecebidas(): Promise<ConexaoProfissional[]> {
  try {
    const { data } = await api.get<{ message: string; data: ConexaoProfissional[] }>(`/conexoes/recebidas`);
    return data.data;
  } catch (e) {
    throw new Error(extractErrorMessage(e));
  }
}

// Listar conexões (aceitas) de um profissional (por profissional.id)
export async function listarConexoesPorProfissional(profissionalId: number): Promise<ConexaoProfissional[]> {
  try {
    const { data } = await api.get<{ message: string; data: ConexaoProfissional[] }>(`/conexoes/profissional/${encodeURIComponent(profissionalId)}`);
    return data.data;
  } catch (e) {
    throw new Error(extractErrorMessage(e));
  }
}

// Helper: obter conexão específica (por ids de profissional)
export async function obterConexaoPorProfissionais(solicitanteProfId: number, solicitadoProfId: number): Promise<ConexaoProfissional | null> {
  try {
    const { data } = await api.get<{ message: string; data: ConexaoProfissional[] }>(`/conexoes/filtrar?solicitanteProfId=${encodeURIComponent(solicitanteProfId)}&solicitadoProfId=${encodeURIComponent(solicitadoProfId)}`);
    return Array.isArray(data.data) && data.data.length ? data.data[0] : null;
  } catch (e) {
    throw new Error(extractErrorMessage(e));
  }
}
