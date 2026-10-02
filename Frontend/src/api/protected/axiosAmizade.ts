import { api } from '../apiClient'

export type StatusConexao = 'PENDENTE' | 'ACEITO' | 'RECUSADO'
export type TipoListaConexao = 'todas' | 'enviadas' | 'recebidas'

export interface ConexaoProfissional {
  id: number
  solicitanteId: number
  destinatarioId: number
  status: StatusConexao
}

export async function enviarSolicitacao(
  destinatarioId: number,
): Promise<ConexaoProfissional> {
  const { data } = await api.post<ConexaoProfissional>('/conexoes', {
    destinatarioId,
  })
  return data
}

async function responderSolicitacao(
  conexaoId: number,
  status: 'ACEITO' | 'RECUSADO',
): Promise<ConexaoProfissional> {
  const { data } = await api.put<ConexaoProfissional>(
    `/conexoes/${conexaoId}/responder`,
    { status },
  )
  return data
}

export const aceitarSolicitacao = (conexaoId: number) =>
  responderSolicitacao(conexaoId, 'ACEITO')

export const recusarSolicitacao = (conexaoId: number) =>
  responderSolicitacao(conexaoId, 'RECUSADO')

export async function removerSolicitacao(conexaoId: number): Promise<void> {
  await api.delete(`/conexoes/${conexaoId}`)
}

export async function listarConexoes(params?: {
  tipo?: TipoListaConexao
  status?: StatusConexao
}): Promise<ConexaoProfissional[]> {
  const { data } = await api.get<ConexaoProfissional[]>('/conexoes', { params })
  return data
}

export const listarSolicitacoesEnviadas = () =>
  listarConexoes({ tipo: 'enviadas' })

export const listarSolicitacoesRecebidas = () =>
  listarConexoes({ tipo: 'recebidas' })

export const listarConexoesPorProfissional = () =>
  listarConexoes({ tipo: 'todas', status: 'ACEITO' })

export async function obterConexaoPorProfissionais(
  primeiroProfissionalId: number,
  segundoProfissionalId: number,
): Promise<ConexaoProfissional | null> {
  const conexoes = await listarConexoes({ tipo: 'todas' })
  return (
    conexoes.find(
      ({ solicitanteId, destinatarioId }) =>
        (solicitanteId === primeiroProfissionalId &&
          destinatarioId === segundoProfissionalId) ||
        (solicitanteId === segundoProfissionalId &&
          destinatarioId === primeiroProfissionalId),
    ) ?? null
  )
}
