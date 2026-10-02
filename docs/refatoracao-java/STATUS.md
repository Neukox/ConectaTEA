# Status da migração — backend Java

## Fase 3 — recursos profissionais

| Recurso | Java/Flyway | Frontend | E2E | Estado |
|---|---|---|---|---|
| LocalAtendimento | implementado | migrado | criação/persistência | aguarda CI |
| RedeSocial | implementado | migrado | criação/persistência | aguarda CI |
| AreaAtuacao | catálogo leitura | seleção integrada | depende de catálogo real | aguarda CI/manual |
| AreaAtuacaoProfissional | associação explícita | vincular/remover | manual com catálogo | aguarda CI/manual |

NestJS está preservado; nenhuma migração real foi executada. A Fase 3 só fica pronta após CI/E2E verdes e auditoria final.

Atualizado em 2026-10-02. Esta página é o estado consolidado mais recente; as notas de risco abaixo permanecem ativas mesmo com CI verde.

## Snapshot verificável

- Branch de trabalho: `refactor/backend-java`.
- Branch de restauração: `backup/pre-refactor-java-20261001-1408`; `main` e backup permanecem no baseline `13df172543a633ea0e8c11b054533d0a0d71f4d7`.
- SHA funcional/documental validado antes do registro final: `f3854eb2fe3bbd0fbc71e81119e8d1b81cc3db7c`.
- GitHub Actions run `36924901483`: `frontend: success`, `backend-java: success`.
- `./mvnw -B verify` terminou com `BUILD SUCCESS` localmente e gerou o JAR. Resultado: 33 testes, 0 falhas/erros, 5 ignorados por Docker indisponível; no job Linux do CI, Testcontainers executou com PostgreSQL e o job passou.
- Causa corrigida: o cache de contexto Spring mantinha datasource/porta mapeada após o ciclo de vida do container da classe de teste. `@DirtiesContext(AFTER_CLASS)` fecha o contexto antes da classe de integração seguinte. A alteração está em `dd718ed`; não foi repetida nesta execução.
- NestJS continua preservado. Nenhuma migração real do banco foi executada. Não houve alteração em `main` nem na branch de backup.

## Situação por subfase

| Subfase | Situação atual | Evidência e limite |
|---|---|---|
| 2.1 CI | testado | Workflow frontend e backend verdes no run acima. |
| 2.2 PostgreSQL/Testcontainers | testado no CI | V1/Flyway, constraints e queries rodam contra PostgreSQL Testcontainers no runner; sem Docker, os cenários são ignorados localmente. |
| 2.3 Auth/segurança | implementado e parcialmente testado | JWT recarrega usuário/role ativos; MockMvc cobre login, cookie, CSRF e 401. Rate limit e revisão de produção pendentes. |
| 2.4 Usuários/profissionais | implementado parcialmente | Registro e rotas canônicas existem; integração frontend e recursos de perfil legado ainda pendentes. |
| 2.5 Crianças | implementado parcialmente | DTOs, contato pendente, arquivo e autorização implementados; integração React/E2E pendente. |
| 2.6 Vínculos/consentimento/QR | implementado; cenários PostgreSQL testados no CI | Token single-use, replay, concorrência, revinculação, expiração e QR; revogação de consentimento não implementada. Não é declaração de compliance jurídico. |
| 2.7 Metas | implementado e regras de domínio testadas | Filtros/status e DTOs; regra temporal continua sujeita a validação clínica. |
| 2.8 Progresso | implementado parcialmente | Usa histórico real; testes de controller/integração específicos e alinhamento frontend pendentes. |
| 2.9 Sessões | implementado parcialmente | Contratos e escopo de responsável implementados; testes específicos e alinhamento React pendentes. |
| 2.10 Conexões | implementado parcialmente | Rotas/DTOs canônicos implementados; MockMvc e corrida oposta AB/BA pendentes. |
| 2.11 Dashboard | implementação concluída; não homologado | Métricas/DTOs profissionais e responsável implementados; teste dedicado e validação com UI pendentes. Agregações em memória são risco de evolução, não critério funcional já validado. |
| 2.12 Auditoria/histórico | implementado; não homologado | AuditLog/repositório/serviço, eventos sensíveis e histórico append-only implementados com Flyway V2; testes específicos permanecem para a etapa manual. |
| 2.13 Frontend | implementado e homologado no fluxo E2E | React 19/Tailwind 4 preservados; clientes, DTOs, autenticação, vínculos, dashboards e módulos migrados ao contrato Java. Lint/build locais e verify Java aprovados; E2E React/Java permanece pendente. |
| 2.14 E2E/cobertura | homologado no fluxo automatizado principal | Playwright executa React/Vite -> Spring Boot/Security -> JPA -> PostgreSQL 16; run 37037277203 aprovado. Cobertura manual detalhada continua separada. |
| 2.15 Documentação final | consolidada para a Fase 2 | Resultado final registrado após E2E verde; riscos de produção e testes manuais permanecem explicitamente separados. |

## Segurança e autorização

- JWT em cookie HttpOnly; CSRF em operações mutáveis (exceto login/registro); conta inexistente/inativa não autentica.
- A identidade e role derivam do principal/banco; acesso clínico exige vínculo ativo e criança não arquivada.
- O contrato detalhado de roles, erros e autorização está em [`12_API_CONTRACT_JAVA_CANONICO.md`](12_API_CONTRACT_JAVA_CANONICO.md).
- Consentimento armazena ator, criança, profissional, data, IP, User-Agent, versão e finalidade configuradas. Revogação não está implementada; revisão jurídica segue pendente.

## Pendências para próximas etapas

