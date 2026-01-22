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
import { useForm, Controller } from 'react-hook-form'
import {
  CreateSessaoSchema,
  type CreateSessaoData,
} from '../schemas/create-sessao.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import ErrorField from '~/components/common/ErrorField'
import { TipoSessao } from '../types'
import useAgendarSessao from '../hooks/useAgendarSessao'
import { useNotificacoesContext } from '~/api/barraNotificacao'

interface ModalAgendarSessaoProps {
  isOpen: boolean
  onClose: () => void
}

const ModalAgendarSessao: React.FC<ModalAgendarSessaoProps> = ({
  isOpen,
  onClose,
}) => {
  const { notificarErro, notificarSucesso } = useNotificacoesContext()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateSessaoData>({
    resolver: zodResolver(CreateSessaoSchema),
    defaultValues: {
      tipoSessao: 'TERAPIA_INDIVIDUAL',
      data: format(new Date().setDate(new Date().getDate() + 1), 'yyyy-MM-dd'),
      duracao: 30,
    },
  })

  const mutation = useAgendarSessao({
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

  // Mock data for children
  const children = [
    { id: '1', name: 'Ana Silva' },
    { id: '2', name: 'Pedro Costa' },
    { id: '3', name: 'Sofia Oliveira' },
  ]

  const submitForm = (data: CreateSessaoData) => {
    const [hours, minutes] = data.horario.split(':').map(Number)
    const sessionDate = new Date(data.data)
    sessionDate.setHours(hours, minutes, 0, 0)

    const formattedData = {
      ...data,
      data: sessionDate,
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
          <DialogTitle>Agendar Nova Sessão</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(submitForm)}
          className='grid grid-cols-2 gap-4'
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
          <div className='col-span-2 grid gap-2'>
            <label
              htmlFor='child'
              className='text-sm font-medium'
            >
              Criança
            </label>
            <select
              id='child'
              className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
              {...register('criancaId', { valueAsNumber: true })}
              required
            >
              <option value=''>Selecione uma criança</option>
              {children.map((child) => (
                <option
                  key={child.id}
                  value={child.id}
                >
                  {child.name}
                </option>
              ))}
            </select>
            {errors.criancaId && (
              <ErrorField message={errors.criancaId?.message} />
            )}
          </div>

          <div className='grid gap-2'>
            <label
              htmlFor='data'
              className='text-sm font-medium'
            >
              Data
            </label>
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
            {errors.duracao && <ErrorField message={errors.duracao?.message} />}
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
              {Object.entries(TipoSessao).map(([key, label]) => (
                <option
                  key={key}
                  value={key}
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
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              className='bg-green-500 hover:bg-green-600'
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Agendando...' : 'Agendar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ModalAgendarSessao
