# Security review

## Controles implementados

- JWT sem fallback, BCrypt e cookie HttpOnly/Secure configurável.
- CORS explícito e proteção CSRF pelo padrão cookie/token da SPA.
- IDs do ator vêm do principal autenticado.
- O filtro JWT consulta o usuário atual no banco antes de criar o contexto e
  rejeita usuário inexistente ou desativado, mesmo com JWT assinado e válido.
- Respostas de autenticação e autorização usam JSON padronizado, sem stack trace.
- Crianças, metas e sessões devem exigir vínculo ativo; a cobertura de IDOR por
  módulo ainda precisa ser ampliada nesta fase.
- Tokens de vínculo são armazenados como SHA-256, expiram e usam bloqueio
  pessimista durante o consumo.

## Evidências automatizadas da Fase 2.3

- JWT de usuário desativado não cria autenticação.
- Claims antigas não prevalecem sobre e-mail/role atuais do banco.
- Endpoint protegido sem autenticação retorna 401 JSON.
- POST protegido sem CSRF retorna 403; com token CSRF no header prossegue.
- Login gera cookie JWT HttpOnly.

## Pendências antes de produção

Rate limit distribuível no login, revisão jurídica, rotação de todos os segredos
históricos, threat model, pentest e conclusão dos testes relacionais/IDOR.
