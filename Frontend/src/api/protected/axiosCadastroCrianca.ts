import { api } from '../apiClient'

export type GeneroCrianca = 'Masculino' | 'Feminino' | 'Outro'
export type Parentesco =
  | 'PAI'
  | 'MAE'
  | 'AVO'
  | 'AVOA'
  | 'TIO'
  | 'TIA'
  | 'TUTOR'
  | 'OUTRO'

export interface CadastroCriancaFormData {
  nomeCompleto: string
  idade: number
  dataNascimento: string
  genero: GeneroCrianca | 'Prefiro não informar'
  diagnostico: string
  diagnosticoOutro?: string
  nomeResponsavel: string
  telefone?: string
  email?: string
  endereco?: string
  parentesco: Parentesco
  observacoes?: string
}

export interface CriarCriancaRequest {
  nome: string
  dataNascimento: string
  genero?: GeneroCrianca
  diagnostico?: string
  diagnosticoDetalhes?: string
  observacoes?: string
  responsavelPendente?: {
    nome: string
    telefone?: string
    email?: string
    parentesco: Parentesco
  }
}

export interface CriancaListagem {
  id: number
  nome: string
  dataNascimento: string
  idade: number
  genero?: string | null
  diagnostico?: string | null
  diagnosticoDetalhes?: string | null
  observacoes?: string | null
}

export interface CadastroCriancaApiResponse {
  message: string
  crianca: CriancaListagem
}

export interface ListagemCriancasApiResponse {
  items: CriancaListagem[]
  total: number
}

export interface AtualizarCriancaData {
  nome: string
  dataNascimento: string
  genero?: string | null
  diagnostico?: string | null
  diagnosticoDetalhes?: string | null
  observacoes?: string | null
}

export interface TokenVinculo {
  id: number
  codigo: string
  expiraEm: string
  qrCodeDataUrl: string
}

const optional = (value?: string | null) => value?.trim() || undefined

export async function cadastrarCrianca(
  data: CadastroCriancaFormData,
): Promise<CadastroCriancaApiResponse> {
  const request: CriarCriancaRequest = {
    nome: data.nomeCompleto.trim(),
    dataNascimento: data.dataNascimento,
    genero: data.genero === 'Prefiro não informar' ? 'Outro' : data.genero,
    diagnostico:
      data.diagnostico === 'Outro'
        ? optional(data.diagnosticoOutro)
        : optional(data.diagnostico),
    observacoes: optional(data.observacoes),
    responsavelPendente: {
      nome: data.nomeResponsavel.trim(),
      telefone: optional(data.telefone),
      email: optional(data.email),
      parentesco: data.parentesco,
    },
  }

  const response = await api.post<CadastroCriancaApiResponse>('/criancas', request)
  return response.data
}

export async function listarCriancas(): Promise<ListagemCriancasApiResponse> {
  const response = await api.get<ListagemCriancasApiResponse>('/criancas')
  return response.data
}

export async function excluirCrianca(criancaId: number): Promise<void> {
  await api.delete(`/criancas/${criancaId}`)
}

export async function buscarCriancaPorId(criancaId: number): Promise<CriancaListagem> {
  const response = await api.get<CriancaListagem>(`/criancas/${criancaId}`)
  return response.data
}

export async function atualizarCrianca(
  criancaId: number,
  data: AtualizarCriancaData,
): Promise<CriancaListagem> {
  const response = await api.put<CriancaListagem>(`/criancas/${criancaId}`, data)
  return response.data
}

export async function gerarTokenVinculo(criancaId: number): Promise<TokenVinculo> {
  const response = await api.post<TokenVinculo>(
    `/criancas/${criancaId}/tokens-vinculo`,
  )
  return response.data
}

export async function cancelarTokenVinculo(
  criancaId: number,
  tokenId: number,
): Promise<void> {
  await api.delete(`/criancas/${criancaId}/tokens-vinculo/${tokenId}`)
}

export const obterCodigoVinculo = gerarTokenVinculo
