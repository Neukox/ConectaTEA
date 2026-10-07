export type VisibilidadeAnotacao = 'PRIVADA' | 'COMPARTILHADA'

export type Anotacao = {
  id: number
  criancaId: number
  criancaNome: string
  autorProfissionalId: number
  autorNome: string
  autorEspecialidade?: string
  conteudo: string
  visibilidade: VisibilidadeAnotacao
  createdAt: string
  updatedAt: string
  isAutor: boolean
}

export type PapelAnotacoes = 'PROFISSIONAL' | 'RESPONSAVEL'
export type OrdenacaoAnotacoes = 'RECENTES' | 'ANTIGAS'
export type FiltroVisibilidade = 'TODAS' | VisibilidadeAnotacao

export type FiltrosAnotacoes = {
  papel: PapelAnotacoes
  criancaId?: number
  profissionalId?: number
  busca?: string
  visibilidade?: FiltroVisibilidade
  ordenacao: OrdenacaoAnotacoes
}

export type CriancaAnotacao = { id: number; nome: string }
export type AutorAnotacao = { id: number; nome: string; especialidade?: string }

export type CriarAnotacaoInput = {
  criancaId: number
  conteudo: string
  visibilidade: VisibilidadeAnotacao
}

export type AtualizarAnotacaoInput = Pick<
  CriarAnotacaoInput,
  'conteudo' | 'visibilidade'
>

export type ContextoNotificacaoAnotacao = {
  annotationId: number
  childId: number
  authorId: number
  authorName: string
  visibility: VisibilidadeAnotacao
}
