export type Parentesco =
  | 'PAI'
  | 'MAE'
  | 'AVO'
  | 'AVOA'
  | 'TIO'
  | 'TIA'
  | 'TUTOR'
  | 'OUTRO'

export type StatusVinculoProfissionalCrianca =
  | 'AGUARDANDO'
  | 'VINCULADO'
  | 'DESVINCULADO'
  | 'SUSPENSO'

export type StatusVinculoResponsavelCrianca =
  | 'AGUARDANDO_VINCULO'
  | 'VINCULADO'
  | 'DESVINCULADO'
  | 'CODIGO_EXPIRADO'

export interface Crianca {
  id: number
  nome: string
  data_nascimento: Date
  genero: string
  diagnostico: string
  parentesco: Parentesco
  observacoes: string
  responsavel: {
    id: number
    name: string // Alterado de nome para name
    email: string
    telefone: string
    endereco: string
  }
}

export const Parentesco = {
  PAI: 'Pai',
  MAE: 'Mãe',
  AVO: 'Avô',
  AVOA: 'Avó',
  TIO: 'Tio',
  TIA: 'Tia',
  TUTOR: 'Tutor',
  OUTRO: 'Outro',
} satisfies Record<Parentesco, string>

export const StatusVinculoProfissionalCriancaMap = {
  AGUARDANDO: 'Aguardando',
  VINCULADO: 'Vinculado',
  DESVINCULADO: 'Desvinculado',
  SUSPENSO: 'Suspenso',
} satisfies Record<StatusVinculoProfissionalCrianca, string>
