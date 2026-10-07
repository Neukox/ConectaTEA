import { Bell, CheckCheck, LoaderCircle, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '~/hooks/useAuth'
import {
  useContadorNotificacoes,
  useMarcarNotificacaoLida,
  useMarcarTodasNotificacoesLidas,
  useNotificacoesPersistentes,
} from './hooks'
import type { NotificacaoPersistente } from './types'

const relative = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

function friendlyDate(value: string): string {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000)
  if (Math.abs(seconds) < 60) return relative.format(seconds, 'second')
  const minutes = Math.round(seconds / 60)
  if (Math.abs(minutes) < 60) return relative.format(minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return relative.format(hours, 'hour')
  const days = Math.round(hours / 24)
  if (Math.abs(days) < 30) return relative.format(days, 'day')
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()
  const count = useContadorNotificacoes(Boolean(user))
  const list = useNotificacoesPersistentes(Boolean(user) && open)
  const readOne = useMarcarNotificacaoLida()
  const readAll = useMarcarTodasNotificacoesLidas()
  const unread = count.data ?? 0

  const openNotification = async (notification: NotificacaoPersistente) => {
    if (!notification.lida) await readOne.mutateAsync(notification.id)
    setOpen(false)
    const base = user?.tipo === 'RESPONSAVEL' ? '/responsavel' : '/profissional'
    navigate(`${base}/anotacoes`)
  }

  return (
    <div className='relative'>
      <button
        type='button'
        aria-label={`Notificações${unread ? `, ${unread} não lidas` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className='relative rounded-full p-2 hover:bg-gray-100'
      >
        <Bell className='h-6 w-6 text-gray-500' />
        {unread > 0 && (
          <span className='absolute -top-0.5 -right-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white'>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <section className='absolute top-12 right-0 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl'>
          <header className='flex items-center justify-between border-b px-4 py-3'>
            <div>
              <h2 className='font-semibold text-gray-900'>Notificações</h2>
              <p className='text-xs text-gray-500'>{unread} não lida{unread === 1 ? '' : 's'}</p>
            </div>
            {unread > 0 && (
              <button
                type='button'
                disabled={readAll.isPending}
                onClick={() => readAll.mutate()}
                className='flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-800 disabled:opacity-50'
              >
                <CheckCheck className='h-4 w-4' />
                Marcar todas como lidas
              </button>
            )}
          </header>

          <div className='max-h-96 overflow-y-auto' aria-live='polite'>
            {list.isLoading && (
              <div className='flex items-center justify-center gap-2 p-8 text-sm text-gray-500'>
                <LoaderCircle className='h-5 w-5 animate-spin' /> Carregando notificações...
              </div>
            )}
            {list.isError && (
              <div className='p-6 text-center text-sm text-red-700'>
                <p>Não foi possível carregar as notificações.</p>
                <button type='button' onClick={() => list.refetch()} className='mt-3 inline-flex items-center gap-1 font-medium'>
                  <RefreshCw className='h-4 w-4' /> Tentar novamente
                </button>
              </div>
            )}
            {list.isSuccess && list.data.length === 0 && (
              <div className='p-8 text-center text-sm text-gray-500'>
                <Bell className='mx-auto mb-2 h-7 w-7 text-gray-300' />
                Nenhuma notificação por enquanto.
              </div>
            )}
            {list.data?.map((notification) => (
              <button
                type='button'
                key={notification.id}
                onClick={() => void openNotification(notification)}
                className={`block w-full border-b px-4 py-3 text-left transition hover:bg-gray-50 ${notification.lida ? 'bg-white' : 'bg-green-50/70'}`}
              >
                <span className='flex items-start gap-3'>
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.lida ? 'bg-transparent' : 'bg-green-600'}`} />
                  <span>
                    <span className='block text-sm font-medium text-gray-900'>{notification.titulo}</span>
                    <span className='mt-1 block text-sm leading-5 text-gray-600'>{notification.mensagem}</span>
                    <time className='mt-1 block text-xs text-gray-400' dateTime={notification.createdAt}>
                      {friendlyDate(notification.createdAt)}
                    </time>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
