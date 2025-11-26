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
  cadastrarCrianca,
  type CadastroCriancaFormData,
} from '../../api/protected/axiosCadastroCrianca'
import { useNotificacoesContext } from '../../api/barraNotificacao'

interface CadastrarCriancaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CadastrarCriancaDialog({
  open,
  onOpenChange,
  onSuccess,
}: CadastrarCriancaDialogProps) {
  const { notificarSucesso, notificarErro } = useNotificacoesContext()

  // Função para criar um estado inicial limpo do formulário
  const getInitialFormData = (): CadastroCriancaFormData => ({
    nomeCompleto: '',
    idade: 0,
    dataNascimento: '',
    genero: 'Masculino',
    diagnostico: '',
    diagnosticoOutro: '',
    nomeResponsavel: '',
    telefone: '',
    email: '',
    endereco: '',
    parentesco: 'PAI',
    observacoes: '',
  })

  const [formData, setFormData] =
    useState<CadastroCriancaFormData>(getInitialFormData())

  // Função para fechar o modal e limpar formulário
  const fecharModal = () => {
    setFormData(getInitialFormData())
    onOpenChange(false)
  }

  // Cadastrar nova criança
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Criar uma cópia profunda dos dados para evitar referências
      const dadosParaEnvio = {
        nomeCompleto: String(formData.nomeCompleto).trim(),
        idade: Number(formData.idade) || 0,
        dataNascimento: String(formData.dataNascimento).trim(),
        genero: formData.genero,
        diagnostico: String(formData.diagnostico).trim(),
        diagnosticoOutro: String(formData.diagnosticoOutro || '').trim(),
        nomeResponsavel: String(formData.nomeResponsavel).trim(),
        telefone: String(formData.telefone).trim(),
        email: String(formData.email || '').trim(),
        endereco: String(formData.endereco || '').trim(),
        parentesco: formData.parentesco,
        observacoes: String(formData.observacoes || '').trim(),
      }

      // Usar a função de cadastro com tipagem correta
      await cadastrarCrianca(dadosParaEnvio)

      // Limpar formulário e fechar modal
      setFormData(getInitialFormData())
      fecharModal()

      // Mostrar mensagem de sucesso
      notificarSucesso(
        'Cadastro realizado!',
        `Criança ${formData.nomeCompleto} foi cadastrada com sucesso!`,
        { duration: 5000 },
      )

      // Chamar callback de sucesso se fornecido
      onSuccess?.()
    } catch (error: unknown) {
      console.error('Erro ao cadastrar criança:', error)
      let errorMessage = 'Erro ao cadastrar criança.'
      // Type guard para AxiosError
      function isAxiosError(
        err: unknown,
      ): err is { response: { data: { message?: string } } } {
        if (typeof err !== 'object' || err === null) return false
        const maybeResponse = (err as Record<string, unknown>).response
        if (typeof maybeResponse !== 'object' || maybeResponse === null)
          return false
        const maybeData = (maybeResponse as Record<string, unknown>).data
        if (typeof maybeData !== 'object' || maybeData === null) return false
        return true
      }
      if (
        isAxiosError(error) &&
        'message' in error.response.data &&
        typeof error.response.data.message === 'string'
      ) {
        errorMessage = error.response.data.message
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message
      }
      notificarErro('Erro no cadastro', errorMessage, { duration: 6000 })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto p-0'>
        {/* Header do Modal */}
        <DialogHeader className='border-b bg-white p-6'>
          <DialogTitle className='text-2xl font-bold text-gray-900'>
            Nova Criança
          </DialogTitle>
          <DialogDescription className='mt-1 text-sm text-gray-600'>
            Cadastre uma nova criança no sistema
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className='p-6'
        >
          {/* Informações Básicas */}
          <div className='mb-8'>
            <h3 className='mb-6 text-lg font-semibold text-gray-900'>
              Informações Básicas
            </h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Nome Completo <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  required
                  value={formData.nomeCompleto}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nomeCompleto: e.target.value,
                    })
                  }
                  className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  placeholder='Digite o nome completo da criança'
                />
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Idade <span className='text-red-500'>*</span>
                </label>
                <input
                  type='number'
                  required
                  min='0'
                  max='18'
                  value={formData.idade}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      idade: parseInt(e.target.value) || 0,
                    })
                  }
                  className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  placeholder='Idade em anos'
                />
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Data de Nascimento <span className='text-red-500'>*</span>
                </label>
                <input
                  type='date'
                  required
                  value={formData.dataNascimento}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dataNascimento: e.target.value,
                    })
                  }
                  className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                />
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Gênero <span className='text-red-500'>*</span>
                </label>
                <select
                  required
                  value={formData.genero}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      genero: e.target.value as
                        | 'Masculino'
                        | 'Feminino'
                        | 'Outro'
                        | 'Prefiro não informar',
                    })
                  }
                  className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                >
                  <option value=''>Selecione o gênero</option>
                  <option value='Masculino'>Masculino</option>
                  <option value='Feminino'>Feminino</option>
                  <option value='Outro'>Outro</option>
                  <option value='Prefiro não informar'>
                    Prefiro não informar
                  </option>
                </select>
              </div>
            </div>

            <div className='mt-6'>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                Diagnóstico <span className='text-red-500'>*</span>
              </label>
              <select
                required
                value={formData.diagnostico}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    diagnostico: e.target.value,
                    diagnosticoOutro: '',
                  })
                }
                className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
              >
                <option value=''>Selecione o diagnóstico</option>
                <option value='TEA - Transtorno do Espectro Autista'>
                  TEA - Transtorno do Espectro Autista
                </option>
                <option value='TDAH - Transtorno do Déficit de Atenção com Hiperatividade'>
                  TDAH - Transtorno do Déficit de Atenção com Hiperatividade
                </option>
                <option value='Síndrome de Down'>Síndrome de Down</option>
                <option value='Deficiência Intelectual'>
                  Deficiência Intelectual
                </option>
                <option value='Paralisia Cerebral'>Paralisia Cerebral</option>
                <option value='Síndrome de Asperger'>
                  Síndrome de Asperger
                </option>
                <option value='Outro'>Outro</option>
              </select>
            </div>

            {/* Campo condicional para diagnóstico customizado */}
            {formData.diagnostico === 'Outro' && (
              <div className='mt-6'>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Especifique o diagnóstico{' '}
                  <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  required
                  value={formData.diagnosticoOutro}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      diagnosticoOutro: e.target.value,
                    })
                  }
                  className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  placeholder='Digite o diagnóstico específico'
                />
              </div>
            )}
          </div>

          {/* Informações do Responsável */}
          <div className='mb-8'>
            <h3 className='mb-6 text-lg font-semibold text-gray-900'>
              Informações do Responsável
            </h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='md:col-span-2'>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Nome do Responsável <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  required
                  value={formData.nomeResponsavel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nomeResponsavel: e.target.value,
                    })
                  }
                  className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  placeholder='Nome completo do responsável'
                />
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Telefone <span className='text-red-500'>*</span>
                </label>
                <input
                  type='tel'
                  required
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: e.target.value })
                  }
                  className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  placeholder='(11) 99999-9999'
                />
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Parentesco <span className='text-red-500'>*</span>
                </label>
                <select
                  required
                  value={formData.parentesco}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parentesco: e.target.value as
                        | 'PAI'
                        | 'MAE'
                        | 'AVO'
                        | 'AVOA'
                        | 'TIO'
                        | 'TIA'
                        | 'TUTOR'
                        | 'OUTRO',
                    })
                  }
                  className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                >
                  <option value='PAI'>Pai</option>
                  <option value='MAE'>Mãe</option>
                  <option value='AVO'>Avô</option>
                  <option value='AVOA'>Avó</option>
                  <option value='TIO'>Tio</option>
                  <option value='TIA'>Tia</option>
                  <option value='TUTOR'>Tutor/Responsável Legal</option>
                  <option value='OUTRO'>Outro</option>
                </select>
              </div>

              <div className='md:col-span-2'>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  E-mail
                </label>
                <input
                  type='email'
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  placeholder='email@exemplo.com'
                />
              </div>

              <div className='md:col-span-2'>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Endereço
                </label>
                <input
                  type='text'
                  value={formData.endereco}
                  onChange={(e) =>
                    setFormData({ ...formData, endereco: e.target.value })
                  }
                  className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  placeholder='Endereço completo'
                />
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className='mb-8'>
            <h3 className='mb-6 text-lg font-semibold text-gray-900'>
              Informações Adicionais
            </h3>
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                Observações
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    observacoes: e.target.value,
                  })
                }
                className='w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                rows={4}
                placeholder='Informações adicionais sobre a criança, necessidades especiais, medicamentos, etc.'
              />
            </div>
          </div>

          {/* Botões */}
          <div className='flex gap-4 border-t border-gray-200 pt-6'>
            <Button
              type='button'
              onClick={fecharModal}
              variant='outline'
              className='flex-1'
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              className='flex-1 bg-green-600 hover:bg-green-700'
            >
              Cadastrar Criança
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
