import { useCallback } from 'react'
import useModal from '~/hooks/useModal'
import type { SessaoToEdit } from '../types'

export default function useSessoesModal() {
  const { openModal, closeModal, isModalOpen } = useModal()

  const openAgendarSessaoModal = useCallback(() => {
    openModal('AGENDAR_SESSAO')
  }, [openModal])

  const openEditarSessaoModal = useCallback(
    (dataToEdit: SessaoToEdit) => {
      openModal('EDITAR_SESSAO', dataToEdit)
    },
    [openModal],
  )

  return {
    openAgendarSessaoModal,
    openEditarSessaoModal,
    closeModal,
    isModalOpen,
  }
}
