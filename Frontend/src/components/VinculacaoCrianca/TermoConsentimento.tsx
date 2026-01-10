import { useState } from 'react'
import { AlertCircle, CheckCircle, Loader } from 'lucide-react'

interface TermoConsentimentoProps {
  onAceitar: () => void
  onRecusar: () => void
  loading: boolean
  consentimentoAceito: boolean
  onConsentimentoChange: (aceito: boolean) => void
}

export default function TermoConsentimento({
  onAceitar,
  onRecusar,
  loading,
  consentimentoAceito,
  onConsentimentoChange
}: TermoConsentimentoProps) {
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({
    coleta: false,
    uso: false,
    compartilhamento: false,
    direitos: false,
    seguranca: false
  })

  const toggleExpand = (key: string) => {
    setExpandidos(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900 mb-1">Atenção!</h3>
          <p className="text-red-800 text-sm">
            Este termo de consentimento é obrigatório conforme a Lei Geral de Proteção de Dados (LGPD).
            Você está autorizando o armazenamento e compartilhamento de dados sensíveis da criança.
          </p>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-6 bg-white">
        {/* Seção 1: Coleta de Dados */}
        <div className="border-b border-gray-200 pb-3 last:border-b-0">
          <button
            onClick={() => toggleExpand('coleta')}
            className="w-full flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded transition"
          >
            <span className="font-semibold text-gray-800">1. Coleta de Dados</span>
            <span className="text-gray-600">{expandidos.coleta ? '▼' : '▶'}</span>
          </button>
          {expandidos.coleta && (
            <div className="mt-3 text-sm text-gray-700 space-y-2 px-2">
              <p>
                O ConectaTEA coleta as seguintes informações sobre a criança:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Dados pessoais (nome, data de nascimento, gênero)</li>
                <li>Informações de diagnóstico e saúde</li>
                <li>Registros de progresso e desempenho</li>
                <li>Anotações clínicas e observações do profissional</li>
                <li>Histórico de sessões e atendimentos</li>
              </ul>
            </div>
          )}
        </div>

        {/* Seção 2: Uso dos Dados */}
        <div className="border-b border-gray-200 pb-3">
          <button
            onClick={() => toggleExpand('uso')}
            className="w-full flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded transition"
          >
            <span className="font-semibold text-gray-800">2. Uso dos Dados</span>
            <span className="text-gray-600">{expandidos.uso ? '▼' : '▶'}</span>
          </button>
          {expandidos.uso && (
            <div className="mt-3 text-sm text-gray-700 space-y-2 px-2">
              <p>
                Os dados serão utilizados para:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Gerenciar o acompanhamento clínico da criança</li>
                <li>Facilitar comunicação entre responsável e profissional</li>
                <li>Acompanhar progresso e metas estabelecidas</li>
                <li>Melhorar a qualidade dos serviços</li>
                <li>Conformidade legal e segurança da plataforma</li>
              </ul>
            </div>
          )}
        </div>

        {/* Seção 3: Compartilhamento de Dados */}
        <div className="border-b border-gray-200 pb-3">
          <button
            onClick={() => toggleExpand('compartilhamento')}
            className="w-full flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded transition"
          >
            <span className="font-semibold text-gray-800">3. Compartilhamento de Dados</span>
            <span className="text-gray-600">{expandidos.compartilhamento ? '▼' : '▶'}</span>
          </button>
          {expandidos.compartilhamento && (
            <div className="mt-3 text-sm text-gray-700 space-y-2 px-2">
              <p>
                Os dados da criança serão compartilhados com:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>O profissional designado para o acompanhamento</li>
                <li>Outros profissionais autorizados pelo responsável</li>
                <li>Servidores de backup para garantir segurança</li>
              </ul>
              <p className="text-red-700 font-semibold mt-3">
                ⚠️ Os dados NÃO serão compartilhados com terceiros sem autorização explícita.
              </p>
            </div>
          )}
        </div>

        {/* Seção 4: Direitos do Responsável */}
        <div className="border-b border-gray-200 pb-3">
          <button
            onClick={() => toggleExpand('direitos')}
            className="w-full flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded transition"
          >
            <span className="font-semibold text-gray-800">4. Seus Direitos</span>
            <span className="text-gray-600">{expandidos.direitos ? '▼' : '▶'}</span>
          </button>
          {expandidos.direitos && (
            <div className="mt-3 text-sm text-gray-700 space-y-2 px-2">
              <p>
                Você tem direito a:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Acessar todos os dados da criança a qualquer momento</li>
                <li>Solicitar correção de dados imprecisos</li>
                <li>Revogar o consentimento e desvinculação da criança</li>
                <li>Solicitar exclusão de dados após desvinculação</li>
                <li>Portabilidade dos dados para outro profissional</li>
              </ul>
            </div>
          )}
        </div>

        {/* Seção 5: Segurança */}
        <div className="pb-3">
          <button
            onClick={() => toggleExpand('seguranca')}
            className="w-full flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded transition"
          >
            <span className="font-semibold text-gray-800">5. Segurança de Dados</span>
            <span className="text-gray-600">{expandidos.seguranca ? '▼' : '▶'}</span>
          </button>
          {expandidos.seguranca && (
            <div className="mt-3 text-sm text-gray-700 space-y-2 px-2">
              <p>
                O ConectaTEA implementa as seguintes medidas de segurança:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Criptografia end-to-end dos dados sensíveis</li>
                <li>Autenticação por dois fatores</li>
                <li>Backup automático e recuperação de desastres</li>
                <li>Auditorias de acesso regularmente</li>
                <li>Conformidade com padrões internacionais de segurança</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Checkbox de Consentimento */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consentimentoAceito}
            onChange={(e) => onConsentimentoChange(e.target.checked)}
            disabled={loading}
            className="w-5 h-5 mt-1 cursor-pointer accent-green-600 disabled:opacity-50"
          />
          <span className="text-sm text-gray-700">
            <strong>Eu confirmo que li e entendo</strong> os termos acima. Autorizo o
            armazenamento, processamento e compartilhamento dos dados pessoais e sensíveis da
            criança conforme descrito, em conformidade com a LGPD.
          </span>
        </label>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-3">
        <button
          onClick={onRecusar}
          disabled={loading}
          className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          Recusar
        </button>
        <button
          onClick={onAceitar}
          disabled={!consentimentoAceito || loading}
          className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader className="h-5 w-5 animate-spin" />
              Processando...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Aceitar e Confirmar
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
