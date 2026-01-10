import api from '../apiClient'

interface ValidarCodigoResponse {
  crianca_id: number
  nome: string
  data_nascimento: string
  diagnostico: string
  status: string
}

interface ConfirmarVinculoRequest {
  crianca_id: number
  consentimento_aceito: boolean
}

interface ConfirmarVinculoResponse {
  id: number
  crianca_id: number
  responsavel_id: number
  status: string
  data_vinculo: string
}

export const vinculacaoAPI = {
  /**
   * Valida um código de vinculação e retorna os dados da criança
   * @param codigo - Código alfanumérico fornecido pelo profissional
   * @returns Dados da criança
   */
  async validarCodigo(codigo: string): Promise<ValidarCodigoResponse> {
    const response = await api.get<ValidarCodigoResponse>(
      `/vinculacao/validar/${codigo}`
    )
    return response.data
  },

  /**
   * Confirma a vinculação da criança ao responsável
   * @param dados - ID da criança e aceito de consentimento
   * @returns Dados do vínculo criado
   */
  async confirmarVinculo(
    dados: ConfirmarVinculoRequest
  ): Promise<ConfirmarVinculoResponse> {
    const response = await api.post<ConfirmarVinculoResponse>(
      '/vinculacao/confirmar',
      dados
    )
    return response.data
  },

  /**
   * Obtém os vínculos do responsável
   * @returns Lista de crianças vinculadas
   */
  async obterVinculos() {
    const response = await api.get('/vinculacao/meus-vinculos')
    return response.data
  },

  /**
   * Desvincula uma criança
   * @param crianca_id - ID da criança a desvincular
   */
  async desvincularCrianca(crianca_id: number) {
    const response = await api.delete(`/vinculacao/crianca/${crianca_id}`)
    return response.data
  }
}
