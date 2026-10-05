# Backend do módulo de Anotações

## Escopo

Esta fase substitui a experiência mock pelo contrato real em Java 21, Spring Boot 3.5, JPA, PostgreSQL e Flyway. Ela inclui persistência, autorização relacional, CRUD, filtros, auditoria, OpenAPI e integração frontend. Notificações persistentes e IA permanecem fora do escopo.

## Persistência

A migration `V6__create_anotacoes.sql` cria `anotacoes` com:

- chave primária `id`;
- chaves estrangeiras `crianca_id` e `autor_profissional_id`;
- `conteudo` limitado a 3.000 caracteres e com validação de texto não vazio;
- `visibilidade` restrita a `PRIVADA` ou `COMPARTILHADA`;
- `created_at` e `updated_at` em `TIMESTAMPTZ`;
- índice composto por criança e criação decrescente;
- índice por autor profissional.

Nomes e especialidade não são duplicados. O response deriva esses valores das relações existentes.

## Domínio e aplicação

O módulo `br.com.conectatea.anotacao` segue a organização existente:

- `domain`: `Anotacao` e `VisibilidadeAnotacao`;
- `infrastructure`: `AnotacaoRepository`;
- `application`: serviço transacional, autorização da anotação e projeção de saída;
- `api`: controller e DTOs validados.

Criação, atualização e exclusão são transacionais. Leituras usam transações `readOnly`. A listagem usa consulta JPA escopada, com `join fetch` de criança e profissional, e resolve os nomes dos autores em lote.

## Autorização

Antes de qualquer acesso, `AuthorizationService` confirma um vínculo ativo com a criança da URL.

- Profissional: recebe as próprias privadas, as próprias compartilhadas e compartilhadas de outros profissionais vinculados.
- Responsável: recebe somente compartilhadas e `isAutor` é sempre `false`.
- Criação: somente profissional vinculado; o autor vem do usuário autenticado.
- Atualização e exclusão: somente o profissional autor.
- Privada alheia: tratada como inexistente para não revelar sua presença.

`isAutor` serve apenas à experiência visual. Todas as decisões de segurança são recalculadas no backend.

## Prevenção de IDOR

Operações individuais consultam a anotação por `anotacaoId` e `criancaId` simultaneamente. Mesmo que o usuário tenha acesso à criança da URL, um identificador pertencente a outra criança não é encontrado. Depois disso, visibilidade e autoria ainda são verificadas na camada de aplicação.

## Endpoints

```text
POST   /api/criancas/{criancaId}/anotacoes
GET    /api/criancas/{criancaId}/anotacoes
GET    /api/criancas/{criancaId}/anotacoes/{anotacaoId}
PUT    /api/criancas/{criancaId}/anotacoes/{anotacaoId}
DELETE /api/criancas/{criancaId}/anotacoes/{anotacaoId}
```

A listagem aceita `visibilidade`, `profissionalId`, `busca` e `ordenacao` (`RECENTES` ou `ANTIGAS`). O papel não é recebido como parâmetro. Para responsáveis, a projeção compartilhada é forçada e solicitar privadas é rejeitado sem consultar anotações privadas.

## Auditoria

São registrados `ANNOTATION_CREATED`, `ANNOTATION_UPDATED` e `ANNOTATION_DELETED`. Os logs contêm somente identificadores, resultado e visibilidade. O conteúdo da anotação nunca é copiado para auditoria.

## Swagger/OpenAPI

A tag `Anotações` documenta os cinco endpoints, papéis, autorização relacional, privacidade, requests, responses e erros 400, 401, 403 e 404. Não há 409 específico no contrato porque esta fase não introduz conflito de domínio próprio.

Os documentos ficam disponíveis pelos caminhos configurados pelo projeto:

```text
/api/v3/api-docs
/api/docs
```

## Integração frontend

`ApiAnotacoesGateway` é a composição padrão e usa o `apiClient`. Para a visão agregada, ele obtém as crianças autorizadas e consulta a rota escopada de cada criança, consolidando e ordenando o resultado. O frontend não envia papel como autorização.

O mock permanece apenas como opção explícita de desenvolvimento visual:

```env
VITE_DEV_USE_MOCK_ANNOTATIONS=true
```

Essa opção só funciona em `import.meta.env.DEV`; o valor seguro e padrão é `false`. O bypass visual de autenticação não é aceito pelo backend e chamadas reais sem sessão continuam recebendo 401.

## Testes

Os testes cobrem criação privada e compartilhada, bloqueio de responsável, autoria em atualização e exclusão, transições de visibilidade, leitura por papel, vínculo, IDOR, filtros seguros, limites do conteúdo, migration e publicação OpenAPI. O E2E foi ampliado com criação, listagem, atualização, exclusão e leitura do responsável sem vazamento da privada.

## Limitações e próximos passos

- Não há paginação nesta primeira versão; avaliar antes de crescimento significativo da coleção.
- Não há notificações, eventos de domínio, listeners após commit, e-mail, push, WebSocket ou SSE.
- Não há endpoint, modelo, prompt, embedding, RAG ou integração real de IA.
- A próxima fase deve implementar notificações persistentes após a estabilização deste contrato.

## Documentação viva

Na próxima versão de `Documentacao_Tecnica_Viva_ConectaTEA.docx`, atualizar o status para `Em desenvolvimento — frontend + backend implementados`. A feature ainda não está concluída porque notificações, CI integral e homologação permanecem pendentes.
