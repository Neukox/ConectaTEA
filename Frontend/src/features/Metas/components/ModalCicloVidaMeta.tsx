import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  concluirMeta,
  pausarMeta,
  reabrirMeta,
  retomarMeta,
} from '~/api/protected/axiosMetas'
import { QUERY_KEYS, queryClient } from '~/api/query-client'
import { useNotificacoesContext } from '~/api/barraNotificacao'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'

export type ModoCicloVida = 'PAUSAR' | 'RETOMAR' | 'CONCLUIR' | 'REABRIR'

const TITULOS: Record<ModoCicloVida, string> = {
  PAUSAR: 'Pausar meta',
  RETOMAR: 'Retomar meta',
  CONCLUIR: 'Concluir meta',
  REABRIR: 'Reabrir meta',
}

const campo =
  'w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none'

interface ModalCicloVidaMetaProps {
  open: boolean
  modo: ModoCicloVida | null
  meta: { id: number; titulo: string } | null
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ModalCicloVidaMeta({
  open,
  modo,
  meta,
  onOpenChange,
  onSuccess,
}: ModalCicloVidaMetaProps) {
  const { notificarSucesso, notificarErro } = useNotificacoesContext()
  const [motivo, setMotivo] = useState('')
  const [novoPrazo, setNovoPrazo] = useState('')
  const [progressoInicial, setProgressoInicial] = useState(0)
  const [resumoResultado, setResumoResultado] = useState('')

  useEffect(() => {
    if (open) {
      setMotivo('')
      setProgressoInicial(0)
      setResumoResultado('')
      setNovoPrazo(new Date().toISOString().slice(0, 10))
    }
  }, [open, modo])

  const mutation = useMutation({
    mutationFn: async () => {
      if (!meta || !modo) throw new Error('Meta ou ação ausente')
      if (modo === 'PAUSAR') return pausarMeta(meta.id, motivo)
      if (modo === 'RETOMAR') return retomarMeta(meta.id, novoPrazo, motivo)
      if (modo === 'CONCLUIR') return concluirMeta(meta.id, resumoResultado)
      return reabrirMeta(meta.id, { motivo, novoPrazo, progressoInicial })
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.METAS] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.META] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.METAS_RESUMO] }),
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.DASHBOARD_PROFISSIONAL_METAS],
        }),
      ])
      notificarSucesso('Meta atualizada', `Ação aplicada em "${meta?.titulo}".`)
      onOpenChange(false)
      onSuccess?.()
    },
    onError: () => {
      notificarErro('Erro na meta', 'Não foi possível aplicar a ação.')
    },
  })

  if (!modo || !meta) return null

  const valido =
    modo === 'PAUSAR'
      ? motivo.trim() !== ''
      : modo === 'RETOMAR'
        ? novoPrazo !== ''
        : modo === 'CONCLUIR'
          ? resumoResultado.trim() !== ''
          : novoPrazo !== '' && motivo.trim() !== ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{TITULOS[modo]}</DialogTitle>
          <DialogDescription>{meta.titulo}</DialogDescription>
        </DialogHeader>
        <form
          className='space-y-4 py-2'
          onSubmit={(event) => {
            event.preventDefault()
            if (valido) mutation.mutate()
          }}
        >
          {modo === 'CONCLUIR' ? (
            <div>
              <label htmlFor='resumo-conclusao' className='mb-2 block text-sm font-medium text-gray-700'>
                Resumo do resultado
              </label>
              <textarea
                id='resumo-conclusao'
                rows={4}
                value={resumoResultado}
                onChange={(e) => setResumoResultado(e.target.value)}
                className={campo}
                placeholder='Descreva o resultado alcançado...'
              />
            </div>
          ) : (
            <>
              {(modo === 'RETOMAR' || modo === 'REABRIR') && (
                <div>
                  <label htmlFor='novo-prazo' className='mb-2 block text-sm font-medium text-gray-700'>
                    Novo prazo
                  </label>
                  <input
                    id='novo-prazo'
                    type='date'
                    min={new Date().toISOString().slice(0, 10)}
                    value={novoPrazo}
                    onChange={(e) => setNovoPrazo(e.target.value)}
                    className={campo}
                  />
                </div>
              )}
              {modo === 'REABRIR' && (
                <div>
                  <label htmlFor='progresso-reabertura' className='mb-2 block text-sm font-medium text-gray-700'>
                    Progresso inicial (0-99)
                  </label>
                  <input
                    id='progresso-reabertura'
                    type='number'
                    min={0}
                    max={99}
                    value={progressoInicial}
                    onChange={(e) =>
                      setProgressoInicial(
                        Math.min(99, Math.max(0, Number(e.target.value))),
                      )
                    }
                    className={campo}
                  />
                </div>
              )}
              <div>
                <label htmlFor='motivo-meta' className='mb-2 block text-sm font-medium text-gray-700'>
                  {modo === 'PAUSAR'
                    ? 'Motivo da pausa'
                    : modo === 'REABRIR'
                      ? 'Motivo da reabertura'
                      : 'Motivo (opcional)'}
                </label>
                <textarea
                  id='motivo-meta'
                  rows={3}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className={campo}
                />
              </div>
            </>
          )}
          <div className='flex gap-3'>
            <Button
              type='button'
              variant='outline'
              className='flex-1'
              disabled={mutation.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              className='flex-1'
              disabled={!valido || mutation.isPending}
            >
              {mutation.isPending ? 'Salvando...' : 'Confirmar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
