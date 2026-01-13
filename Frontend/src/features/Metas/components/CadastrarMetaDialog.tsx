import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { cadastrarMeta } from '../../../api/protected/axiosMetas'
import { useNotificacoesContext } from '../../../api/barraNotificacao'
import { useForm } from 'react-hook-form'
import {
  CreateMetaSchema,
  type CreateMetaData,
} from '../schemas/create-meta.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { CategoriaMeta, PrioridadeMeta } from '../types'
import { useMutation } from '@tanstack/react-query'
import { QUERY_KEYS, queryClient } from '~/api/query-client'

interface CadastrarMetaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

// Mock data for children - in a real app this would come from an API
const criancasMock = [
  { id: 1, nome: 'Ana Silva' },
  { id: 2, nome: 'João Pedro' },
  { id: 3, nome: 'Sofia Costa' },
  { id: 4, nome: 'Lucas Ferreira' },
]

export function CadastrarMetaDialog({
  open,
  onOpenChange,
  onSuccess,
}: CadastrarMetaDialogProps) {
  const { notificarSucesso, notificarErro } = useNotificacoesContext()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateMetaData>({
    resolver: zodResolver(CreateMetaSchema),
    defaultValues: {
      prioridade: PrioridadeMeta.MEDIA,
    },
  })

  const mutation = useMutation({
    mutationFn: cadastrarMeta,
    onSuccess: () => {
      notificarSucesso('Meta cadastrada!', 'A meta foi criada com sucesso.', {
        duration: 5000,
      })
      fecharModal()
      onSuccess?.()

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.METAS] })
    },
    onError: () => {
      notificarErro(
        'Erro ao salvar',
        'Não foi possível salvar as alterações da meta.',
        {
          duration: 5000,
        },
      )
    },
  })

  const fecharModal = () => {
    reset()
    onOpenChange(false)
  }

  const submitForm = async (data: CreateMetaData) => {
    mutation.mutate(data)
  }

  const loading = mutation.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto p-0'>
        <DialogHeader className='border-b bg-white p-6'>
          <DialogTitle className='text-2xl font-bold text-gray-900'>
            Nova Meta Terapêutica
          </DialogTitle>
          <DialogDescription className='mt-1 text-sm text-gray-600'>
            Defina uma nova meta para acompanhamento
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(submitForm)}
          className='p-6'
        >
          <div className='grid grid-cols-1 gap-6'>
            {/* Título */}
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                Título da Meta <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                required
                {...register('titulo')}
                className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none'
                placeholder='Ex: Melhorar comunicação verbal'
              />
              {errors.titulo && (
                <p className='mt-1 text-sm text-red-500'>
                  {errors.titulo.message}
                </p>
              )}
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {/* Categoria */}
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Categoria <span className='text-red-500'>*</span>
                </label>
                <select
                  required
                  {...register('categoria')}
                  className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none'
                >
                  {Object.entries(CategoriaMeta).map(([key, value]) => (
                    <option
                      key={key}
                      value={value}
                    >
                      {value}
                    </option>
                  ))}
                </select>
                {errors.categoria && (
                  <p className='mt-1 text-sm text-red-500'>
                    {errors.categoria.message}
                  </p>
                )}
              </div>

              {/* Prioridade */}
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Prioridade <span className='text-red-500'>*</span>
                </label>
                <select
                  required
                  {...register('prioridade')}
                  className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none'
                >
                  {Object.entries(PrioridadeMeta).map(([key, value]) => (
                    <option
                      key={key}
                      value={value}
                    >
                      {value}
                    </option>
                  ))}
                </select>
                {errors.prioridade && (
                  <p className='mt-1 text-sm text-red-500'>
                    {errors.prioridade.message}
                  </p>
                )}
              </div>
            </div>

            {/* Criança */}
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                Criança <span className='text-red-500'>*</span>
              </label>
              <select
                required
                {...register('criancaId', { valueAsNumber: true })}
                className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none'
              >
                <option value={0}>Selecione a criança...</option>
                {criancasMock.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                  >
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {/* Data Início */}
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Data Início <span className='text-red-500'>*</span>
                </label>
                <input
                  type='date'
                  required
                  {...register('dataInicio')}
                  className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none'
                />
                {errors.dataInicio && (
                  <p className='mt-1 text-sm text-red-500'>
                    {errors.dataInicio.message}
                  </p>
                )}
              </div>

              {/* Data Fim */}
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Data Fim <span className='text-red-500'>*</span>
                </label>
                <input
                  type='date'
                  required
                  {...register('dataFim')}
                  className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none'
                />
                {errors.dataFim && (
                  <p className='mt-1 text-sm text-red-500'>
                    {errors.dataFim.message}
                  </p>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                Descrição Detalhada
              </label>
              <textarea
                {...register('descricao')}
                className='w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none'
                rows={4}
                placeholder='Descreva os objetivos específicos e estratégias...'
              />
              {errors.descricao && (
                <p className='mt-1 text-sm text-red-500'>
                  {errors.descricao.message}
                </p>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className='mt-8 flex gap-4 border-t border-gray-200 pt-6'>
            <Button
              type='button'
              onClick={fecharModal}
              variant='outline'
              className='flex-1'
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              className='flex-1 bg-green-600 hover:bg-green-700'
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Meta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
