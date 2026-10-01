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
| Auditoria/histórico | não funcional | apenas schema | n/a | pendente | não iniciado |

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
