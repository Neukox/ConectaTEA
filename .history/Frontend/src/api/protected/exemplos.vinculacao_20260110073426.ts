// Exemplo de uso da API de Vinculação

import { vinculacaoAPI } from '@/api/protected/axiosVinculacao'
import type { ReactNode } from 'react'

// 1. Validar um código de vinculação
async function validarCodigoExemplo() {
  try {
    const dados = await vinculacaoAPI.validarCodigo('TEA-6081-Z')
    console.log('Criança encontrada:', dados)
    // Resultado:
    // {
    //   id: 1,
    //   nome: 'João Silva',
    //   data_nascimento: '2018-05-15',
    //   diagnostico: 'TEA Nível 2',
    //   status: 'Aguardando Vínculo Familiar'
    // }
  } catch (error) {
    console.error('Código inválido:', error)
  }
}

// 2. Confirmar a vinculação
async function confirmarVinculoExemplo() {
  try {
    const vínculo = await vinculacaoAPI.confirmarVinculo({
      crianca_id: 1,
      consentimento_aceito: true
    })
    console.log('Vínculo criado:', vínculo)
    // Resultado:
    // {
    //   id: 10,
    //   crianca_id: 1,
    //   responsavel_id: 5,
    //   status: 'VINCULADO',
    //   data_vinculo: '2026-01-10T10:30:00Z'
    // }
  } catch (error) {
    console.error('Erro ao confirmar vínculo:', error)
  }
}

// 3. Obter vínculos do responsável
async function obterVinculosExemplo() {
  try {
    const vinculos = await vinculacaoAPI.obterVinculos()
    console.log('Minhas crianças:', vinculos)
    // Resultado:
    // [
    //   {
    //     id: 1,
    //     nome: 'João Silva',
    //     idade: 8,
    //     diagnostico: 'TEA Nível 2',
    //     profissional: 'Dra. Maria Silva'
    //   },
    //   {
    //     id: 2,
    //     nome: 'Pedro Silva',
    //     idade: 6,
    //     diagnostico: 'TEA Nível 1',
    //     profissional: 'Dr. Carlos Santos'
    //   }
    // ]
  } catch (error) {
    console.error('Erro ao obter vínculos:', error)
  }
}

// 4. Desvincular uma criança
async function desvincularCriancaExemplo() {
  try {
    await vinculacaoAPI.desvincularCrianca(1)
    console.log('Criança desvinculada com sucesso')
  } catch (error) {
    console.error('Erro ao desvincular:', error)
  }
}

// Exemplo de integração no componente
import { useState } from 'react'
import type { ChangeEvent } from 'react'

interface CriancaDados {
  id: number
  nome: string
  data_nascimento: string
  diagnostico: string
  status: string
}

function MinhaIntegracaoExemplo(): ReactNode {
  const [crianca, setCrianca] = useState<CriancaDados | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const handleValidarCodigo = async (codigo: string) => {
    setLoading(true)
    setErro(null)

    try {
      const dados = await vinculacaoAPI.validarCodigo(codigo)
      setCrianca(dados)
    } catch (error: any) {
      setErro(
        error.response?.data?.message ||
        'Código inválido. Tente novamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmarVinculo = async () => {
    if (!crianca) return

    setLoading(true)
    setErro(null)

    try {
      const resultado = await vinculacaoAPI.confirmarVinculo({
        crianca_id: crianca.id,
        consentimento_aceito: true
      })
      console.log('Vínculo confirmado:', resultado)
      // Redirecionar ou atualizar UI
    } catch (error: any) {
      setErro(
        error.response?.data?.message ||
        'Erro ao confirmar vínculo. Tente novamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Input de código */}
      <input
        type="text"
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleValidarCodigo(e.target.value)}
        placeholder="TEA-XXXX-X"
      />

      {/* Exibir erro */}
      {erro && <div className="text-red-600">{erro}</div>}

      {/* Loading */}
      {loading && <div>Carregando...</div>}

      {/* Dados da criança */}
      {crianca && (
        <div>
          <p>Nome: {crianca.nome}</p>
          <p>Diagnóstico: {crianca.diagnostico}</p>
          <button onClick={handleConfirmarVinculo}>Confirmar Vínculo</button>
        </div>
      )}
    </div>
  )
}

// Comentar o export para evitar erros ao importar este arquivo
// export default MinhaIntegracaoExemplo
