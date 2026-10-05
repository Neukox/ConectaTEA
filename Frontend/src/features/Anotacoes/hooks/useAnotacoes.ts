import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '~/api/query-client'
import { anotacoesGateway } from '../services'
import type {
  AtualizarAnotacaoInput,
  CriarAnotacaoInput,
  FiltrosAnotacoes,
} from '../types'

export function useAnotacoes(
  filtros: FiltrosAnotacoes,
  criancaIds: readonly number[],
  enabled: boolean,
) {
  return useQuery({
    queryKey: [QUERY_KEYS.ANOTACOES, filtros, criancaIds],
    queryFn: () => anotacoesGateway.listar(filtros, criancaIds),
    enabled,
  })
}

export function useCriarAnotacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarAnotacaoInput) => anotacoesGateway.criar(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ANOTACOES] }),
  })
}

export function useAtualizarAnotacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      criancaId,
      id,
      input,
    }: {
      criancaId: number
      id: number
      input: AtualizarAnotacaoInput
    }) => anotacoesGateway.atualizar(criancaId, id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ANOTACOES] }),
  })
}

export function useExcluirAnotacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ criancaId, id }: { criancaId: number; id: number }) =>
      anotacoesGateway.excluir(criancaId, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ANOTACOES] }),
  })
}
