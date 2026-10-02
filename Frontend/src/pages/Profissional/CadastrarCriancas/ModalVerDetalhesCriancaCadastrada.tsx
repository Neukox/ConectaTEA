import type { CriancaListagem } from '../../../api/protected/axiosCadastroCrianca';

interface ModalVerDetalhesCriancaCadastradaProps {
  crianca: CriancaListagem;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (criancaId: number) => void;
}

export default function ModalVerDetalhesCriancaCadastrada({
  crianca,
  isOpen,
  onClose,
  onEdit
}: ModalVerDetalhesCriancaCadastradaProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header do Modal */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Detalhes da Criança</h2>
            <p className="text-gray-600 text-sm mt-1">Informações completas do cadastro</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          
          {/* Card Header com Avatar */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{crianca.nome}</h3>
                <p className="text-green-100">{crianca.idade} anos • ID #{crianca.id}</p>
              </div>
            </div>
          </div>

          {/* Informações da Criança */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Informações da Criança
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Nome:</span>
                <span className="text-gray-900">{crianca.nome}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Idade:</span>
                <span className="text-gray-900">{crianca.idade} anos</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Data de Nascimento:</span>
                <span className="text-gray-900">
                  {crianca.dataNascimento ? new Date(crianca.dataNascimento).toLocaleDateString('pt-BR') : 'Não informado'}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Gênero:</span>
                <span className="text-gray-900">{crianca.genero || 'Não informado'}</span>
              </div>
              
              <div className="flex justify-between items-start py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Diagnóstico:</span>
                <span className="text-gray-900 text-right ml-4">{crianca.diagnostico}</span>
              </div>
            </div>
          </div>

          {/* Informações do Responsável */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Responsável
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Nome:</span>
                <span className="text-gray-900">Não fornecido por este endpoint</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Parentesco:</span>
                <span className="text-gray-900">
                  Não fornecido por este endpoint
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Telefone:</span>
                <span className="text-gray-900">Não fornecido por este endpoint</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">E-mail:</span>
                <span className="text-gray-900">Não fornecido por este endpoint</span>
              </div>

              <div className="flex justify-between items-start py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Endereço:</span>
                <span className="text-gray-900 text-right ml-4">Não fornecido por este endpoint</span>
              </div>
            </div>
          </div>

          {/* Observações */}
          {crianca.observacoes && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Observações
              </h4>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 leading-relaxed">{crianca.observacoes}</p>
              </div>
            </div>
          )}

          {/* Status/Badges */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Status</h4>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Ativo
              </span>
              
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cadastro Completo
              </span>
            </div>
          </div>
        </div>

        {/* Footer com Ações */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={() => {
              onEdit(crianca.id);
              onClose();
            }}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
          
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
