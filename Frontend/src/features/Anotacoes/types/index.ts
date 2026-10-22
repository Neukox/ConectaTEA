export type VisibilidadeAnotacao = 'PRIVADA' | 'COMPARTILHADA'

export type Anotacao = {
  id: number
  criancaId: number
  criancaNome: string
  autorProfissionalId: number
  autorNome: string
  autorEspecialidade?: string
  titulo: string
  conteudo: string
  temas?: string | null
  sessaoId?: number | null
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
  titulo: string
  conteudo: string
  visibilidade: VisibilidadeAnotacao
  temas?: string
  sessaoId?: number
}

export type AtualizarAnotacaoInput = Pick<CriarAnotacaoInput,'titulo'|'conteudo'|'visibilidade'|'temas'> & { motivoCorrecao?: string }

export type ArquivoAnotacao = Pick<Anotacao,'id'|'criancaId'|'criancaNome'|'titulo'|'conteudo'|'temas'|'sessaoId'|'visibilidade'|'createdAt'|'updatedAt'> & {snapshotCapturadoEm:string;snapshotOrigem:'CRIACAO'|'MIGRACAO_V15';snapshotHistoricoConfiavel:boolean}
export type VersaoAnotacao = {id:number;numero:number;titulo:string;conteudo:string;temas?:string|null;motivoCorrecao:string;autorUsuarioId:number;criadoEm:string}

export type ContextoNotificacaoAnotacao = {
  annotationId: number
  childId: number
  authorId: number
  authorName: string
  visibility: VisibilidadeAnotacao
}
