// import { api } from '../apiClient'

export interface CadastroMetaData {
  titulo: string
  categoria: string
  prioridade: 'alta' | 'media' | 'baixa'
  criancaId: number
  profissionalId?: number
  dataInicio: string
  dataFim: string
  descricao: string
}

// Mock function to simulate API call
export const cadastrarMeta = async (data: CadastroMetaData): Promise<void> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulate success
  console.log('Meta cadastrada com sucesso:', data)
  return Promise.resolve()

  // In a real scenario, this would be:
  // return api.post('/metas', data)
}
