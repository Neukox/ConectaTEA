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

## Pendências manuais após esta execução

Sem gerar nova bateria automática nesta fase, devem ser escritos posteriormente testes de auditoria (sanitização e falha secundária), histórico transacional, rate limit/429, controllers de Progresso, Sessões, Conexões e Dashboard, IDOR por módulo, corrida AB/BA de conexões e E2E profissional/responsável. O CI deve continuar executando Flyway V1+V2 e Hibernate validate no PostgreSQL Testcontainers.

## Evidência da Fase 2.13 — frontend

- npm ci: aprovado.
- npm run lint: aprovado com zero erros; cinco avisos preexistentes de Fast Refresh em arquivos não alterados.
- npm run build (tsc -b + Vite): aprovado.
- mvn -B verify: aprovado, preservando a suíte Java.
- GitHub Actions run 37000403678: jobs frontend e backend-java aprovados.
- Auditoria estática: cliente Axios único, contratos camelCase, datas YYYY-MM-DD/ISO-8601 e ausência das rotas legadas dos módulos migrados.

Ainda é obrigatório homologar em ambiente integrado: registro/login/me/logout, perfis, CRUD/arquivamento de criança, token/QR, preview/consentimento, metas, progresso, sessões, conexões e dashboards de ambas as roles. A indisponibilidade de uma infraestrutura local completa não deve ser confundida com aprovação E2E.
