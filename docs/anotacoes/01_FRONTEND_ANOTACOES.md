# Frontend do módulo de Anotações

## Objetivo

Entregar a experiência inicial de anotações para profissionais e responsáveis, com dados em memória e uma fronteira explícita para a futura API Java. A interface demonstra regras de produto, mas não substitui a autorização do backend.

## Experiências por papel

O profissional pode listar as anotações das crianças às quais possui acesso, criar registros privados ou compartilhados e alterar ou excluir somente itens dos quais é autor. Anotações compartilhadas de outros profissionais aparecem sem ações de mutação.

O responsável recebe somente itens compartilhados das crianças vinculadas. Sua experiência não contém criação, edição, exclusão, filtros privados, contagens privadas ou qualquer indicação de que conteúdo privado existe.

## Privada e compartilhada

- `PRIVADA`: visível somente ao profissional autor.
- `COMPARTILHADA`: futuramente será visível aos membros ativos e autorizados do Círculo de Cuidado da criança.

O filtro do mock aplica a projeção por papel antes de pesquisar ou ordenar. Isso evita vazamento visual na demonstração, mas não é uma garantia de segurança. O backend deverá autenticar, verificar autoria e vínculo ativo e retornar somente dados autorizados.

## Arquitetura frontend

A feature está em `Frontend/src/features/Anotacoes` e separa componentes, hooks, tipos, schemas, constantes, mocks e serviços. As páginas por papel apenas compõem `PageLayout` e a experiência compartilhada.

`AnotacoesGateway` define as operações de listar, criar, atualizar e excluir. `MockAnotacoesGateway` implementa o contrato em memória. Os hooks TanStack Query dependem do contrato exportado em `services`, permitindo trocar a composição por uma futura `ApiAnotacoesGateway` sem reescrever páginas ou componentes.

Os mocks ficam centralizados e cobrem múltiplas crianças, múltiplos profissionais, anotações próprias privadas e compartilhadas e uma anotação compartilhada de outro profissional. Nenhuma anotação privada de outro profissional faz parte da projeção disponível ao usuário atual.

## Preparação para IA

Itens compartilhados oferecem `AiAnnotationAssistantTrigger` e `AiAnnotationAssistantDialog`. O diálogo recebe `annotationId`, não chama serviço externo e informa que a funcionalidade ainda está em preparação.

Fluxo futuro obrigatório:

```text
Usuário
  -> backend autentica
  -> backend aplica autorização relacional
  -> backend seleciona somente dados permitidos
  -> contexto autorizado
  -> modelo de IA
  -> resposta
```

O modelo de IA nunca decidirá autorização e nunca deverá receber um conjunto irrestrito de anotações.

## Preparação para notificações

Os modelos preservam `annotationId`, `childId`, `authorId`, `authorName` e `visibility` por meio de `ContextoNotificacaoAnotacao`.

Fluxo de backend planejado:

```text
Profissional cria anotação COMPARTILHADA
  -> backend persiste
  -> COMMIT
  -> AnotacaoCompartilhadaCriadaEvent
  -> listener AFTER_COMMIT
  -> Círculo de Cuidado
  -> notificações persistentes
```

Não há polling, WebSocket, SSE, push ou serviço de notificações nesta fase. Notificações pertencem ao domínio do backend Java; um runtime Python acrescentaria deploy, observabilidade e custo operacional sem benefício atual. Python poderá ser avaliado futuramente para IA, NLP, embeddings, RAG, avaliações de modelo e processamento específico de ML.

## Decisões e limitações

- Persistência somente em memória; recarregar a aplicação restaura os mocks.
- Sem endpoints fictícios e sem alterações em backend, banco ou Swagger/OpenAPI.
- A autorização visual existe para demonstrar o produto, não como barreira de segurança.
- O projeto não recebeu framework novo de testes unitários nesta fase.
- GSAP é usado apenas para entrada progressiva dos cards, respeitando `prefers-reduced-motion`.

## Próximos passos do backend

Na mesma branch `feat/anotacoes`, implementar persistência, autorização relacional, regras de autoria, eventos após commit, notificações, testes unitários, integração e E2E. Somente quando os endpoints reais existirem, implementar `ApiAnotacoesGateway` e substituir a composição do mock.

Swagger/OpenAPI permanece pendente até o backend real. Nessa fase, documentar a tag `Anotações`, segurança, papéis, autoria, visibilidades, vínculo com criança, requests, responses, paginação e filtros implementados, exemplos e erros 400, 401, 403, 404 e 409 quando aplicável. O contrato publicado deve refletir apenas comportamento implementado e testado.

## Bypass local de autenticação para teste visual

O frontend possui um bypass estritamente local para abrir rotas protegidas durante testes visuais sem depender de uma sessão real. A configuração é centralizada em `Frontend/src/config/devAuth.ts` e somente é aceita quando o Vite informa `import.meta.env.DEV === true`, o bypass está explicitamente habilitado e o papel pertence à lista permitida.

Crie um arquivo local não versionado, como `Frontend/.env.local`, com:

```env
VITE_DEV_BYPASS_AUTH=true
VITE_DEV_USER_ROLE=PROFISSIONAL
```

Depois execute:

```bash
npm run dev
```

E acesse `http://localhost:5173/profissional/anotacoes`.

Para visualizar a experiência do responsável, altere o papel e reinicie o Vite:

```env
VITE_DEV_BYPASS_AUTH=true
VITE_DEV_USER_ROLE=RESPONSAVEL
```

Acesse `http://localhost:5173/responsavel/anotacoes`.

O usuário mock é mínimo, usa identificador negativo e dados locais fictícios. `ProtectedRoute` continua ativo e aplica `allowedRoles`; portanto, um profissional mock não acessa uma rota exclusiva de responsável e vice-versa. Um papel ausente ou inválido desativa o bypass e preserva o fluxo normal de autenticação.

Nunca habilite o bypass em produção. Além da variável explícita, a condição `import.meta.env.DEV` impede sua ativação em builds normais. Não versione arquivos `.env` locais.

## Documentação viva

Na próxima revisão de `Documentacao_Tecnica_Viva_ConectaTEA.docx`, atualizar Anotações de `Não iniciado` para `Em desenvolvimento — frontend`. A feature só poderá ser marcada como concluída após frontend, backend, banco, notificações, testes, OpenAPI, documentação, CI e homologação.
