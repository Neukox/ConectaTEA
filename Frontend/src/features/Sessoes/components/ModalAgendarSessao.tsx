import React, { useState } from 'react'
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

interface ModalAgendarSessaoProps {
  isOpen: boolean
  onClose: () => void
  onSchedule: (data: any) => void
}

const ModalAgendarSessao: React.FC<ModalAgendarSessaoProps> = ({
  isOpen,
  onClose,
  onSchedule,
}) => {
  const [date, setDate] = useState<Date>(new Date())
  const [formData, setFormData] = useState({
    childId: '',
    time: '',
    duration: '60min',
    type: 'Terapia Individual',
    notes: '',
  })

  // Mock data for children
  const children = [
    { id: '1', name: 'Ana Silva' },
    { id: '2', name: 'Pedro Costa' },
    { id: '3', name: 'Sofia Oliveira' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSchedule({ ...formData, date })
    onClose()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Agendar Nova Sessão</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className='grid gap-4 py-4'
        >
          <div className='grid gap-2'>
            <label
              htmlFor='child'
              className='text-sm font-medium'
            >
              Criança
            </label>
            <select
              id='child'
              className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
              value={formData.childId}
              onChange={(e) =>
                setFormData({ ...formData, childId: e.target.value })
              }
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
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <label className='text-sm font-medium'>Data</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {date ? (
                      format(date, 'PPP', { locale: ptBR })
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
                    selected={date}
                    onSelect={setDate}
                    captionLayout='dropdown'
                  />
                </PopoverContent>
              </Popover>
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
                value={formData.time}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, time: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
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
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
              >
                <option value='30min'>30 min</option>
                <option value='45min'>45 min</option>
                <option value='60min'>60 min</option>
                <option value='90min'>90 min</option>
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
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value='Terapia Individual'>Terapia Individual</option>
                <option value='Avaliação'>Avaliação</option>
                <option value='Fonoaudiologia'>Fonoaudiologia</option>
                <option value='Terapia Ocupacional'>Terapia Ocupacional</option>
              </select>
            </div>
          </div>

          <div className='grid gap-2'>
            <label
              htmlFor='notes'
              className='text-sm font-medium'
            >
              Observações
            </label>
            <textarea
              id='notes'
              className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
              placeholder='Adicione observações sobre a sessão...'
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          <DialogFooter>
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
              Agendar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ModalAgendarSessao
