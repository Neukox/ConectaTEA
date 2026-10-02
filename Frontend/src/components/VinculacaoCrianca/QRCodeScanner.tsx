import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Loader } from 'lucide-react'

interface QRCodeScannerProps {
  onCodeDetected: (code: string) => void
  loading: boolean
}

export default function QRCodeScanner({ onCodeDetected, loading }: QRCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    let cameraStream: MediaStream | null = null

    const startCamera = async () => {
      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream
          setHasPermission(true)
        }
      } catch {
        setError('Não foi possível acessar a câmera. Verifique as permissões.')
        setHasPermission(false)
      }
    }

    void startCamera()
    return () => cameraStream?.getTracks().forEach(track => track.stop())
  }, [])

  const handleCapture = async () => {
    if (!videoRef.current || scanned || loading) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(videoRef.current, 0, 0)

    type BarcodeDetectorInstance = {
      detect: (source: CanvasImageSource) => Promise<Array<{ rawValue: string }>>
    }
    type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorInstance
    const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector

    if (!Detector) {
      setError('A leitura de QR code não é suportada neste navegador. Use a opção de código manual.')
      return
    }

    const codes = await new Detector({ formats: ['qr_code'] }).detect(canvas)
    const code = codes[0]?.rawValue
    if (!code) {
      setError('Nenhum QR code foi identificado. Ajuste a câmera e tente novamente.')
      return
    }

    setScanned(true)
    onCodeDetected(code)
  }

  if (hasPermission === false) {
    return (
      <div className="rounded-lg border-2 border-red-200 bg-red-50 p-8">
        <div className="flex gap-4">
          <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600" />
          <div>
            <h3 className="mb-2 font-semibold text-red-900">Permissão de Câmera Necessária</h3>
            <p className="mb-4 text-red-800">Você precisa permitir acesso à câmera para escanear o QR code.</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border-2 border-gray-200 bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={hasPermission === true ? 'h-full w-full object-cover' : 'hidden'}
        />
        {hasPermission === null && (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader className="h-5 w-5 animate-spin" />
            Iniciando câmera...
          </div>
        )}
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          Aponte a câmera para o QR code fornecido pelo profissional. O código será detectado ao capturar.
        </p>
      </div>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <button
        onClick={handleCapture}
        disabled={loading || scanned || hasPermission !== true}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader className="h-5 w-5 animate-spin" />
            Processando...
          </span>
        ) : scanned ? 'QR Code Detectado' : 'Capturar QR Code'}
      </button>
    </div>
  )
}
