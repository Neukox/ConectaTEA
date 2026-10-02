# ConectaTEA

Plataforma para acompanhamento de crianças com TEA, conectando responsáveis e profissionais.

## Arquitetura atual

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

## Execução local no Windows

Pré-requisitos: Docker, JDK 21+ e Node.js 22.

1. Defina as variáveis descritas em `BackendJava/.env.example`, usando segredos locais próprios.
2. Suba o banco:

```powershell
docker compose up -d postgres
```

3. Inicie o backend em outro terminal:

```powershell
cd BackendJava
.\mvnw.cmd spring-boot:run
```

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

## Validação

```powershell
cd Frontend
npm.cmd ci
npm.cmd run lint
npm.cmd run build

cd ..\BackendJava
.\mvnw.cmd -B verify
```

Consulte `docs/refatoracao-java/18_OPENAPI_SWAGGER.md` para testar autenticação e CSRF no Swagger e `docs/refatoracao-java/STATUS.md` para o estado consolidado.
