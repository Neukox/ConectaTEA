import { useState } from 'react'
import { AlertCircle, Loader } from 'lucide-react'

interface CodigoInputProps {
  onSubmit: (codigo: string) => void
  loading: boolean
}

export default function CodigoInput({ onSubmit, loading }: CodigoInputProps) {
  const [codigo, setCodigo] = useState('')
  const [erro, setErro] = useState('')

  const handleChange = (value: string) => {
    // Apenas permitir caracteres alfanuméricos e hífen
    const codigoLimpo = value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
    setCodigo(codigoLimpo)
    setErro('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!codigo.trim()) {
      setErro('Por favor, insira um código válido.')
      return
    }

    if (codigo.length < 5) {
      setErro('O código deve ter pelo menos 5 caracteres.')
      return
    }

    onSubmit(codigo)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          💡 O código foi fornecido pelo profissional. Ele tem o formato: TEA-XXXX-X
        </p>
      </div>

      <div>
        <label htmlFor="codigo" className="block text-sm font-semibold text-gray-700 mb-2">
          Código de Conexão Exclusiva
        </label>
        <input
          type="text"
          id="codigo"
          value={codigo}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Ex: TEA-6081-Z"
          disabled={loading}
          className={`w-full px-4 py-3 text-lg tracking-widest font-mono text-center border-2 rounded-lg transition ${
            erro
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 focus:border-blue-500 focus:bg-blue-50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        {erro && (
          <div className="mt-2 flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{erro}</span>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-600 space-y-2">
        <p className="font-semibold">Dicas:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>O código é sensível a maiúsculas/minúsculas</li>
          <li>Verifique se copiou corretamente todos os caracteres</li>
          <li>O código é válido por 30 dias a partir da geração</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={loading || !codigo.trim()}
        className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader className="h-5 w-5 animate-spin" />
            Validando Código...
          </div>
        ) : (
          'Continuar'
        )}
      </button>
    </form>
  )
}
