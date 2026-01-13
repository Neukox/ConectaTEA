import { useCallback } from 'react'
import useModal from '~/hooks/useModal'
import type { MetaToEdit, MetaToUpdateProgress } from '../types'

export function useMetasModal() {
  const { openModal, closeModal, isModalOpen } = useModal()

  const openCadastrarMetaModal = useCallback(() => {
    openModal('CADASTRAR_META')
  }, [openModal])

  const openAtualizarMetaModal = useCallback(
    (metaToEdit: MetaToEdit) => {
      openModal('ATUALIZAR_META', metaToEdit)
    },
    [openModal],
  )

  const openAtualizarProgressoModal = useCallback(
    (metaToUpdate: MetaToUpdateProgress) => {
      openModal('ATUALIZAR_PROGRESSO', metaToUpdate)
    },
    [openModal],
  )

  return {
    openCadastrarMetaModal,
    openAtualizarMetaModal,
    openAtualizarProgressoModal,
    closeModal,
    isModalOpen,
  }
}