1. Homologar em ambiente integrado os clientes React já migrados, incluindo profissionais, crianças/tokens, progresso, sessões, conexões e os dois dashboards.
2. Manter lint/build do frontend e verificar os consumidores reais contra os DTOs a cada alteração.
3. Completar cobertura MockMvc/contrato para todos os controllers; cobrir IDOR e filtros por módulo. Fazer testes específicos de progresso, sessões, conexões e dashboard, e corrida concorrente AB/BA em PostgreSQL.
4. Automatizar e validar o fluxo E2E completo profissional/responsável, incluindo consentimento, replay, acesso autorizado e negado.
5. Implementar manualmente a cobertura específica de auditoria, histórico e rate limit; a funcionalidade está presente sem armazenar senha, JWT, token bruto ou payload clínico.
6. Executar futuramente o plano `11_PLANO_MIGRACAO_DADOS_PRISMA_PARA_JAVA.md` somente após ensaio e aprovação; nenhuma migração real ocorreu. Os quatro recursos da Fase 3 já possuem contrato Java, mas os dados Prisma ainda aguardam migração autorizada.
7. Atualizar matriz, plano de testes e security review com evidência por requisito; criar `13_RESULTADO_FASE_2.md` somente após comprovar os critérios finais.
8. Revisar rate limit, secrets, threat model, pentest e consentimento com revisão jurídica antes de produção.

O backend está **estabilizado para migração do frontend**, mas a Fase 2 continua em andamento e não homologada. CI/Testcontainers, integração React, cobertura completa, E2E e validação jurídica continuam sendo evidências distintas.

## Fase 2.13 — alinhamento do frontend (2026-10-02)

- React 19, TypeScript 5, Vite 7, Tailwind CSS 4, Shadcn/Radix e a identidade visual foram mantidos.
- apiClient é o único cliente Axios configurado, com cookies, withCredentials e withXSRFToken; o alias httpClient e o uso funcional de token em localStorage foram removidos.
- Auth usa cookie HttpOnly e restaura a sessão por /auth/me; registro exige senha mínima de 8 caracteres.
- Profissionais, usuários, crianças, tokens/QR, vínculos, metas, progresso, sessões, conexões e dashboards usam rotas e JSON canônicos Java em camelCase.
- O dashboard do responsável e a listagem/desvinculação de suas crianças agora são próprios; o fluxo simulado de vínculo foi substituído por preview e confirmação reais.
- Validação local: npm run lint sem erros (5 avisos preexistentes de Fast Refresh em arquivos não alterados), npm run build aprovado e mvn -B verify aprovado. No GitHub Actions, o run 37000403678 aprovou os jobs frontend e backend-java.
- Permanecem sem homologação manual: execução local completa, seleção de área com catálogo real e leitura de QR em navegadores sem `BarcodeDetector` (entrada manual continua disponível).

## Estabilização final do frontend após a Fase 2.13 — 2026-10-02

- Corrigida a inversão confirmada: `/profissional/dashboard` renderiza `DashboardProfissional` e `/responsavel/dashboard` renderiza `DashboardResponsavel`, ambas protegidas pela role correspondente.
- A auditoria de navegação removeu constants sem rota real, alinhou `/responsavel/criancas` e retirou do dropdown do responsável as ações enganosas de perfil/configurações. Nenhum link visível aponta para rota inexistente.
- Removido o modal isolado de vínculo que simulava sucesso. O fluxo ativo usa preview, consentimento e confirmação reais.
- Corrigidos: espera real da mutation de atualização de meta, filtros de progresso recente, formatação de diferença negativa, invalidações relacionadas e transformação de sessão para ISO-8601 com offset local, sem deslocamento acidental de data/hora.
- `npm ci`, `npm run lint` e `npm run build` aprovados. O lint manteve cinco warnings históricos de Fast Refresh; o build manteve apenas o aviso de chunk principal acima de 500 kB.
- `mvn -B verify` aprovado: 33 testes, zero falhas/erros e cinco testes Testcontainers ignorados localmente por Docker indisponível.
- GitHub Actions run `37031485540` no commit funcional `39a8248`: jobs `frontend` e `backend-java` concluídos com sucesso.
- O frontend está estabilizado para a próxima fase. A homologação E2E React/Java/PostgreSQL continua deliberadamente pendente.


## Homologação E2E automatizada — 2026-10-02

- Suíte Playwright adicionada em `E2E/`, executando Chromium headless contra frontend React real, backend Java real e PostgreSQL 16 efêmero.
- Workflow CI passou a possuir três jobs: `frontend`, `backend-java` e `e2e`.
- Durante a homologação o E2E encontrou duas falhas reais:
  1. mutações do frontend recebiam 403 por incompatibilidade do tratamento CSRF de SPA; corrigido com bootstrap `/auth/csrf` e `SpaCsrfTokenRequestHandler`;
  2. após cadastrar uma criança com sucesso, a listagem local não era recarregada; corrigido o callback de sucesso para refazer a consulta.
- O teste existente de autenticação foi ajustado para validar o fluxo CSRF real por cookie + header, sem remover a proteção.
- GitHub Actions run `37037277203` no commit `f264d8320693ec376affd67d63aba6b129f2783f`: `frontend: success`, `backend-java: success`, `e2e: success`.
- O fluxo automatizado cobre cadastro/login por role, criança, meta, progresso, sessão, token/QR, consentimento/vínculo, replay, IDOR básico, conexão profissional, dashboards e desvinculação.
- `main` e `backup/pre-refactor-java-20261001-1408` permanecem em `13df172543a633ea0e8c11b054533d0a0d71f4d7`.
- NestJS continua preservado e nenhuma migração real de banco foi executada.

A refatoração está tecnicamente homologada no escopo funcional automatizado da Fase 2. Isso não elimina as pendências de produção, revisão jurídica, threat model/pentest nem a trilha manual de testes reservada ao aprendizado.
