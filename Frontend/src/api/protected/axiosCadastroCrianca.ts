//Algoritmo que faz ligação do frontend e backend do cadastro de criança.

import type {
  StatusVinculoProfissionalCrianca,
  StatusVinculoResponsavelCrianca,
} from '~/features/Criancas/types'
import { api } from '../apiClient' // NOVO ARQUIVO PARA QUEBRAR CACHE

// Interface para tipagem dos dados de cadastro de criança baseada no layout do frontend
export interface CadastroCriancaFormData {
  // Informações Básicas
  nomeCompleto: string
  idade: number
  dataNascimento: string // formato: "YYYY-MM-DD"
  genero: 'Masculino' | 'Feminino' | 'Outro' | 'Prefiro não informar'
  diagnostico: string
  diagnosticoOutro?: string // Campo condicional quando diagnostico === 'Outro'

  // Informações do Responsável
  nomeResponsavel: string
  telefone: string
  email?: string // opcional
  endereco?: string // opcional
  parentesco: 'PAI' | 'MAE' | 'AVO' | 'AVOA' | 'TIO' | 'TIA' | 'TUTOR' | 'OUTRO' // Relação com a criança

  // Informações Adicionais
  observacoes?: string // opcional
}

// Interface para os dados que serão enviados para a API (compatível com backend)
export interface CadastroCriancaApiRequest {
  // Dados da criança (nomes ajustados para compatibilidade com backend)
  fullName: string // Nome Completo
  age?: number // Idade (opcional, calculada automaticamente pelo backend)
  birthDate: string // Data de Nascimento no formato dd/mm/aaaa
  gender: 'Masculino' | 'Feminino' | 'Outro' // Gênero
  diagnosis: string // Diagnóstico final (já processado)
  notes?: string // Observações
  parentesco: string // Relação do responsável com a criança

  // Dados do responsável (se não existir, será criado)
  responsible: {
    name: string // Nome do Responsável
    phone: string // Telefone (obrigatório)
    email?: string // E-mail (opcional)
    address?: string // Endereço (opcional)
  }
}

// Interface para a resposta da API ao cadastrar criança (compatível com backend)
export interface CadastroCriancaApiResponse {
  message: string
  crianca: {
    id: number
    nome: string
    idade: number
    data_nascimento: string // retorna como dd/mm/aaaa do backend
    genero: string
    diagnostico: string
    observacoes?: string
    responsavel: {
      id: number
      nome: string
      telefone?: string
      email?: string
      endereco?: string
    }
  }
  codigoParaVinculo: string // Código alfanumérico para vincular responsável
  qrcodeParaVinculo: string // QR Code em formato Data URL (base64)
}

// Interface para os dados de uma criança retornada pela API (listagem)
export interface CriancaListagem {
  id: number
  nome: string
  idade: number
  dataNascimento: string // Adicionado
  genero: string // Adicionado
  diagnostico: string
  observacoes?: string
  parentesco: string // Adicionado
  responsavelId?: number // Tornando opcional
  status_vinculo_responsavel: StatusVinculoResponsavelCrianca // Adicionado status do vínculo
  status_vinculo_profissional: StatusVinculoProfissionalCrianca
  responsavel: {
    id: number // Adicionado
    nome: string // Backend retorna 'name' mas mapeia para 'nome'
    email?: string
    telefone?: string
    endereco?: string // Adicionado
  }
}

// Interface para resposta da API de listagem de crianças
export interface ListagemCriancasApiResponse {
  message: string
  criancas: CriancaListagem[]
  total: number
}

// Função para converter data do formato YYYY-MM-DD para dd/mm/aaaa
const formatDateToBR = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

// Função para mapear gênero do frontend para backend (filtrar "Prefiro não informar")
const mapGenderToBackend = (
  gender: string,
): 'Masculino' | 'Feminino' | 'Outro' => {
  if (gender === 'Prefiro não informar') {
    return 'Outro' // Backend não aceita "Prefiro não informar", mapeia para "Outro"
  }
  return gender as 'Masculino' | 'Feminino' | 'Outro'
}

export const cadastrarCrianca = async (
  data: CadastroCriancaFormData,
): Promise<CadastroCriancaApiResponse> => {
  // Processar diagnóstico final
  const diagnosticoFinal =
    data.diagnostico === 'Outro'
      ? data.diagnosticoOutro || ''
      : data.diagnostico

  const requestData: CadastroCriancaApiRequest = {
    fullName: data.nomeCompleto,
    birthDate: formatDateToBR(data.dataNascimento), // converter YYYY-MM-DD para dd/mm/aaaa
    age: data.idade, // opcional, backend calcula automaticamente
    gender: mapGenderToBackend(data.genero),
    diagnosis: diagnosticoFinal,
    notes: data.observacoes,
    parentesco: data.parentesco,
    responsible: {
      name: data.nomeResponsavel,
      phone: data.telefone,
      email: data.email,
      address: data.endereco,
    },
  }

  try {
    // Usar a rota correta do backend - VERSÃO ATUALIZADA
    const response = await api.post<CadastroCriancaApiResponse>(
      '/criancas',
      requestData,
    )
    return response.data
  } catch (error) {
    console.error('Erro ao cadastrar criança:', error)
    throw error
  }
}

