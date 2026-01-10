import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, QrCode, Type } from 'lucide-react'
import QRCodeScanner from '../../components/VinculacaoCrianca/QRCodeScanner'
import CodigoInput from '../../components/VinculacaoCrianca/CodigoInput'
import ConfirmacaoVinculo from '../../components/VinculacaoCrianca/ConfirmacaoVinculo'
import TermoConsentimento from '../../components/VinculacaoCrianca/TermoConsentimento'
import Stepper from '../../components/VinculacaoCrianca/Stepper'

type Step = 'selecao' | 'scanner' | 'codigo' | 'confirmacao' | 'consentimento' | 'sucesso'

interface CriancaData {
  id: number
  nome: string
  data_nascimento: string
  diagnostico: string
  status: string
}

const STEPS = ['Selecionar Método', 'Validação', 'Confirmação', 'Consentimento', 'Sucesso']

const getStepIndex = (step: Step): number => {
  const mapping: Record<Step, number> = {
    'selecao': 0,
    'scanner': 1,
    'codigo': 1,
    'confirmacao': 2,
    'consentimento': 3,
    'sucesso': 4
  }
  return mapping[step]
}

export default function VincularCrianca() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('selecao')
  const [metodo, setMetodo] = useState<'qr' | 'codigo'>()
  const [criancaData, setCriancaData] = useState<CriancaData | null>(null)
  const [consentimentoAceito, setConsentimentoAceito] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleQRCodeDetected = async (codigo: string) => {
    setLoading(true)
    try {
      // Aqui você chamaria a API para buscar dados da criança
      // const response = await api.get(`/vinculacao/validar/${codigo}`)
      // setCriancaData(response.data)
      // Por enquanto, simulamos:
      setCriancaData({
        id: 1,
        nome: 'João Silva',
        data_nascimento: '2018-05-15',
        diagnostico: 'TEA Nível 2',
        status: 'Aguardando Vínculo Familiar'
      })
      setStep('confirmacao')
    } catch (error) {
      console.error('Erro ao validar código:', error)
      alert('Código inválido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleCodigoSubmit = async (codigo: string) => {
    setLoading(true)
    try {
      // Aqui você chamaria a API para buscar dados da criança
      // const response = await api.get(`/vinculacao/validar/${codigo}`)
      // setCriancaData(response.data)
      setCriancaData({
        id: 1,
        nome: 'João Silva',
        data_nascimento: '2018-05-15',
        diagnostico: 'TEA Nível 2',
        status: 'Aguardando Vínculo Familiar'
      })
      setStep('confirmacao')
    } catch (error) {
      console.error('Erro ao validar código:', error)
      alert('Código inválido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmacao = () => {
    setStep('consentimento')
  }

  const handleConsentimentoAceito = async () => {
    setLoading(true)
    try {
      // Aqui você chamaria a API para criar o vínculo
      // await api.post('/vinculacao/confirmar', { crianca_id: criancaData.id })
      setStep('sucesso')
    } catch (error) {
      console.error('Erro ao confirmar vínculo:', error)
      alert('Erro ao confirmar vínculo. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleVoltarPrincipal = () => {
    navigate('/dashboard')
  }

  const renderContent = () => {
    const stepIndex = getStepIndex(step)
    switch (step) {
      case 'selecao':
        return (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
              Vincular Criança
            </h1>
            <p className="text-center text-gray-600 mb-12">
              Escolha como você deseja vincular a criança. O profissional fornecerá um código ou QR code exclusivo.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Opção QR Code */}
              <button
                onClick={() => {
                  setMetodo('qr')
                  setStep('scanner')
                }}
                className="group relative overflow-hidden rounded-lg border-2 border-gray-200 p-8 transition-all hover:border-blue-500 hover:shadow-lg"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-blue-100 p-4 group-hover:bg-blue-200 transition">
                    <QrCode className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Escanear QR Code
                  </h2>
                  <p className="text-sm text-gray-600">
                    Use a câmera para escanear o QR code fornecido pelo profissional
                  </p>
                </div>
              </button>

              {/* Opção Código Manual */}
              <button
                onClick={() => {
                  setMetodo('codigo')
                  setStep('codigo')
                }}
                className="group relative overflow-hidden rounded-lg border-2 border-gray-200 p-8 transition-all hover:border-green-500 hover:shadow-lg"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-green-100 p-4 group-hover:bg-green-200 transition">
                    <Type className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Inserir Código
                  </h2>
                  <p className="text-sm text-gray-600">
                    Digite o código alfanumérico fornecido pelo profissional
                  </p>
                </div>
              </button>
            </div>
          </div>
        )

      case 'scanner':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setStep('selecao')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                Escanear QR Code
              </h1>
            </div>
            <QRCodeScanner onCodeDetected={handleQRCodeDetected} loading={loading} />
          </div>
        )

      case 'codigo':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setStep('selecao')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                Inserir Código
              </h1>
            </div>
            <CodigoInput onSubmit={handleCodigoSubmit} loading={loading} />
          </div>
        )

      case 'confirmacao':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => {
                  setStep('selecao')
                  setCriancaData(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
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
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setStep('confirmacao')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
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
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-4">
                <svg
                  className="h-12 w-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Vínculo Criado com Sucesso!
            </h1>
            <p className="text-gray-600 mb-8">
              A criança foi vinculada à sua conta. Você agora pode acompanhar o progresso
              e receber atualizações do profissional.
            </p>
            <button
              onClick={handleVoltarPrincipal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Stepper */}
        {step !== 'selecao' && <Stepper currentStep={getStepIndex(step)} steps={STEPS} />}

        {renderContent()}
      </div>
    </div>
  )
}
