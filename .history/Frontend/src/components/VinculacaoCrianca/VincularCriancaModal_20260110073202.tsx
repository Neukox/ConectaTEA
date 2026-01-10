import { useState } from 'react'
import { X, Loader } from 'lucide-react'
import CodigoInput from './CodigoInput'

interface VincularCriancaModalProps {
  isOpen: boolean
  onClose: () => void
  onVinculoConfirmado?: () => void
}

export default function VincularCriancaModal({
  isOpen,
  onClose,
  onVinculoConfirmado,
}: VincularCriancaModalProps) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleCodigoSubmit = async (codigo: string) => {
    setLoading(true)
    try {
      // Aqui você integraria com a API
      // await vinculacaoAPI.validarCodigo(codigo)
      setTimeout(() => {
        setLoading(false)
        onVinculoConfirmado?.()
        onClose()
      }, 1500)
    } catch (error) {
      setLoading(false)
      alert('Erro ao vincular criança')
    }
  }

  return (
    <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4'>
      <div className='w-full max-w-md rounded-lg bg-white shadow-xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 p-6'>
          <h2 className='text-xl font-bold text-gray-900'>Vincular Criança</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className='rounded p-1 transition hover:bg-gray-100 disabled:opacity-50'
          >
            <X className='h-6 w-6 text-gray-600' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          <p className='mb-6 text-sm text-gray-600'>
            Insira o código exclusivo fornecido pelo profissional para vincular
            uma criança à sua conta.
          </p>

          <CodigoInput
            onSubmit={handleCodigoSubmit}
            loading={loading}
          />
        </div>

        {/* Footer */}
        <div className='rounded-b-lg border-t border-gray-200 bg-gray-50 px-6 py-4'>
          <p className='text-xs text-gray-600'>
            Não tem um código? Peça ao profissional que gere um QR code ou
            código de acesso exclusivo.
          </p>
        </div>
      </div>
    </div>
  )
}
