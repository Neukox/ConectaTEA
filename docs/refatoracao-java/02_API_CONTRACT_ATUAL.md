# Contrato atual e canônico

Rotas preservadas: `/auth/login|logout|me`, `/users/register`, `/criancas`, `/metas`, `/progresso`, `/sessoes`, `/dashboard` e `/conexoes`.

Rotas seguras novas: `/users/me`, `/profissionais/me`, `POST /criancas/{id}/tokens-vinculo`, `GET /vinculos/tokens/{codigo}/preview`, `POST /vinculos/confirmar`, `GET /vinculos/me` e `DELETE /vinculos/criancas/{id}`.

API usa camelCase, `LocalDate` como `YYYY-MM-DD` e timestamps ISO-8601. O preview nunca consome token.

