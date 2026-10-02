# Matriz de paridade

| Módulo | NestJS | Java | Frontend | Testes | Status |
|---|---:|---:|---:|---:|---|
| Auth/Users | sim | contrato canônico | ajuste de senha pendente | MockMvc parcial | parcial |
| Profissionais | sim | rotas canônicas | rotas legadas pendentes de remoção | MockMvc parcial | parcial |
| Crianças | sim | inicial | contrato legado | pendente | parcial |
| Vínculos | divergente | inicial | contrato legado | concorrência pendente | parcial |
| Metas/Progresso | sim | inicial | divergente | unitário parcial | parcial |
| Sessões | sim | inicial | divergente | pendente | parcial |
| Dashboard | sim | inicial | divergente | pendente | parcial |
| Conexões | sim | inicial | divergente parcial | pendente | parcial |
| Auditoria/histórico | não funcional | eventos e histórico append-only | n/a | testes novos reservados à etapa manual | implementado, não homologado |

O backend Java principal está funcionalmente implementado para iniciar a migração do frontend. A classificação continua sem homologação porque não foram executados E2E nem integração React/Java. Recursos profissionais acessórios abaixo permanecem conscientemente no NestJS e não alteram o contrato Java congelado desta fase.

Nenhuma linha parcial autoriza desligar o NestJS.

## Recursos profissionais do Prisma legado

`LocalAtendimento`, `RedeSocial`, `AreaAtuacao` e
`AreaAtuacaoProfissional` não foram descartados. A decisão da Fase 2 é mantê-los
temporariamente no NestJS, porque ainda não há modelo, migration nem contrato Java
homologado para esses dados. A migração exige inventário e mapeamento no plano de
dados antes de qualquer desligamento do backend legado.

Critérios de mudança de status:

- **implementado:** contrato e regra presentes no código;
- **testado:** testes automatizados relevantes executados no banco-alvo;
- **homologado:** frontend integrado e fluxo E2E validado;
- **parcial:** qualquer requisito do módulo ainda está pendente.

## Atualização da paridade frontend — Fase 2.13

| Área | Paridade React/Java | Evidência | Limite |
|---|---|---|---|
| Auth e segurança HTTP | implementada | cookie HttpOnly, /auth/me, cliente único e XSRF | E2E pendente |
| Usuários/profissionais | implementada no contrato Java | /users/me, /profissionais/me e diretório canônico | acessórios de perfil seguem no NestJS |
| Crianças/tokens/vínculos | implementada | DTOs canônicos, QR/token, preview, consentimento e listagem real | homologação com câmera/backend pendente |
| Metas/progresso/sessões | implementada | camelCase, datas ISO, filtros e summaries Java | E2E pendente |
| Conexões/dashboards | implementada | rotas diretas e dashboards próprios por role | E2E pendente |

O status não é “homologado”: lint/build/verify comprovam consistência estática e testes backend, mas não substituem o fluxo integrado profissional–responsável.

## Revisão final de paridade do frontend

| Área | Estado após estabilização | Evidência/limite |
|---|---|---|
| Rotas e roles | corrigido | dashboards por role, rota plural de crianças e navegação visível auditados |
| Auth/HTTP | preservado e conferido | cookie HttpOnly, `/auth/me`, logout, CSRF e instância Axios única; E2E pendente |
| Crianças, token e vínculos | compatível | LocalDate/camelCase, POST de token e fluxo real; câmera depende de `BarcodeDetector` |
| Metas e progresso | compatível e estabilizado | update aguarda resposta real; caches e filtros relacionados corrigidos |
| Sessões | compatível e estabilizado | form separado do request e `dataHora` com offset local explícito |
| Conexões e dashboards | compatível | endpoints/DTOs canônicos; CI verde no run `37031485540` |

Nenhum recurso legado acessório foi reintroduzido no contrato Java. `LocalAtendimento`, `RedeSocial`, `AreaAtuacao` e `AreaAtuacaoProfissional` permanecem preservados somente no NestJS até fase futura própria.
