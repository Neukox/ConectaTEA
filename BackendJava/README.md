# Backend Java do ConectaTEA

Backend principal em Java 21 e Spring Boot 3.5.16, organizado como monólito modular.

## Pré-requisitos

- JDK 21+
- Docker, ou PostgreSQL 15+

## Configuração e execução

Copie apenas os nomes de `.env.example` para o seu gerenciador de ambiente. Nunca versione `.env`.

```powershell
docker compose up -d postgres
cd BackendJava
.\mvnw.cmd spring-boot:run
```

O servidor usa `http://localhost:3000/api`, health em `/api/actuator/health`, Swagger UI em `/api/swagger-ui/index.html` (atalho `/api/docs`) e OpenAPI JSON em `/api/v3/api-docs`.

## Banco e migrations

Flyway é a única fonte de evolução do schema. Hibernate usa `ddl-auto=validate`; não altere para `update` em produção.

## Testes e build

```powershell
.\mvnw.cmd test
.\mvnw.cmd verify
```

Testes de integração usam PostgreSQL via Testcontainers quando Docker está disponível.

## Segurança

- `JWT_SECRET` é obrigatório e precisa ter ao menos 32 caracteres.
- JWT fica em cookie HttpOnly; o frontend envia credenciais.
- CSRF usa cookie/token do Spring Security.
- CORS é configurado por `FRONTEND_ORIGINS`.
- autorização clínica exige vínculo ativo, não apenas role.
- logs não devem conter JWT, senha, diagnóstico completo ou payload clínico.

Swagger documenta o cookie HttpOnly `jwt` e mantém CSRF ativo. Use `GET /api/auth/csrf` e envie `X-XSRF-TOKEN` nas operações mutáveis. Em ambientes onde a documentação não deve ser exposta, defina `OPENAPI_ENABLED=false` e `SWAGGER_UI_ENABLED=false`.

Antes do uso com dados reais, o texto e a trilha de consentimento precisam de revisão jurídica.

