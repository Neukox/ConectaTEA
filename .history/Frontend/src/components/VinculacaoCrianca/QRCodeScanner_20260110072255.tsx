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
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setHasPermission(true)
        }
      } catch (err) {
        setError('Não foi possível acessar a câmera. Verifique as permissões.')
        setHasPermission(false)
      }
    }

    startCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  const handleCapture = async () => {
    if (!videoRef.current || scanned || loading) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')

    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0)
      const imageData = canvas.toDataURL('image/png')

      // Aqui você integraria uma biblioteca de QR code como jsQR ou ZXing
      // Por enquanto, simulamos detecção
      setScanned(true)
      onCodeDetected('TEA-6081-Z') // Simulação
    }
  }

  if (hasPermission === false) {
    return (
      <div className="rounded-lg border-2 border-red-200 bg-red-50 p-8">
        <div className="flex gap-4">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900 mb-2">
              Permissão de Câmera Necessária
            </h3>
            <p className="text-red-800 mb-4">
              Você precisa permitir acesso à câmera para escanear o QR code.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
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
      <div className="rounded-lg overflow-hidden border-2 border-gray-200 bg-black aspect-square flex items-center justify-center">
        {hasPermission === null ? (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader className="h-5 w-5 animate-spin" />
            Iniciando câmera...
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          📸 Aponte a câmera para o QR code fornecido pelo profissional. O código será
          detectado automaticamente.
        </p>
      </div>

      <button
        onClick={handleCapture}
        disabled={loading || scanned || hasPermission !== true}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader className="h-5 w-5 animate-spin" />
            Processando...
          </div>
        ) : scanned ? (
          'QR Code Detectado'
        ) : (
          'Capturar QR Code'
        )}
      </button>
    </div>
  )
}
