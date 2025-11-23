import React, { useState } from 'react'
import { Bell } from 'lucide-react'
import { Switch } from '~/components/ui'

const NotificationsSection: React.FC = () => {
  const [email, setEmail] = useState(true)
  const [push, setPush] = useState(true)
  const [sms, setSms] = useState(false)
  const [sessions, setSessions] = useState(true)
  const [progress, setProgress] = useState(true)
  const [messages, setMessages] = useState(true)

  return (
    <div className='rounded-xl border bg-white p-6 shadow-sm'>
      <div className='mb-6 flex items-center gap-2 border-b pb-4'>
        <Bell className='h-5 w-5 text-gray-500' />
        <h2 className='text-lg font-bold text-gray-800'>Notificações</h2>
      </div>

      <div className='space-y-6'>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='font-medium text-gray-800'>
                Notificações por Email
              </p>
              <p className='text-sm text-gray-500'>
                Receba atualizações importantes por email
              </p>
            </div>
            <Switch
              checked={email}
              onCheckedChange={setEmail}
            />
          </div>

          <div className='flex items-center justify-between'>
            <div>
              <p className='font-medium text-gray-800'>Notificações Push</p>
              <p className='text-sm text-gray-500'>
                Receba notificações no navegador
              </p>
            </div>
            <Switch
              checked={push}
              onCheckedChange={setPush}
            />
          </div>

          <div className='flex items-center justify-between'>
            <div>
              <p className='font-medium text-gray-800'>SMS</p>
              <p className='text-sm text-gray-500'>
                Receba mensagens de texto importantes
              </p>
            </div>
            <Switch
              checked={sms}
              onCheckedChange={setSms}
            />
          </div>
        </div>

        <div className='border-t pt-4'>
          <h3 className='mb-4 font-medium text-gray-800'>
            Tipos de Notificação
          </h3>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <p className='text-gray-700'>Sessões Agendadas</p>
              <Switch
                checked={sessions}
                onCheckedChange={setSessions}
              />
            </div>
            <div className='flex items-center justify-between'>
              <p className='text-gray-700'>Atualizações de Progresso</p>
              <Switch
                checked={progress}
                onCheckedChange={setProgress}
              />
            </div>
            <div className='flex items-center justify-between'>
              <p className='text-gray-700'>Novas Mensagens</p>
              <Switch
                checked={messages}
                onCheckedChange={setMessages}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationsSection
