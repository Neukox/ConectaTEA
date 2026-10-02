import {
  atualizarMeuPerfilProfissional,
  obterMeuPerfilProfissional,
  type AtualizarProfissionalRequest,
  type Profissional,
} from './axiosProfissionais'

export async function obterPerfilProfissional(): Promise<Profissional> {
  return obterMeuPerfilProfissional()
}

export async function atualizarPerfilProfissional(
  payload: AtualizarProfissionalRequest,
): Promise<Profissional> {
  return atualizarMeuPerfilProfissional(payload)
}
