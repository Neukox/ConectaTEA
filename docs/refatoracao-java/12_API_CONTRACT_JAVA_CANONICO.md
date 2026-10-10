# Contrato canônico da API Java — fotografia da implementação

> Atualização de 10/10/2026: em `GET /criancas/{id}/circulo/membros`, `acoesPermitidas` contém `podeRemover`, `podeSair`, `requerTransferenciaGestao` e `podeTransferirGestao`. Para o último gestor, `podeSair=false` e `requerTransferenciaGestao=true`; a tentativa direta continua retornando `409 LAST_MANAGER`.
>
> Foto profissional: `POST /profissionais/me/foto` (`multipart/form-data`, parte `file`) substitui a foto do próprio perfil; `DELETE /profissionais/me/foto` remove; `GET /profissionais/fotos/{key}` entrega JPEG/PNG armazenado. Limites: 5 MiB e 64–4096 px. Bytes, assinatura e decodificação são validados; `PUT /profissionais/me` não aceita `fotoPerfilUrl`.
> O `PUT /profissionais/me` não possui mais `fotoPerfilUrl`. A URL retornada é absoluta e configurável por `PUBLIC_API_URL`; sem essa variável, usa a origem HTTP observada e o context-path `/api`. Troca e remoção usam lock do perfil, persistência explícita e limpeza de arquivo sincronizada ao commit.

**Estado atual:** este é o contrato textual do único backend ativo. O OpenAPI em `/api/v3/api-docs` e a Swagger UI refletem os controllers Java; trechos explicitamente históricos ao final registram divergências já resolvidas.

## Recursos profissionais — Fase 3

Rotas relativas a `/api`, autenticadas e camelCase. `/profissionais/me/**` exige `PROFISSIONAL`, deriva ownership do principal e não aceita `usuarioId`.

| Método e rota | Request | Response/status | Erros | Consumer |
|---|---|---|---|---|
| `GET /areas-atuacao` | — | `[{id,nome}]` 200 | 401 | edição de perfil |
| `GET/POST /profissionais/me/locais-atendimento` | POST `{nome,cidade}` | lista 200 / objeto 201 | 400/401/403/404/409 | perfil |
| `PUT/DELETE /profissionais/me/locais-atendimento/{id}` | PUT `{nome,cidade}` | objeto 200 / 204 | 400/401/403/404/409 | edição |
| `GET/POST /profissionais/me/redes-sociais` | POST `{tipo,url}` | lista 200 / objeto 201 | 400/401/403/404/409 | perfil |
| `PUT/DELETE /profissionais/me/redes-sociais/{id}` | PUT `{tipo,url}` | objeto 200 / 204 | 400/401/403/404/409 | edição |
| `GET/POST /profissionais/me/areas-atuacao` | POST `{areaId}` | lista 200 / objeto 201 | 400/401/403/404 | perfil |
| `DELETE /profissionais/me/areas-atuacao/{areaId}` | — | 204 | 401/403/404 | edição |

`url` é HTTP(S), não vazia e limitada a 2048 caracteres. Repetir vínculo de área é idempotente. Não há endpoint administrativo de catálogo porque o legado não comprovou essa regra.

**Base da API:** `/api` (context path configurado). As rotas abaixo são relativas a essa base.  
**Escopo:** endpoints atualmente implementados nos módulos Auth, Usuários, Profissionais, Crianças, Vínculos/Consentimento, Metas, Progresso, Sessões, Conexões e Dashboard. Este documento descreve o código existente; não significa que a integração React/Java esteja homologada.

## Convenções efetivas e segurança

- Requests e responses Java usam propriedades JSON `camelCase`; `LocalDate` é `YYYY-MM-DD` e `Instant`/`OffsetDateTime` são ISO-8601. Enums são strings com o nome do enum.
- A autenticação é stateless por JWT no cookie `jwt` (HttpOnly). O principal autenticado é a fonte do ID/tipo do ator; rotas próprias não recebem o ID do usuário no body.
- São públicos `POST /auth/login`, `POST /auth/password/forgot`, `POST /auth/password/reset`, `POST /users/register`, documentação, health e `OPTIONS`. As demais rotas requerem autenticação. `POST`, `PUT`, `PATCH` e `DELETE` exigem CSRF via cookie `XSRF-TOKEN` e header `X-XSRF-TOKEN`, exceto login, registro e recuperação de senha. CORS aceita credenciais e origens configuradas.
- Resposta de erro da infraestrutura de segurança: `{timestamp,status,error,code,message,path}`. Erros de validação podem também conter `fields`. Status usados pelos endpoints: `400` request inválido/filtro inválido, `401` não autenticado/credenciais inválidas/conta inativa, `403` role ou autorização relacional negada, `404` recurso/perfil ausente, `409` conflito de unicidade/concorrência, `410` token indisponível/expirado. Não se deve tratar entidades JPA como contrato HTTP; os controllers abaixo expõem records/DTOs, com exceções descritas.
- As respostas não têm envelope global. Algumas rotas retornam `{message,...}`, enquanto outras retornam DTO, lista ou mapa diretamente.
- Autorização relacional padrão: profissional/responsável só acessam criança não arquivada com vínculo ativo apropriado. Ausência de vínculo e criança arquivada são negadas. Listas padrão excluem arquivadas.
- Login e operações de geração, consulta, confirmação e cancelamento de token têm rate limit configurável. Excesso retorna `429` com `{timestamp,status,error,code:"RATE_LIMITED",message,path}` e `Retry-After: 60`. No MVP o limite é por instância.
- Eventos sensíveis são auditados sem alterar requests/responses. Senha/hash, JWT, cookies, CSRF, token bruto e payload clínico não integram os registros.
- O cliente frontend citado é o consumidor encontrado no código atual, não garantia de compatibilidade. Não foram alterados clientes nesta etapa.

## Inventário completo de endpoints de domínio

`/api` é o prefixo real (context path). Os detalhes de body, query, response e divergências estão nas seções por módulo abaixo. `Aut.` indica JWT obrigatório; `CSRF` aplica-se aos métodos mutáveis, salvo login/registro. “Testado” significa evidência automatizada existente/executada; “homologado” exige integração frontend + fluxo E2E validado. Nenhum endpoint abaixo é declarado homologado nesta fotografia.

