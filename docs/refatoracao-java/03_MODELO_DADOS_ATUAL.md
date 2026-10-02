# Modelo de dados

O Prisma final possui User, Profissional, Crianca, perfis auxiliares, vínculos, ConexaoProfissional, Sessoes, Meta, Progresso, AuditLog, HistoricoVinculos, Consentimento e TokenVinculo.

O modelo Java separa vínculo de responsável e permite criança provisória sem conta artificial. IDs novos são `BIGINT`; tabelas usam snake_case e enums são strings. A migration Prisma inicial tardia e migrations posteriores possuem operações potencialmente incompatíveis com dados existentes; por isso V1 cria um schema-alvo novo e a migração de dados será um procedimento separado com backup/contagens/FKs.

## Recursos profissionais — Fase 3

`Usuario 1—1 Profissional 1—N LocalAtendimento`, `Profissional 1—N RedeSocial` e `Profissional N—N AreaAtuacao` por `AreaAtuacaoProfissional`. A associação permanece entidade/tabela explícita com PK composta. A V3 usa `BIGINT`, snake_case, timestamps e FKs; apagar profissional remove recursos próprios e associações, enquanto apagar área referenciada é restrito.

