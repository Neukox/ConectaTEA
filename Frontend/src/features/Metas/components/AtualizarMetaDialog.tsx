import { useMutation } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { atualizarMeta } from '../../../api/protected/axiosMetas'
import { useNotificacoesContext } from '../../../api/barraNotificacao'
import { useForm } from 'react-hook-form'
import {
  UpdateMetaSchema,
  type UpdateMetaData,
} from '../schemas/update-meta.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { CategoriaMeta, PrioridadeMeta } from '../types'

interface AtualizarMetaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  metaToEdit?: UpdateMetaData & { id: number }
}

export function AtualizarMetaDialog({
  open,
  onOpenChange,
  onSuccess,
  metaToEdit,
}: AtualizarMetaDialogProps) {
  const { notificarSucesso, notificarErro } = useNotificacoesContext()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateMetaData>({
    resolver: zodResolver(UpdateMetaSchema),
    defaultValues: metaToEdit,
  })

  const mutation = useMutation({
    mutationFn: async (data: UpdateMetaData) => {
      atualizarMeta(metaToEdit?.id as number, data)
    },
    onSuccess: (_, variables) => {
      notificarSucesso(
        'Meta atualizada!',
        `A meta "${variables.titulo}" foi atualizada com sucesso.`,
        { duration: 5000 },
      )
      reset()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      console.error('Erro ao salvar meta:', error)
      notificarErro(
        'Erro ao salvar',
        'Não foi possível salvar as alterações da meta.',
        { duration: 5000 },
      )
    },
  })

  const fecharModal = () => {
    reset()
    onOpenChange(false)
  }

  const submitForm = (data: UpdateMetaData) => {
    mutation.mutate(data)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto p-0'>
        <DialogHeader className='border-b bg-white p-6'>
          <DialogTitle className='text-2xl font-bold text-gray-900'>
            {metaToEdit ? 'Editar Meta Terapêutica' : 'Nova Meta Terapêutica'}
          </DialogTitle>
          <DialogDescription className='mt-1 text-sm text-gray-600'>
            {metaToEdit
              ? 'Atualize as informações da meta'
              : 'Defina uma nova meta para acompanhamento'}
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
                {...register('titulo')}
                className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none'
                placeholder='Ex: Melhorar comunicação verbal'
              />
              {errors.titulo && (
                <p className='mt-1 text-sm text-red-600'>
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
                  {...register('categoria')}
                  className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none'
                >
                  <option value=''>Selecione...</option>
                  {Object.entries(CategoriaMeta).map(([key, value]) => (
                    <option
                      key={key}
                      value={key}
                    >
                      {value}
                    </option>
                  ))}
                </select>
                {errors.categoria && (
                  <p className='mt-1 text-sm text-red-600'>
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
                  {...register('prioridade')}
                  className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none'
                >
                  {Object.entries(PrioridadeMeta).map(([key, value]) => (
                    <option
                      key={key}
                      value={key}
                    >
                      {value}
                    </option>
                  ))}
                </select>
                {errors.prioridade && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.prioridade.message}
                  </p>
                )}
              </div>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {/* Data Início */}
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Data Início <span className='text-red-500'>*</span>
                </label>
                <input
                  type='date'
                  {...register('dataInicio')}
                  className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none'
                />
                {errors.dataInicio && (
                  <p className='mt-1 text-sm text-red-600'>
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
                  {...register('dataFim')}
                  className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none'
                />
                {errors.dataFim && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.dataFim.message}
                  </p>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                Descrição Detalhada <span className='text-red-500'>*</span>
              </label>
              <textarea
                {...register('descricao')}
                className='w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none'
                rows={4}
                placeholder='Descreva os objetivos específicos e estratégias...'
              />
              {errors.descricao && (
                <p className='mt-1 text-sm text-red-600'>
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
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              className='flex-1 bg-green-600 hover:bg-green-700'
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
