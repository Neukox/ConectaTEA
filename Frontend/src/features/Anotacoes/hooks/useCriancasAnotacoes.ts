import { useQuery } from '@tanstack/react-query'
import { listarCriancas } from '~/api/protected/axiosCadastroCrianca'
import { vinculacaoAPI } from '~/api/protected/axiosVinculacao'
import { QUERY_KEYS } from '~/api/query-client'
import type { CriancaAnotacao, PapelAnotacoes } from '../types'

const listarCriancasProfissional = async (): Promise<CriancaAnotacao[]> => {
  const response = await listarCriancas()
  return response.items.map(({ id, nome }) => ({ id, nome }))
}

const listarCriancasResponsavel = async (): Promise<CriancaAnotacao[]> => {
  const vinculos = await vinculacaoAPI.obterVinculos()
  return vinculos.map(({ id, nome }) => ({ id, nome }))
}

export function useCriancasAnotacoes(papel: PapelAnotacoes) {
  const isProfissional = papel === 'PROFISSIONAL'

  return useQuery({
    queryKey: [isProfissional ? QUERY_KEYS.CRIANCAS : QUERY_KEYS.VINCULOS],
    queryFn: isProfissional
      ? listarCriancasProfissional
      : listarCriancasResponsavel,
  })
}
