# Preparação do backend para o novo frontend

Data: 2026-10-10

Base: `origin/main` em `ed5c453fd2d800c14c00e93e9322c5530787f777`

Branch: `feat/preparacao-backend-banco-novo-frontend`

## Escopo implementado

Esta entrega prepara o núcleo independente de #8, #65–#69, #72, #74 e #75, sem reformular o React e sem provisionar AWS. A matriz `Frontend/Levantamento_Contratos_Frontend_ConectaTEA.md` foi lida na cópia de trabalho original (ela estava não rastreada e foi preservada). As issues #8, #10, #12, #15, #16, #21–#39 e #52–#79 foram consultadas em 10/10/2026 pela API pública do GitHub; `gh` não estava instalado.

### Crianças — #65/#76–#78

- `POST /criancas` e `PUT /criancas/{id}` aceitam, todos opcionais: `escola`, `escolaridade`, `cidade`, `uf`, `interesses`, `nivelSuporte`.
- `GET /criancas` e `GET /criancas/{id}` devolvem esses campos e `arquivada`.
- `uf`, quando presente, usa duas letras maiúsculas; `nivelSuporte`, quando presente, aceita 1–3.
- Nenhum campo é inferido do diagnóstico e contato pendente continua separado de vínculo.

Exemplo parcial:

```json
{
  "nome": "Nome da criança",
  "dataNascimento": "2018-04-12",
  "escola": "Escola informada pela família",
  "escolaridade": "Ensino fundamental",
  "cidade": "Salvador",
  "uf": "BA",
  "interesses": "Texto informado, sem inferência clínica",
  "nivelSuporte": 2
}
```

### Metas e progresso — #66/#67

- Estados persistidos: `EM_ANDAMENTO`, `PAUSADA`, `CONCLUIDA`. Alertas de prazo são os booleanos `prazoProximo` e `prazoAtrasado`, não estados.
- Somente o profissional autor pode fazer `PUT /metas/{id}`, `DELETE /metas/{id}`, `PATCH /metas/{id}/progresso`, pausa ou retomada. A leitura continua relacional para profissionais/responsáveis vinculados.
- `PATCH /metas/{id}/pausa`, request `{ "motivo": "..." }`, registra data, motivo e evento auditável. Meta pausada rejeita progresso.
- `PATCH /metas/{id}/retomada`, request `{ "dataFim": "2027-03-31", "motivo": "opcional" }`. O prazo anterior é preservado quando `dataFim` é omitida; prazo passado é rejeitado.
- `GET /progresso/historico?criancaId={id}&meses=3|6|12` devolve todos os registros do corte, autor, estado capturado, tamanho da amostra e `historicoInsuficiente`; não calcula causalidade nem publica fórmula clínica.
- `metasAtivas` conta somente `EM_ANDAMENTO`. Progresso 100 não conclui automaticamente, porque conclusão/reabertura ainda requer decisão explícita.

Resposta resumida de meta:

```json
{
  "id": 42,
  "status": "PAUSADA",
  "progresso": 60,
  "autorProfissionalId": 7,
  "prazoProximo": false,
  "prazoAtrasado": false,
  "pausadaEm": "2026-10-10T11:30:00Z",
  "motivoPausa": "Reavaliação do plano"
}
```

### Sessões — #68

- Novo `GET /sessoes/{id}` com autorização por vínculo.
- Respostas incluem `autorProfissionalId`.
- `PUT`, `PATCH /status` e `DELETE` agora exigem o profissional autor no servidor.
- `observacoes` é tratada como conteúdo interno e omitida (`null`) para responsável; `descricao` permanece compartilhada pelo contrato atual.
- Não foram adicionados tipos, modalidades, objetivos nem transições ainda não aprovados.

### Notificações — #74

- `GET /notificacoes` continua sendo o histórico completo.
- Novo `GET /notificacoes/sino` lista itens não ocultados do sino.
- Novo `PATCH /notificacoes/sino/limpar` oculta os itens do sino do usuário autenticado e responde `{ "hidden": n }`; não apaga histórico e não altera `lida`/`lidaEm`.
- `PATCH /notificacoes/lidas` mantém a semântica distinta de Ler tudo.
- A janela de “nova/recente” não foi inventada; até essa decisão, o sino usa o marcador persistente de ocultação.

## Migration

`V8__prepare_new_frontend_core.sql`, `V9__notification_bell_visibility.sql`, `V10__legacy_progress_status_compatibility.sql` e `V11__care_circle_core.sql` são aditivas:

