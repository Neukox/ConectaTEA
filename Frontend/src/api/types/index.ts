export interface ResponseError {
  message: string
  error: string | string[]
  statusCode: number
}

export type Periodo = 'HOJE' | 'SEMANAL' | 'MENSAL' | 'SEMESTRAL' | 'ANUAL'

export const Periodo = {
  HOJE: 'Hoje',
  SEMANAL: 'Semanal',
  MENSAL: 'Mensal',
  SEMESTRAL: 'Semestral',
  ANUAL: 'Anual',
} satisfies Record<Periodo, string>
