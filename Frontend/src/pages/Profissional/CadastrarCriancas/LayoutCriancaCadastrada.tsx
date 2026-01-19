import React, { useState } from 'react'
import { QrCode } from 'lucide-react'
import type { CriancaListagem } from '../../../api/protected/axiosCadastroCrianca'
import { useConfirmacao } from '../../../hooks/useConfirmacao'
import BarraConfirmacao from '../../../components/features/ModalConfirmacao'
import ModalVerDetalhesCriancaCadastrada from './ModalVerDetalhesCriancaCadastrada'
import { StatusVinculoProfissionalCrianca } from '~/features/Criancas/types'
import { Badge } from '~/components/ui/badge'
import { cn } from '~/lib/utils'

// Interface para o profissional
interface ProfissionalInfo {
  nome: string
  email: string
}

// Props do componente
interface LayoutCriancaCadastradaProps {
  crianca: CriancaListagem
  profissional: ProfissionalInfo
  onVerDetalhes?: (criancaId: number) => void
  onEditar?: (criancaId: number) => void
  onExcluir?: (criancaId: number) => void
  onVisualizarCodigo?: (criancaId: number) => void
}

const LayoutCriancaCadastrada: React.FC<LayoutCriancaCadastradaProps> = ({
  crianca,
  profissional,
  onVerDetalhes,
  onEditar,
  onExcluir,
  onVisualizarCodigo,
}) => {
  const [showModal, setShowModal] = useState(false)
  const { confirmacao, mostrarConfirmacao } = useConfirmacao()

  // Função para obter a última sessão (mock - pode ser substituída por dados reais)
  const getUltimaSessao = () => {
    return '09/01/2024' // Mock - substituir por dados reais da API
  }

  const handleVerDetalhes = () => {
    if (onVerDetalhes) {
      onVerDetalhes(crianca.id)
    } else {
      setShowModal(true)
    }
  }

  const handleExcluir = () => {
    mostrarConfirmacao(
      {
        titulo: 'Confirmar Exclusão',
        mensagem: `Tem certeza que deseja excluir o cadastro de "${crianca.nome}"?\n\nEsta ação não pode ser desfeita.`,
        textoBotaoConfirmar: 'Excluir',
        textoBotaoCancelar: 'Cancelar',
        tipoConfirmacao: 'danger',
      },
      () => {
        onExcluir?.(crianca.id)
      },
    )
  }

  return (
    <div className='@container rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
      <div className='grid grid-cols-1 gap-x-4 gap-y-6'>
        {/* Nome da criança */}
        <div className='flex items-center gap-2'>
          <h3 className='text-lg font-semibold text-gray-900'>
            {crianca.nome}
          </h3>
          <Badge
            className={cn(
              crianca.status_vinculo_profissional === 'VINCULADO'
                ? 'border-green-200 bg-green-100 text-green-800 hover:bg-green-200/80'
                : '',
              crianca.status_vinculo_profissional === 'AGUARDANDO'
                ? 'border-gray-200 bg-gray-100 text-gray-800 hover:bg-gray-200/80'
                : '',
              crianca.status_vinculo_profissional === 'DESVINCULADO'
                ? 'border-red-200 bg-red-100 text-red-800 hover:bg-red-200/80'
                : '',
              crianca.status_vinculo_profissional === 'SUSPENSO'
                ? 'border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-200/80'
                : '',
            )}
          >
            {
              StatusVinculoProfissionalCrianca[
                crianca.status_vinculo_profissional
              ]
            }
          </Badge>
        </div>
        <div className='flex flex-col items-start justify-between gap-4 @lg:col-span-2 @lg:col-end-2 @lg:flex-row'>
          {/* Idade */}
          <p className='text-sm text-gray-600'>
            <span className='font-medium'>Idade:</span> {crianca.idade} anos
          </p>
          {/* Diagnóstico */}
          <div>
            <p className='text-sm text-gray-600'>
              <span className='font-medium'>Diagnóstico:</span>{' '}
              {crianca.diagnostico}
            </p>
          </div>
          {/* Responsável */}
          <div>
            <p className='text-sm text-gray-600'>
              <span className='font-medium'>Responsável:</span>{' '}
              {crianca.responsavel.nome}
            </p>
            <p className='text-sm text-gray-600'>
              <span className='font-medium'>Profissional:</span>{' '}
              {profissional.nome}
            </p>
          </div>
          {/* Última sessão */}
          <div>
            <p className='text-sm text-gray-600'>
              <span className='font-medium'>Última sessão:</span>{' '}
              {getUltimaSessao()}
            </p>
          </div>
        </div>
        {/* Botões de ação */}
        <div className='flex flex-col justify-end gap-2 @lg:col-start-1 @lg:row-end-1 @lg:flex-row @lg:flex-wrap'>
          {/* Botão para visualizar código de vínculo (quando ainda aguardando) */}
          {crianca.status_vinculo_responsavel === 'AGUARDANDO_VINCULO' && (
            <button
              onClick={() => onVisualizarCodigo?.(crianca.id)}
              className='flex items-center justify-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-center text-sm text-blue-600 transition-colors hover:bg-blue-50'
              title='Visualizar código de vínculo'
            >
              <QrCode className='h-4 w-4' />
              <span>Código</span>
            </button>
          )}
          <button
            onClick={handleVerDetalhes}
            className='rounded-lg border border-green-600 px-4 py-2 text-sm text-green-600 transition-colors hover:bg-green-50'
          >
            Ver Detalhes
          </button>
          <button
            onClick={() => onEditar?.(crianca.id)}
            className='rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50'
          >
            Editar
          </button>
          <button
            onClick={handleExcluir}
            className='rounded-lg border border-red-600 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50'
          >
            Excluir
          </button>
        </div>
      </div>

      {/* Modal de Detalhes */}
      <ModalVerDetalhesCriancaCadastrada
        crianca={crianca}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onEdit={(id) => {
          setShowModal(false)
          onEditar?.(id)
        }}
      />

      {/* Barra de Confirmação */}
      <BarraConfirmacao
        isOpen={confirmacao.isOpen}
        titulo={confirmacao.titulo}
        mensagem={confirmacao.mensagem}
        textoBotaoConfirmar={confirmacao.textoBotaoConfirmar}
        textoBotaoCancelar={confirmacao.textoBotaoCancelar}
        tipoConfirmacao={confirmacao.tipoConfirmacao}
        onConfirmar={confirmacao.onConfirmar}
        onCancelar={confirmacao.onCancelar}
        position='top-center'
      />
    </div>
  )
}

export default LayoutCriancaCadastrada
