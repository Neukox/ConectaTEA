import { Copy, Download, X } from 'lucide-react'
import { useState } from 'react'

interface ModalCodigoVinculoProps {
  isOpen: boolean
  codigoVinculo: string
  qrcodeUrl: string
  nomeCrianca: string
  onClose: () => void
}

export default function ModalCodigoVinculo({
  isOpen,
  codigoVinculo,
  qrcodeUrl,
  nomeCrianca,
  onClose,
}: ModalCodigoVinculoProps) {
  const [codigoCopiado, setCodigoCopiado] = useState(false)

  const handleCopiarCodigo = () => {
    navigator.clipboard.writeText(codigoVinculo)
    setCodigoCopiado(true)
    setTimeout(() => setCodigoCopiado(false), 2000)
  }

  const handleBaixarQRCode = () => {
    const link = document.createElement('a')
    link.href = qrcodeUrl
    link.download = `qrcode-${nomeCrianca}-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl sm:p-8'>
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 rounded-lg p-2 transition hover:bg-gray-100'
        >
          <X className='h-6 w-6 text-gray-600' />
        </button>

        {/* Conteúdo */}
        <div className='space-y-6 pt-4'>
          {/* Título e descrição */}
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-gray-900'>
              Código de Vínculo Gerado
            </h2>
            <p className='mt-2 text-gray-600'>
              Compartilhe este código ou QR code com o responsável para que ele
              possa vincular a criança{' '}
              <span className='font-semibold'>{nomeCrianca}</span> na plataforma
            </p>
          </div>

          {/* Aviso importante */}
          <div className='rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4'>
            <p className='text-sm text-amber-900'>
              <span className='font-semibold'>⚠️ Importante:</span> Este é o
              único código para vincular o responsável. Guarde este código com
              segurança e compartilhe apenas com o responsável da criança. O
              código expira em 7 dias.
            </p>
          </div>

          {/* QR Code */}
          <div className='flex justify-center rounded-lg border-2 border-gray-200 bg-gray-50 p-6'>
            <img
              src={qrcodeUrl}
              alt='QR Code de vínculo'
              className='h-64 w-64'
            />
          </div>

          {/* Código alfanumérico */}
          <div className='space-y-3'>
            <label className='block text-sm font-semibold text-gray-700'>
              Código Alfanumérico
            </label>
            <div className='flex gap-2'>
              <input
                type='text'
                readOnly
                value={codigoVinculo}
                className='flex-1 rounded-lg border-2 border-gray-300 bg-gray-50 px-4 py-3 font-mono text-lg font-semibold text-gray-900'
              />
              <button
                onClick={handleCopiarCodigo}
                className={`flex items-center gap-2 rounded-lg px-4 py-3 font-semibold transition ${
                  codigoCopiado
                    ? 'bg-green-600 text-white'
                    : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Copy className='h-5 w-5' />
                {codigoCopiado ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Instruções */}
          <div className='space-y-3 rounded-lg bg-blue-50 p-4'>
            <h3 className='font-semibold text-blue-900'>Como compartilhar:</h3>
            <ol className='list-inside list-decimal space-y-2 text-sm text-blue-900'>
              <li>Compartilhe o QR code por WhatsApp, email ou pessoalmente</li>
              <li>Ou compartilhe apenas o código alfanumérico acima</li>
              <li>
                O responsável escaneia o código ou digita após criar sua conta
              </li>
              <li>O responsável assina o termo de consentimento LGPD</li>
              <li>A sincronização é feita automaticamente</li>
            </ol>
          </div>

          {/* Botões de ação */}
          <div className='flex gap-3'>
            <button
              onClick={handleBaixarQRCode}
              className='flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50'
            >
              <Download className='h-5 w-5' />
              Baixar QR Code
            </button>
            <button
              onClick={onClose}
              className='flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700'
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