1. converte `VENCENDO`/`QUASE_CONCLUIDA` antigos para `EM_ANDAMENTO` (eram alertas derivados);
2. adiciona pausa coerente e `eventos_metas` com índices;
3. adiciona campos opcionais de criança e validações sem preencher conteúdo clínico;
4. a V9 adiciona `ocultada_sino` com default `false` e índice por usuário.
5. a V10 preserva `VENCENDO`/`QUASE_CONCLUIDA` de `progressos.status` em `status_legado`, normaliza o estado de trabalho para `EM_ANDAMENTO` e corrige `uf` para `VARCHAR(2)`. `nivel_suporte` permanece `SMALLINT` e é mapeado como `Short` no JPA.
6. a V11 adiciona papel e versionamento aos vínculos, sem promover responsáveis legados, e separa convites, solicitações e a ponte de solicitações dos tokens anteriores.

A aplicação anterior não compreende `PAUSADA`; portanto, durante rollout, a versão nova deve entrar antes de usuários pausarem metas. O novo schema permanece legível pela versão anterior enquanto nenhum estado novo for gravado, e as colunas aditivas são ignoradas pelo Hibernate antigo. Não há promessa de rollback automático de dados após uso de `PAUSADA`.

## Segurança e contratos comuns

- Autenticação segue cookie JWT HttpOnly, `credentials: include`, CORS e CSRF `X-XSRF-TOKEN` existentes.
- Autorização é aplicada em detalhes e mutações; IDs alheios não ganham acesso por DTO, UI ou notificação.
- Datas civis usam `YYYY-MM-DD`; timestamps usam ISO-8601 com offset/UTC conforme os contratos existentes.
- Validação retorna 400; ausência 404; falta de vínculo/autoria 403; conflito otimista pode retornar 409 pelo handler existente.

## Validação executada

- `mvnw.cmd -q -DskipTests compile`: sucesso.
- Execução anterior a `021dd15`: 96 testes aprovados e 13 integrações ignoradas por indisponibilidade local do Docker; esse resultado não foi usado como prova de banco.
- Na continuação pós-revisão, `mvnw.cmd test`: 107 testes, 0 falhas, 0 erros e 0 ignorados. Docker/Testcontainers com PostgreSQL 16 validou criação limpa até V11, `ddl-auto=validate`, tipos `SMALLINT/VARCHAR`, upgrade V7→V11 com históricos `VENCENDO`, `QUASE_CONCLUIDA` e `CONCLUIDA`, consumo concorrente de token e geração do OpenAPI em contexto executável.
- Clientes React foram inspecionados sem alterações. O frontend atual ainda tipa `VENCENDO` e `QUASE_CONCLUIDA`; a integração visual deve migrar para `PAUSADA` e usar os booleanos de alerta.

## Bloqueios e trabalho restante

- #8/#72/#75: o núcleo de papéis, listagem, transferência bloqueada do último gestor, saída e solicitação pendente por código está preparado. Responsáveis legados ficam com papel `NULL` e não recebem gestão. Convites nominais e bootstrap real continuam indisponíveis até email confirmado/verificação de autoridade terem contrato operacional.
- #67: série bruta 3/6/12 está pronta; coorte, frequência, baseline e composição calculada continuam pendentes, logo nenhum cálculo arbitrário foi publicado.
- #68: máquina final de transições, modalidade/local/objetivos e eventual associação de anotação dependem de contrato.
- #69/#73: arquivo pós-saída e efeitos de edição/exclusão de compartilhadas aguardam política de dados mínimos/retenção.
- #70: upload de foto depende de limites e estratégia de storage; não foi simulada persistência nem provisionada AWS.
- #64/#71/#76–78: composições finais e feed aguardam os contratos bloqueados acima e o visual de #24–#38.
- #15: IA permanece desativada até provedor, governança, retenção, consentimento e custos serem decididos.
- #52–#61: futuro deploy deve configurar PostgreSQL gerenciado, storage da foto, secrets, domínio/TLS, observabilidade, backups/RPO/RTO e região/orçamento. Nenhum recurso AWS foi criado.

## Responsabilidades e próxima integração

Alexandre prepara visual, componentes, estados e interfaces e mantém #12/#16 conforme a divisão combinada. Gabriel adapta os clientes, serviços/hooks/cache e integra as APIs: tipos de meta, pausa/retomada, alertas de prazo, campos da criança, detalhe de sessão, sino/histórico e Círculo. A integração de Gabriel deve revalidar 401/403 e limpar cache por conta/criança.

## Correções da revisão de 021dd15

