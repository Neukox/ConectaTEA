# Arquitetura atual

React 19 consome REST por Axios. NestJS 10 aplica guards e acessa PostgreSQL com Prisma. A autenticação atual mistura cookie e Bearer/localStorage. Há regras de vínculo duplicadas nos guards e services.

O estado de transição mantém NestJS como referência, adiciona Spring Boot em paralelo e aponta o frontend para o contrato Java após validação.

