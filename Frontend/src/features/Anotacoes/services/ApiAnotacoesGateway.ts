import { api } from '~/api/apiClient'
import { listarCriancas } from '~/api/protected/axiosCadastroCrianca'
import type {
  Anotacao,
  AtualizarAnotacaoInput,
  CriarAnotacaoInput,
  FiltrosAnotacoes,
} from '../types'
import type { AnotacoesGateway } from './AnotacoesGateway'

export class ApiAnotacoesGateway implements AnotacoesGateway {
  async listar(filtros: FiltrosAnotacoes): Promise<Anotacao[]> {
    const criancaIds = filtros.criancaId
      ? [filtros.criancaId]
      : (await listarCriancas()).items.map(({ id }) => id)

    const listas = await Promise.all(
      criancaIds.map(async (criancaId) => {
        const response = await api.get<Anotacao[]>(
          `/criancas/${criancaId}/anotacoes`,
          {
            params: {
              busca: filtros.busca?.trim() || undefined,
              profissionalId: filtros.profissionalId,
              visibilidade:
                filtros.visibilidade === 'TODAS'
                  ? undefined
                  : filtros.visibilidade,
              ordenacao: filtros.ordenacao,
            },
          },
        )
        return response.data
      }),
    )

    const direction = filtros.ordenacao === 'RECENTES' ? -1 : 1
    return listas
      .flat()
      .sort(
        (left, right) =>
          direction *
          (new Date(left.createdAt).getTime() -
            new Date(right.createdAt).getTime()),
      )
  }

  async criar(input: CriarAnotacaoInput): Promise<Anotacao> {
    const response = await api.post<Anotacao>(
      `/criancas/${input.criancaId}/anotacoes`,
      { conteudo: input.conteudo, visibilidade: input.visibilidade },
    )
    return response.data
  }

  async atualizar(
    criancaId: number,
    id: number,
    input: AtualizarAnotacaoInput,
  ): Promise<Anotacao> {
    const response = await api.put<Anotacao>(
      `/criancas/${criancaId}/anotacoes/${id}`,
      input,
    )
    return response.data
  }

  async excluir(criancaId: number, id: number): Promise<void> {
    await api.delete(`/criancas/${criancaId}/anotacoes/${id}`)
  }
}
