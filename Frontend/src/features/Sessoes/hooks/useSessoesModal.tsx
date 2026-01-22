import { useCallback } from "react"
import useModal from "~/hooks/useModal"

export default function useSessoesModal() {
  const { openModal, closeModal, isModalOpen } = useModal()

  const openAgendarSessaoModal = useCallback(() => {
    openModal('AGENDAR_SESSAO')
  }, [openModal])

  return {
    openAgendarSessaoModal,
    closeModal,
    isModalOpen,
  }
}