# Registro histórico do plano de migração Prisma para Java

## Decisão final

O usuário confirmou que **não existem dados reais no ambiente NestJS/Prisma que precisem ser preservados**. Portanto, nenhuma migração operacional será executada.

Este arquivo permanece apenas como evidência de que o risco foi analisado. Não serão criados ETL, importadores, jobs de cópia, camada de compatibilidade ou seeds que simulem dados reais.

## Estado do banco Java

O PostgreSQL utilizado pelo backend Java começa com schema integralmente controlado pelas migrations Flyway V1, V2 e V3. Hibernate valida o schema com `ddl-auto=validate`; não cria nem atualiza tabelas automaticamente.

Os mapeamentos históricos eram: usuários, profissionais, crianças, vínculos, metas, progresso, sessões, conexões e auditoria para suas tabelas Java; os recursos da Fase 3 para `locais_atendimento`, `redes_sociais`, `areas_atuacao` e `areas_atuacao_profissionais`.

Como não há dados reais, esse mapeamento não gera atividade operacional. O estado anterior pode ser consultado na branch `backup/pre-remocao-nestjs`.

## Catálogos

Nenhum catálogo de áreas será inventado. Caso surja requisito real aprovado, os valores deverão ser definidos pelo domínio e introduzidos por migration Flyway ou mecanismo administrativo explicitamente projetado e testado.
