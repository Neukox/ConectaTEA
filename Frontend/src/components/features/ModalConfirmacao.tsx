import React from 'react';
import { createPortal } from 'react-dom';

interface BarraConfirmacaoProps {
  isOpen: boolean;
  titulo: string;
  mensagem: string;
  textoBotaoConfirmar?: string;
  textoBotaoCancelar?: string;
  tipoConfirmacao?: 'danger' | 'warning' | 'info';
  onConfirmar: () => void;
  onCancelar: () => void;
  position?: 'top-right' | 'top-center' | 'bottom-center';
}

const BarraConfirmacao: React.FC<BarraConfirmacaoProps> = ({
  isOpen,
  titulo,
  mensagem,
  textoBotaoConfirmar = 'Confirmar',
  textoBotaoCancelar = 'Cancelar',
  tipoConfirmacao = 'danger',
  onConfirmar,
  onCancelar,
  position = 'top-center'
}) => {
  if (!isOpen) return null;

  // Configurações visuais por tipo
  const getTipoConfig = (tipo: string) => {
    switch (tipo) {
      case 'danger':
        return {
          bgColor: 'bg-red-50 border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
          botaoConfirmar: 'bg-red-600 hover:bg-red-700 text-white',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50 border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700',
          botaoConfirmar: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50 border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700',
          botaoConfirmar: 'bg-blue-600 hover:bg-blue-700 text-white',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )
        };
      default:
        return getTipoConfig('danger');
    }
  };

  // Configurações de posição
  const getPositionClasses = (pos: string) => {
    switch (pos) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      default:
        return 'top-4 left-1/2 -translate-x-1/2';
    }
  };

  const config = getTipoConfig(tipoConfirmacao);

  return createPortal(
    <div 
      className={`fixed z-[9999] ${getPositionClasses(position)} animate-slide-in-top`}
      style={{ 
        maxWidth: '500px',
        minWidth: '400px'
      }}
    >
      <div className={`
        ${config.bgColor} border rounded-lg shadow-xl p-4 backdrop-blur-sm
      `}>
        <div className="flex items-start gap-3">
          {/* Ícone */}
          <div className={`flex-shrink-0 ${config.iconColor} mt-0.5`}>
            {config.icon}
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
              {titulo}
            </h3>
            <p className={`text-sm ${config.messageColor} whitespace-pre-line`}>
              {mensagem}
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-2 ml-2">
            <button
              onClick={onCancelar}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              {textoBotaoCancelar}
            </button>
            <button
              onClick={onConfirmar}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${config.botaoConfirmar}`}
            >
              {textoBotaoConfirmar}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BarraConfirmacao;
