import z from 'zod'
import { TipoSessao } from '../types'

export const UpdateSessaoSchema = z.object({
  descricao: z
    .string()
    .min(10, 'A descrição deve ter no mínimo 10 caracteres')
    .max(200, 'A descrição deve ter no máximo 200 caracteres'),
  tipoSessao: z.enum(Object.keys(TipoSessao), {
    error: 'Tipo de sessão é obrigatório',
  }),
  data: z
    .string()
    .nonempty('Data é obrigatória')
    .refine((date) => new Date(date) >= new Date(), {
      message: 'A data não pode ser uma data anterior a hoje',
    }),
  horario: z.string().nonempty('Horário é obrigatório'),
  duracao: z
    .number({ error: 'Duração é obrigatória' })
    .min(30, 'A duração mínima é de 30 minutos')
    .max(90, 'A duração máxima é de 90 minutos'),
  observacoes: z
    .string()
    .max(500, 'As observações devem ter no máximo 500 caracteres')
    .nullable()
    .optional(),
})

export type UpdateSessaoData = z.infer<typeof UpdateSessaoSchema>
