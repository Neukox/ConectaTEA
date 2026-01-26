import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '~/lib/utils'
import {
  Button,
  Calendar,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui'
import { TipoSessao, type SessaoToEdit } from '../types'
import {
  UpdateSessaoSchema,
  type UpdateSessaoData,
} from '../schemas/update-sessao.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import useEditarSessao from '../hooks/useEditarSessao'
import { useNotificacoesContext } from '~/api/barraNotificacao'
import ErrorField from '~/components/common/ErrorField'

interface ModalEditarSessaoProps {
  isOpen: boolean
  onClose: () => void
  session: SessaoToEdit | null
}

const ModalEditarSessao: React.FC<ModalEditarSessaoProps> = ({
  isOpen,
  onClose,
  session,
}) => {
  const { notificarErro, notificarSucesso } = useNotificacoesContext()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UpdateSessaoData>({
    resolver: zodResolver(UpdateSessaoSchema),
    defaultValues: {
      ...session,
    },
  })

  const mutation = useEditarSessao({
    success: () => {
      notificarSucesso(
        'Sessão agendada com sucesso!',
        'A nova sessão foi agendada.',
        { duration: 3000 },
      )
      reset()
      onClose()
    },
    error: () => {
      notificarErro(
        'Erro ao agendar sessão',
        'Não foi possível agendar a sessão. tente novamente.',
        { duration: 5000 },
      )
    },
  })

  const submitForm = (data: UpdateSessaoData) => {
    const [hours, minutes] = data.horario.split(':').map(Number)
    const sessionDate = new Date(data.data)
    sessionDate.setHours(hours, minutes, 0, 0)

    const formattedData: SessaoToEdit = {
      ...data,
      id: session?.id || 0,
      data: sessionDate.toISOString(),
    }

    console.log('Form Data:', formattedData)
    mutation.mutate(formattedData)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className='max-h-[90vh] w-[90vw] overflow-y-auto sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Editar Sessão</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(submitForm)}
          className='grid-col-2 grid items-baseline gap-4 py-4'
        >
          <div className='col-span-2 grid gap-2'>
            <label
              htmlFor='description'
              className='text-sm font-medium'
            >
              Descrição
            </label>
            <input
              id='description'
              className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
              placeholder='Descreva a sessão...'
              {...register('descricao')}
              required
            />
            {errors.descricao && (
              <ErrorField message={errors.descricao?.message} />
            )}
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Data</label>
            <Controller
              control={control}
              name='data'
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start truncate font-normal',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className='size-4' />
                      {field.value ? (
                        format(field.value, 'PPP', { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      disabled={{
                        before: new Date(),
                      }}
                      required
                      mode='single'
                      selected={new Date(field.value)}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(format(date, 'yyyy-MM-dd'))
                        }
                      }}
                      captionLayout='dropdown'
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.data && <ErrorField message={errors.data?.message} />}
          </div>

          <div className='grid gap-2'>
            <label
              htmlFor='time'
              className='text-sm font-medium'
            >
              Horário
            </label>
            <Input
              id='time'
              type='time'
              className='bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
              {...register('horario')}
              required
            />
            {errors.horario && <ErrorField message={errors.horario?.message} />}
          </div>

          <div className='grid gap-2'>
            <label
              htmlFor='duration'
              className='text-sm font-medium'
            >
              Duração
            </label>
            <select
              id='duration'
              className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
              {...register('duracao', { valueAsNumber: true })}
            >
              <option value='30'>30 min</option>
              <option value='45'>45 min</option>
              <option value='60'>60 min</option>
              <option value='90'>90 min</option>
            </select>
          </div>
          <div className='grid gap-2'>
            <label
              htmlFor='type'
              className='text-sm font-medium'
            >
              Tipo de Sessão
            </label>
            <select
              id='type'
              className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
              {...register('tipoSessao')}
            >
              {Object.entries(TipoSessao).map(([value, label]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              ))}
            </select>
            {errors.tipoSessao && (
              <ErrorField message={errors.tipoSessao?.message} />
            )}
          </div>

          <div className='col-span-2 grid gap-2'>
            <label
              htmlFor='notes'
              className='text-sm font-medium'
            >
              Observações
            </label>
            <textarea
              id='notes'
              className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-20 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
              placeholder='Adicione observações sobre a sessão...'
              {...register('observacoes')}
            />
            {errors.observacoes && (
              <ErrorField message={errors.observacoes?.message} />
            )}
          </div>

          <DialogFooter className='col-span-2 flex-row justify-end gap-4'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              className='bg-green-500 hover:bg-green-600'
            >
              {mutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ModalEditarSessao
