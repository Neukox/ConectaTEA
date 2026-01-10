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
  onVinculoConfirmado
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Vincular Criança
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-gray-100 rounded transition disabled:opacity-50"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Insira o código exclusivo fornecido pelo profissional para vincular
            uma criança à sua conta.
          </p>

          <CodigoInput onSubmit={handleCodigoSubmit} loading={loading} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <p className="text-xs text-gray-600">
            Não tem um código? Peça ao profissional que gere um QR code ou
            código de acesso exclusivo.
          </p>
        </div>
      </div>
    </div>
  )
}
