import React, { useState } from 'react'
import { Shield, Key } from 'lucide-react'
import { Switch } from '../../../../components/ui/switch'

const PrivacySecuritySection: React.FC = () => {
  const [profileVisible, setProfileVisible] = useState(true)
  const [shareProgress, setShareProgress] = useState(false)
  const [allowMessages, setAllowMessages] = useState(true)

  return (
    <div className='rounded-xl border bg-white p-6 shadow-sm'>
      <div className='mb-6 flex items-center gap-2 border-b pb-4'>
        <Shield className='h-5 w-5 text-gray-500' />
        <h2 className='text-lg font-bold text-gray-800'>
          Privacidade e Segurança
        </h2>
      </div>

      <div className='space-y-6'>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='font-medium text-gray-800'>Perfil Visível</p>
              <p className='text-sm text-gray-500'>
                Permitir que outros usuários vejam seu perfil
              </p>
            </div>
            <Switch
              checked={profileVisible}
              onCheckedChange={setProfileVisible}
            />
          </div>

          <div className='flex items-center justify-between'>
            <div>
              <p className='font-medium text-gray-800'>
                Compartilhar Progresso
              </p>
              <p className='text-sm text-gray-500'>
                Permitir compartilhamento de dados de progresso
              </p>
            </div>
            <Switch
              checked={shareProgress}
              onCheckedChange={setShareProgress}
            />
          </div>

          <div className='flex items-center justify-between'>
            <div>
              <p className='font-medium text-gray-800'>Permitir Mensagens</p>
              <p className='text-sm text-gray-500'>
                Receber mensagens de profissionais
              </p>
            </div>
            <Switch
              checked={allowMessages}
              onCheckedChange={setAllowMessages}
            />
          </div>
        </div>

        <div className='border-t pt-4'>
          <button className='flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 font-medium text-gray-700 hover:bg-gray-50'>
            <Key className='h-4 w-4' />
            Alterar Senha
          </button>
        </div>
      </div>
    </div>
  )
}

export default PrivacySecuritySection
