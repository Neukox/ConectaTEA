# Status da Fase 2 — backend Java

Atualizado em 2026-10-01. Esta página é o estado consolidado mais recente; as notas de risco abaixo permanecem ativas mesmo com CI verde.

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
| 2.13 Frontend | implementado; não homologado | React 19/Tailwind 4 preservados; clientes, DTOs, autenticação, vínculos, dashboards e módulos migrados ao contrato Java. Lint/build locais e verify Java aprovados; E2E React/Java permanece pendente. |
| 2.14 E2E/cobertura | pendente | Fluxo profissional-responsável completo ainda não foi validado de ponta a ponta. |
| 2.15 Documentação final | parcial | Contrato canônico sendo consolidado nesta execução; plano de migração de dados e resultado final ainda faltam. |

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
6. Executar futuramente o plano `11_PLANO_MIGRACAO_DADOS_PRISMA_PARA_JAVA.md` somente após ensaio e aprovação; nenhuma migração real ocorreu. Manter `LocalAtendimento`, `RedeSocial`, `AreaAtuacao` e `AreaAtuacaoProfissional` no NestJS até contrato e migração próprios.
7. Atualizar matriz, plano de testes e security review com evidência por requisito; criar `13_RESULTADO_FASE_2.md` somente após comprovar os critérios finais.
8. Revisar rate limit, secrets, threat model, pentest e consentimento com revisão jurídica antes de produção.

O backend está **estabilizado para migração do frontend**, mas a Fase 2 continua em andamento e não homologada. CI/Testcontainers, integração React, cobertura completa, E2E e validação jurídica continuam sendo evidências distintas.

## Fase 2.13 — alinhamento do frontend (2026-10-02)

- React 19, TypeScript 5, Vite 7, Tailwind CSS 4, Shadcn/Radix e a identidade visual foram mantidos.
- apiClient é o único cliente Axios configurado, com cookies, withCredentials e withXSRFToken; o alias httpClient e o uso funcional de token em localStorage foram removidos.
- Auth usa cookie HttpOnly e restaura a sessão por /auth/me; registro exige senha mínima de 8 caracteres.
- Profissionais, usuários, crianças, tokens/QR, vínculos, metas, progresso, sessões, conexões e dashboards usam rotas e JSON canônicos Java em camelCase.
- O dashboard do responsável e a listagem/desvinculação de suas crianças agora são próprios; o fluxo simulado de vínculo foi substituído por preview e confirmação reais.
- Validação local: npm run lint sem erros (5 avisos preexistentes de Fast Refresh em arquivos não alterados), npm run build aprovado e mvn -B verify aprovado. O CI do SHA final deve ser registrado após o push.
- Permanecem sem homologação: E2E com banco/backend em execução, leitura de QR em navegadores sem BarcodeDetector (entrada manual continua disponível) e recursos legados LocalAtendimento, RedeSocial, AreaAtuacao e AreaAtuacaoProfissional.
