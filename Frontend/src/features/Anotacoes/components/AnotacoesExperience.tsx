import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FileText, Plus, RefreshCw } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useNotificacoesContext } from '~/api/barraNotificacao'
import Header from '~/components/layout/Header'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import type { AnotacaoFormData } from '../schemas/anotacao.schema'
import {
  useAnotacoes,
  useAtualizarAnotacao,
  useCriarAnotacao,
  useExcluirAnotacao,
} from '../hooks/useAnotacoes'
import type {
  Anotacao,
  FiltroVisibilidade,
  OrdenacaoAnotacoes,
  PapelAnotacoes,
} from '../types'
import { AiAnnotationAssistantDialog } from './AiAnnotationAssistantDialog'
import { AnotacaoCard } from './AnotacaoCard'
import { AnotacaoFormDialog } from './AnotacaoFormDialog'
import { AnotacoesFilters } from './AnotacoesFilters'
import { DeleteAnotacaoDialog } from './DeleteAnotacaoDialog'

gsap.registerPlugin(useGSAP, ScrollTrigger)

type Props = { papel: PapelAnotacoes }

export function AnotacoesExperience({ papel }: Props) {
  const isProfissional = papel === 'PROFISSIONAL'
  const listRef = useRef<HTMLDivElement>(null)
  const [criancaId, setCriancaId] = useState<number>()
  const [profissionalId, setProfissionalId] = useState<number>()
  const [busca, setBusca] = useState('')
  const [visibilidade, setVisibilidade] = useState<FiltroVisibilidade>('TODAS')
  const [ordenacao, setOrdenacao] = useState<OrdenacaoAnotacoes>('RECENTES')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Anotacao>()
  const [deleting, setDeleting] = useState<Anotacao>()
  const [aiAnnotationId, setAiAnnotationId] = useState<number | null>(null)
  const { notificarSucesso, notificarErro } = useNotificacoesContext()

  const baseQuery = useAnotacoes({ papel, ordenacao: 'RECENTES' })
  const query = useAnotacoes({
    papel,
    criancaId,
    profissionalId,
    busca,
    visibilidade,
    ordenacao,
  })
  const createMutation = useCriarAnotacao()
  const updateMutation = useAtualizarAnotacao()
  const deleteMutation = useExcluirAnotacao()

  const criancas = useMemo(
    () =>
      Array.from(
        new Map(
          (baseQuery.data ?? []).map(({ criancaId: id, criancaNome: nome }) => [
            id,
            { id, nome },
          ]),
        ).values(),
      ),
    [baseQuery.data],
  )
  const autores = useMemo(
    () =>
      Array.from(
        new Map(
          (baseQuery.data ?? []).map(
            ({
              autorProfissionalId: id,
              autorNome: nome,
              autorEspecialidade: especialidade,
            }) => [id, { id, nome, especialidade }],
          ),
        ).values(),
      ),
    [baseQuery.data],
  )

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const cards = gsap.utils.toArray<HTMLElement>(
        '.annotation-card',
        listRef.current,
      )
      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 48, scale: 0.94, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 92%',
              end: 'top 62%',
              scrub: 0.5,
            },
            zIndex: index + 1,
          },
        )
      })
    },
    { scope: listRef, dependencies: [query.data] },
  )

  const submitForm = async (data: AnotacaoFormData) => {
    try {
      if (editing)
        await updateMutation.mutateAsync({
          id: editing.id,
          input: { conteudo: data.conteudo, visibilidade: data.visibilidade },
        })
      else await createMutation.mutateAsync(data)
      notificarSucesso(
        editing ? 'Anotação atualizada' : 'Anotação criada',
        editing
          ? 'As alterações foram salvas.'
          : 'A anotação já está disponível nesta experiência mock.',
      )
      setFormOpen(false)
      setEditing(undefined)
    } catch {
      notificarErro('Não foi possível salvar', 'Tente novamente em instantes.')
    }
  }

  const confirmDelete = async () => {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      notificarSucesso(
        'Anotação excluída',
        'A anotação foi removida com sucesso.',
      )
      setDeleting(undefined)
    } catch {
      notificarErro('Não foi possível excluir', 'Tente novamente em instantes.')
    }
  }

  const emptyMessage = isProfissional
    ? 'Nenhuma anotação registrada para esta criança.'
    : 'Nenhuma anotação compartilhada disponível.'

  return (
    <main className='w-full max-w-full overflow-x-hidden pb-16'>
      <Header
        title={isProfissional ? 'Anotações' : 'Anotações compartilhadas'}
        description={
          isProfissional
            ? 'Registre e acompanhe informações importantes das crianças.'
            : 'Acompanhe informações compartilhadas pelos profissionais que participam do cuidado.'
        }
        className='max-w-5xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'
      >
        {isProfissional && (
          <Button
            type='button'
            onClick={() => {
              setEditing(undefined)
              setFormOpen(true)
            }}
            className='bg-green-700 text-white hover:bg-green-800'
          >
            <Plus aria-hidden='true' />
            Nova anotação
          </Button>
        )}
      </Header>

      <div className='mx-auto max-w-7xl space-y-8'>
        <AnotacoesFilters
          papel={papel}
          criancas={criancas}
          autores={autores}
          criancaId={criancaId}
          profissionalId={profissionalId}
          busca={busca}
          visibilidade={visibilidade}
          ordenacao={ordenacao}
          onCriancaChange={setCriancaId}
          onProfissionalChange={setProfissionalId}
          onBuscaChange={setBusca}
          onVisibilidadeChange={setVisibilidade}
          onOrdenacaoChange={setOrdenacao}
        />

        {(query.isLoading || baseQuery.isLoading) && (
          <div
            className='grid grid-flow-dense grid-cols-12 gap-5'
            aria-label='Carregando anotações'
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className='col-span-12 h-72 rounded-2xl md:col-span-6'
              />
            ))}
          </div>
        )}

        {query.isError && (
          <section
            role='alert'
            className='rounded-2xl border border-red-200 bg-red-50 p-8 text-center'
          >
            <h2 className='font-semibold text-red-900'>
              Não foi possível carregar as anotações.
            </h2>
            <p className='mt-2 text-sm text-red-700'>
              Verifique a conexão e tente novamente.
            </p>
            <Button
              type='button'
              variant='outline'
              onClick={() => query.refetch()}
              className='mt-5 border-red-200 bg-white text-red-800'
            >
              <RefreshCw aria-hidden='true' />
              Tentar novamente
            </Button>
          </section>
        )}

        {query.data?.length === 0 && (
          <section className='rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center'>
            <FileText
              className='mx-auto h-10 w-10 text-green-700'
              aria-hidden='true'
            />
            <h2 className='mt-4 text-lg font-semibold text-gray-900'>
              {emptyMessage}
            </h2>
            <p className='mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-600'>
              {isProfissional
                ? 'Ajuste os filtros ou crie uma nova anotação para iniciar o acompanhamento.'
                : 'Quando um profissional compartilhar uma anotação autorizada, ela aparecerá aqui.'}
            </p>
          </section>
        )}

        {query.data && query.data.length > 0 && (
          <div
            ref={listRef}
            className='grid grid-flow-dense grid-cols-12 gap-5'
          >
            {query.data.map((anotacao) => (
              <AnotacaoCard
                key={anotacao.id}
                anotacao={anotacao}
                onOpenAi={setAiAnnotationId}
                onEdit={
                  isProfissional
                    ? (item) => {
                        setEditing(item)
                        setFormOpen(true)
                      }
                    : undefined
                }
                onDelete={isProfissional ? setDeleting : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {isProfissional && (
        <AnotacaoFormDialog
          open={formOpen}
          anotacao={editing}
          criancas={criancas}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onOpenChange={(open) => {
            setFormOpen(open)
            if (!open) setEditing(undefined)
          }}
          onSubmit={submitForm}
        />
      )}
      {isProfissional && (
        <DeleteAnotacaoDialog
          open={Boolean(deleting)}
          anotacao={deleting}
          isDeleting={deleteMutation.isPending}
          onOpenChange={(open) => {
            if (!open) setDeleting(undefined)
          }}
          onConfirm={confirmDelete}
        />
      )}
      <AiAnnotationAssistantDialog
        annotationId={aiAnnotationId}
        open={aiAnnotationId !== null}
        onOpenChange={(open) => {
          if (!open) setAiAnnotationId(null)
        }}
      />
    </main>
  )
}
