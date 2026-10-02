# ADR-008 — auditoria, histórico e proteção contra abuso

## Status

Aceita na Fase 2.12.

## Decisão

Eventos operacionais sensíveis são gravados em `audit_logs` sem segredos ou payload clínico, por serviço com transação independente. Uma falha secundária de auditoria é registrada no log técnico e não desfaz a operação principal. O histórico de vínculo, por representar o próprio fato de negócio, é append-only e participa da mesma transação da criação, reativação ou desvinculação.

O rate limit do MVP usa janelas locais em memória por IP, método e rota para login e fluxos de token. Limites são externalizados. A solução protege uma instância, mas não é global em implantação horizontal; Redis/API gateway permanece evolução operacional antes de escala distribuída.

## Consequências

- auditoria não armazena senha, hash de senha, JWT, cookie, CSRF, token bruto nem conteúdo clínico;
- histórico não é sobrescrito quando o vínculo é reativado;
- indisponibilidade da tabela de histórico invalida a mutação correspondente, preservando consistência;
- IP obtido de `X-Forwarded-For` só é confiável quando o proxy de borda remove cabeçalhos enviados pelo cliente;
- o rate limit em memória é deliberadamente simples e deve ser substituído/centralizado antes de múltiplas réplicas.
