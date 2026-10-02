import z from 'zod'
import { CategoriaMeta, PrioridadeMeta } from '../types'

export const UpdateMetaSchema = z
  .object({
    titulo: z
      .string()
      .nonempty('O título é obrigatório')
      .min(3, 'O título deve ter ao menos 3 caracteres')
      .max(100, 'O título deve ter no máximo 100 caracteres'),
    categoria: z.enum(Object.keys(CategoriaMeta), {
      error: 'Categoria é obrigatória',
    }),
    prioridade: z.enum(Object.keys(PrioridadeMeta), {
      error: 'Prioridade é obrigatória',
    }),
    dataInicio: z.string().nonempty('Data de início é obrigatória'),
    dataFim: z.string().nonempty('Data de fim é obrigatória'),
    descricao: z
      .string()
      .max(1000, 'A descrição deve ter no máximo 1000 caracteres')
      .optional(),
  })
  .refine((data) => data.dataInicio <= data.dataFim, {
    message: 'A data de fim deve ser igual ou posterior à data de início',
    path: ['dataFim'],
  })

export type UpdateMetaData = z.infer<typeof UpdateMetaSchema>
