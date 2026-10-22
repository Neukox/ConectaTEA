# Observabilidade do backend

## Endpoints

| Endpoint | Acesso | Uso |
|---|---|---|
| `/api/actuator/health` | público | visão agregada |
| `/api/actuator/health/liveness` | público | processo vivo |
| `/api/actuator/health/readiness` | público | pronto para receber tráfego |
| `/api/actuator/metrics/**` | restrito | métricas Micrometer |
| `/api/actuator/prometheus` | restrito | scrape Prometheus |

Health e probes não retornam detalhes sensíveis. Métricas e Prometheus exigem
sessão autenticada de um email listado em `OBSERVABILITY_ALLOWED_EMAILS`
(separado por vírgulas). Com a variável vazia, os endpoints ficam fechados.

## Correlação

O `RequestCorrelationFilter` aceita `X-Request-Id` apenas com
`[A-Za-z0-9._-]{1,128}`; qualquer outro valor é substituído por UUID. O id vai
para o MDC, para o header de resposta e para o campo `requestId` dos erros.
Nunca registre corpo clínico, senha, cookie ou token de convite.

## Sinais esperados

- HTTP: latência, volume e taxa de erro por rota/status.
- JVM: memória, GC e threads.
- Banco: pool Hikari e health do datasource.
- Regras de negócio: logs/auditoria já existentes, sem conteúdo sensível.

O envio assíncrono de e-mail ainda é observado por logs de sucesso/falha; métricas
dedicadas de fila/execução devem ser adicionadas junto do alarme em #60.

## Runbook rápido

1. `readiness` fora do ar: verificar datasource/PostgreSQL antes de reiniciar.
2. `liveness` fora do ar: reiniciar o processo e conferir memória/GC.
3. Aumento de 5xx ou latência: correlacionar `requestId`, rota e horário nos logs.
4. Falha de e-mail: conferir logs do listener, configuração Brevo e fila assíncrona.
5. Métricas indisponíveis: confirmar `OBSERVABILITY_ALLOWED_EMAILS` e a sessão usada.

## Limites

- Prometheus/Micrometer não substituem auditoria clínica.
- Alarmes, retenção e dashboards externos pertencem à #60.
- Toda exposição nova de actuator precisa passar pela allowlist acima.
