import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, QrCode, Type } from 'lucide-react'
import QRCodeScanner from '~/components/VinculacaoCrianca/QRCodeScanner'
import CodigoInput from '~/components/VinculacaoCrianca/CodigoInput'
import ConfirmacaoVinculo from '~/components/VinculacaoCrianca/ConfirmacaoVinculo'
import TermoConsentimento from '~/components/VinculacaoCrianca/TermoConsentimento'
import Stepper from '~/components/VinculacaoCrianca/Stepper'
import { vinculacaoAPI, type ValidarCodigoResponse } from '~/api/protected/axiosVinculacao'
import { useNotificacoesContext } from '~/api/barraNotificacao'
import { getApiErrorMessage } from '~/api/errors'
import { queryClient, QUERY_KEYS } from '~/api/query-client'

type Step =
  | 'selecao'
  | 'scanner'
  | 'codigo'
  | 'confirmacao'
  | 'consentimento'
  | 'sucesso'

const STEPS = [
  'Selecionar Método',
  'Validação',
  'Confirmação',
  'Consentimento',
  'Sucesso',
]

const getStepIndex = (step: Step): number => {
  const mapping: Record<Step, number> = {
    'selecao': 0,
    'scanner': 1,
    'codigo': 1,
    'confirmacao': 2,
    'consentimento': 3,
    'sucesso': 4,
  }
  return mapping[step]
}

