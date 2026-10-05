import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { VISIBILIDADE_DESCRICOES } from '../constants'
import {
  anotacaoSchema,
  type AnotacaoFormData,
} from '../schemas/anotacao.schema'
import type { Anotacao, CriancaAnotacao } from '../types'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'

type Props = {
  open: boolean
  anotacao?: Anotacao
  criancas: CriancaAnotacao[]
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: AnotacaoFormData) => Promise<void>
}

const fieldClass =
  'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100'

export function AnotacaoFormDialog({
  open,
  anotacao,
  criancas,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AnotacaoFormData>({
    resolver: zodResolver(anotacaoSchema),
    defaultValues: {
      criancaId: criancas[0]?.id,
      conteudo: '',
      visibilidade: 'PRIVADA',
    },
  })
  const visibilidade = watch('visibilidade')

  useEffect(() => {
    reset(
      anotacao
        ? {
            criancaId: anotacao.criancaId,
            conteudo: anotacao.conteudo,
            visibilidade: anotacao.visibilidade,
          }
        : { criancaId: criancas[0]?.id, conteudo: '', visibilidade: 'PRIVADA' },
    )
  }, [anotacao, criancas, open, reset])

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='max-h-[90vh] max-w-xl overflow-y-auto rounded-2xl p-0'>
        <DialogHeader className='border-b border-gray-100 p-6 pb-5'>
          <DialogTitle className='text-2xl text-gray-950'>
            {anotacao ? 'Editar anotação' : 'Nova anotação'}
          </DialogTitle>
          <DialogDescription>
            {anotacao
              ? 'Atualize o conteúdo e a visibilidade.'
              : 'Registre uma informação importante com a visibilidade adequada.'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='space-y-5 p-6'
        >
          <div>
            <label
              htmlFor='anotacao-crianca'
              className='mb-2 block text-sm font-medium text-gray-800'
            >
              Criança
            </label>
            <select
              id='anotacao-crianca'
              disabled={Boolean(anotacao)}
              {...register('criancaId', { valueAsNumber: true })}
              className={fieldClass}
            >
              <option value=''>Selecione a criança</option>
              {criancas.map((crianca) => (
                <option
                  key={crianca.id}
                  value={crianca.id}
                >
                  {crianca.nome}
                </option>
              ))}
            </select>
            {errors.criancaId && (
              <p
                role='alert'
                className='mt-1 text-sm text-red-600'
              >
                {errors.criancaId.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor='anotacao-conteudo'
              className='mb-2 block text-sm font-medium text-gray-800'
            >
              Conteúdo
            </label>
            <textarea
              id='anotacao-conteudo'
              rows={7}
              {...register('conteudo')}
              className={`${fieldClass} resize-y`}
              placeholder='Escreva a anotação de forma clara e objetiva.'
            />
            {errors.conteudo && (
              <p
                role='alert'
                className='mt-1 text-sm text-red-600'
              >
                {errors.conteudo.message}
              </p>
            )}
          </div>
          <fieldset>
            <legend className='mb-2 text-sm font-medium text-gray-800'>
              Visibilidade
            </legend>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              {(['PRIVADA', 'COMPARTILHADA'] as const).map((value) => (
                <label
                  key={value}
                  className='flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 has-[:checked]:border-green-500 has-[:checked]:bg-green-50'
                >
                  <input
                    type='radio'
                    value={value}
                    {...register('visibilidade')}
                    className='mt-1 accent-green-700'
                  />
                  <span>
                    <strong className='block text-sm text-gray-950'>
                      {value === 'PRIVADA' ? 'Privada' : 'Compartilhada'}
                    </strong>
                    <span className='mt-1 block text-xs leading-5 text-gray-600'>
                      {VISIBILIDADE_DESCRICOES[value]}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <p
              className='mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700'
              aria-live='polite'
            >
              {VISIBILIDADE_DESCRICOES[visibilidade]}
            </p>
          </fieldset>
          <div className='flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='bg-green-700 text-white hover:bg-green-800'
            >
              {isSubmitting
                ? 'Salvando...'
                : anotacao
                  ? 'Salvar alterações'
                  : 'Criar anotação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
