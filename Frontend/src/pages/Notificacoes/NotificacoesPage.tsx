import { Bell, CheckCheck, LoaderCircle, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '~/components/layout/PageLayout'
import Header from '~/components/layout/Header'
import {
  useMarcarNotificacaoLida,
  useMarcarTodasNotificacoesLidas,
  useNotificacoesPersistentes,
} from '~/features/Notificacoes/hooks'
import type { NotificacaoPersistente } from '~/features/Notificacoes/types'

type NotificacoesPageProps = {
  basePath: '/profissional' | '/responsavel'
  title?: string
  description?: string
}

export default function NotificacoesPage({
  basePath,
  title = 'Notificações',
  description = 'Histórico de notificações da sua conta',
}: NotificacoesPageProps) {
  const navigate = useNavigate()
  const list = useNotificacoesPersistentes(true)
  const readOne = useMarcarNotificacaoLida()
  const readAll = useMarcarTodasNotificacoesLidas()
  const unread = list.data?.filter((n) => !n.lida).length ?? 0

  const openNotification = async (notification: NotificacaoPersistente) => {
    if (!notification.lida) await readOne.mutateAsync(notification.id)
    navigate(`${basePath}/anotacoes`)
  }

  return (
    <PageLayout>
      <Header title={title} description={description} />
      <div className='mb-4 flex items-center justify-between'>
        <p
          className='text-sm text-gray-600'
          aria-live='polite'
        >
          {unread} não lida{unread === 1 ? '' : 's'}
        </p>
        {unread > 0 && (
          <button
            type='button'
            disabled={readAll.isPending}
            onClick={() => readAll.mutate()}
            className='flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80 disabled:opacity-50'
          >
            <CheckCheck className='h-4 w-4' />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {list.isLoading && (
        <div
          role='status'
          className='flex items-center justify-center gap-2 rounded-xl bg-white p-8 text-sm text-gray-500'
        >
          <LoaderCircle className='h-5 w-5 animate-spin' /> Carregando
          notificações...
        </div>
      )}
      {list.isError && (
        <div
          role='alert'
          className='rounded-xl bg-red-50 p-6 text-center text-sm text-red-700'
        >
          <p>Não foi possível carregar as notificações.</p>
          <button
            type='button'
            onClick={() => list.refetch()}
            className='mt-3 inline-flex items-center gap-1 font-medium underline'
          >
            <RefreshCw className='h-4 w-4' /> Tentar novamente
          </button>
        </div>
      )}
      {list.isSuccess && list.data.length === 0 && (
        <div className='rounded-xl bg-white p-8 text-center text-sm text-gray-500'>
          <Bell className='mx-auto mb-2 h-7 w-7 text-gray-300' />
          Nenhuma notificação por enquanto.
        </div>
      )}
      <ul className='space-y-2'>
        {list.data?.map((notification) => (
          <li key={notification.id}>
            <button
              type='button'
              onClick={() => void openNotification(notification)}
              className={`block w-full rounded-xl border bg-white px-4 py-3 text-left transition hover:bg-gray-50 ${notification.lida ? '' : 'border-primary/40'}`}
            >
              <span className='flex items-start gap-3'>
                <span
                  aria-hidden='true'
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.lida ? 'bg-transparent' : 'bg-primary'}`}
                />
                <span>
                  <span className='block text-sm font-medium text-gray-900'>
                    {notification.titulo}
                  </span>
                  <span className='mt-1 block text-sm leading-5 text-gray-600'>
                    {notification.mensagem}
                  </span>
                  <time
                    className='mt-1 block text-xs text-gray-400'
                    dateTime={notification.createdAt}
                  >
                    {new Date(notification.createdAt).toLocaleString('pt-BR')}
                  </time>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </PageLayout>
  )
}
