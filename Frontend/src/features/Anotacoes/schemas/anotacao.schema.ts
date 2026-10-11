import { z } from 'zod'

export const anotacaoSchema = z.object({
  criancaId: z.number().int().positive('Selecione uma criança.'),
  titulo: z.string().trim().min(1,'Informe o título.').max(100),
  conteudo: z
    .string()
    .trim()
    .min(10, 'Escreva ao menos 10 caracteres.')
    .max(3000, 'A anotação deve ter no máximo 3.000 caracteres.'),
  visibilidade: z.enum(['PRIVADA', 'COMPARTILHADA']),
  temas: z.string().trim().max(500).optional(),
  sessaoId: z.number().int().positive().optional(),
  motivoCorrecao: z.string().trim().max(500).optional(),
})

export type AnotacaoFormData = z.infer<typeof anotacaoSchema>
