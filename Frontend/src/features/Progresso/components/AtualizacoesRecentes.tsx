import type { Atualizacao } from '../types'
import { AtualizacaoCard } from './AtualizacaoCard'

interface AtualizacoesRecentesProps {
  atualizacoes: Atualizacao[]
}

export function AtualizacoesRecentes({ atualizacoes }: AtualizacoesRecentesProps) {
  return (
    <div className='rounded-xl border border-gray-100 bg-white p-6 shadow-sm'>
      <h3 className='mb-6 text-lg font-bold text-gray-900'>
        Atualizações Recentes
      </h3>
      <div className='space-y-4'>
        {atualizacoes.map((item, index) => (
          <AtualizacaoCard key={index} {...item} />
        ))}
      </div>
    </div>
  )
}
