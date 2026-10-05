# ConectaTEA

Plataforma para acompanhamento de crianças com TEA, conectando responsáveis e profissionais.

## TL;DR

O ConectaTEA organiza o acompanhamento terapêutico de crianças com TEA. Responsáveis acompanham as crianças às quais estão vinculados, enquanto profissionais administram atendimentos, metas e evolução com controle relacional de acesso.

O runtime atual usa React 19 e uma API Java 21/Spring Boot 3.5 com PostgreSQL. O backend legado NestJS/Prisma foi removido. A recuperação segura de senha está implementada no backend; as telas e o envio real de e-mail permanecem planejados.

## Arquitetura

```text
Browser → React 19 / TypeScript / Vite → REST → Java 21 / Spring Boot → JPA / Hibernate → PostgreSQL
                                               ├─ Spring Security
                                               ├─ Flyway
                                               └─ OpenAPI / Swagger UI
```

- Frontend: React, TypeScript, Vite, Tailwind, Axios e TanStack Query.
- Backend: Java 21 e Spring Boot 3.5, em monólito modular.
- Banco e schema: PostgreSQL e Flyway; Hibernate usa `ddl-auto=validate`.
- Autenticação: JWT no cookie HttpOnly `jwt`, com proteção CSRF para a SPA.
- E2E: Playwright contra React, Spring Boot e PostgreSQL reais.
- CI: GitHub Actions com jobs `frontend`, `backend-java` e `e2e`.

O antigo backend NestJS/Prisma foi removido após a migração integral para Java. Seu estado anterior permanece recuperável em `backup/pre-remocao-nestjs` e nos documentos históricos.

## Funcionalidades atuais

- cadastro, autenticação e gestão da própria conta;
- perfis profissionais, crianças, vínculos e consentimento;
- metas, progresso, sessões, conexões e dashboards por papel;
- recuperação de senha no backend, com token hashado e de uso único;
- migrations Flyway e documentação navegável da API.

## Segurança

A API usa JWT em cookie HttpOnly, CSRF, BCrypt, autorização por papel e vínculo, rate limit e auditoria. Tokens de vínculo e recuperação não são persistidos em texto puro; o token de recuperação expira, é invalidado por nova solicitação e só pode ser consumido uma vez. Esses controles não representam certificação de segurança ou conformidade legal.

## Estrutura do projeto

```text
Frontend/      aplicação React
BackendJava/   API Spring Boot
docs/          arquitetura, contratos e decisões
.github/       workflows de CI
E2E/           testes Playwright
```

## Desenvolvimento local

Pré-requisitos: Docker, JDK 21+ e Node.js 22.

1. Para sobrescrever os valores locais padrão do Docker, crie um `.env` na raiz
   a partir de `BackendJava/.env.example` e use segredos locais próprios.
2. Suba o banco (este comando não exige `JWT_SECRET`):

```powershell
docker compose up -d postgres
```

Por padrão, o PostgreSQL do projeto é publicado em `localhost:5433`, evitando
conflito com uma instalação local na porta `5432`. Use `POSTGRES_PORT` para
sobrescrever essa porta.

3. Inicie o backend em outro terminal:

```powershell
cd BackendJava
.\run-local.ps1
```

O script define as credenciais locais e a porta `5433`, mesmo que o terminal
tenha variáveis antigas apontando para outro PostgreSQL.

4. Verifique:

- Health: `http://localhost:3000/api/actuator/health`
- Swagger UI: `http://localhost:3000/api/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:3000/api/v3/api-docs`

5. Inicie o frontend:

```powershell
cd Frontend
npm.cmd ci
npm.cmd run dev
```

6. Abra `http://localhost:5173`.

## OpenAPI / Swagger

- Swagger UI: `http://localhost:3000/api/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:3000/api/v3/api-docs`

## Testes e CI

```powershell
cd Frontend
npm.cmd ci
npm.cmd run lint
npm.cmd run build

cd ..\BackendJava
.\mvnw.cmd -B verify
```

Consulte `docs/refatoracao-java/18_OPENAPI_SWAGGER.md` para testar autenticação e CSRF no Swagger e `docs/refatoracao-java/STATUS.md` para o estado consolidado.

## Roadmap curto

- Implementado: runtime Java, módulos atuais, segurança transversal, OpenAPI e backend de recuperação de senha.
- Em desenvolvimento: homologação contínua dos fluxos React/API.
- Planejado: provedor real de e-mail e telas de “Esqueci minha senha”/“Redefinir senha”.
