# Plano de remoção definitiva do NestJS/Prisma

> **Plano executado na Fase 4:** pré-condições verificadas, backup publicado e backend legado removido. O texto abaixo é preservado como registro da estratégia.

Após aprovação funcional e documental, uma Fase 4 poderá remover `Backend/`, incluindo fontes NestJS, dependências, configuração, schema e migrations Prisma. Referências históricas úteis devem permanecer nos documentos ou em tag/branch protegida, não no runtime.

## Pré-condições

- jobs `frontend`, `backend-java` e `e2e` verdes no SHA candidato;
- teste PostgreSQL + Java + React aprovado explicitamente pelo usuário;
- busca sem consumer, URL, Docker, CI ou E2E dependente do NestJS;
- migração ensaiada com contagens/checksums, backup e restauração comprovados;
- documentação aprovada e janela operacional definida.

## Estratégia, rollback e riscos

Inventariar `Backend/package.json`, fontes, Dockerfiles, schema e migrations. Criar tag e backup verificado no SHA anterior; remover em branch e commit isolados; executar a pipeline sem reescrever histórico. O rollback é reverter o commit/restaurar a tag. Não copiar dados de volta automaticamente. Riscos incluem perda de referência, catálogo incompleto, órfãos/duplicados, timezone e segredos históricos.

Este plano não autoriza exclusão, migração real, PR ou merge. Depende de `TESTE FUNCIONAL LOCAL APROVADO` e `DOCUMENTAÇÃO APROVADA`.