| Módulo | Método e rota completa | Role | Aut./CSRF | Autorização relacional | Sucesso | Situação/evidência |
|---|---|---|---|---|---:|---|
| Auth | `POST /api/auth/login` | pública | não / dispensado | não se aplica | 200 | implementado; MockMvc de login/cookie; não homologado |
| Auth | `POST /api/auth/password/forgot` | pública | não / dispensado | não se aplica | 200 | implementado; unitário e MockMvc; frontend futuro |
| Auth | `POST /api/auth/password/reset` | pública | não / dispensado | token de uso único | 200 | implementado; unitário, MockMvc e concorrência PostgreSQL; frontend futuro |
| Auth | `POST /api/auth/logout` | qualquer autenticado | sim / sim | principal da sessão | 200 | implementado; sem teste dedicado conhecido; não homologado |
| Auth | `GET /api/auth/me` | qualquer autenticado | sim / não | principal da sessão | 200 | implementado; cobertura de auth parcial; não homologado |
| Usuários | `POST /api/users/register` | pública | não / dispensado | não se aplica | 201 | implementado e testado por MockMvc; não homologado |
| Usuários | `GET /api/users/me` | qualquer autenticado | sim / não | próprio principal | 200 | implementado; sem teste dedicado conhecido; não homologado |
| Usuários | `PUT /api/users/me` | qualquer autenticado | sim / sim | próprio principal | 200 | implementado; sem teste dedicado conhecido; não homologado |
| Usuários | `DELETE /api/users/me` | qualquer autenticado | sim / sim | próprio principal; desativa conta | 204 | implementado; bloqueio de JWT inativo testado; não homologado |
| Profissionais | `GET /api/profissionais?search=` | qualquer autenticado | sim / não | diretório de perfis ativos; sem vínculo infantil | 200 | implementado; listagem/busca MockMvc; não homologado |
| Profissionais | `GET /api/profissionais/me` | PROFISSIONAL | sim / não | perfil do principal | 200 | implementado; perfil MockMvc parcial; não homologado |
| Profissionais | `PUT /api/profissionais/me` | PROFISSIONAL | sim / sim | perfil do principal | 200 | implementado; perfil MockMvc parcial; não homologado |
| Profissionais | `GET /api/profissionais/{id}` | qualquer autenticado | sim / não | leitura de perfil ativo, sem vínculo infantil | 200 | implementado; 404 coberto no conjunto MockMvc; não homologado |
| Crianças | `POST /api/criancas` | PROFISSIONAL | sim / sim | ator cria vínculo profissional ativo | 201 | implementado; MockMvc create/DTO inválido; não homologado |
| Crianças | `GET /api/criancas` | PROFISSIONAL ou RESPONSAVEL | sim / não | lista por vínculos ativos do principal | 200 | implementado; integração frontend pendente; não homologado |
| Crianças | `GET /api/criancas/{id}` | PROFISSIONAL ou RESPONSAVEL | sim / não | vínculo ativo e não arquivada | 200 | implementado; IDOR/arquivada cobertos unitariamente; não homologado |
| Crianças | `PUT /api/criancas/{id}` | PROFISSIONAL | sim / sim | vínculo profissional ativo e não arquivada | 200 | implementado; contrato frontend pendente; não homologado |
| Crianças | `DELETE /api/criancas/{id}` | PROFISSIONAL | sim / sim | vínculo profissional ativo; arquivamento lógico | 204 | implementado; regra de acesso arquivada testada; não homologado |
| Tokens | `POST /api/criancas/{id}/tokens-vinculo` | PROFISSIONAL | sim / sim | vínculo profissional ativo e não arquivada | 200 | implementado; QR/regra unitária; integração PostgreSQL no CI; não homologado |
| Tokens | `DELETE /api/criancas/{childId}/tokens-vinculo/{tokenId}` | PROFISSIONAL | sim / sim | vínculo ativo e token pertencente ao profissional/criança | 204 | implementado; testes de domínio parciais; não homologado |
| Vínculos | `GET /api/vinculos/tokens/{codigo}/preview` | qualquer role autenticada | sim / não | valida token; não cria vínculo | 200 | implementado; preview no fluxo frontend, E2E pendente; não homologado |
| Vínculos | `POST /api/vinculos/confirmar` | RESPONSAVEL | sim / sim | consome código não nominal e cria solicitação pendente; não concede acesso | 200 | implementado; replay/concorrência exercitados com PostgreSQL; E2E completo pendente |
| Vínculos | `GET /api/vinculos/me` | RESPONSAVEL | sim / não | vínculos ativos do principal; crianças não arquivadas | 200 | implementado; sem homologação frontend/backend |
| Vínculos | `DELETE /api/vinculos/criancas/{id}` | RESPONSAVEL | sim / sim | encerra apenas vínculo do principal | 204 | implementado; regra parcial; E2E pendente |
| Metas | `POST /api/metas` | PROFISSIONAL | sim / sim | vínculo ativo com `criancaId` | 201 | implementado; regras de domínio testadas; não homologado |
| Metas | `GET /api/metas?criancaId=&categoria=&prioridade=&status=&periodo=&search=` | qualquer autenticado | sim / não | profissional: próprias; responsável: `criancaId` obrigatório e vínculo ativo | 200 | implementado; filtros de domínio cobertos parcialmente; não homologado |
| Metas | `GET /api/metas/resumo` | qualquer autenticado | sim / não | profissional: próprias; responsável recebe 403 sem escopo infantil permitido | 200 | implementado; não homologado |
| Metas | `GET /api/metas/{id}` | qualquer autenticado | sim / não | vínculo ativo à criança da meta | 200 | implementado; não homologado |
| Metas | `PUT /api/metas/{id}` | PROFISSIONAL | sim / sim | vínculo ativo à criança da meta | 200 | implementado; regras de domínio testadas; não homologado |
| Metas | `PATCH /api/metas/{id}/progresso` | PROFISSIONAL | sim / sim | vínculo ativo à criança da meta | 200 | implementado; regras de progresso testadas; não homologado |
| Metas | `DELETE /api/metas/{id}` | PROFISSIONAL | sim / sim | vínculo ativo à criança da meta | 204 | implementado; sem homologação frontend/backend |
| Progresso | `GET /api/progresso/resumo?criancaId=` | qualquer autenticado | sim / não | profissional: metas próprias; responsável deve escopar criança vinculada | 200 | implementado; frontend usa tipos antigos; não homologado |
| Progresso | `GET /api/progresso/recentes?criancaId=&periodo=` | qualquer autenticado | sim / não | mesmo escopo relacional do resumo | 200 | implementado; sem teste de controller conhecido; não homologado |
| Progresso | `GET /api/progresso/distribuicao-categoria?criancaId=` | qualquer autenticado | sim / não | mesmo escopo relacional do resumo | 200 | implementado; frontend ainda a validar; não homologado |
| Progresso | `GET /api/progresso/evolucao-categoria?criancaId=&periodo=` | qualquer autenticado | sim / não | mesmo escopo relacional do resumo | 200 | implementado; frontend ainda a validar; não homologado |
| Progresso | `GET /api/progresso/crianca?criancaId=` | qualquer autenticado | sim / não | mesmo escopo relacional do resumo | 200 | implementado; frontend ainda a validar; não homologado |
| Sessões | `POST /api/sessoes` | PROFISSIONAL | sim / sim | vínculo ativo com criança | 201 | implementado; testes específicos de controller pendentes; não homologado |
| Sessões | `GET /api/sessoes?criancaId=&status=&tipo=&periodo=&search=` | qualquer autenticado | sim / não | profissional: próprias; responsável: crianças vinculadas; filtro valida vínculo | 200 | implementado; testes específicos pendentes; não homologado |
| Sessões | `GET /api/sessoes/resumo` | qualquer autenticado | sim / não | profissional: próprias; responsável: crianças vinculadas | 200 | implementado; testes específicos pendentes; não homologado |
| Sessões | `PUT /api/sessoes/{id}` | PROFISSIONAL | sim / sim | vínculo ativo à criança da sessão | 200 | implementado; testes específicos pendentes; não homologado |
| Sessões | `PATCH /api/sessoes/{id}/status` | PROFISSIONAL | sim / sim | vínculo ativo à criança da sessão | 200 | implementado; testes específicos pendentes; não homologado |
| Sessões | `DELETE /api/sessoes/{id}` | PROFISSIONAL | sim / sim | vínculo ativo à criança da sessão | 204 | implementado; testes específicos pendentes; não homologado |
| Conexões | `POST /api/conexoes` | PROFISSIONAL | sim / sim | ator e destinatário são perfis profissionais; sem vínculo infantil | 201 | implementado; MockMvc/AB-BA pendentes; não homologado |
| Conexões | `GET /api/conexoes?tipo=&status=` | PROFISSIONAL | sim / não | lista relações do perfil do principal | 200 | implementado; MockMvc pendente; não homologado |
| Conexões | `PUT /api/conexoes/{id}/responder` | PROFISSIONAL destinatário | sim / sim | somente destinatário responde | 200 | implementado; MockMvc pendente; não homologado |
| Conexões | `DELETE /api/conexoes/{id}` | PROFISSIONAL participante | sim / sim | solicitante ou destinatário | 204 | implementado; MockMvc pendente; não homologado |
| Dashboard | `GET /api/dashboard/profissional` | PROFISSIONAL | sim / não | dados do perfil do principal e vínculos próprios | 200 | implementado; comportamento da controller sem teste dedicado conhecido; não homologado |
| Dashboard | `GET /api/dashboard/profissional/criancas` | PROFISSIONAL | sim / não | crianças vinculadas ao perfil do principal | 200 | implementado; teste dedicado pendente; não homologado |
| Dashboard | `GET /api/dashboard/profissional/metas` | PROFISSIONAL | sim / não | metas do perfil do principal | 200 | implementado; teste dedicado pendente; não homologado |
| Dashboard | `GET /api/dashboard/responsavel` | RESPONSAVEL | sim / não | crianças vinculadas ao principal | 200 | implementado; teste dedicado pendente; não homologado |

