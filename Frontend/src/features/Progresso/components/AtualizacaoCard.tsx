import type { Atualizacao } from '../types'

export function AtualizacaoCard({
  nome,
  meta,
  aumento,
  descricao,
  profissional,
  data,
  progressoAtual,
}: Atualizacao) {
  return (
    <div className='rounded-lg border border-gray-100 p-4 transition-shadow hover:shadow-md'>
      <div className='mb-2 flex items-start justify-between'>
        <div className='flex items-center gap-2'>
          <span className='font-bold text-gray-900'>{nome}</span>
          <span className='rounded bg-gray-100 px-2 py-1 text-xs text-gray-600'>
            {meta}
          </span>
        </div>
        <span className='text-sm font-bold text-green-600'>{aumento}</span>
      </div>
      <p className='mb-3 text-sm text-gray-600'>{descricao}</p>
      <div className='flex items-center justify-between text-xs text-gray-400'>
        <span>Profissional: {profissional}</span>
        <div className='flex gap-4'>
          <span>Data: {data}</span>
          <span>Progresso atual: {progressoAtual}%</span>
        </div>
      </div>
    </div>
  )
}
