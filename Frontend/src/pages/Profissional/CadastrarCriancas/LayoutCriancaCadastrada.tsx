import React, { useState } from 'react'
import { QrCode } from 'lucide-react'
import type { CriancaListagem } from '../../../api/protected/axiosCadastroCrianca'
import { useConfirmacao } from '../../../hooks/useConfirmacao'
import BarraConfirmacao from '../../../components/features/ModalConfirmacao'
import ModalVerDetalhesCriancaCadastrada from './ModalVerDetalhesCriancaCadastrada'

// Props do componente
interface LayoutCriancaCadastradaProps {
  crianca: CriancaListagem
  onVerDetalhes?: (criancaId: number) => void
  onEditar?: (criancaId: number) => void
  onExcluir?: (criancaId: number) => void
  onVisualizarCodigo?: (criancaId: number) => void
}

const LayoutCriancaCadastrada: React.FC<LayoutCriancaCadastradaProps> = ({
  crianca,
  onVerDetalhes,
  onEditar,
  onExcluir,
  onVisualizarCodigo,
}) => {
  const [showModal, setShowModal] = useState(false)
  const { confirmacao, mostrarConfirmacao } = useConfirmacao()

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
        </div>
        {/* Botões de ação */}
        <div className='flex flex-col justify-end gap-2 @lg:col-start-1 @lg:row-end-1 @lg:flex-row @lg:flex-wrap'>
          <button
            onClick={() => onVisualizarCodigo?.(crianca.id)}
            className='flex items-center justify-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-center text-sm text-blue-600 transition-colors hover:bg-blue-50'
            title='Gerar novo código de vínculo'
          >
            <QrCode className='h-4 w-4' />
            <span>Gerar código</span>
          </button>
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
