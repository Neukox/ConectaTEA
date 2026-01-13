import { useContext } from 'react'
import { ModalContext } from '~/contexts/modal/provider'

export default function useModal() {
  const context = useContext(ModalContext)

  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }

  return context
}
