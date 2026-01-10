import { Loader } from 'lucide-react'
import { formatDate, calculateAge } from '../../lib/date.utils'

interface CriancaData {
  id: number
  nome: string
  data_nascimento: string
  diagnostico: string
  status: string
}

interface ConfirmacaoVinculoProps {
  crianca: CriancaData
  onConfirm: () => void
  loading: boolean
}

export default function ConfirmacaoVinculo({
  crianca,
  onConfirm,
  loading
}: ConfirmacaoVinculoProps) {

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold text-green-900 mb-2">Criança Encontrada</h3>
        <p className="text-green-800">
          Os dados da criança foram validados com sucesso. Verifique as informações abaixo.
        </p>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nome da Criança
            </label>
            <p className="text-lg text-gray-900 font-semibold">{crianca.nome}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Idade
            </label>
            <p className="text-lg text-gray-900 font-semibold">
              {calculateAge(crianca.data_nascimento)} anos
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Data de Nascimento
            </label>
            <p className="text-lg text-gray-900 font-semibold">
              {formatDate(crianca.data_nascimento)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Diagnóstico
            </label>
            <p className="text-lg text-gray-900 font-semibold">{crianca.diagnostico}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Status de Vínculo
          </label>
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
            ⏳ {crianca.status}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Próximo passo:</strong> Você será solicitado a aceitar o termo de consentimento
          antes de confirmar o vínculo.
        </p>
      </div>

      <button
        onClick={onConfirm}
        disabled={loading}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader className="h-5 w-5 animate-spin" />
            Processando...
          </div>
        ) : (
          'Prosseguir com Consentimento'
        )}
      </button>
    </div>
  )
}