**Erros transversais:** `400` validação/argumento/filtro; `401` JWT ausente, inválido, expirado ou usuário inativo; `403` role, CSRF ou autorização relacional; `404` `NoSuchElementException`/recurso ausente; `409` integridade/concorrência otimista; `410` token expirado, usado ou cancelado. A resposta do advice inclui `timestamp,status,error,code,message,path,fields` (campos nulos podem ser omitidos pelo Jackson). Rotas que lançam `ResponseStatusException` usam o status indicado pelo serviço. Códigos específicos podem variar conforme o handler que origina a falha.

**Cobertura do legado:** os quatro modelos permanecem fisicamente no Prisma somente como referência para a futura migração de dados. Seus consumers ativos usam os endpoints Java da Fase 3; não houve migração real de dados.

## Estado de congelamento

O contrato Java descrito neste documento registra o que está implementado e as pendências explicitamente marcadas. Auditoria, histórico e rate limit são transversais e acrescentam possíveis erros sem dispensar autorização no recurso. Convites nominais, bootstrap do primeiro gestor, arquivo pós-saída, fórmula agregada de progresso, foto e demais itens indicados como pendentes ainda podem exigir evolução de contrato; integração React, E2E e revisão jurídica/operacional também permanecem pendentes.

## Auth

### `POST /auth/password/forgot`

- Role/autenticação/CSRF: pública, sem JWT e dispensada de CSRF.
- Request: `{email:string}` com formato válido.
- Response `200`: `{message:"Se existir uma conta associada a este e-mail, enviaremos instruções para redefinição da senha."}` para conta existente, ausente ou inapta.
- Erros: `400` request inválido; `429` após cinco pedidos por minuto por IP e por instância.
- Regra/autorização: só conta ativa gera token e publica evento; o notifier é executado assincronamente após commit. O cliente nunca recebe indício de existência. Tokens ativos anteriores são invalidados.
- Consumer: frontend futuro de “Esqueci minha senha”. Testes: service unitário e contrato MockMvc.

### `POST /auth/password/reset`

