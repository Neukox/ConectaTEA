import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '~/api/query-client'
import { anotacoesGateway } from '../services'
import type {
  AtualizarAnotacaoInput,
  CriarAnotacaoInput,
  FiltrosAnotacoes,
} from '../types'

export function useAnotacoes(filtros: FiltrosAnotacoes) {
  return useQuery({
    queryKey: [QUERY_KEYS.ANOTACOES, filtros],
    queryFn: () => anotacoesGateway.listar(filtros),
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
      id,
      input,
    }: {
      id: number
      input: AtualizarAnotacaoInput
    }) => anotacoesGateway.atualizar(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ANOTACOES] }),
  })
}

export function useExcluirAnotacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => anotacoesGateway.excluir(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ANOTACOES] }),
  })
}
