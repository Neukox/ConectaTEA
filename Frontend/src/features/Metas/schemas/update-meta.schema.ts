import z from 'zod'
import { CategoriaMeta, PrioridadeMeta } from '../types'

export const UpdateMetaSchema = z
  .object({
    titulo: z
      .string()
      .nonempty('O título é obrigatório')
      .min(3, 'O título deve ter ao menos 3 caracteres')
      .max(100, 'O título deve ter no máximo 100 caracteres'),
    categoria: z.enum(CategoriaMeta, {
      error: 'Categoria é obrigatória',
    }),
    prioridade: z.enum(PrioridadeMeta, {
      error: 'Prioridade é obrigatória',
    }),
    dataInicio: z
      .string()
      .nonempty('Data de início é obrigatória')
      .refine((date) => new Date(date) >= new Date(), {
        message: 'A data de início não pode ser uma data anterior a hoje',
      }),
    dataFim: z
      .string()
      .nonempty('Data de fim é obrigatória')
      .refine((date) => new Date(date) >= new Date(), {
        message: 'A data de fim não pode ser uma data anterior a hoje',
      }),
    descricao: z
      .string()
      .min(10, 'A descrição deve ter ao menos 10 caracteres')
      .max(1000, 'A descrição deve ter no máximo 1000 caracteres')
      .optional(),
  })
  .refine((data) => new Date(data.dataInicio) < new Date(data.dataFim), {
    message: 'A data de fim não pode ser posterior à data de início',
    path: ['dataFim'],
  })

export type UpdateMetaData = z.infer<typeof UpdateMetaSchema>