- Role/autenticação/CSRF: pública, sem JWT e dispensada de CSRF.
- Request: `{token:string,newPassword:string}`; senha entre 8 e 72 caracteres.
- Response `200`: `{message:"Senha redefinida com sucesso."}`.
- Erros: `400` validação ou `{code:"INVALID_PASSWORD_RESET_TOKEN",message:"Token de redefinição inválido ou expirado."}` para token ausente, expirado, usado, invalidado ou usuário inativo.
- Regra/autorização: SHA-256 localiza o registro; bloqueio pessimista torna consumo, troca BCrypt e atualização de `credentialsUpdatedAt` atômicos e single-use. JWTs com `iat` anterior deixam de autenticar; não há login automático. TTL padrão: 30 minutos.
- Consumer: frontend futuro de “Redefinir senha”. Testes: unitário, MockMvc e integração concorrente com PostgreSQL/Testcontainers.

### `POST /auth/login`

- Role/autenticação: pública; CSRF dispensado.
- Request: `{email:string,password:string}` (email e senha não vazios; email validado).
- Response `200`: `{message:"Login realizado",user:{id,name,email,telefone,endereco,tipo}}`; JWT é entregue no cookie HttpOnly `jwt`, não no JSON.
- Erros: `400` validação, `401` credenciais inválidas ou usuário inativo.
- Regra: usuário precisa existir, estar ativo e a senha corresponder.
- Frontend: `src/api/authApi.ts` (`login`). Campos principais compatíveis; o frontend tipa `user` sem telefone/endereço, mas são campos adicionais opcionais na prática.

### `POST /auth/logout`

- Role/autenticação: qualquer usuário autenticado; CSRF requerido.
- Request: sem body.
- Response `200`: `{message:"Logout realizado"}` e cookie `jwt` expirado.
- Erros: `401` sem autenticação, `403` CSRF ausente/inválido.
- Regra: logout invalida o cookie do cliente; não há revogação server-side de JWT emitido.
- Frontend: `src/api/authApi.ts` (`logout`); compatível quanto ao envelope.

### `GET /auth/me`

- Role/autenticação: qualquer usuário autenticado.
- Request: sem body.
- Response `200`: `{message:"Usuário autenticado",user:{id,name,email,telefone,endereco,tipo}}`.
- Erros: `401` sem sessão JWT válida.
- Regra: identidade vem do principal e é consultada no banco.
- Frontend: `src/api/authApi.ts` (`checkAuth`); compatível com `response.data.user`.

## Usuários

### `POST /users/register`

- Role/autenticação: pública; CSRF dispensado.
- Request: `{name,email,password,telefone?,endereco?,tipo}`; senha de 8 a 72 caracteres.
- Response `201`: `{message:"Usuário cadastrado",user:{id,name,email,telefone,endereco,tipo}}`.
- Erros: `400` validação, `409` email já cadastrado.
- Regra: criação de usuário e, para `tipo: PROFISSIONAL`, perfil profissional são transacionais. O registro não autentica automaticamente.
- Frontend: `src/api/authApi.ts` (`register`). Forma e envelope alinhados; divergência P1: validação local ainda aceita senha de 6 caracteres, mas Java exige 8.

### `GET /users/me`, `PUT /users/me`, `DELETE /users/me`

- Role/autenticação: qualquer usuário autenticado; ator obtido do principal. CSRF requerido em PUT/DELETE.
- Request GET/DELETE: sem body. PUT: `{name,telefone?,endereco?}`.
- Response GET/PUT `200`: `{id,name,email,telefone,endereco,tipo}`. DELETE `204`, sem body.
- Erros: `400` body inválido, `401` sem autenticação/conta inativa, `403` CSRF inválido.
- Regra: PUT/DELETE operam apenas sobre o próprio usuário; DELETE desativa, não apaga.
- Frontend: `src/api/authApi.ts` consome registro/login/me, mas não foi localizado consumidor Java-alinhado para PUT/DELETE. Clientes legados ainda chamam `/users/{id}` (ver Profissionais).

## Profissionais

### `GET /profissionais?search=`

- Role/autenticação: qualquer usuário autenticado.
- Request: query opcional `search`.
- Response `200`: array de `{id,usuarioId,name,especialidade,registroProfissional,titulo,formacaoAcademica,sobre,fotoPerfilUrl,codigoIdentificacao}`.
- Erros: `401` não autenticado.
- Regra: diretório de perfis com usuário ativo; busca por nome, especialidade ou título. Não aplica vínculo com criança.
- Frontend: `src/api/protected/axiosProfissionais.ts` e `axiosPerfil.ts`. Diverge: frontend chama `/private/profissionais`, inclui filtro `usuarioId` que Java não implementa e espera nomes como `usuario_id`/campos adicionais.

### `GET /profissionais/me`, `PUT /profissionais/me`

- Role/autenticação: `PROFISSIONAL`; ator derivado do principal. CSRF requerido no PUT.
- Request GET: sem body. PUT: `{especialidade?,registroProfissional?,titulo?,formacaoAcademica?,sobre?,fotoPerfilUrl?}`.
- Response `200`: o DTO de profissional acima.
- Erros: `400` body inválido, `401` não autenticado, `403` role/CSRF incorretos, `404` perfil não criado.
- Regra: atualização apenas do perfil próprio. Não implementa locais de atendimento, redes sociais nem áreas de atuação do Prisma legado.
- Frontend: deveria ser consumido por `axiosPerfil.ts`/`axiosProfissionais.ts`, mas os clientes atuais usam `/profissionais/usuario/{id}`, `/private/atualizar-perfil/{id}` e não usam `/me`; divergência de rota, campos e recursos.

### `GET /profissionais/{id}`

- Role/autenticação: qualquer usuário autenticado.
- Request: `id` é ID do perfil profissional (não do usuário).
- Response `200`: DTO de profissional.
- Erros: `401`, `404` perfil inexistente/inativo.
- Regra: consulta de perfil sem autorização relacional adicional.
- Frontend: `axiosProfissionais.ts` usa rota legada `/private/profissionais/{id}`; divergência de rota e possível ambiguidade entre ID de perfil e ID de usuário.

## Crianças