- Schema: `nivel_suporte` mapeado como `Short`; `uf` corrigida por migration aditiva, sem editar V8.
- Histórico: alerta legado preservado em `alertaLegado`; endpoints recentes/histórico/evolução leem o estado normalizado sem perder a origem.
- Sessões: responsável pesquisa somente conteúdo compartilhado; observação interna não influencia resultados, detalhes ou DTO.
- Metas: violações de estado retornam `409` com codes `META_PAUSED`, `META_COMPLETED`, `META_CANNOT_PAUSE` ou `META_CANNOT_RESUME`; motivo é obrigatório na pausa e limitado a 500 caracteres.
- Tempo: cortes 3/6/12 usam meses de calendário, relógio injetável, UTC técnico do armazenamento, início inclusivo, fim exclusivo e ordem decrescente. A estratégia de localidade de apresentação permanece pendente.
- Exclusão de meta: `eventos_metas.meta_id ON DELETE RESTRICT` preserva o histórico e uma tentativa de exclusão referenciada retorna conflito; a proteção não foi removida.

## Círculo e código não nominal

- `GET /criancas/{criancaId}/circulo/membros`: membros derivados exclusivamente de vínculos infantis ativos, com IDs estáveis e `acoesPermitidas`.
- `PATCH /criancas/{criancaId}/circulo/gestao`: transferência entre responsáveis ativos, com locks pessimistas; vínculo legado sem papel não pode ser promovido silenciosamente.
- `DELETE /criancas/{criancaId}/circulo/membros/me`: saída voluntária; último gestor recebe `409 LAST_MANAGER`.
- `POST /vinculos/confirmar`: agora consome/reserva atomicamente o código não nominal e cria solicitação `PENDENTE`, sem conceder acesso.
- `PATCH /vinculos/criancas/{childId}/solicitacoes/{requestId}`: gestor aprova ou recusa; somente a aprovação cria o vínculo e consentimento. Replay do token continua `410`.

### Integração da solicitação pendente e E2E

- O cliente React interpreta `{solicitacaoId,criancaId,status}`. `PENDENTE` mostra “Solicitação enviada”, não invalida caches de vínculos/crianças/dashboard e não anuncia acesso liberado.
- O E2E cria um gestor previamente autorizado por fixture direta no PostgreSQL isolado e remove somente os vínculos criados pela própria execução. A fixture estabelece o pré-requisito do cenário; não implementa nem valida o bootstrap produtivo do primeiro gestor.
- Solicitação pendente permanece sem acesso e sem notificações. A aprovação é feita pela API real do gestor; solicitante, responsável comum e profissional recebem `403`. Somente após `APROVADA` o vínculo ativo autoriza leitura e entrega de notificações.
- Validação local: lint sem erros, build de produção aprovado e 7 testes focados de backend aprovados. O Playwright percorreu todas as asserções funcionais, mas a execução local encerrou ao copiar o trace por falta de espaço no volume; a repetição sem artefatos locais foi interrompida pelo usuário para publicação e confirmação no CI.

## Matriz de cobertura das 15 telas após correções de gestão