export default function VincularCrianca() {
  const navigate = useNavigate()
  const { notificarErro, notificarSucesso } = useNotificacoesContext()
  const [step, setStep] = useState<Step>('selecao')
  const [criancaData, setCriancaData] = useState<ValidarCodigoResponse | null>(null)
  const [codigoValidado, setCodigoValidado] = useState<string | null>(null)
  const [consentimentoAceito, setConsentimentoAceito] = useState(false)
  const [loading, setLoading] = useState(false)

  const validarCodigo = async (codigo: string) => {
    setLoading(true)
    try {
      const codigoNormalizado = codigo.trim()
      const response = await vinculacaoAPI.validarCodigo(codigoNormalizado)
      setCriancaData(response)
      setCodigoValidado(codigoNormalizado)
      setStep('confirmacao')
    } catch (error) {
      notificarErro(
        'Não foi possível validar o código',
        getApiErrorMessage(error, 'O código é inválido, expirou ou já foi utilizado.'),
      )
    } finally {
      setLoading(false)
    }
  }

  const handleQRCodeDetected = validarCodigo
  const handleCodigoSubmit = validarCodigo

  const handleConfirmacao = () => {
    setStep('consentimento')
  }

  const handleConsentimentoAceito = async () => {
    if (!criancaData || !codigoValidado || !consentimentoAceito) return

    setLoading(true)
    try {
      await vinculacaoAPI.confirmarVinculo({
        codigo: codigoValidado,
        consentimentoAceito: true,
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VINCULOS] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CRIANCAS] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_RESPONSAVEL] }),
      ])
      notificarSucesso('Vínculo criado', `${criancaData.nome} foi vinculado(a) à sua conta.`)
      setStep('sucesso')
    } catch (error) {
      notificarErro('Erro ao confirmar vínculo', getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleVoltarPrincipal = () => {
    navigate('/dashboard')
  }

  const renderContent = () => {
    switch (step) {
      case 'selecao':
        return (
          <div className='mx-auto max-w-2xl'>
            <h1 className='mb-8 text-center text-3xl font-bold text-gray-800'>
              Vincular Criança
            </h1>
            <p className='mb-12 text-center text-gray-600'>
              Escolha como você deseja vincular a criança. O profissional
              fornecerá um código ou QR code exclusivo.
            </p>

            <div className='grid gap-6 md:grid-cols-2'>
              {/* Opção QR Code */}
              <button
                onClick={() => {
                  setStep('scanner')
                }}
                className='group relative overflow-hidden rounded-lg border-2 border-gray-200 p-8 transition-all hover:border-blue-500 hover:shadow-lg'
              >
                <div className='flex flex-col items-center gap-4'>
                  <div className='rounded-full bg-blue-100 p-4 transition group-hover:bg-blue-200'>
                    <QrCode className='h-8 w-8 text-blue-600' />
                  </div>
                  <h2 className='text-xl font-semibold text-gray-800'>
                    Escanear QR Code
                  </h2>
                  <p className='text-sm text-gray-600'>
                    Use a câmera para escanear o QR code fornecido pelo
                    profissional
                  </p>
                </div>
              </button>

              {/* Opção Código Manual */}
              <button
                onClick={() => {
                  setStep('codigo')
                }}
                className='group relative overflow-hidden rounded-lg border-2 border-gray-200 p-8 transition-all hover:border-green-500 hover:shadow-lg'
              >
                <div className='flex flex-col items-center gap-4'>
                  <div className='rounded-full bg-green-100 p-4 transition group-hover:bg-green-200'>
                    <Type className='h-8 w-8 text-green-600' />
                  </div>
                  <h2 className='text-xl font-semibold text-gray-800'>
                    Inserir Código
                  </h2>
                  <p className='text-sm text-gray-600'>
                    Digite o código alfanumérico fornecido pelo profissional
                  </p>
                </div>
              </button>
            </div>
          </div>
        )

      case 'scanner':
        return (
          <div className='mx-auto max-w-2xl'>
            <div className='mb-6 flex items-center gap-4'>
              <button
                onClick={() => setStep('selecao')}
                className='rounded-lg p-2 transition hover:bg-gray-100'
              >
                <ArrowLeft className='h-6 w-6 text-gray-600' />
              </button>
              <h1 className='text-2xl font-bold text-gray-800'>
                Escanear QR Code
              </h1>
            </div>
            <QRCodeScanner
              onCodeDetected={handleQRCodeDetected}
              loading={loading}
            />
          </div>
        )

      case 'codigo':
        return (
          <div className='mx-auto max-w-2xl'>
            <div className='mb-6 flex items-center gap-4'>
              <button
                onClick={() => setStep('selecao')}
                className='rounded-lg p-2 transition hover:bg-gray-100'
              >
                <ArrowLeft className='h-6 w-6 text-gray-600' />
              </button>
              <h1 className='text-2xl font-bold text-gray-800'>
                Inserir Código
              </h1>
            </div>
            <CodigoInput
              onSubmit={handleCodigoSubmit}
              loading={loading}
            />
          </div>
        )

      case 'confirmacao':
        return (
          <div className='mx-auto max-w-2xl'>
            <div className='mb-6 flex items-center gap-4'>
              <button
                onClick={() => {
                  setStep('selecao')
                  setCriancaData(null)
                }}
                className='rounded-lg p-2 transition hover:bg-gray-100'
              >
                <ArrowLeft className='h-6 w-6 text-gray-600' />
              </button>
              <h1 className='text-2xl font-bold text-gray-800'>
                Confirmar Vinculação
              </h1>
            </div>
            {criancaData && (
              <ConfirmacaoVinculo
                crianca={criancaData}
                onConfirm={handleConfirmacao}
                loading={loading}
              />
            )}
          </div>
        )

      case 'consentimento':
        return (
          <div className='mx-auto max-w-2xl'>
            <div className='mb-6 flex items-center gap-4'>
              <button
                onClick={() => setStep('confirmacao')}
                className='rounded-lg p-2 transition hover:bg-gray-100'
              >
                <ArrowLeft className='h-6 w-6 text-gray-600' />
              </button>
              <h1 className='text-2xl font-bold text-gray-800'>
                Termo de Consentimento
              </h1>
            </div>
            <TermoConsentimento
              onAceitar={handleConsentimentoAceito}
              onRecusar={() => setStep('confirmacao')}
              loading={loading}
              consentimentoAceito={consentimentoAceito}
              onConsentimentoChange={setConsentimentoAceito}
            />
          </div>
        )

      case 'sucesso':
        return (
          <div className='mx-auto max-w-2xl text-center'>
            <div className='mb-6 flex justify-center'>
              <div className='rounded-full bg-green-100 p-4'>
                <svg
                  className='h-12 w-12 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
            </div>
            <h1 className='mb-4 text-3xl font-bold text-gray-800'>
              Vínculo Criado com Sucesso!
            </h1>
            <p className='mb-8 text-gray-600'>
              A criança foi vinculada à sua conta. Você agora pode acompanhar o
              progresso e receber atualizações do profissional.
            </p>
            <button
              onClick={handleVoltarPrincipal}
              className='inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700'
            >
              Ir para Dashboard
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className='min-h-screen bg-linear-to-br from-blue-50 via-green-50 to-blue-50 px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-4xl'>
        {/* Stepper */}
        {step !== 'selecao' && (
          <Stepper
            currentStep={getStepIndex(step)}
            steps={STEPS}
          />
        )}

        {renderContent()}
      </div>
    </div>
  )
}
