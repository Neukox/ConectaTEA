import { api } from '../apiClient'

interface ValidarCodigoResponse {
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
  async obterVinculos() {
    const response = await api.get('/vinculos/me')
    return response.data
  },

  /**
   * Desvincula uma criança
   * @param crianca_id - ID da criança a desvincular
   */
  async desvincularCrianca(crianca_id: number) {
    const response = await api.delete(`/vinculos/criancas/${crianca_id}`)
    return response.data
  },
}