| Tela/bloco/ação | Endpoint | Banco/migration | Autorização | Teste | Situação | Pendência localizada |
|---|---|---|---|---|---|---|
| Shell/sessão #63 | `/auth/me`, `/auth/logout`, `/auth/csrf`, `/users/me` | usuários existentes | cookie HttpOnly, CSRF e usuário ativo | Auth/JWT/usuário | 1. Implementado e validado | integração visual/cache por conta continua com Gabriel |
| P01 Dashboard profissional #64 | `/dashboard/profissional`, `/criancas`, `/metas` | índices existentes | vínculos profissionais ativos | suíte backend; composição sem N+1 | 1. Implementado e validado para dados atuais | janela “nova” e semântica final do card semanal |
| P02 Crianças profissional #65 | `/criancas` e `/criancas/{id}` | V8/V10 | profissional vinculado; arquivada bloqueada | controller/Flyway | 1. Campos estruturados implementados e validados | paginação/filtros de alto volume e enum de acompanhamento ainda não implementados |
| P03 Detalhe/Círculo profissional #75/#76 | detalhe infantil, membros, metas, sessões, anotações | V8–V11 | vínculo infantil; autoria nas mutações | autorização e Círculo | 2. Blocos independentes implementados | feed composto e arquivo pós-saída bloqueados por contrato/retenção |
| P04 Metas #66 | `/metas`, `/pausa`, `/retomada`, `/progresso` | V8/V10 | somente autor muta | domínio e HTTP | 1. Implementado e validado | concluir/reabrir continua bloqueado; exclusão referenciada preserva histórico e retorna conflito |
| P05 Progresso #67 | `/progresso/historico`, resumo e consultas existentes | V8/V10 | vínculo ativo e escopo infantil | calendário/Flyway | 2. Histórico 3/6/12 implementado | série agregada, coorte, baseline e frequência ainda bloqueados; histórico bruto não é anunciado como agregado |
| P06 Sessões #68 | `/sessoes`, `/sessoes/{id}`, `/resumo` | schema existente | autor muta; responsável lê sem observação interna | privacidade de busca | 1. Contrato independente implementado e validado | transições finais, local/modalidade/objetivos e associação com anotação |
| P07 Anotações profissional #69 | `/criancas/{id}/anotacoes` | V6 | privada só autor; compartilhada relacional | 20 testes de serviço + integração | 1. Núcleo implementado e validado | título/temas e arquivo pós-saída bloqueados por retenção/dados mínimos |
| P08 Notificações profissional #74 | histórico, sino, limpar, leitura e badge | V7/V9 | isolamento por destinatário | serviço/controller/OpenAPI | 1. Implementado e validado | janela “nova/recente” não definida |
| P09 Perfil/configurações #70 | `/users/me`, `/profissionais/me` | schema existente | próprio usuário/perfil | MockMvc | 2. Campos atuais implementados | upload/remoção de foto, limites/storage e verificação de email ainda não implementados |
| R01 Dashboard responsável #71 | `/dashboard/responsavel` | índices existentes | todas as crianças com vínculo ativo | suíte backend/E2E | 1. Implementado e validado para cards atuais | feed composto e indicadores dependem de #67/#74 |
| R02 Minhas crianças #78 | `/criancas`, `/vinculos/me` | vínculos V1/V11 | somente vínculos ativos, não contatos pendentes | autorização/E2E | 1. Implementado e validado | filtros/paginação contratual de alto volume |
| R03 Detalhe/Círculo responsável #75/#77 | membros, solicitações, transferência, remoção e saída | V11 | gestor administra; comum lê/sai; último gestor protegido | unidade + concorrência PostgreSQL | 1. Núcleo de gestão implementado e validado | feed/arquivo permanecem localizados; bootstrap produtivo não está ativo |
| R04 Vinculação #72 | preview, confirmar, `/solicitacoes/me`, decisão do gestor | V11 | pendente sem acesso; gestor decide | replay/concorrência/E2E | 1. Código não nominal implementado e validado | nominal e proposta profissional aguardam email confirmado/aceite operacional; tabelas isoladas não são anunciadas como funcionalidade |
| R05 Anotações compartilhadas #73 | `/criancas/{id}/anotacoes` | V6/V7 | responsável recebe apenas compartilhadas | serviço/E2E | 1. Implementado e validado no vínculo ativo | preservação após edição/exclusão e retenção exigem decisão |
| R06 Notificações responsável #74 | histórico/sino/badge/leitura | V7/V9 | somente destinatário ativo; pendente/desvinculado não recebe eventos novos | provedor/E2E | 1. Implementado e validado | destino da UI deve continuar revalidando recurso |

Classificação 1 não significa tela visual concluída: indica que o contrato backend listado foi executado e validado. Integração React é de Gabriel; visual/componentes e #12/#16 permanecem com Alexandre.

### Gestão do Círculo — correções posteriores a `b94d696`

- `DELETE /vinculos/criancas/{id}` e `DELETE /criancas/{id}/circulo/membros/me` usam o mesmo fluxo transacional com lock pessimista. `LAST_MANAGER` impede que qualquer rota deixe a criança sem gestor.
- `DELETE /users/me` encerra vínculos do responsável pelo mesmo fluxo e rejeita desativação do último gestor; não deixa gestor inativo “utilizável” no Círculo.
- `PATCH /criancas/{id}/circulo/gestao` rejeita o próprio ator com `409 CANNOT_TRANSFER_TO_SELF`, criança arquivada, destino ausente e papel legado não classificado sem alterar o estado.
- `DELETE /criancas/{id}/circulo/membros/{vinculoId}?tipo=RESPONSAVEL|PROFISSIONAL` permite remoção apenas pelo gestor, com auditoria/histórico e proteção do último gestor.
- `GET /criancas/{id}/circulo/solicitacoes` lista pendências para o gestor; `GET /vinculos/solicitacoes/me` mostra ao solicitante apenas seus próprios estados e identificação mínima da criança.
- Aprovação revalida criança, gestor, solicitante ativo e vínculo atual. Decisões repetidas, solicitante já vinculado e criança arquivada retornam conflito de domínio.
