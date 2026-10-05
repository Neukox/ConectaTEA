import type {
  Anotacao,
  AtualizarAnotacaoInput,
  CriarAnotacaoInput,
  FiltrosAnotacoes,
} from '../types'

export interface AnotacoesGateway {
  listar(
    filtros: FiltrosAnotacoes,
    criancaIds: readonly number[],
  ): Promise<Anotacao[]>
  criar(input: CriarAnotacaoInput): Promise<Anotacao>
  atualizar(
    criancaId: number,
    id: number,
    input: AtualizarAnotacaoInput,
  ): Promise<Anotacao>
  excluir(criancaId: number, id: number): Promise<void>
}
