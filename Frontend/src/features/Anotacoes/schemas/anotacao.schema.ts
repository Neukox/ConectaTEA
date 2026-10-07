import { z } from 'zod'

export const anotacaoSchema = z.object({
  criancaId: z.number().int().positive('Selecione uma criança.'),
  conteudo: z
    .string()
    .trim()
    .min(10, 'Escreva ao menos 10 caracteres.')
    .max(3000, 'A anotação deve ter no máximo 3.000 caracteres.'),
  visibilidade: z.enum(['PRIVADA', 'COMPARTILHADA']),
})

export type AnotacaoFormData = z.infer<typeof anotacaoSchema>