### `POST /criancas`

- Role/autenticação: `PROFISSIONAL`; vínculo profissional-criança criado pelo principal. CSRF requerido.
- Request: `{nome,dataNascimento:"YYYY-MM-DD",genero?,diagnostico?,diagnosticoDetalhes?,observacoes?,responsavelPendente?:{nome,telefone?,email?,parentesco}}`.
- Response `201`: `{message:"Criança cadastrada",crianca:{id,nome,dataNascimento,idade,genero,diagnostico,diagnosticoDetalhes,observacoes}}`.
- Erros: `400` validação/data inválida, `401`, `403` role/CSRF, `404` perfil profissional ausente, `409` conflito de integridade.
- Regra: cria criança, vínculo profissional e contato pendente numa operação; não cria conta de responsável nem gera token automaticamente.
- Frontend: `src/api/protected/axiosCadastroCrianca.ts`. Divergência crítica: envia `{fullName,birthDate,gender,diagnosis,notes,parentesco,responsible}` e converte data para `dd/MM/yyyy`; Java requer propriedades em português e `YYYY-MM-DD`, com `responsavelPendente`.

### `GET /criancas`

- Role/autenticação: qualquer usuário autenticado.
- Request: sem body.
- Response `200`: `{items:[ChildResponse],total:number}`; `ChildResponse={id,nome,dataNascimento,idade,genero,diagnostico,diagnosticoDetalhes,observacoes}`.
- Erros: `401` não autenticado.
- Regra: retorna somente crianças não arquivadas ligadas ao ator com vínculo ativo; o conjunto depende da role.
- Frontend: `axiosCadastroCrianca.ts`. Divergência: espera `{message,criancas}` e campos de relacionamento snake_case/responsável que a API não retorna.

### `GET /criancas/{id}`

- Role/autenticação: profissional ou responsável autenticado com vínculo ativo à criança.
- Request: path `id`.
- Response `200`: `ChildResponse` diretamente, sem wrapper.
- Erros: `401`, `403` sem vínculo/arquivada, `404` não encontrada.
- Regra: a criança arquivada não é acessível pela rota normal.
- Frontend: `axiosCadastroCrianca.ts` espera `{message,data}` e campos de responsável/vínculos adicionais; divergente.

### `PUT /criancas/{id}` e `DELETE /criancas/{id}`

- Role/autenticação: apenas `PROFISSIONAL` com vínculo profissional ativo; CSRF requerido.
- Request PUT: `{nome,dataNascimento:"YYYY-MM-DD",genero?,diagnostico?,diagnosticoDetalhes?,observacoes?}`. DELETE sem body.
- Response PUT `200`: `ChildResponse` direto. DELETE `204`.
- Erros: `400` validação, `401`, `403` role/vínculo/CSRF, `404` ausente.
- Regra: PUT não altera responsável; DELETE arquiva e retira a criança das consultas normais.
- Frontend: `axiosCadastroCrianca.ts`. Divergências: update espera envelope `{message,crianca}` e envia propriedades extras/contato de responsável; exclusão usa a mesma rota mas resposta não foi alinhada.

## Vínculos, tokens e consentimento

### Círculo de Cuidado e solicitações — contrato vigente pós-V11

- `GET /criancas/{criancaId}/circulo/membros`: qualquer membro ativo; lista somente vínculos infantis, nunca conexões sociais, e inclui `vinculoId`, `usuarioId`, `papel`, `tipo` e `acoesPermitidas`.
- `PATCH /criancas/{criancaId}/circulo/gestao`: responsável gestor; request `{responsavelUsuarioId}`; `204`. Bloqueia alvo inativo ou legado não classificado e serializa a transferência por lock pessimista.
- `DELETE /criancas/{criancaId}/circulo/membros/me`: membro ativo; `204`. Profissional pode sair; último gestor recebe `409 LAST_MANAGER`.
- `POST /vinculos/confirmar`: código não nominal não cria vínculo. Response `{solicitacaoId,criancaId,status:"PENDENTE"}`; o token é consumido atomicamente para impedir replay.
- `PATCH /vinculos/criancas/{childId}/solicitacoes/{requestId}`: gestor decide `{aprovar:boolean}`. Aprovação cria/reativa vínculo como responsável comum e registra consentimento; recusa exige novo convite.
- Vínculos responsáveis anteriores à V11 permanecem com `papel=null`; isso significa “legado não classificado”, jamais gestor. Convite nominal/email confirmado e bootstrap do primeiro gestor ainda não estão ativos.
- `GET /criancas/{criancaId}/circulo/solicitacoes`: somente gestor ativo; retorna solicitações pendentes com IDs, estado, instante e identificação do solicitante.
- `GET /vinculos/solicitacoes/me`: responsável consulta somente as próprias solicitações, inclusive decisão e identificação mínima da criança.
- `DELETE /criancas/{criancaId}/circulo/membros/{vinculoId}?tipo=RESPONSAVEL|PROFISSIONAL`: somente gestor; `LAST_MANAGER`, `USE_LEAVE_FLOW`, `MEMBER_NOT_ACTIVE` e `INVALID_MEMBER_TYPE` são conflitos `409`.
- As duas rotas de saída (`/circulo/membros/me` e a compatível `/vinculos/criancas/{id}`) compartilham lock e regra `LAST_MANAGER`. Desativação de conta responsável também passa pela mesma proteção.
- Transferência para o próprio ator retorna `409 CANNOT_TRANSFER_TO_SELF`; destino precisa estar ativo, vinculado e classificado como `RESPONSAVEL`.

### `GET /vinculos/tokens/{codigo}/preview`

- Role/autenticação: código é somente leitura; apesar de não ter restrição de role no controller, a configuração global exige JWT.
- Request: token no path.
- Response `200`: `{id,nome,dataNascimento:"YYYY-MM-DD",genero}`.
- Erros: `401` sem JWT, `404` token inválido, `410` expirado/usado/cancelado.
- Regra: token aleatório guardado como SHA-256; expiração é marcada ao ser detectada. A consulta não consome token.
- Frontend: `src/api/protected/axiosVinculacao.ts` usa a mesma rota e DTO; divergência operacional: cliente/comentário assume validação pública, mas servidor requer usuário autenticado.

