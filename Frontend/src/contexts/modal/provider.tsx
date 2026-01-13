import { createContext, useCallback, useState } from 'react'
import type {
  ModalContextType,
  ModalData,
  ModalState,
  ModalType,
} from './types'
import { createPortal } from 'react-dom'
import { CadastrarMetaDialog } from '~/features/Metas'
import { AtualizarMetaDialog } from '~/features/Metas'
import { AtualizarProgressoDialog } from '~/features/Metas'

export const ModalContext = createContext<ModalContextType | undefined>(
  undefined,
)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalState | null>(null)

  const openModal = useCallback(
    <T extends ModalType>(type: T, data?: ModalState['data']) => {
      setActiveModal({ type, data } as ModalState)
    },
    [],
  )

  const closeModal = useCallback(() => {
    setActiveModal(null)
  }, [])

  const isModalOpen = useCallback(
    (type: ModalType) => {
      return activeModal?.type === type
    },
    [activeModal],
  )

  const renderModal = () => {
    if (!activeModal) return null

    switch (activeModal.type) {
      case 'CADASTRAR_META':
        return (
          <CadastrarMetaDialog
            open={true}
            onOpenChange={closeModal}
          />
        )
      case 'ATUALIZAR_META':
        return (
          <AtualizarMetaDialog
            open={true}
            onOpenChange={closeModal}
            metaToEdit={activeModal.data as ModalData['ATUALIZAR_META']}
          />
        )
      case 'ATUALIZAR_PROGRESSO':
        return (
          <AtualizarProgressoDialog
            open={true}
            onOpenChange={closeModal}
            meta={activeModal.data as ModalData['ATUALIZAR_PROGRESSO']}
          />
        )
      default:
        return null
    }
  }

  return (
    <ModalContext.Provider value={{ openModal, closeModal, isModalOpen }}>
      {children}
      {activeModal && createPortal(renderModal(), document.body)}
    </ModalContext.Provider>
  )
}
