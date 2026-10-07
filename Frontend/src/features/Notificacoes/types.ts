export type TipoNotificacao =
  | 'ANOTACAO_CRIADA'
  | 'ANOTACAO_EDITADA'
  | 'ANOTACAO_EXCLUIDA'
  | 'ANOTACAO_COMPARTILHADA'
  | 'ANOTACAO_TORNADA_PRIVADA'

export interface NotificacaoPersistente {
  id: number
  criancaId: number
  anotacaoId?: number | null
  tipo: TipoNotificacao
  titulo: string
  mensagem: string
  lida: boolean
  lidaEm?: string | null
  createdAt: string
}
