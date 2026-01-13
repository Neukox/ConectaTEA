export type Meta = {
  id: number
  titulo: string
  categoria: string
  status: 'Em Andamento' | 'Quase Concluída' | 'Concluída'
  prioridade: 'alta' | 'media' | 'baixa'
  crianca: { nome: string; avatarUrl?: string }
  profissional: string
  periodo: string // "31/12/2023 - 30/03/2024"
  progresso: number
  descricao?: string
}
