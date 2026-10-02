# Resultado final da refatoração Node para Java

## Cronologia

1. **Origem — NestJS/Prisma:** backend TypeScript com contrato divergente, autorização incompleta, migrations arriscadas e consumers duplicados.
2. **Fase 1 — análise:** inventário de módulos, dados, contratos, riscos e arquitetura Java alvo.
3. **Fase 2 — núcleo Java:** Spring Boot, Flyway, segurança, módulos de domínio, frontend Java API e E2E React/Java/PostgreSQL. O E2E revelou e permitiu corrigir CSRF da SPA e atualização local da lista de crianças.
4. **Fase 3 — perfil profissional:** locais, redes sociais, catálogo e vínculos de áreas migrados com ownership, Flyway V3 e E2E.
5. **Finalização — Fase 4:** OpenAPI/Swagger consolidado, confirmação de ausência de dados reais, backup `backup/pre-remocao-nestjs` e remoção definitiva do backend Node/Prisma.

## Decisões finais

- Java 21/Spring Boot é o único backend.
- PostgreSQL/Flyway controla o schema; nenhuma migração de dados foi necessária.
- autenticação usa JWT em cookie HttpOnly e CSRF permanece ativo.
- IDs de ownership derivam do principal autenticado.
- a associação profissional/área permanece explícita.
- não foram inventados seeds de áreas ou endpoints administrativos.
- OpenAPI usa o cookie real, não Bearer fictício, e pode ser desabilitado por ambiente.

## Estado final

Frontend, backend Java, Flyway, E2E e CI formam o runtime oficial. O código NestJS, Prisma e suas configurações operacionais foram removidos; relatórios históricos permanecem para auditoria. A validação funcional humana e a revisão documental ainda são obrigatórias antes do PR final.

GitHub Actions run `37053545940`, SHA `3c3ab7a`: jobs `frontend`, `backend-java` e `e2e` concluídos com sucesso. O job E2E validou PostgreSQL/Flyway, OpenAPI JSON, Swagger UI e Playwright integrado.

A grande trilha educacional JUnit/Mockito/MockMvc não foi automatizada nesta execução e será conduzida posteriormente com o usuário.
