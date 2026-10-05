import { ANOTACOES_MOCK, PROFISSIONAL_ATUAL_ID } from '../mocks/anotacoes.mock'
import type {
  Anotacao,
  AtualizarAnotacaoInput,
  CriarAnotacaoInput,
  FiltrosAnotacoes,
} from '../types'
import type { AnotacoesGateway } from './AnotacoesGateway'

const SIMULATED_DELAY_MS = 250

const wait = () =>
  new Promise<void>((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS))

export class MockAnotacoesGateway implements AnotacoesGateway {
  private anotacoes = ANOTACOES_MOCK.map((anotacao) => ({ ...anotacao }))

  async listar(filtros: FiltrosAnotacoes): Promise<Anotacao[]> {
    await wait()
    const busca = filtros.busca?.trim().toLocaleLowerCase('pt-BR')

    return this.anotacoes
      .filter((anotacao) => {
        if (
          filtros.papel === 'RESPONSAVEL' &&
          anotacao.visibilidade !== 'COMPARTILHADA'
        ) {
          return false
        }
        if (filtros.criancaId && anotacao.criancaId !== filtros.criancaId)
          return false
        if (
          filtros.profissionalId &&
          anotacao.autorProfissionalId !== filtros.profissionalId
        )
          return false
        if (
          filtros.visibilidade &&
          filtros.visibilidade !== 'TODAS' &&
          anotacao.visibilidade !== filtros.visibilidade
        )
          return false
        if (!busca) return true

        return [
          anotacao.conteudo,
          anotacao.criancaNome,
          anotacao.autorNome,
        ].some((value) => value.toLocaleLowerCase('pt-BR').includes(busca))
      })
      .sort((a, b) => {
        const diferenca =
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        return filtros.ordenacao === 'RECENTES' ? diferenca : -diferenca
      })
      .map((anotacao) => ({ ...anotacao }))
  }

  async criar(input: CriarAnotacaoInput): Promise<Anotacao> {
    await wait()
    const referencia = this.anotacoes.find(
      (item) => item.criancaId === input.criancaId,
    )
    if (!referencia) throw new Error('Criança não encontrada.')

    const now = new Date().toISOString()
    const anotacao: Anotacao = {
      id: Math.max(...this.anotacoes.map(({ id }) => id), 0) + 1,
      criancaId: input.criancaId,
      criancaNome: referencia.criancaNome,
      autorProfissionalId: PROFISSIONAL_ATUAL_ID,
      autorNome: 'Dra. Marina Costa',
      autorEspecialidade: 'Psicologia',
      conteudo: input.conteudo,
      visibilidade: input.visibilidade,
      createdAt: now,
      updatedAt: now,
      isAutor: true,
    }
    this.anotacoes.unshift(anotacao)
    return { ...anotacao }
  }

  async atualizar(
    id: number,
    input: AtualizarAnotacaoInput,
  ): Promise<Anotacao> {
    await wait()
    const index = this.anotacoes.findIndex((item) => item.id === id)
    const atual = this.anotacoes[index]
    if (!atual || !atual.isAutor)
      throw new Error('Anotação não disponível para edição.')

    const atualizada = {
      ...atual,
      ...input,
      updatedAt: new Date().toISOString(),
    }
    this.anotacoes[index] = atualizada
    return { ...atualizada }
  }

  async excluir(id: number): Promise<void> {
    await wait()
    const anotacao = this.anotacoes.find((item) => item.id === id)
    if (!anotacao || !anotacao.isAutor)
      throw new Error('Anotação não disponível para exclusão.')
    this.anotacoes = this.anotacoes.filter((item) => item.id !== id)
  }
}