### `POST /vinculos/confirmar` (vigente após V11)

- Role/autenticação: `RESPONSAVEL`; CSRF requerido.
- Request: `{codigo,consentimentoAceito:true}`.
- Response `200`: `{solicitacaoId,criancaId,status:"PENDENTE"}`.
- Erros: `400` aceite ausente/request inválido, `401`, `403` role/CSRF, `404` token inválido, `410` token indisponível.
- Regra: ator é o responsável autenticado. Token é bloqueado e consumido para uso único, mas posse não concede acesso: cria solicitação pendente. Somente decisão posterior de gestor cria/reativa vínculo e grava consentimento.
- Frontend: `axiosVinculacao.ts` precisa tratar estado pendente e não navegar para dados da criança após a confirmação.

### `GET /vinculos/me`, `DELETE /vinculos/criancas/{id}`

- Role/autenticação: `RESPONSAVEL`; ator do principal. CSRF requerido no DELETE.
- Request: GET sem body; DELETE usa ID da criança.
- Response GET `200`: array de `ChildResponse`; DELETE `204`.
- Erros: `401`, `403` role/vínculo/CSRF, `404` vínculo ausente.
- Regra: GET lista relações ativas/não arquivadas. DELETE encerra o próprio vínculo; revogação de consentimento não está implementada.
- Frontend: `axiosVinculacao.ts`; rotas e shape de lista simples alinhados, mas outros componentes antigos esperam campos adicionais de vínculo.

### `POST /criancas/{id}/tokens-vinculo`, `DELETE /criancas/{childId}/tokens-vinculo/{tokenId}`

- Role/autenticação: `PROFISSIONAL` com vínculo ativo à criança; ator/perfil profissional vêm do principal. CSRF requerido.
- Request: POST sem body; DELETE sem body.
- Response POST `200`: `{id,codigo,expiraEm:"ISO-8601",qrCodeDataUrl:"data:image/png;base64,..."}`. DELETE `204`.
- Erros: `401`, `403` role/relacionamento/propriedade/CSRF, `404` criança/token ausente, `410` token já indisponível.
- Regra: código de uso único expira em sete dias; QR é gerado sob demanda, não persistido. Cancelamento é permitido ao profissional proprietário.
- Frontend: `axiosCadastroCrianca.ts` ainda chama `GET /criancas/{id}/codigo-vinculo` e espera `codigoParaVinculo/qrcodeParaVinculo`; deve migrar para POST e os novos nomes.

### Consentimento (efeito da aprovação da solicitação)

- Não há endpoint independente de consentimento. `POST /vinculos/confirmar` reserva o token e preserva IP/User-Agent na solicitação; somente `PATCH /vinculos/criancas/{childId}/solicitacoes/{requestId}` com aprovação do gestor cria o vínculo e grava o consentimento com versão/finalidade configuradas.
- A resposta da confirmação é `{solicitacaoId,criancaId,status:"PENDENTE"}`, não Preview nem recibo de consentimento. Não há rota de revogação. O registro técnico não representa declaração de conformidade jurídica.
- Consumidor: `axiosVinculacao.ts`. Gabriel deve adaptar a navegação para o estado pendente; UI/termo e versão precisam permanecer sincronizados com configuração antes de produção.

## Metas

### `POST /metas`

- Role/autenticação: `PROFISSIONAL` ligado à criança indicada; CSRF requerido.
- Request: `{titulo,descricao?,categoria,prioridade,dataInicio:"YYYY-MM-DD",dataFim:"YYYY-MM-DD",criancaId}`.
- Response `201`: `{id,titulo,descricao,categoria,prioridade,status,progresso,dataInicio,dataFim,criancaId}`.
- Erros: `400` validação/datas, `401`, `403` role/relacionamento/CSRF.
- Regra: início não pode estar no passado no create; fim deve ser igual/posterior ao início.
- Frontend: `src/api/protected/axiosMetas.ts` e schemas/features Metas; rota/camelCase/resumo alinhados, validar enums e datas no schema.

### `GET /metas`, `GET /metas/resumo`, `GET /metas/{id}`

