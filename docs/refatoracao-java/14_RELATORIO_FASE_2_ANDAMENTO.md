# Relatório de andamento — Fase 2

Data do relatório: 2026-10-01
Branch: `refactor/backend-java`
Último commit ao iniciar este relatório: `6cd66af`
(`refactor(conexoes): padroniza solicitações e respostas`).

Este relatório registra o trabalho realizado nesta execução e o que continua
pendente. A Fase 2 ainda não está concluída.

## Estado do Git

- Branch ativa: `refactor/backend-java`.
- `main` não foi alterada nem recebeu merge.
- A branch `backup/pre-refactor-java-20261001-1408` não foi alterada por este
  trabalho.
- Nenhum push foi realizado; portanto não há novo resultado remoto do GitHub
  Actions para esta sequência de commits.
- No momento em que o relatório foi criado, havia duas alterações não commitadas:
  `BackendJava/src/main/java/br/com/conectatea/dashboard/api/DashboardController.java`
  e `docs/refatoracao-java/STATUS.md`. Elas pertencem à Fase 2.11 e ainda não
  passaram por compilação ou teste nesta execução.
- NestJS foi preservado. Nenhuma migração real de banco foi executada.

## Mudanças realizadas e commits

| Subfase | Mudanças | Commit | Evidência/limite |
|---|---|---|---|
| 2.1 CI | Corrigido o modo Git de `BackendJava/mvnw` de `100644` para `100755`; atualizado baseline e status. | `cb00caa` | `mvnw.cmd test` e `verify` passaram com 6 testes na ocasião. O workflow remoto ainda precisa rodar após push. |
| 2.2 Testes base | Removida configuração de H2 do perfil de teste; criada base Testcontainers com PostgreSQL 16, Flyway e Hibernate `validate`; cobertura de schema V1, índice case-insensitive, enum e query JPA. | `56aa32f` | `verify` passou na máquina local; testes PostgreSQL foram ignorados porque Docker Engine estava indisponível. |
| 2.3 Auth/segurança | JWT passa a consultar usuário atual no banco, rejeitando conta removida/desativada e usando role atual; JSON de erro global e respostas 401/403 padronizadas; adicionados testes de filtro e MockMvc para login, cookie HttpOnly, validação e CSRF. | `1677900` | `verify` passou: 17 encontrados, 13 executados, 4 Testcontainers ignorados. |
| 2.4 Usuários/profissionais | Registro retorna `{message,user}`; senha mínima de 8 permanece canônica; endpoints de perfil passam a usar `/profissionais`, `/profissionais/me` e `/profissionais/{id}`; listagem/search e ocultação de perfil inativo; adicionados testes MockMvc. Recursos `LocalAtendimento`, `RedeSocial`, `AreaAtuacao` e `AreaAtuacaoProfissional` foram declarados temporariamente no NestJS na matriz de paridade. | `7745444` | `mvn test` passou: 23 encontrados, 19 executados e 4 Testcontainers ignorados. Frontend ainda não foi migrado. |
| 2.5 Crianças | DTOs separados de criação/atualização; contato `responsavelPendente` persistido sem criar conta temporária; resposta `{message,crianca}`, lista `{items,total}`; autorização nega criança arquivada; ADR-007 registra a decisão de não expor arquivo histórico por rotas comuns. | `570d95a` | 4 testes focados passaram; testes PostgreSQL e alinhamento React permanecem pendentes. |
| 2.6 Vínculos/consentimento/QR | Revinculação reativa vínculo desligado; replay retorna 410; expiração é persistida como `EXPIRADO`; cancelamento seguro de token; QR PNG é gerado sob demanda; versão/finalidade do consentimento vêm de configuração; teste concorrente Testcontainers criado. | `a9b11ab` | `mvn test` passou: 31 encontrados, 26 executados e 5 Testcontainers ignorados localmente. Concorrência ainda precisa executar com Docker. Revogação de consentimento está fora da fase. |
| 2.7 Metas | DTOs separados; `criancaId` apenas no create; update aceita data inicial passada; resumo e filtros reais; status temporal na leitura e janela de vencimento de hoje até sete dias. | `8d622f9` | 7 testes unitários de metas passaram. Regra ainda requer validação clínica futura. |
| 2.8 Progresso | Controller passa a usar `ProgressoRepository`; recentes e evolução usam histórico; resumo camelCase, filtros semestral/anual e autorização por criança. | `f3eb50a` | Código compilou via `test -DskipTests`; faltam testes específicos do controller e integração. |
| 2.9 Sessões | DTOs próprios; contrato `tipo`, `dataHora`, `duracao`, `criancaId`; resumo e filtros; responsável recebe somente sessões das crianças vinculadas; escritas profissionais exigem vínculo ativo. | `abf89ed` | Compilou via `test -DskipTests`; faltam testes específicos e alinhamento React. |
| 2.10 Conexões | `POST /conexoes` com `{destinatarioId}`, resposta com `{status}`, filtros enviados/recebidos/status, validação de destinatário e autoconexão. | `6cd66af` | Compilou via `test -DskipTests`; faltam MockMvc e teste concorrente AB/BA em PostgreSQL. |
| 2.11 Dashboard | Troca de entidades e mapas por DTOs compatíveis com a UI; métricas mensais e dados vinculados para responsável. | Incluído no commit deste relatório | A compilação (`mvnw test -DskipTests`) passou. Testes de comportamento continuam pendentes. |

## Arquivos e áreas já modificados

