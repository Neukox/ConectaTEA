# OpenAPI e Swagger UI

## Objetivo e implementação

A API Java publica contrato OpenAPI 3 navegável com `springdoc-openapi-starter-webmvc-ui` 2.8.13, compatível com Spring Boot 3.5. A configuração central está em `OpenApiConfig` e identifica a API como **ConectaTEA API**, versão 1.0.

Com o backend local na porta padrão e context path `/api`, as URLs verificadas pelo pipeline são:

- Swagger UI: `http://localhost:3000/api/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:3000/api/v3/api-docs`
- atalho configurado da UI: `http://localhost:3000/api/docs`

O GitHub Actions run `37053545940` confirmou HTTP 200 para o JSON e para `/api/swagger-ui/index.html`; a validação também exigiu `openapi`, `info`, `paths` e `components.securitySchemes.cookieAuth` no documento.

## Autenticação e CSRF

O contrato usa o security scheme `cookieAuth`, correspondente ao cookie HttpOnly `jwt`. Não existe autenticação Bearer para o cliente.

Fluxo real:

1. `POST /api/auth/login` com email e senha fictícios de uma conta local; a resposta cria `jwt`.
2. `GET /api/auth/csrf`; a resposta/cookie fornece o token CSRF.
3. Em POST, PUT, PATCH e DELETE, enviar o valor do cookie `XSRF-TOKEN` no header `X-XSRF-TOKEN`, mantendo cookies na mesma sessão.

A UI não desabilita CSRF. Dependendo das limitações do navegador/Swagger UI para cookies HttpOnly, operações autenticadas podem ser mais práticas pelo frontend ou por cliente HTTP com cookie jar; o JSON continua sendo a referência navegável.

## Erros e limites

O `ApiExceptionHandler` padroniza validação 400, autenticação 401, autorização 403, ausência 404 e conflito 409. Fluxos específicos também podem produzir 410 e o rate limiter produz 429. Erros inesperados permanecem 500; isso não significa que todo endpoint produza todos os códigos.

Swagger documenta o contrato, mas não substitui testes E2E, ownership, concorrência ou homologação funcional humana.

## Recuperação de senha

O grupo **Autenticação** expõe duas operações públicas:

```text
Usuário → POST /auth/password/forgot → token aleatório de 256 bits
                                      → SHA-256 no PostgreSQL
                                      → PasswordResetNotifier
                                      → e-mail (adaptador futuro)

Usuário → POST /auth/password/reset → nova senha BCrypt + consumo do token
```

`forgot` recebe `{email}` e sempre retorna a mesma mensagem neutra, inclusive para conta ausente ou inativa, evitando enumeração. A rota dispensa JWT e CSRF porque inicia uma recuperação sem sessão; seu contrato contém explicitamente `security: []`. A notificação é agendada depois do commit e não depende sincronicamente do futuro provedor. Há limite local padrão de cinco pedidos por minuto por IP (`429`, `Retry-After: 60`). Em múltiplas instâncias esse limite não é global.

`reset` recebe `{token,newPassword}` e também declara `security: []`. O token expira em 30 minutos por padrão, é de uso único e pedidos novos invalidam tokens ativos anteriores. Apenas o hash SHA-256 é armazenado, portanto um vazamento do banco não fornece diretamente o segredo enviado no link. Token ausente, expirado, usado ou invalidado produz o mesmo erro `400` (`INVALID_PASSWORD_RESET_TOKEN`). Após sucesso, sessões JWT anteriores à troca deixam de autenticar e nenhum JWT novo é emitido automaticamente.

`PasswordResetNotifier` é a porta independente de fornecedor. O adaptador atual é silencioso (`noop`) e não registra token ou destinatário; Brevo não foi integrada nesta fase. Uma integração futura implementará a interface e substituirá o bean sem alterar o serviço. A URL base vem de `FRONTEND_PASSWORD_RESET_URL`.

## Controle por ambiente

Desenvolvimento habilita documentação por padrão. Para desativar em produção:

```text
OPENAPI_ENABLED=false
SWAGGER_UI_ENABLED=false
```

Os endpoints de documentação são públicos quando habilitados; endpoints de negócio mantêm autenticação e autorização. A decisão de exposição em produção deve ser explícita.
