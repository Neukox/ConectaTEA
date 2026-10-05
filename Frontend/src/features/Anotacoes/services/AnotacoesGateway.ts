import type {
  Anotacao,
  AtualizarAnotacaoInput,
  CriarAnotacaoInput,
  FiltrosAnotacoes,
} from '../types'

export interface AnotacoesGateway {
  listar(filtros: FiltrosAnotacoes): Promise<Anotacao[]>
  criar(input: CriarAnotacaoInput): Promise<Anotacao>
  atualizar(id: number, input: AtualizarAnotacaoInput): Promise<Anotacao>
  excluir(id: number): Promise<void>
}
