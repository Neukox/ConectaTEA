# Plano de testes

Unitários: cálculo de status de meta, autenticação e validações. MockMvc: 401/403,
cookies/CSRF e contratos. Testcontainers PostgreSQL: Flyway, vínculo e consumo
concorrente de token, constraints e autorização relacional. Frontend: lint/build.
Infra: Compose config/build e healthcheck.

## Fase 2.2 — base PostgreSQL real

- Testes de integração usam PostgreSQL 16 via Testcontainers; H2 não é fonte de
  compatibilidade do schema.
- O Flyway executa a V1 desde um banco vazio antes da validação do contexto JPA.
- A suíte valida tabelas essenciais, índice único case-insensitive, `CHECK` de
  enum e uma consulta derivada do Spring Data contra PostgreSQL.
- Em ambiente sem Docker os testes são explicitamente marcados como ignorados;
  o job Linux do CI é o ambiente obrigatório para executá-los de verdade.
- Próximos cenários da mesma infraestrutura: concorrência de token, replay,
  autorização relacional, CSRF e fluxo E2E.
