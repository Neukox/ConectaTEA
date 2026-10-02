# ADR-003: Autenticação por cookie

Aceito. JWT curto em cookie HttpOnly, Secure em produção e SameSite configurável. CSRF usa cookie/token do Spring; Bearer/localStorage deixa de ser contrato canônico.
