import { api } from '../apiClient'
import type { CriancaListagem } from './axiosCadastroCrianca'

export interface ValidarCodigoResponse {
  id: number
  nome: string
  dataNascimento: string
  genero?: string
}

interface ConfirmarVinculoRequest {
  codigo: string
  consentimentoAceito: boolean
}

type ConfirmarVinculoResponse = ValidarCodigoResponse

export const vinculacaoAPI = {
  /**
   * Valida um código de vinculação e retorna os dados da criança
   * @param codigo - Código alfanumérico fornecido pelo profissional
   * @returns Dados da criança
   */
  async validarCodigo(codigo: string): Promise<ValidarCodigoResponse> {
    const response = await api.get<ValidarCodigoResponse>(
      `/vinculos/tokens/${encodeURIComponent(codigo)}/preview`,
    )
    return response.data
  },

  /**
   * Confirma a vinculação da criança ao responsável
   * @param dados - ID da criança e aceito de consentimento
   * @returns Dados do vínculo criado
   */
  async confirmarVinculo(
    dados: ConfirmarVinculoRequest,
  ): Promise<ConfirmarVinculoResponse> {
    const response = await api.post<ConfirmarVinculoResponse>(
      '/vinculos/confirmar',
      dados,
    )
    return response.data
  },

  /**
   * Obtém os vínculos do responsável
   * @returns Lista de crianças vinculadas
   */
  async obterVinculos(): Promise<CriancaListagem[]> {
    const response = await api.get<CriancaListagem[]>('/vinculos/me')
    return response.data
  },

  /**
   * Desvincula uma criança
   * @param criancaId - ID da criança a desvincular
   */
  async desvincularCrianca(criancaId: number): Promise<void> {
    await api.delete(`/vinculos/criancas/${criancaId}`)
  },
}
