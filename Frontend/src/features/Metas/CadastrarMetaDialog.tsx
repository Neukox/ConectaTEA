import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import {
  cadastrarMeta,
  type CadastroMetaData,
} from '../../api/protected/axiosMetas'
import { useNotificacoesContext } from '../../api/barraNotificacao'

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

  const getInitialFormData = (): CadastroMetaData => ({
    titulo: '',
    categoria: '',
    prioridade: 'media',
    criancaId: 0,
    dataInicio: '',
    dataFim: '',
    descricao: '',
  })

  const [formData, setFormData] =
    useState<CadastroMetaData>(getInitialFormData())
  const [loading, setLoading] = useState(false)

  const fecharModal = () => {
    setFormData(getInitialFormData())
    onOpenChange(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await cadastrarMeta(formData)

      setFormData(getInitialFormData())
      fecharModal()

      notificarSucesso(
        'Meta cadastrada!',
        `A meta "${formData.titulo}" foi criada com sucesso.`,
        { duration: 5000 },
      )

      onSuccess?.()
    } catch (error) {
      console.error('Erro ao cadastrar meta:', error)
      notificarErro('Erro no cadastro', 'Não foi possível cadastrar a meta.', {
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

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
          onSubmit={handleSubmit}
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
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
                className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none'
                placeholder='Ex: Melhorar comunicação verbal'
              />
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {/* Categoria */}
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Categoria <span className='text-red-500'>*</span>
                </label>
                <select
                  required
                  value={formData.categoria}
                  onChange={(e) =>
                    setFormData({ ...formData, categoria: e.target.value })
                  }
                  className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none'
                >
                  <option value=''>Selecione...</option>
                  <option value='Comunicação'>Comunicação</option>
                  <option value='Social'>Social</option>
                  <option value='Comportamental'>Comportamental</option>
                  <option value='Cognitiva'>Cognitiva</option>
                  <option value='Autonomia'>Autonomia</option>
                  <option value='Motora'>Motora</option>
                </select>
              </div>

              {/* Prioridade */}
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Prioridade <span className='text-red-500'>*</span>
                </label>
                <select
                  required
                  value={formData.prioridade}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      prioridade: e.target.value as 'alta' | 'media' | 'baixa',
                    })
                  }
                  className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none'
                >
                  <option value='alta'>Alta</option>
                  <option value='media'>Média</option>
                  <option value='baixa'>Baixa</option>
                </select>
              </div>
            </div>

            {/* Criança */}
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                Criança <span className='text-red-500'>*</span>
              </label>
              <select
                required
                value={formData.criancaId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    criancaId: Number(e.target.value),
                  })
                }
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
                  value={formData.dataInicio}
                  onChange={(e) =>
                    setFormData({ ...formData, dataInicio: e.target.value })
                  }
                  className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none'
                />
              </div>

              {/* Data Fim */}
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Data Fim <span className='text-red-500'>*</span>
                </label>
                <input
                  type='date'
                  required
                  value={formData.dataFim}
                  onChange={(e) =>
                    setFormData({ ...formData, dataFim: e.target.value })
                  }
                  className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none'
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                Descrição Detalhada
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                className='w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none'
                rows={4}
                placeholder='Descreva os objetivos específicos e estratégias...'
              />
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
              {loading ? 'Cadastrando...' : 'Criar Meta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
