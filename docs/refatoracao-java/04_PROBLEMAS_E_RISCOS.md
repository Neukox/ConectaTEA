# Problemas e riscos

- P0: `.history` com `.env`, segredo JWT padrão, senha temporária fixa, IDOR e autorização somente por role.
- P1: token consumido em GET, fluxo frontend/backend divergente, migrations arriscadas, datas ambíguas, ausência de testes e condição de corrida.
- P2: rotas/módulos/clientes duplicados, nomenclatura mista, N+1 e documentos defasados.

Credenciais anteriormente versionadas devem ser consideradas comprometidas e rotacionadas. O histórico Git não será reescrito sem autorização humana.

