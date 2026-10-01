# Relatório de andamento — Fase 2

Atualização: 2026-10-01. Este documento substitui as afirmações de CI pendente e resume a situação comprovada antes da consolidação documental atual. A Fase 2 segue em andamento e não está homologada.

## Estado de branch, CI e segurança do escopo

- Branch ativa: `refactor/backend-java`.
- SHA local ao iniciar esta consolidação documental: `844efc9221223d2565480dcbdaa89d938d49aeb7`. Esse commit já continha o contrato inicial, ainda sem o inventário completo de endpoints. O último commit de implementação/testes é `dd718edfb094e3e0abf1495207051c4096c79327`.
- O remoto validado antes desta consolidação apontava `refactor/backend-java` para `dd718ed`. `main` e `backup/pre-refactor-java-20261001-1408` permanecem em `13df172543a633ea0e8c11b054533d0a0d71f4d7`.
- GitHub Actions run `36918281401` no commit `dd718ed`: `frontend: success`; `backend-java: success`.
- O job backend executou `./mvnw -B verify`; a suíte PostgreSQL/Testcontainers executou no CI com PostgreSQL disponível. Localmente, `./mvnw -B verify` passou, mas cinco testes Testcontainers foram ignorados por indisponibilidade de Docker. Nenhum teste foi executado nesta atualização documental.
- A falha anterior `Connection refused` foi corrigida em `dd718ed`: o contexto Spring em cache podia sobreviver ao container da classe e reutilizar uma porta dinâmica encerrada. `@DirtiesContext(AFTER_CLASS)` fecha o contexto antes de o container daquela classe ser finalizado. Não houve alteração adicional dessa correção.
- NestJS continua preservado; nenhuma migração real de banco foi executada; não houve alteração/merge na `main` nem alteração da branch de backup.

## Histórico resumido das subfases

| Subfase | Implementação/evidência atual | Pendência relevante |
|---|---|---|
| 2.1 CI | Wrapper executável; jobs frontend e backend verdes no run `36918281401`. | Reexecutar CI após push da documentação para registrar o novo estado remoto. |
| 2.2 Testcontainers | PostgreSQL 16, Flyway, schema V1, constraints e query JPA; execução confirmada pelo verify no CI. | Execução local não disponível sem Docker; manter runner como evidência para integração PostgreSQL. |
| 2.3 Auth/segurança | Usuário/role atuais lidos do banco; conta desativada bloqueada; JSON de erro; MockMvc de login/cookie/CSRF/401. | Rate limit, threat model, pentest e revisão de produção. |
| 2.4 Usuários/profissionais | Cadastro canônico e rotas `/profissionais`, `/me`; busca/perfil ativo. | React ainda chama rotas legadas; recursos de perfil adicionais seguem no NestJS. |
| 2.5 Crianças | DTOs create/update, contato pendente sem conta temporária, arquivo e autorização relacional; ADR-007. | Contrato React/E2E ainda divergente. |
| 2.6 Vínculos/consentimento/QR | Token hash SHA-256, lock pessimista, uso único, replay/expiração, revinculação, cancelamento, QR on-demand; configuração de consentimento. | Revogação de consentimento fora da fase; sem alegação de conformidade legal. |
| 2.7 Metas | DTOs separados, filtros, resumo, atualização de progresso e status temporal. | Regra temporal precisa validação clínica antes de virar regra clínica definitiva. |
| 2.8 Progresso | Histórico consultado via `ProgressoRepository`; resumo, recentes e filtros de período. | Testes dedicados de controller e integração frontend. |
| 2.9 Sessões | DTOs próprios, filtros, resumo e escopo correto para responsável. | Testes dedicados e contrato React. |
| 2.10 Conexões | Request/resposta canônicos, filtros, validação e unicidade. | MockMvc e corrida concorrente AB/BA no PostgreSQL. |
| 2.11 Dashboard | Controller implementado com DTOs e indicadores; profissional usa conexões aceitas na métrica “profissionais ativos”; dashboard responsável limita dados às crianças vinculadas. | Testes de comportamento da controller e validação dos indicadores com a UI. Agregações em memória ficam como risco técnico futuro. |
| 2.12 Auditoria/histórico | Implementado com Flyway V2, auditoria segura e histórico append-only. | Testes específicos serão escritos manualmente; revisão operacional de retenção permanece. |
| 2.13 Frontend | Não migrado nesta execução. | Corrigir rotas, nomes, envelopes, datas, CSRF/cliente HTTP e validar lint/build. |
| 2.14 E2E/cobertura | Não homologado. | Completar cobertura por controller e fluxo de ponta a ponta profissional/responsável. |
| 2.15 Documentação final | Contrato iniciado e consolidado nesta execução; status atualizado. | Plano documental de migração de dados e relatório final somente quando critérios estiverem provados. |

## Correção do lifecycle Testcontainers

O teste base `PostgresIntegrationTest` usa `@Testcontainers` com container estático por classe e Spring Boot mantém contextos/datasources em cache. Encerrar o container ao final de uma classe sem fechar o contexto podia deixar uma classe seguinte com URL/porta mapeada obsoleta. A anotação `@DirtiesContext(classMode = AFTER_CLASS)` na classe base fecha o contexto depois de cada classe de integração. A correção foi isolada no commit `dd718ed`; os testes não foram desabilitados, removidos nem substituídos por H2.

## Documentação consolidada nesta execução

- `12_API_CONTRACT_JAVA_CANONICO.md`: inventário das rotas encontradas nos controllers Java e seus DTOs/regras atuais, com consumidores React encontrados, divergências e situação de evidência. O código Java é a fonte do contrato; endpoints inexistentes não são inferidos do NestJS.
- `STATUS.md`: CI verde e evidência PostgreSQL CI, situação real por subfase e pendências que continuam abertas.
- Este relatório: corrige status remoto anterior, lifecycle, estado de Dashboard e lista atual de pendências.

## Pendências exatas da próxima etapa

1. Migrar React para o contrato Java, começando pelos endpoints com incompatibilidade de rota/body/shape: profissionais, crianças e tokens, progresso, sessões, conexões e dashboard; corrigir mínimo de senha no frontend.
2. Validar os consumidores após migração; executar lint e build do frontend. Não considerar integração homologada apenas por compilação.
3. Completar testes MockMvc/contrato ausentes, em particular Progresso, Sessões, Conexões e Dashboard, e fechar cobertura de role, IDOR, erros e CSRF por endpoint.
4. Manter Testcontainers PostgreSQL no CI e cobrir explicitamente corrida AB/BA de conexão; automatizar e validar o fluxo completo profissional/responsável, incluindo consentimento, replay e acesso negado sem vínculo.
5. Escrever manualmente testes de auditoria/histórico/rate limit e definir retenção operacional; a implementação funcional já existe.
6. Usar `11_PLANO_MIGRACAO_DADOS_PRISMA_PARA_JAVA.md` apenas numa operação futura aprovada. Manter `LocalAtendimento`, `RedeSocial`, `AreaAtuacao` e `AreaAtuacaoProfissional` no NestJS até contrato e migração futura.
7. Atualizar `08_MATRIZ_PARIDADE.md`, `09_PLANO_DE_TESTES.md` e `10_SECURITY_REVIEW.md` com a evidência nova sem rebaixar pendências; criar `13_RESULTADO_FASE_2.md` só depois dos critérios de aceite.
8. Revisar segredos, rate limit, threat model, pentest e consentimento com revisão jurídica antes de produção.

Não fazer nesta fase documental: migrar frontend, iniciar auditoria, adicionar testes, remover NestJS, executar migração real, alterar branch de backup ou fazer merge na `main`.
