# Fase 3 — migração dos recursos profissionais legados

## Objetivo e baseline

Trabalho iniciado em `refactor/fase-3-remocao-legado-node`, a partir da `main` limpa e sincronizada no SHA `5fe5d9f2664f9b3a1ebb4037a59d658a3bb4b05e`. O objetivo é retirar dependências funcionais de NestJS/Prisma sem apagar `Backend/` e sem executar migração real de dados.

## Inventário e decisões

| Recurso | Legado Prisma/NestJS | Modelo Java/Flyway | Decisão |
|---|---|---|---|
| LocalAtendimento | `id`, `nome`, `cidade`, N:1 profissional; substituição em lote no update de perfil | `locais_atendimento`, entidade/repository/service/controller próprios | CRUD do próprio profissional |
| RedeSocial | `id`, `tipo`, `url?`, N:1; substituição em lote | `redes_sociais`; URL obrigatória HTTP(S), tipo único por profissional | CRUD do próprio profissional |
| AreaAtuacao | `id`, `nome` único | `areas_atuacao`, unicidade case-insensitive | catálogo global somente leitura; nenhuma administração foi inventada |
| AreaAtuacaoProfissional | PK composta `(profissional_id, area_id)` | entidade explícita e tabela `areas_atuacao_profissionais` | vincular/remover apenas no próprio perfil |

Não existiam controllers, modules ou services NestJS isolados para esses recursos. `ProfissionaisService` incluía os quatro nas leituras e alterava locais/redes pelo endpoint `PUT /profissionais/usuario/{usuarioId}`. O frontend da Fase 2 já não o chamava e exibia apenas aviso de pendência.

## Implementação

A migration `V3__professional_profile_resources.sql` cria PKs, FKs, índices, unicidades, checks e cascades. Hibernate permanece com `ddl-auto=validate`. A aplicação segue `api/application/domain/infrastructure`, DTOs distintos de entidade e autenticação via `AuthenticatedUser`.

Rotas canônicas: catálogo `GET /areas-atuacao`; CRUD em `/profissionais/me/locais-atendimento` e `/profissionais/me/redes-sociais`; leitura/vínculo/desvínculo em `/profissionais/me/areas-atuacao`. Requests e responses usam camelCase.

## Segurança, auditoria e erros

Somente `PROFISSIONAL` opera recursos próprios. O profissional é resolvido do principal, nunca de `usuarioId` enviado pelo cliente. Alterar/excluir ID pertencente a outro profissional resulta em 403; inexistência resulta em 404; validação em 400 e unicidade em 409. Mutações são auditadas apenas com ator, recurso e IDs, sem URL ou payload completo.

## Frontend, E2E e CI

O perfil React usa o `apiClient` central e endpoints Java. A tela permite CRUD de locais/redes e associação às áreas disponíveis, sem redesign. O E2E integrado cobre criação e persistência visual de local e rede; áreas dependem de catálogo previamente migrado e não recebem seed inventada.

O workflow continua com jobs `frontend`, `backend-java` e `e2e`, usando PostgreSQL + Spring Boot + React, sem NestJS. O run `37050290884` concluiu os três jobs com sucesso no SHA `3b71cbb`. Localmente, `npm ci`, lint e build passaram; `mvn verify` passou com 33 testes, cinco integrações ignoradas por indisponibilidade do Docker local. O E2E/PostgreSQL real foi comprovado pelo job Linux.

## Auditoria final de consumers

| Recurso | Consumer antigo | Consumer novo | Status |
|---|---|---|---|
| locais | `PUT /profissionais/usuario/{usuarioId}` no legado, sem chamada React atual | `/profissionais/me/locais-atendimento` | Java ativo |
| redes | mesmo update agregado legado, sem chamada React atual | `/profissionais/me/redes-sociais` | Java ativo |
| áreas | inclusão em response legado, sem seleção React atual | `/areas-atuacao` e `/profissionais/me/areas-atuacao` | Java ativo |

Busca em Frontend, E2E, Docker e workflow não encontrou NestJS, Prisma, porta 3001 ou rota de perfil legada como dependência funcional. As ocorrências restantes estão no código `Backend/` preservado e em documentação histórica/plano de migração. Portanto: **BACKEND NESTJS SEM CONSUMIDORES FUNCIONAIS**.

## Limitações e pendências

- Nenhum dado Prisma foi copiado; o catálogo pode estar vazio até a migração operacional futura.
- A UI pública de perfil continua sem expor esses detalhes; a Fase 3 cobre o próprio perfil.
- A homologação manual no navegador permanece obrigatória.
- `Backend/`, schema e migrations Prisma são preservados para auditoria e rollback.

O plano de retirada física está em `17_PLANO_REMOCAO_NESTJS.md` e não deve ser executado nesta fase.