- Role/autenticação: qualquer autenticado; responsável precisa informar `criancaId` nas consultas list/resumo sem escopo, enquanto profissional sem ID vê metas próprias. Para ID explícito, exige vínculo ativo e criança não arquivada.
- Request: list aceita `criancaId,categoria,prioridade,status,periodo,search`; períodos `TODOS|HOJE|SEMANA|MES|ATRASADAS`. Resumo sem parâmetros. Get usa `id`.
- Response list `200`: array de MetaResponse. Resumo: `{totalMetas,metasEmAndamento,metasVencendo,metasConcluidas}`. Get: MetaResponse.
- Erros: `400` enum/período inválido, `401`, `403` acesso/role/contexto sem child, `404` meta ausente.
- Regra vigente desde a preparação do novo frontend (#66): o estado de trabalho é `EM_ANDAMENTO`, `PAUSADA` ou `CONCLUIDA`; prazo próximo/atrasado é sinalizado separadamente. Progresso 100% não conclui automaticamente enquanto a regra de conclusão/reabertura estiver pendente. Consulte `docs/preparacao-backend-novo-frontend.md` para os endpoints de pausa/retomada e compatibilidade da V8.
- Frontend: `axiosMetas.ts` chama list/resumo/get; contrato de resumo compatível. A listagem atual não inclui `criancaId` na interface de filtros e componente de responsável precisa fornecê-lo.

### `PUT /metas/{id}`, `PATCH /metas/{id}/progresso`, `DELETE /metas/{id}`

- Role/autenticação: `PROFISSIONAL` com vínculo ativo à criança da meta; CSRF requerido.
- Request PUT: `{titulo,descricao?,categoria,prioridade,dataInicio,dataFim}` (sem `criancaId`). PATCH: `{progresso:0..100,descricao?}`. DELETE sem body.
- Response PUT/PATCH `200`: MetaResponse. DELETE `204`.
- Erros: `400` validação/datas, `401`, `403` role/vínculo/CSRF, `404` inexistente.
- Regra: atualização não muda a criança; PATCH grava histórico de progresso na mesma transação.
- Frontend: `axiosMetas.ts` usa as rotas e PATCH compatíveis; confirmar que update schema não envia `criancaId`.

## Progresso

Todos os endpoints requerem autenticação. `criancaId` opcional limita consulta a criança com vínculo ativo; sem esse filtro, somente profissional consulta seu próprio conjunto. Responsável deve sempre fornecer `criancaId`. Respostas são calculadas a partir de metas e/ou registros históricos, não expõem entidades JPA.

### `GET /progresso/resumo?criancaId=`

- Response `200`: `{mediaProgresso,metasAtivas,metasConcluidas,criancasAtivas}`. Erros `401/403/404` conforme autenticação/autorização/criança.
- Frontend: `features/Progresso/services/index.ts`; divergência: service não envia `criancaId` e tipos antigos usam snake_case (`media_progresso`, etc.).

### `GET /progresso/recentes?criancaId=&periodo=SEMESTRAL|ANUAL`

- Response `200`: array `{id,data:"ISO-8601",descricao,diferenca,progressoAtual,metaId,metaTitulo,criancaId}` (últimos dez registros do histórico).
- Erros: `400` período inválido, `401`, `403`, `404` criança inexistente.
- Frontend: `getAtualizacoesRecentes`; rota compatível, mas não envia filtros e modelo UI legado espera objeto aninhado/snake_case.

### `GET /progresso/distribuicao-categoria?criancaId=`

- Response `200`: mapa `CategoriaMeta -> contagem`; erros `401/403/404`.
- Regra: distribuição atual é agrupamento de metas por categoria, não série histórica.
- Frontend: service de distribuição; confirmar shape de map e nomes de enum.

### `GET /progresso/evolucao-categoria?criancaId=&periodo=SEMESTRAL|ANUAL`

- Response `200`: mapa `CategoriaMeta -> média de progresso histórico`; erros `400/401/403/404`.
- Frontend: service de evolução; rota/filtro compatíveis, conferir mapeamento dos enums.

### `GET /progresso/crianca?criancaId=`

- Response `200`: array `{nome,progresso}` agregado por criança; erros `401/403/404`.
- Frontend: service `getProgressoPorCrianca`; compatibilidade de shape precisa ser confirmada nos tipos de apresentação.

## Sessões

### `POST /sessoes`

- Role/autenticação: `PROFISSIONAL` com vínculo ativo à criança; CSRF requerido.
- Request: `{criancaId,tipo,dataHora:"ISO-8601 com offset",duracao,descricao?,observacoes?}`.
- Response `201`: `{id,dataHora,duracao,status,tipo,descricao,observacoes,criancaId}`.
- Erros: `400` body inválido/data/duração, `401`, `403` role/vínculo/CSRF.
- Regra: profissional vem do principal; estado inicial definido pelo domínio.
- Frontend: `features/Sessoes/services/index.ts`; divergência: envia `tipoSessao` e `data: Date`, mas Java espera `tipo` e `dataHora` ISO string.

### `GET /sessoes`, `GET /sessoes/resumo`

- Role/autenticação: qualquer autenticado. Profissional vê sessões próprias; responsável vê apenas sessões de crianças vinculadas ativas. Filtro `criancaId` também valida relação.
- Request list: `criancaId,status,tipo,periodo,search`; período `TODOS|HOJE|SEMANA|MES`. Resumo sem parâmetros.
- Response list `200`: array de SessionResponse. Resumo: `{sessoesHoje,sessoesConcluidas,sessoesEstaSemana,sessoesPendentes}`.
- Erros: `400` enum/período inválido, `401`, `403` relação/CSRF quando aplicável, `404` criança ausente.
- Regra: resumo usa role para escopo; responsável não é resolvido como profissional.
- Frontend: serviços de Sessões chamam rotas certas, mas tipo de resumo usa `sessoes_hoje` etc.; filtros/tipos da UI ainda carregam `tipoSessao` e formato antigo.

### `PUT /sessoes/{id}`, `PATCH /sessoes/{id}/status`, `DELETE /sessoes/{id}`

- Role/autenticação: `PROFISSIONAL` com vínculo ativo à criança associada à sessão; CSRF requerido.
- Request PUT: `{tipo,dataHora,duracao,descricao?,observacoes?}` (sem criancaId). PATCH: `{status}`. DELETE sem body.
- Response PUT/PATCH `200`: SessionResponse. DELETE `204`.
- Erros: `400` request inválido, `401`, `403` role/vínculo/CSRF, `404` sessão ausente.
- Frontend: `features/Sessoes/services/index.ts`; update usa `tipoSessao`/`data`, incompatível.

## Conexões profissionais

Todos os endpoints exigem autenticação e role `PROFISSIONAL`; o ID do profissional solicitante é obtido do principal.

### `POST /conexoes`

- Request: `{destinatarioId}` (ID de perfil profissional); CSRF requerido.
- Response `201`: `{id,solicitanteId,destinatarioId,status}`.
- Erros: `400` autoconexão/request inválido, `401`, `403` role/CSRF, `404` destinatário inexistente, `409` par duplicado/conflito de unicidade.
- Frontend: `src/api/protected/axiosAmizade.ts` envia `POST /conexoes/enviar` com `profissionalDestinoId`, divergindo rota e body.

### `GET /conexoes?tipo=todas|enviadas|recebidas&status=`

- Response `200`: array de ConnectionResponse filtrado por tipo/status.
- Erros: `400` tipo/status inválido, `401`, `403` role.
- Frontend: `axiosAmizade.ts` usa `/enviadas`, `/recebidas`, `/filtrar` e envelope `{message,data}`; backend aceita somente coleção com query params e retorna array simples.

### `PUT /conexoes/{id}/responder`, `DELETE /conexoes/{id}`

- Request PUT: `{status:"ACEITO"|"RECUSADO"}`; DELETE sem body; CSRF requerido.
- Response PUT `200`: ConnectionResponse. DELETE `204`.
- Erros: `400` status de resposta não permitido, `401`, `403` não destinatário/não participante/CSRF, `404` conexão ausente, `409` restrição de duplicidade.
- Regra: só destinatário responde; participante pode remover.
- Frontend: `axiosAmizade.ts` chama path de resposta compatível, mas envia `{acao:"ACEITAR"|"RECUSAR"}` e espera envelope; diverge do status e DTO Java.

## Dashboard

### `GET /dashboard/profissional`

- Role/autenticação: `PROFISSIONAL`; escopo do principal e vínculos profissionais ativos.
- Response `200`: `{totalCriancas,criancasEsteMes,profissionaisAtivos,profissionaisAtivosEsteMes,totalMetas,totalMetasEsteMes,taxaProgresso,taxaProgressoEsteMes}`.
- Erros: `401`, `403` role.
- Regra: progresso é média dos valores das metas; contadores mensais consideram criação no mês; “profissionais ativos” conta conexões aceitas do profissional, não diretório global.
- Frontend: `features/Dashboard/services/index.ts`; nomes esperados pelo componente devem ser conferidos, mas rota/shape dos indicadores é camelCase.

### `GET /dashboard/profissional/criancas`, `GET /dashboard/profissional/metas`

- Role/autenticação: `PROFISSIONAL`; crianças/metas do principal.
- Responses `200`: crianças `[{id,nome,idade,diagnostico}]`; metas `[{id,titulo,status,progresso,crianca}]`.
- Erros: `401`, `403` role.
- Frontend: `features/Dashboard/services/index.ts`. Divergência encontrada na lista de crianças: cards/types incluem status/profissional que o backend não retorna. O DTO de metas é próximo do esperado.

### `GET /dashboard/responsavel`

- Role/autenticação: `RESPONSAVEL`; crianças vinculadas ao principal, não arquivadas.
- Response `200`: `{totalCriancas,totalMetas,sessoesProximas,taxaProgresso}`.
- Erros: `401`, `403` role.
- Frontend: não foi localizado consumidor correspondente em `features/Dashboard/services`; dashboard do responsável ainda não está integrado a este endpoint.

## Inventário histórico de divergências frontend/backend — resolvido

1. Senha: validação local de registro aceita 6; API exige 8.
2. Profissionais: clientes chamam rotas legadas `/private/...`, `/profissionais/usuario/{id}` e `/users/{id}`; Java oferece `/profissionais`, `/profissionais/me`, `/profissionais/{id}` e `/users/me`. Perfil legado também contém locais, redes sociais e áreas de atuação, ausentes no Java.
3. Crianças: cliente envia nomes em inglês/data `dd/MM/yyyy` e estrutura `responsible`; API exige camelCase português, data ISO e `responsavelPendente`. Shapes de lista, detalhe e update são diferentes. Geração antiga `GET .../codigo-vinculo` diverge do POST de tokens.
4. Vínculo preview é descrito como público pelo frontend, mas o filtro global exige JWT. Confirmação e desvinculação têm paths/body compatíveis.
5. Metas: principais rotas, camelCase e resumo coincidem; para responsável, serviços/componentes precisam incluir `criancaId` onde a consulta não tem escopo automático.
6. Progresso: resumo/tipos legados usam snake_case, recente espera campos aninhados, e summary/recentes não enviam `criancaId`; responsável não pode consultar sem esse filtro. Distribuição representa metas atuais, não histórico.
7. Sessões: UI envia `tipoSessao` e `data: Date`; API exige `tipo` e timestamp ISO `dataHora`. Tipos de resumo usam snake_case.
8. Conexões: cliente usa `/enviar`, `/enviadas`, `/recebidas`, `/filtrar`, body `profissionalDestinoId`/`acao` e envelope `{message,data}`; API usa `POST /conexoes`, query params, `{destinatarioId}`/`{status}` e respostas diretas camelCase.
9. Dashboard: DTO da lista de crianças não contém todos os campos de UI; rota do dashboard de responsável não tem consumidor localizado.
10. Todos os endpoints mutáveis precisam de CSRF (`X-XSRF-TOKEN`); integração deve continuar usando `apiClient` com cookies/credenciais. `httpClient` permanece alias/cliente legado em alguns módulos.

## Estado histórico deste contrato na Fase 2

Este documento foi produzido a partir dos controllers Java e clientes React atualmente versionados após a correção de lifecycle do Testcontainers. Ele registra contratos implementados e divergências observadas; não corrige essas divergências nem certifica um fluxo end-to-end do frontend. Próxima etapa deve migrar os clientes incompatíveis e adicionar/atualizar testes de contrato conforme plano de fases, sem remover o backend NestJS nesta fase.

## Consumidores React após a Fase 2.13 — histórico

Em 2026-10-02, os consumidores foram alinhados ao contrato descrito neste documento: autenticação por cookie e /auth/me; rotas /me para usuário/profissional; crianças com nomes portugueses e LocalDate; token via POST /criancas/{id}/tokens-vinculo; vínculo com preview/consentimento; criancaId nas metas; progresso e resumos em camelCase; sessões com tipo/dataHora; conexões com respostas diretas; dashboards separados por role.

O apiClient é o cliente HTTP único e mantém withCredentials e withXSRFToken. Os itens do inventário anterior representam o estado pré-migração e foram resolvidos no frontend, com exceção dos recursos acessórios que permanecem no NestJS e da homologação E2E ainda pendente.

## Correções finais posteriores à Fase 2.13

O inventário histórico acima permanece para registrar o estado anterior. Na revisão final de 2026-10-02, os consumidores foram novamente comparados com controllers e records Java. Foram confirmados os DTOs diretos de usuários/profissionais, crianças, token, vínculo, metas, progresso, sessões, conexões e dashboards.

As correções adicionais foram: dashboards associados à role correta; constants de rotas inexistentes removidas; mutation de meta aguardando a resposta HTTP; invalidações de cache relacionadas; progresso recente respeitando filtro; e `dataHora` de sessão emitido como ISO-8601 com offset local explícito. `tipoSessao`, `data` e `horario` permanecem somente no modelo de formulário e são transformados para `{tipo,dataHora}` antes do request.

O run `37031485540` validou `frontend` e `backend-java` no commit funcional `39a8248`. Isso comprova CI estático/unitário, não substitui a fase E2E real ainda pendente.
