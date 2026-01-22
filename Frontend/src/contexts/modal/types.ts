import type { MetaToEdit, MetaToUpdateProgress } from '~/features/Metas/types'

export type ModalType =
  | 'CADASTRAR_META'
  | 'ATUALIZAR_META'
  | 'ATUALIZAR_PROGRESSO'
  | 'AGENDAR_SESSAO'

export type ModalData = {
  CADASTRAR_META: undefined
  ATUALIZAR_META: MetaToEdit
  ATUALIZAR_PROGRESSO: MetaToUpdateProgress
  AGENDAR_SESSAO: undefined
}

export interface ModalState<T extends ModalType = ModalType> {
  type: T
  data?: ModalData[T]
}

export type ModalContextType = {
  openModal: <T extends ModalType>(
    type: T,
    data?: ModalData[T]
  ) => void
  closeModal: () => void
  isModalOpen: (type: ModalType) => boolean
}
