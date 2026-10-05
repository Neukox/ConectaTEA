# Backend Java do ConectaTEA

Backend principal em Java 21 e Spring Boot 3.5.16, organizado como monólito modular.

## Pré-requisitos

- JDK 21+
- Docker, ou PostgreSQL 15+

## Configuração e execução

Copie apenas os nomes de `.env.example` para o seu gerenciador de ambiente. Nunca versione `.env`.

```powershell
cd BackendJava
.\run-local.ps1
```

O script inicia o PostgreSQL do Compose e força a conexão local pela porta
`5433`, evitando variáveis antigas do terminal ou outro PostgreSQL na `5432`.

O servidor usa `http://localhost:3000/api`, health em `/api/actuator/health`, Swagger UI em `/api/swagger-ui/index.html` (atalho `/api/docs`) e OpenAPI JSON em `/api/v3/api-docs`.

## Banco e migrations

Flyway é a única fonte de evolução do schema. Hibernate usa `ddl-auto=validate`; não altere para `update` em produção.

## Testes e build

```powershell
.\mvnw.cmd test
.\mvnw.cmd verify
```

Testes de integração usam PostgreSQL via Testcontainers quando Docker está disponível.

## Recuperação de senha

`POST /api/auth/password/forgot` aceita um e-mail e sempre responde de forma neutra; `POST /api/auth/password/reset` recebe `token` e `newPassword` (8 a 72 caracteres). Ambos são públicos e dispensados de CSRF, pois atendem clientes sem sessão prévia. O pedido é limitado por IP a cinco chamadas por minuto em cada instância.

Configure `PASSWORD_RESET_TOKEN_TTL` (padrão `PT30M`), `FRONTEND_PASSWORD_RESET_URL` e, se necessário, `PASSWORD_RESET_RATE_LIMIT_PER_MINUTE`. O serviço gera 256 bits aleatórios, persiste apenas SHA-256, invalida tokens ativos anteriores e usa bloqueio pessimista para consumo único.

`PasswordResetNotifier` isola a regra do provedor de e-mail. O adaptador atual é `NoOpPasswordResetNotifier`: mantém aplicação e CI funcionais sem expor o token, mas não envia mensagens. Testes unitários capturam a URL no mock; o teste de integração usa PostgreSQL/Testcontainers para validar concorrência. A integração real com Brevo ainda não foi realizada.

## Segurança

- `JWT_SECRET` é obrigatório e precisa ter ao menos 32 caracteres.
- JWT fica em cookie HttpOnly; o frontend envia credenciais.
- CSRF usa cookie/token do Spring Security.
- CORS é configurado por `FRONTEND_ORIGINS`.
- autorização clínica exige vínculo ativo, não apenas role.
- logs não devem conter JWT, senha, diagnóstico completo ou payload clínico.
- tokens de recuperação nunca são persistidos ou registrados em texto puro.

Swagger documenta o cookie HttpOnly `jwt` e mantém CSRF ativo. Use `GET /api/auth/csrf` e envie `X-XSRF-TOKEN` nas operações mutáveis. Em ambientes onde a documentação não deve ser exposta, defina `OPENAPI_ENABLED=false` e `SWAGGER_UI_ENABLED=false`.

Antes do uso com dados reais, o texto e a trilha de consentimento precisam de revisão jurídica.

