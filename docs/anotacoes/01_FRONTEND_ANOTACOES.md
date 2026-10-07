# Frontend do módulo de Anotações

## Objetivo

Entregar a experiência de anotações para profissionais e responsáveis, integrada à API Java. A interface demonstra regras de produto, mas não substitui a autorização do backend.

## Experiências por papel

O profissional pode listar as anotações das crianças às quais possui acesso, criar registros privados ou compartilhados e alterar ou excluir somente itens dos quais é autor. Anotações compartilhadas de outros profissionais aparecem sem ações de mutação.

O responsável recebe somente itens compartilhados das crianças vinculadas. Sua experiência não contém criação, edição, exclusão, filtros privados, contagens privadas ou qualquer indicação de que conteúdo privado existe.

Na experiência do responsável, autoria não possui significado visual. O campo `isAutor` é ignorado para esse papel, mesmo quando estiver presente no objeto recebido. A indicação `Sua anotação` é exclusiva da experiência profissional e somente aparece quando o profissional atual é o autor.

## Privada e compartilhada

- `PRIVADA`: visível somente ao profissional autor.
- `COMPARTILHADA`: visível aos profissionais e responsáveis autorizados pelos vínculos ativos existentes. O Círculo de Cuidado formal ainda será implementado.

O filtro do mock aplica a projeção por papel antes de pesquisar ou ordenar. Isso evita vazamento visual na demonstração isolada, mas não é uma garantia de segurança. Na integração real, o backend autentica, verifica autoria e vínculo ativo e retorna somente dados autorizados.

## Arquitetura frontend

A feature está em `Frontend/src/features/Anotacoes` e separa componentes, hooks, tipos, schemas, constantes, mocks e serviços. As páginas por papel apenas compõem `PageLayout` e a experiência compartilhada.

`AnotacoesGateway` define as operações de listar, criar, atualizar e excluir. Os hooks TanStack Query dependem do contrato exportado em `services`; a composição padrão usa `ApiAnotacoesGateway`, enquanto `MockAnotacoesGateway` permanece disponível para desenvolvimento visual isolado sem reescrever páginas ou componentes.

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

## Notificações implementadas

O backend implementa notificações internas persistentes para alterações relevantes em anotações compartilhadas. Criação, edição e exclusão de uma compartilhada geram notificação. As transições `PRIVADA -> COMPARTILHADA` e `COMPARTILHADA -> PRIVADA` também geram eventos específicos; criação, edição e exclusão de anotações que permanecem privadas não geram notificação.

Os destinatários são resolvidos pela abstração `CareRecipientsProvider`. A implementação atual consulta os vínculos ativos de profissionais e responsáveis, exclui o autor da alteração e considera somente usuários ativos. Essa fronteira prepara a arquitetura para o futuro Círculo de Cuidado sem afirmar que esse modelo formal já existe.

Fluxo implementado no backend:

```text
Profissional altera anotação compartilhada
  -> backend resolve vínculos ativos por CareRecipientsProvider
  -> persiste anotação e notificações na mesma transação
  -> COMMIT
  -> listener AFTER_COMMIT solicita o envio assíncrono de e-mails pela Brevo
```

O e-mail é um canal externo complementar e não inclui o conteúdo da anotação nem dados clínicos ou sensíveis; orienta o destinatário a acessar o ConectaTEA conforme suas permissões. Falhas externas não desfazem a alteração já confirmada, mas ainda não existe Outbox/retry durável e, portanto, não há garantia durável de entrega. WhatsApp, push, WebSocket e SSE não foram implementados. Notificações pertencem ao domínio do backend Java; Python poderá ser avaliado futuramente para IA, NLP, embeddings, RAG, avaliações de modelo e processamento específico de ML.

## Decisões e limitações

- A implementação padrão usa `ApiAnotacoesGateway`; o mock permanece disponível somente para desenvolvimento visual isolado.
- O backend real, banco e Swagger/OpenAPI são descritos em `02_BACKEND_ANOTACOES.md`.
- A autorização visual existe para demonstrar o produto, não como barreira de segurança.
- O projeto não recebeu framework novo de testes unitários nesta fase.
- GSAP é usado apenas para entrada progressiva dos cards, respeitando `prefers-reduced-motion`.

## Próximos passos do backend

Persistência, autorização relacional, regras de autoria, integração e contrato OpenAPI do módulo de Anotações estão implementados. Na branch `feat/notificacoes-anotacoes`, também estão implementadas as notificações internas persistentes e o envio externo por e-mail após commit via Brevo.

Swagger/OpenAPI agora publica a tag `Anotações`, segurança, papéis, autoria, visibilidades, vínculo com criança, requests, responses, filtros implementados, exemplos e erros aplicáveis. O contrato reflete somente os endpoints reais.

Os próximos passos relacionados são implementar o Círculo de Cuidado formal, adotar Outbox/retry durável para entrega externa e avaliar WhatsApp e push como novos canais. IA contextual e hardening adicional permanecem como evoluções futuras.

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

O módulo de Anotações está implementado. Na branch `feat/notificacoes-anotacoes`, as notificações persistentes e o envio de e-mail também estão implementados, e o conjunto encontra-se em validação e revisão para merge. A documentação viva deve registrar o estado definitivo de `concluído na main` somente depois de PR, revisão, CI e merge.