- CI e baseline: `BackendJava/mvnw` (modo Git),
  `docs/refatoracao-java/FASE_2_BASELINE.md` e
  `docs/refatoracao-java/STATUS.md`.
- Testes: perfil de teste, integração Testcontainers/Flyway, testes de auth,
  usuário, profissional, criança, autorização, vínculo e metas sob
  `BackendJava/src/test`.
- Backend: controllers e serviços de auth, usuário, profissional, criança,
  vínculo/consentimento, metas, progresso, sessões, conexões e dashboard; filtro
  JWT, autorização relacional, handler global e configuração de consentimento.
- Decisões: `docs/refatoracao-java/adr/ADR-007-criancas-arquivadas.md`.
- Documentação atualizada: matriz de paridade, plano de testes, revisão de
  segurança e status.

## Validação observada

- O modo Git do wrapper foi corrigido e o Maven `test`/`verify` passou na fase
  inicial.
- Um `verify` posterior às correções de auth passou com 17 testes encontrados,
  13 executados e 4 testes Testcontainers ignorados.
- Em vínculo, 31 testes foram encontrados, 26 executados e 5 testes de banco
  ignorados localmente.
- Os sete testes focados de regra de metas passaram.
- Progresso, sessões e conexões compilaram em chamadas com `-DskipTests`; isso
  não prova seus comportamentos em execução.
- A primeira tentativa de validação do dashboard foi interrompida. Em seguida,
  `mvnw -B -f BackendJava/pom.xml test -DskipTests` compilou código principal e
  testes com sucesso; não executou testes.
- Docker Engine não estava acessível nesta máquina. Flyway sobre PostgreSQL
  limpo, constraints via PostgreSQL e teste concorrente ainda dependem de uma
  execução real Testcontainers.
- O CI remoto não foi consultado/atualizado após os commits, pois a branch não
  foi enviada ao remoto.
- Nenhum teste do frontend foi repetido nesta execução; não há alegação de lint,
  build ou integração React aprovados para as mudanças recentes.

## Trabalho que falta

### Concluir o dashboard (2.11)

- Retomar a compilação de `DashboardController` e corrigir eventuais erros.
- Confirmar métricas com a UI e suas fontes de dados; adicionar testes MockMvc.
- Substituir agregações em memória por queries focadas quando aplicável.
- Testar que dashboard de responsável só inclui crianças vinculadas.

### Auditoria e histórico (2.12)

- Implementar `AuditLog`/repository/service e histórico de vínculo funcional.
- Registrar login/logout, criação/encerramento de vínculo, geração/uso/expiração/
  cancelamento de token e eventos de conexão.
- Garantir que senhas, JWT e payload clínico integral não sejam gravados.
- Criar testes desses registros.

### Alinhar o frontend (2.13)

- Atualizar `authApi.ts` para mínimo de senha de 8 e envelope de usuário.
- Migrar clientes de profissionais das rotas `/private/*`, `/users/:id` e outras
  rotas antigas para `/profissionais/me` e rotas canônicas.
- Alinhar cadastro/listagem/update de crianças e geração de token para
  `POST /criancas/{id}/tokens-vinculo`.
- Padronizar metas, progresso, sessões, conexões e dashboard em camelCase e nas
  rotas/formatos definidos no Java.
- Consolidar o acesso HTTP em `apiClient.ts` e retirar usos funcionais legados.
- Reexecutar lint e build do frontend.

### E2E e cobertura completa (2.14)

- Adicionar MockMvc para as controllers previstas, cobrindo autenticação,
  autorização por role, IDOR, 404, 400 e conflitos.
- Executar Testcontainers com Docker: V1 limpa, constraints, queries JPA,
  concorrência de token, replay, expiração e solicitações opostas AB/BA.
- Completar testes de sessões, progresso, conexões e dashboard.
- Automatizar fluxo principal profissional/responsável, consentimento, vínculo,
  metas, progresso, sessão, acesso autorizado e replay negado.
- Executar `./mvnw -B test` e `./mvnw -B verify` no ambiente Linux/CI com Docker.

### Documentação final (2.15)

- Criar `11_PLANO_MIGRACAO_DADOS_PRISMA_PARA_JAVA.md` sem executar migração.
- Criar `12_API_CONTRACT_JAVA_CANONICO.md` cobrindo método, rota, papel,
  request/response, erros, autorização, consumidor frontend e teste.
- Atualizar matriz, plano de testes, revisão de segurança e status com critérios
  reais de implementado/testado/homologado.
- Criar `13_RESULTADO_FASE_2.md` somente quando os critérios de aceite forem
  comprovados.

### CI, revisão e entrega

- Fazer push somente de `refactor/backend-java` para disparar GitHub Actions;
  verificar backend e frontend como `success`.
- Resolver qualquer falha reportada pelo runner, em especial inicialização do
  PostgreSQL Testcontainers e compatibilidade Flyway/JPA.
- Executar lint/build React e `mvnw verify` após todas as mudanças.
- Revisar `git status`, confirmar `main` e backup intactas, NestJS preservado e
  branch atualizada. Não fazer merge na `main`.

## Critério de conclusão

A Fase 2 permanece **em andamento**. Os requisitos de CI remoto verde, execução
PostgreSQL real, cobertura completa de controllers, frontend alinhado, auditoria,
fluxo E2E e documentação final ainda não foram demonstrados. Os commits listados
representam incrementos locais na branch de trabalho, não homologação integral da
migração.
