# OpenAPI e Swagger UI

## Objetivo e implementação

A API Java publica contrato OpenAPI 3 navegável com `springdoc-openapi-starter-webmvc-ui` 2.8.13, compatível com Spring Boot 3.5. A configuração central está em `OpenApiConfig` e identifica a API como **ConectaTEA API**, versão 1.0.

Com o backend local na porta padrão e context path `/api`, as URLs verificadas pelo pipeline são:

- Swagger UI: `http://localhost:3000/api/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:3000/api/v3/api-docs`
- atalho configurado da UI: `http://localhost:3000/api/docs`

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

## Controle por ambiente

Desenvolvimento habilita documentação por padrão. Para desativar em produção:

```text
OPENAPI_ENABLED=false
SWAGGER_UI_ENABLED=false
```

Os endpoints de documentação são públicos quando habilitados; endpoints de negócio mantêm autenticação e autorização. A decisão de exposição em produção deve ser explícita.
