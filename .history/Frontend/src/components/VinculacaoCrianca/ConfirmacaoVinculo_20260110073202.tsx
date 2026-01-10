import { Loader } from 'lucide-react'
import { formatDate, calculateAge } from '~/lib/date.utils'

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
  loading,
}: ConfirmacaoVinculoProps) {
  return (
    <div className='space-y-6'>
      <div className='rounded-lg border border-green-200 bg-green-50 p-6'>
        <h3 className='mb-2 font-semibold text-green-900'>
          Criança Encontrada
        </h3>
        <p className='text-green-800'>
          Os dados da criança foram validados com sucesso. Verifique as
          informações abaixo.
        </p>
      </div>

      <div className='space-y-4 rounded-lg border-2 border-gray-200 bg-white p-6'>
        <div className='grid gap-6 md:grid-cols-2'>
          <div>
            <label className='mb-1 block text-sm font-semibold text-gray-700'>
              Nome da Criança
            </label>
            <p className='text-lg font-semibold text-gray-900'>
              {crianca.nome}
            </p>
          </div>

          <div>
            <label className='mb-1 block text-sm font-semibold text-gray-700'>
              Idade
            </label>
            <p className='text-lg font-semibold text-gray-900'>
              {calculateAge(crianca.data_nascimento)} anos
            </p>
          </div>

          <div>
            <label className='mb-1 block text-sm font-semibold text-gray-700'>
              Data de Nascimento
            </label>
            <p className='text-lg font-semibold text-gray-900'>
              {formatDate(crianca.data_nascimento)}
            </p>
          </div>

          <div>
            <label className='mb-1 block text-sm font-semibold text-gray-700'>
              Diagnóstico
            </label>
            <p className='text-lg font-semibold text-gray-900'>
              {crianca.diagnostico}
            </p>
          </div>
        </div>

        <div className='border-t border-gray-200 pt-4'>
          <label className='mb-2 block text-sm font-semibold text-gray-700'>
            Status de Vínculo
          </label>
          <div className='inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-800'>
            ⏳ {crianca.status}
          </div>
        </div>
      </div>

      <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
        <p className='text-sm text-blue-800'>
          <strong>Próximo passo:</strong> Você será solicitado a aceitar o termo
          de consentimento antes de confirmar o vínculo.
        </p>
      </div>

      <button
        onClick={onConfirm}
        disabled={loading}
        className='w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
      >
        {loading ? (
          <div className='flex items-center justify-center gap-2'>
            <Loader className='h-5 w-5 animate-spin' />
            Processando...
          </div>
        ) : (
          'Prosseguir com Consentimento'
        )}
      </button>
    </div>
  )
}
