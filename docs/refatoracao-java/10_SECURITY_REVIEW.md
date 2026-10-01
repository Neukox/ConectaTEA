# Security review

JWT sem fallback, BCrypt, cookie HttpOnly/Secure configurável, CORS explícito, CSRF cookie/token, validação e erros sem stack trace. IDs do ator vêm do principal. Crianças, metas e sessões exigem vínculo ativo. Tokens são armazenados como SHA-256, expiram e são bloqueados pessimisticamente ao consumir.

Pendente antes de produção: rate limit distribuível no login, revisão jurídica, rotação de todos os segredos históricos, threat model e pentest.

