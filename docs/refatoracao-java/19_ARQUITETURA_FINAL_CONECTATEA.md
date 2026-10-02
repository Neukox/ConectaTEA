# Arquitetura final do ConectaTEA

```text
Browser
  ↓
React / TypeScript / Vite
  ↓ HTTPS/REST
Spring Boot (monólito modular)
  ↓
Spring Security
  ↓
API → Application/Services → Domain → Repositories
  ↓
JPA / Hibernate
  ↓
PostgreSQL
```

## Componentes

O frontend mantém React, Vite, Axios central, TanStack Query, React Hook Form e Zod. O backend usa Java 21, Spring Boot 3.5 e módulos por domínio, com camadas `api`, `application`, `domain` e `infrastructure`. Não há microserviços nem runtime Node.

Flyway V1–V3 é a única fonte do schema PostgreSQL; Hibernate usa `ddl-auto=validate`. Os módulos cobrem autenticação, usuários, profissionais e perfil, crianças, vínculos/consentimento, metas, progresso, sessões, conexões, dashboards e auditoria.

## Segurança e operação

- JWT em cookie HttpOnly `jwt`, sem fallback de segredo.
- CSRF por cookie `XSRF-TOKEN` e header `X-XSRF-TOKEN`.
- CORS com origens explícitas e credenciais.
- autorização por role e relações/ownership para recursos sensíveis.
- token de vínculo hashado, expirável e consumido uma única vez com controle concorrente.
- auditoria sanitizada e rate limit local configurável.
- OpenAPI/Swagger controlável por ambiente.

O rate limit em memória não é global entre réplicas. A documentação pública deve ser desativada em produção quando não for necessária. Não há declaração de conformidade LGPD, pentest ou segurança produtiva certificada.

## Qualidade

Playwright valida Chromium → React → Spring Boot → PostgreSQL sem mocks. GitHub Actions executa frontend, Maven/Flyway e E2E. Testes pedagógicos aprofundados permanecem reservados para trabalho posterior com o usuário.