// Função para listar crianças (para profissionais) - VERSÃO ATUALIZADA
export const listarCriancas =
  async (): Promise<ListagemCriancasApiResponse> => {
    try {
      const response = await api.get<ListagemCriancasApiResponse>('/criancas')
      return response.data
    } catch (error) {
      console.error('Erro ao listar crianças:', error)
      throw error
    }
  }

// Função para excluir criança
export const excluirCrianca = async (
  criancaId: number,
): Promise<{ message: string }> => {
  try {
    const response = await api.delete<{ message: string }>(
      `/criancas/${criancaId}`,
    )
    return response.data
  } catch (error) {
    console.error('Erro ao excluir criança:', error)
    throw error
  }
}

// Interface para resposta do backend ao buscar criança por ID
interface CriancaBackendResponse {
  id: number
  nome: string
  idade: number
  dataNascimento: string
  genero: string
  diagnostico: string
  observacoes?: string
  parentesco: string
  status_vinculo_responsavel: StatusVinculoResponsavelCrianca
  status_vinculo_profissional: StatusVinculoProfissionalCrianca
  responsavel: {
    id: number
    nome: string
    email?: string
    telefone?: string
    endereco?: string
  }
}

// Função para buscar criança por ID
export const buscarCriancaPorId = async (
  criancaId: number,
): Promise<CriancaListagem> => {
  try {
    const response = await api.get<{
      message: string
      data: CriancaBackendResponse
    }>(`/criancas/${criancaId}`)

    // Mapear dados do backend para o formato esperado pelo frontend
    const criancaData = response.data.data
    const criancaFormatada: CriancaListagem = {
      id: criancaData.id,
      nome: criancaData.nome,
      idade: criancaData.idade,
      dataNascimento: criancaData.dataNascimento,
      genero: criancaData.genero,
      diagnostico: criancaData.diagnostico,
      observacoes: criancaData.observacoes,
      parentesco: criancaData.parentesco,
      status_vinculo_responsavel: criancaData.status_vinculo_responsavel, // Usar status do vínculo do responsável
      status_vinculo_profissional: criancaData.status_vinculo_profissional, // Preservar status do vínculo do profissional
      responsavel: {
        id: criancaData.responsavel.id,
        nome: criancaData.responsavel.nome,
        email: criancaData.responsavel.email,
        telefone: criancaData.responsavel.telefone,
        endereco: criancaData.responsavel.endereco,
      },
    }

    return criancaFormatada
  } catch (error) {
    console.error('Erro ao buscar criança:', error)
    throw error
  }
}

// Interface para dados de atualização de criança
export interface AtualizarCriancaData {
  nome?: string
  dataNascimento?: string
  genero?: string
  diagnostico?: string
  diagnosticoDetalhes?: string
  observacoes?: string
  parentesco?: string
  responsavel?: {
    nome?: string
    telefone?: string
    email?: string
    endereco?: string
  }
}

// Função para atualizar criança
export const atualizarCrianca = async (
  criancaId: number,
  data: AtualizarCriancaData,
): Promise<{ message: string; crianca: CriancaListagem }> => {
  try {
    // Mapear dados para o formato esperado pelo backend
    const backendData = {
      nome: data.nome,
      dataNascimento: data.dataNascimento,
      genero: data.genero,
      diagnostico: data.diagnostico,
      observacoes: data.observacoes,
      parentesco: data.parentesco,
      // Mapear dados do responsável
      nomeResponsavel: data.responsavel?.nome,
      telefoneResponsavel: data.responsavel?.telefone,
      emailResponsavel: data.responsavel?.email,
      enderecoResponsavel: data.responsavel?.endereco,
    }

    const response = await api.put<{
      message: string
      crianca: CriancaListagem
    }>(`/criancas/${criancaId}`, backendData)
    return response.data
  } catch (error) {
    console.error('Erro ao atualizar criança:', error)
    throw error
  }
}
// Função para obter código de vínculo de uma criança
export const obterCodigoVinculo = async (
  criancaId: number,
): Promise<{ codigoParaVinculo: string; qrcodeParaVinculo: string }> => {
  try {
    const response = await api.get<{
      codigoParaVinculo: string
      qrcodeParaVinculo: string
    }>(`/criancas/${criancaId}/codigo-vinculo`)
    return response.data
  } catch (error) {
    console.error('Erro ao obter código de vínculo:', error)
    throw error
  }
}
