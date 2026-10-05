# Security review

## Estado consolidado atual

O runtime usa exclusivamente Spring Boot; NestJS/Prisma foram removidos. A autenticação usa JWT no cookie HttpOnly `jwt`, CSRF por `XSRF-TOKEN`/`X-XSRF-TOKEN`, ownership relacional contra IDOR, token de vínculo single-use, consentimento auditável e rate limit local. OpenAPI/Swagger não enfraquece esses controles e pode ser desativado por `OPENAPI_ENABLED=false` e `SWAGGER_UI_ENABLED=false`.

Swagger expõe metadados da API quando habilitado; em produção sua exposição deve ser decisão operacional explícita. Permanecem necessários threat model, pentest, rotação de segredos históricos e revisão jurídica. Este documento não declara conformidade LGPD nem segurança produtiva certificada.

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
- Tokens de recuperação têm 256 bits, somente o SHA-256 é persistido, expiram,
  são invalidados por novo pedido e usam bloqueio pessimista para consumo único.
- A solicitação de recuperação responde de forma neutra e tem rate limit local
  por IP. Em múltiplas réplicas, gateway ou armazenamento compartilhado ainda
  é necessário para um limite global.

## Evidências automatizadas da Fase 2.3

- JWT de usuário desativado não cria autenticação.
- Claims antigas não prevalecem sobre e-mail/role atuais do banco.
- Endpoint protegido sem autenticação retorna 401 JSON.
- POST protegido sem CSRF retorna 403; com token CSRF no header prossegue.
- Login gera cookie JWT HttpOnly.

## Revogação lógica de sessões

`usuarios.credentials_updated_at` registra a última mudança relevante de credenciais. O reset atualiza senha, timestamp e consumo do token na mesma transação. O filtro compara o `iat` do JWT, normalizado à precisão de segundos usada pelo NumericDate, e rejeita tokens emitidos antes de `credentialsUpdatedAt`. Tokens não são apagados fisicamente: deixam de ser aceitos porque toda autenticação continua consultando o estado atual do usuário no banco. Um novo login emite JWT válido sem autenticação automática no reset.

Usuários migrados recebem inicialmente o `created_at` truncado para segundos, preservando sessões posteriores à criação. A estratégia cobre revogação por alteração de credenciais sem criar blacklist de JWT; continua dependente da consulta ao banco já existente.

## Password reset pós-commit

O pedido válido invalida tokens anteriores, persiste somente o novo hash, publica evento interno e conclui a transação. Apenas após o commit, `PasswordResetNotificationListener` agenda o `PasswordResetNotifier` em executor pequeno, configurável e com fila limitada. Assim uma futura chamada à Brevo não mantém lock ou conexão transacional, e sua latência não integra o caminho normal da resposta HTTP.

Rollback impede o listener. Falha posterior do notifier é registrada sem destinatário, URL ou token e não desfaz o token já persistido; retry durável/outbox permanece decisão futura. E-mails inexistentes continuam sem token ou evento, portanto a mitigação reduz principalmente a diferença causada pelo provedor, não promete eliminar todo side-channel de banco/processamento.

## Pendências antes de produção

O backend agora aplica rate limit local em memória, configurável, no login e nos fluxos de token. Em implantação com múltiplas réplicas ele não fornece limite global; centralização por Redis ou gateway continua pendente. Também permanecem revisão jurídica, rotação de todos os segredos
históricos, threat model, pentest e conclusão dos testes relacionais/IDOR.

## Auditoria técnica

Login bem-sucedido, logout, solicitação/conclusão de recuperação de senha, geração/cancelamento/expiração/consumo de token, criação/reativação/encerramento de vínculo e envio/aceite/recusa/remoção de conexão são auditados. Os registros contêm apenas IDs e metadados operacionais mínimos; token bruto, hash de token, JWT, cookies, senha/hash, CSRF e payload clínico são proibidos. O histórico de vínculo é atômico com a mudança de negócio; auditoria operacional usa transação independente e falha secundária não cancela a operação.

## Consentimento

O registro preserva responsável, criança, profissional, data, IP, user agent,
versão e finalidade. Versão/finalidade são configuração operacional. Revogação
ainda não foi implementada nesta fase; este desenho técnico não constitui, por
si só, certificação ou garantia de conformidade legal.

## Recursos de perfil profissional — Fase 3

Locais, redes e vínculos de áreas usam rotas `/profissionais/me`: ownership vem do `AuthenticatedUser`, eliminando o `usuarioId` arbitrário do legado. IDs alheios em update/delete resultam em 403. URLs aceitam somente HTTP(S), têm limite e não entram integralmente na auditoria; a UI abre links com `noreferrer`. O catálogo de áreas é somente leitura e não existe administração sem regra comprovada. A exposição pública desses detalhes não foi ampliada.
