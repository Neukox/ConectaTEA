import { Search } from 'lucide-react'
import { Input } from '~/components/ui/input'
import type {
  AutorAnotacao,
  CriancaAnotacao,
  FiltroVisibilidade,
  OrdenacaoAnotacoes,
  PapelAnotacoes,
} from '../types'

type Props = {
  papel: PapelAnotacoes
  criancas: CriancaAnotacao[]
  autores: AutorAnotacao[]
  criancaId?: number
  profissionalId?: number
  busca: string
  visibilidade: FiltroVisibilidade
  ordenacao: OrdenacaoAnotacoes
  onCriancaChange: (id?: number) => void
  onProfissionalChange: (id?: number) => void
  onBuscaChange: (value: string) => void
  onVisibilidadeChange: (value: FiltroVisibilidade) => void
  onOrdenacaoChange: (value: OrdenacaoAnotacoes) => void
}

const fieldClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100'

export function AnotacoesFilters(props: Props) {
  return (
    <section
      aria-label='Filtros das anotações'
      className='grid grid-flow-dense grid-cols-12 gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5'
    >
      <div className='col-span-12 md:col-span-6 xl:col-span-4'>
        <label
          htmlFor='busca-anotacoes'
          className='mb-1.5 block text-sm font-medium text-gray-700'
        >
          Busca
        </label>
        <div className='relative'>
          <Search
            className='absolute top-3.5 left-3 h-4 w-4 text-gray-400'
            aria-hidden='true'
          />
          <Input
            id='busca-anotacoes'
            value={props.busca}
            onChange={(event) => props.onBuscaChange(event.target.value)}
            placeholder='Buscar no conteúdo, criança ou autor'
            className='h-11 rounded-xl pl-10'
          />
        </div>
      </div>
      <div className='col-span-12 sm:col-span-6 md:col-span-3 xl:col-span-2'>
        <label
          htmlFor='filtro-crianca'
          className='mb-1.5 block text-sm font-medium text-gray-700'
        >
          Criança
        </label>
        <select
          id='filtro-crianca'
          value={props.criancaId ?? ''}
          onChange={(event) =>
            props.onCriancaChange(
              event.target.value ? Number(event.target.value) : undefined,
            )
          }
          className={fieldClass}
        >
          <option value=''>Todas</option>
          {props.criancas.map((crianca) => (
            <option
              key={crianca.id}
              value={crianca.id}
            >
              {crianca.nome}
            </option>
          ))}
        </select>
      </div>
      {props.papel === 'RESPONSAVEL' ? (
        <div className='col-span-12 sm:col-span-6 md:col-span-3 xl:col-span-3'>
          <label
            htmlFor='filtro-profissional'
            className='mb-1.5 block text-sm font-medium text-gray-700'
          >
            Profissional
          </label>
          <select
            id='filtro-profissional'
            value={props.profissionalId ?? ''}
            onChange={(event) =>
              props.onProfissionalChange(
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
            className={fieldClass}
          >
            <option value=''>Todos</option>
            {props.autores.map((autor) => (
              <option
                key={autor.id}
                value={autor.id}
              >
                {autor.nome}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className='col-span-12 sm:col-span-6 md:col-span-3 xl:col-span-3'>
          <label
            htmlFor='filtro-visibilidade'
            className='mb-1.5 block text-sm font-medium text-gray-700'
          >
            Visibilidade
          </label>
          <select
            id='filtro-visibilidade'
            value={props.visibilidade}
            onChange={(event) =>
              props.onVisibilidadeChange(
                event.target.value as FiltroVisibilidade,
              )
            }
            className={fieldClass}
          >
            <option value='TODAS'>Todas</option>
            <option value='PRIVADA'>Privadas</option>
            <option value='COMPARTILHADA'>Compartilhadas</option>
          </select>
        </div>
      )}
      <div className='col-span-12 sm:col-span-6 md:col-span-3 xl:col-span-3'>
        <label
          htmlFor='ordenacao-anotacoes'
          className='mb-1.5 block text-sm font-medium text-gray-700'
        >
          Ordenação
        </label>
        <select
          id='ordenacao-anotacoes'
          value={props.ordenacao}
          onChange={(event) =>
            props.onOrdenacaoChange(event.target.value as OrdenacaoAnotacoes)
          }
          className={fieldClass}
        >
          <option value='RECENTES'>Mais recentes</option>
          <option value='ANTIGAS'>Mais antigas</option>
        </select>
      </div>
    </section>
  )
}
