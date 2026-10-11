# Contrato canônico da API Java — fotografia da implementação

## Contrato vigente após o PR #80

Base: `/api`; JSON `camelCase`; datas civis `YYYY-MM-DD`; instantes ISO-8601. Autenticação por cookie HttpOnly `jwt`; mutações autenticadas exigem CSRF (`XSRF-TOKEN`/`X-XSRF-TOKEN`). Erros usam `{timestamp,status,error,code,message,path,fields?}`. O principal autenticado define o ator; IDs no request nunca substituem autorização relacional.

### Crianças e Círculo

- `POST /criancas` e `PUT /criancas/{id}` usam `nome`, `dataNascimento`, campos clínicos opcionais e `escola`, `escolaridade`, `cidade`, `uf`, `interesses`, `nivelSuporte`. Lista: `GET /criancas` → `{items,total}`; detalhe: `GET /criancas/{id}` → DTO direto.
- Estados: `PENDENTE_CLASSIFICACAO|EM_ACOMPANHAMENTO|PAUSADO|ENCERRADO`. `PATCH /criancas/{id}/estado` recebe `{status,motivo}`; `PATCH /criancas/{id}/arquivamento` recebe `{arquivada,motivo}`. Arquivamento preserva histórico, mas bloqueia mutações de domínio.
- `GET /criancas/{id}/circulo/membros`, `GET /criancas/{id}/circulo/solicitacoes`, `PATCH /criancas/{id}/circulo/gestao`, `DELETE /criancas/{id}/circulo/membros/me` e `DELETE .../membros/{vinculoId}?tipo=` aplicam o papel vigente e protegem o último gestor.
- Código/QR: preview autenticado, `POST /vinculos/confirmar` cria solicitação `PENDENTE`; gestor decide em `PATCH /vinculos/criancas/{childId}/solicitacoes/{requestId}`. Convite nominal usa `/vinculos/convites`, exige destinatário correto com email confirmado e aceite.
- Primeiro gestor: `POST /criancas/cadastro-responsavel` ou `POST /criancas/{id}/cadastro-responsavel` cria pedido sem acesso; `GET|PATCH /administracao/pedidos-primeiro-gestor[/{id}]` exige operador com `administrador=true`. Aprovação revalida solicitante ativo/confirmado e criança não arquivada, cria `RESPONSAVEL_GESTOR`, histórico, auditoria e um evento restrito. Recusa é definitiva para o pedido.

### Metas e progresso

- Meta: `EM_ANDAMENTO|PAUSADA|CONCLUIDA`. CRUD e `/progresso` permanecem; ações explícitas: `PATCH /metas/{id}/pausa` `{motivo}`, `/retomada` `{dataFim?,motivo?}`, `/conclusao` `{resumoResultado}` (máx. 2.000) e `/reabertura` `{motivo,novoPrazo,progressoInicial}` (0–99). Somente o autor profissional altera; leitura continua relacional.
- `GET /progresso/resumo-atual?criancaId=` retorna `{categorias,metasEmAndamento,metasPausadas,metasConcluidas,metasComDados,metasSemDados}`. Categorias contêm `{media,metasComDados,metasSemDados}`. Só metas em andamento entram na média; ausência é `null`, zero registrado é zero e cada meta com dado tem peso igual. O último registro é escolhido por `(data DESC,id DESC)`.
- `GET /progresso/evolucao-historica?criancaId=&meses=3|6|12&timezone=` retorna séries mensais por categoria, amostra, metas sem dados/pausadas, alterações de composição, tendência em pontos percentuais e sinalização de histórico insuficiente/legado. Limites mensais são locais e exclusivos no fim.
- `/resumo`, `/recentes`, `/historico`, `/distribuicao-categoria`, `/evolucao-categoria` e `/crianca` permanecem por compatibilidade; novos gráficos devem usar `resumo-atual` e `evolucao-historica`.

### Sessões, anotações e notificações

Contratos detalhados vigentes: [Sessões](#sessões) e [Anotações](#anotações).

- Sessão recebe `{criancaId,tipo,dataHora,duracao,descricao?,observacoes?,modalidade?,localInstrucoes?,objetivos?,anotacaoId?}`; `modalidade` padrão `PRESENCIAL` quando ausente; estados `AGENDADA|REALIZADA|CANCELADA|NAO_COMPARECEU`; criação retorna `201` com todos os campos incluindo `autorProfissionalId`. Há CRUD, `GET /sessoes/{id}`, `PATCH /status`, `/correcao` e `/reagendamento`. Somente o profissional autor muta; responsável não recebe `observacoes` privadas (campo `null` na resposta).
- Anotação: `POST` recebe `{titulo?,conteudo,visibilidade,temas?,sessaoId?}`; `titulo` ausente ou em branco aplica fallback `"Anotação"` antes de persistir; `sessaoId` exige sessão da mesma criança e do mesmo profissional. `PUT` recebe `{titulo,conteudo,visibilidade,temas,motivoCorrecao?}` — a semântica efetiva dos campos opcionais é descrita no contrato detalhado abaixo. Em qualquer edição, o servidor preserva o título anterior quando `titulo` é nulo ou em branco e os temas anteriores quando `temas` é `null`; quando a anotação já é `COMPARTILHADA`, `motivoCorrecao` torna-se obrigatório (`CORRECTION_REASON_REQUIRED`) e limita-se a 500 caracteres. `sessaoId` não integra o DTO de edição. Compartilhada não volta a privada (`SHARED_NOTE_IMMUTABLE_VISIBILITY`) e não admite exclusão (`SHARED_NOTE_PRESERVED`); correção gera versão anterior e evento `ANOTACAO_CORRIGIDA`.
- `GET /anotacoes/arquivo-proprio` é somente leitura, independente do vínculo atual e retorna apenas anotações de autoria própria. O DTO inclui `snapshotCapturadoEm`, `snapshotOrigem` e `snapshotHistoricoConfiavel`; `snapshotOrigem=MIGRACAO_V15` com `snapshotHistoricoConfiavel=false` não deve ser apresentado como verdade histórica.
- Notificações: `GET /notificacoes` (histórico), `/nao-lidas/count`, `/sino`; `PATCH /sino/limpar`, `/{id}/lida`, `/lidas`. Ocultar do sino não marca como lida nem apaga histórico.

### Feed e paginação

- Individual: `GET /criancas/{criancaId}/feed?size=10&antes=&antesId=`; `size` é 1–50. Agregado: `GET /dashboard/feed?size=5&antes=&antesId=`; `size` é 1–5.
- Resposta: `{items,hasMore,nextAntes,nextAntesId}`. Item: `{tipo,recursoTipo,recursoId,titulo,resumo,instante,id}`. Ordenação é `(instante DESC,id DESC)`; quando `hasMore=true`, o próximo request envia juntos `nextAntes` como `antes` e `nextAntesId` como `antesId`. Não existe paginação por `offset`.
- `id` é o identificador único da ocorrência e integra o cursor. Navegação usa `recursoTipo + recursoId`; tipos diferentes podem compartilhar `recursoId`.
- `CIRCULO` exige vínculo atual com a criança. `GESTORES` exige adicionalmente vínculo atual `RESPONSAVEL_GESTOR` na criança do evento, inclusive no agregado. Perda de gestão revoga a leitura. Textos do feed são projeções mínimas e não contêm prova, referência ou motivo administrativo.

### Dashboards e fuso

- `GET /dashboard/profissional?timezone=` retorna `{totalCriancas,criancasEsteMes,profissionaisAtivos,profissionaisAtivosEsteMes,totalMetas,metasAtivas,totalMetasEsteMes,progressoAtual,progressoAtualEsteMes,sessoesSemana,notificacoesNaoLidas,fusoUtilizado}`.
- `GET /dashboard/responsavel?timezone=` retorna `{totalCriancas,metasAtivas,sessoesSemana,sessoesProximas,notificacoesNaoLidas,progressoAtual,fusoUtilizado}`. `progressoAtual` contém `{media,metasComDados,metasSemDados,metasPausadas,metasConcluidas}`.
- `timezone`, quando presente, deve ser IANA válido; inválido retorna `400 INVALID_ARGUMENT`. Omissão usa `APP_TIME_ZONE`, validado na inicialização, com fallback `America/Bahia`. O dashboard agregado usa um único calendário para todas as crianças: semana `[segunda local,segunda seguinte)`, mês por limites locais e próximas sessões a partir do `Clock` atual. Não há fuso individual persistido nem inferência por UF.

### Perfil, OpenAPI e estado de validação

- Perfil próprio usa `/users/me`, `/profissionais/me`; foto é `POST/DELETE /profissionais/me/foto` e `GET /profissionais/fotos/{key}`. Locais, redes sociais e áreas de atuação têm coleções próprias sob `/profissionais/me`.
- OpenAPI: `/api/v3/api-docs`; Swagger: `/api/swagger-ui/index.html` e `/api/docs`. A CI valida presença de `openapi`, `info`, `paths` e `cookieAuth`, não equivalência exaustiva com todos os consumidores TypeScript.
- Evidência revisada: [CI 38138130356](https://github.com/Neukox/ConectaTEA/actions/runs/38138130356), SHA `32d3a90834ddfa3ce14b510c2b8a3fbdb814ca49`: backend 169/169, frontend aprovado e um cenário E2E React + Java + PostgreSQL aprovado. Isso não homologa as 15 telas.

## Sessões

Todos os endpoints de sessão são relativos a `/api/sessoes`. Enums de tipo: `TERAPIA_INDIVIDUAL|TERAPIA_OCUPACIONAL|FONOAUDIOLOGIA|AVALIACAO`. Enums de status: `AGENDADA|REALIZADA|CANCELADA|NAO_COMPARECEU`. Enums de modalidade: `PRESENCIAL|ONLINE`. `dataHora` e `novoInicio` são ISO-8601 com offset (ex.: `2026-11-15T10:00:00-03:00`). `SessionResponse` completo: `{id,dataHora,duracao,status,tipo,descricao,observacoes,criancaId,autorProfissionalId,modalidade,localInstrucoes,objetivos,anotacaoId}`; campo `observacoes` é `null` para responsável ou quando o usuário autenticado não é o autor.

### `POST /sessoes`

- Role/autenticação: `PROFISSIONAL` com vínculo ativo à criança (`requireCriancaWritable`); CSRF requerido.
- Request (todos os campos do `CreateSessionRequest`):

  | Campo | Tipo | Obrigatório | Validação / default |
  |---|---|---|---|
  | `criancaId` | `Long` | sim | vínculo ativo obrigatório |
  | `tipo` | enum `TipoSessao` | sim | — |
  | `dataHora` | `OffsetDateTime` (ISO-8601) | sim | `@FutureOrPresent` |
  | `duracao` | `int` (minutos) | sim | `@Min(1)` |
  | `descricao` | `String` | não | sem limite declarado |
  | `observacoes` | `String` | não | conteúdo privado; não exposto ao responsável |
  | `modalidade` | enum `ModalidadeSessao` | não | default `PRESENCIAL` aplicado pelo servidor |
  | `localInstrucoes` | `String` | não | sem limite declarado |
  | `objetivos` | `String` | não | sem limite declarado |
  | `anotacaoId` | `Long` | não | sem validação de associação adicional além da persistência |

- Response `201`: `SessionResponse` completo. Status inicial sempre `AGENDADA`.
- Erros: `400` validação (data passada, duração < 1, campo obrigatório ausente), `401`, `403` role/vínculo/CSRF, `404` profissional não encontrado.
- Payload de exemplo:

  ```json
  {
    "criancaId": 42,
    "tipo": "TERAPIA_INDIVIDUAL",
    "dataHora": "2026-11-15T10:00:00-03:00",
    "duracao": 50,
    "descricao": "Sessão de acompanhamento",
    "observacoes": "Nota interna do profissional",
    "modalidade": "PRESENCIAL",
    "localInstrucoes": "Sala 3, trazer material sensorial",
    "objetivos": "Trabalhar comunicação alternativa",
    "anotacaoId": null
  }
  ```

### `GET /sessoes` e `GET /sessoes/{id}`

- Role/autenticação: qualquer autenticado; sem CSRF.
- `GET /sessoes` — query params: `criancaId` (opcional), `status` (enum), `tipo` (enum), `periodo` (`TODOS|HOJE|SEMANA|MES`), `search` (busca em `descricao`; profissional também pesquisa em `observacoes`).
  - Profissional sem `criancaId`: vê sessões de todas as crianças vinculadas ao próprio perfil.
  - Responsável sem `criancaId`: vê sessões de todas as crianças vinculadas ativas.
  - `criancaId` informado: valida vínculo antes de filtrar.
  - Período `MES` cobre `[hoje, hoje + 1 mês]`, não o mês calendário.
- `GET /sessoes/{id}`: exige vínculo ativo via `requireCriancaWritable`; retorna `SessionResponse` com `observacoes` preenchido apenas se o solicitante for o autor.
- Response `200`: array de `SessionResponse` (list) ou `SessionResponse` único (detalhe).
- Erros: `400` período inválido, `401`, `403` sem vínculo, `404` sessão/criança ausente.

### `GET /sessoes/resumo`

- Role/autenticação: qualquer autenticado; sem CSRF.
- Request: sem parâmetros.
- Response `200`: `{sessoesHoje,sessoesConcluidas,sessoesEstaSemana,sessoesPendentes}` (todos `long`).
- Regra: escopo idêntico ao `GET /sessoes` sem `criancaId`; semana é `[segunda local, segunda local + 6 dias]`.

### `PUT /sessoes/{id}`

- Role/autenticação: `PROFISSIONAL` autor da sessão com vínculo ativo; CSRF requerido.
- Request (`UpdateSessionRequest` — sem `criancaId`, sem campos de detalhe):

  | Campo | Tipo | Obrigatório | Validação |
  |---|---|---|---|
  | `tipo` | enum `TipoSessao` | sim | — |
  | `dataHora` | `OffsetDateTime` (ISO-8601) | sim | sem `@FutureOrPresent` |
  | `duracao` | `int` | sim | `@Min(1)` |
  | `descricao` | `String` | não | — |
  | `observacoes` | `String` | não | — |

  > `modalidade`, `localInstrucoes`, `objetivos` e `anotacaoId` **não** integram `UpdateSessionRequest`; permanecem inalterados.

- Regra de negócio: `session.update()` lança `SESSION_FINAL` (409) se o status já não for `AGENDADA`; nesse caso, use `PATCH /correcao`.
- Response `200`: `SessionResponse` completo.
- Erros: `400` validação, `401`, `403` role/vínculo/autoria/CSRF, `404` sessão ausente, `409` `SESSION_FINAL`.

### `PATCH /sessoes/{id}/status`

- Role/autenticação: `PROFISSIONAL` autor com vínculo ativo; CSRF requerido.
- Request (`StatusRequest`):

  | Campo | Tipo | Obrigatório | Validação |
  |---|---|---|---|
  | `status` | enum `StatusSessao` | sim | destino: `REALIZADA|CANCELADA|NAO_COMPARECEU` |
  | `motivo` | `String` | não | armazenado no histórico; sem limite declarado |

- Regras de transição aplicadas pelo domínio:
  - Somente sessões com status `AGENDADA` podem ser transicionadas; qualquer outro status gera `INVALID_SESSION_TRANSITION` (409).
  - `NAO_COMPARECEU` só é aceito após `dataHora` (`NO_SHOW_BEFORE_START`, 409).
  - Destino `AGENDADA` não é permitido (`INVALID_SESSION_TRANSITION`, 409).
- Evento de feed: transição para `REALIZADA` gera `SESSAO_REALIZADA`; para `CANCELADA` gera `SESSAO_CANCELADA`.
- Response `200`: `SessionResponse`.
- Erros: `400` campo obrigatório ausente, `401`, `403`, `404`, `409` transição inválida ou `NO_SHOW_BEFORE_START`.

### `PATCH /sessoes/{id}/correcao`

- Role/autenticação: `PROFISSIONAL` autor com vínculo ativo; CSRF requerido.
- Request (`CorrectionRequest`):

  | Campo | Tipo | Obrigatório | Validação |
  |---|---|---|---|
  | `status` | enum `StatusSessao` | sim | destino: `REALIZADA|CANCELADA|NAO_COMPARECEU` |
  | `motivo` | `String` | **sim** | `@NotBlank`; ausente ou em branco → `400` |

- Diferença em relação a `/status`: aceita somente sessões cujo status já **não** é `AGENDADA` (`SESSION_NOT_FINAL`, 409 quando ainda for `AGENDADA`); `motivo` é obrigatório e armazenado no histórico com tipo `CORRECAO_STATUS`.
- Response `200`: `SessionResponse`.
- Erros: `400` motivo ausente/branco, `401`, `403`, `404`, `409` `SESSION_NOT_FINAL` ou destino inválido.
- Payload de exemplo:

  ```json
  { "status": "REALIZADA", "motivo": "Status corrigido; a sessão foi realizada nesta data." }
  ```

### `PATCH /sessoes/{id}/reagendamento`

- Role/autenticação: `PROFISSIONAL` autor com vínculo ativo; CSRF requerido.
- Request (`RescheduleRequest`):

  | Campo | Tipo | Obrigatório | Validação |
  |---|---|---|---|
  | `novoInicio` | `OffsetDateTime` (ISO-8601) | sim | `@FutureOrPresent` |
  | `duracao` | `int` (minutos) | sim | `@Min(1)` |
  | `motivo` | `String` | **sim** | `@NotBlank`; ausente ou em branco → `400` |

- Regra: chama `session.update()` internamente; portanto, lança `SESSION_FINAL` (409) se o status não for `AGENDADA`. O histórico anterior de `dataHora` e `novoInicio` é registrado com tipo `REAGENDAMENTO`.
- Response `200`: `SessionResponse` com `dataHora` atualizado.
- Erros: `400` campo obrigatório ausente/inválido, `401`, `403`, `404`, `409` `SESSION_FINAL`.
- Payload de exemplo:

  ```json
  { "novoInicio": "2026-11-22T10:00:00-03:00", "duracao": 50, "motivo": "Conflito de agenda; reagendado para semana seguinte." }
  ```

### `DELETE /sessoes/{id}`

- Role/autenticação: `PROFISSIONAL` autor com vínculo ativo; CSRF requerido.
- Request: sem body.
- Response `204`: sem body.
- Erros: `401`, `403` role/vínculo/autoria/CSRF, `404` sessão ausente.
- Frontend: `features/Sessoes/services/index.ts`; update usa `tipoSessao`/`data`, incompatível.

## Anotações

Todas as rotas são relativas a `/api/criancas/{criancaId}/anotacoes`. Role `PROFISSIONAL` é exigida em criação, edição e exclusão. Leitura (`GET`) aceita qualquer role autenticada com vínculo. `visibilidade` aceita `PRIVADA` ou `COMPARTILHADA`.

### `POST /criancas/{criancaId}/anotacoes`

- Role/autenticação: `PROFISSIONAL` com vínculo ativo à criança (`requireCriancaWritable`); CSRF requerido.
- Request (`CreateRequest`):

  | Campo | Tipo | Obrigatório | Validação / default |
  |---|---|---|---|
  | `titulo` | `String` | não | máx. 100 caracteres; ausente ou em branco → servidor aplica `"Anotação"` |
  | `conteudo` | `String` | **sim** | `@NotBlank`, mín. 10, máx. 3000 caracteres |
  | `visibilidade` | enum `VisibilidadeAnotacao` | **sim** | `PRIVADA` ou `COMPARTILHADA` |
  | `temas` | `String` | não | máx. 500 caracteres |
  | `sessaoId` | `Long` | não | sessão deve pertencer à mesma criança **e** ao mesmo profissional autor; violação → `SESSION_CHILD_MISMATCH` (business rule) ou `403` |

- Comportamento: anotação nasce sempre com `visibilidade=PRIVADA` internamente; se o request informar `COMPARTILHADA`, o serviço chama `atualizar()` na mesma transação para promover. Snapshot da criança (`snapshotCriancaId`, `snapshotCriancaNome`, `snapshotCapturadoEm`, `snapshotOrigem="CRIACAO"`) é capturado imediatamente.
- Notificação e feed: se `visibilidade=COMPARTILHADA`, dispara notificação `ANOTACAO_CRIADA` e evento de feed `ANOTACAO_COMPARTILHADA` no círculo.
- Response `201`: `AnotacaoResponse` — `{id,criancaId,criancaNome,autorProfissionalId,autorNome,autorEspecialidade,titulo,conteudo,temas,sessaoId,visibilidade,createdAt,updatedAt,isAutor}`.
- Erros: `400` validação (conteúdo ausente/curto/longo, título longo, visibilidade nula), `401`, `403` role/vínculo/sessão/CSRF, `404` criança ausente.
- Payload de criação privada:

  ```json
  {
    "titulo": "Observação pós-sessão",
    "conteudo": "A criança respondeu bem aos combinados visuais durante a atividade.",
    "visibilidade": "PRIVADA",
    "temas": "comunicação, rotina",
    "sessaoId": 15
  }
  ```

### `GET /criancas/{criancaId}/anotacoes` e `GET /criancas/{criancaId}/anotacoes/{anotacaoId}`

- Role/autenticação: qualquer autenticado com vínculo; sem CSRF.
- `GET` list — query params: `visibilidade` (enum; responsável não pode filtrar `PRIVADA`), `profissionalId` (Long), `busca` (string), `ordenacao` (`RECENTES|ANTIGAS`; default `RECENTES`).
  - `PROFISSIONAL`: vê próprias privadas + compartilhadas autorizadas.
  - `RESPONSAVEL`: vê somente compartilhadas; filtragem por `visibilidade=PRIVADA` retorna `400`.
- `GET /{anotacaoId}`: valida `criancaId`, vínculo, papel e visibilidade; previne IDOR.
- Response `200`: lista ou objeto único de `AnotacaoResponse`.
- `isAutor` é conveniente para UX e não é mecanismo de autorização.

### `PUT /criancas/{criancaId}/anotacoes/{anotacaoId}`

- Role/autenticação: `PROFISSIONAL` autor com vínculo ativo (`requireCriancaWritable`); CSRF requerido. Lock pessimista aplicado.
- Request (`UpdateRequest`; campos opcionais seguem a semântica efetiva do serviço):

  | Campo | Tipo | Obrigatório | Validação / semântica |
  |---|---|---|---|
  | `titulo` | `String` | não | máx. 100 caracteres |
  | `conteudo` | `String` | **sim** | `@NotBlank`, mín. 10, máx. 3000 caracteres |
  | `visibilidade` | enum `VisibilidadeAnotacao` | **sim** | `PRIVADA` ou `COMPARTILHADA` |
  | `temas` | `String` | não | máx. 500 caracteres |
  | `motivoCorrecao` | `String` | condicional | máx. 500 caracteres; **obrigatório** quando a anotação já for `COMPARTILHADA` |

  > `sessaoId` **não** integra o DTO de edição; não é possível alterar a sessão associada por esta rota.

- Semântica efetiva da edição, para `PRIVADA → PRIVADA`, `PRIVADA → COMPARTILHADA` e correção de `COMPARTILHADA`:
  - `titulo` nulo ou em branco preserva o título anterior; um valor não vazio substitui o anterior.
  - `temas` nulo preserva os temas anteriores; uma string enviada substitui o valor, inclusive string vazia.
  - `conteudo` é obrigatório e sempre substitui o anterior.
  - `visibilidade` é obrigatória; a promoção é permitida e o retorno de compartilhada para privada é rejeitado.
  - A presença de `PUT` na rota não implica limpeza dos campos opcionais omitidos: prevalece este comportamento do serviço.

- Regras de negócio:
  - `COMPARTILHADA → PRIVADA`: proibido — `SHARED_NOTE_IMMUTABLE_VISIBILITY` (business rule, 409).
  - Correção de `COMPARTILHADA` sem `motivoCorrecao`: `CORRECTION_REASON_REQUIRED` (business rule, 409).
  - Promoção `PRIVADA → COMPARTILHADA`: sem motivo obrigatório; dispara notificação `ANOTACAO_COMPARTILHADA` e evento de feed.
  - Correção `COMPARTILHADA → COMPARTILHADA`: persiste versão anterior (`VersaoAnotacao`), evento de feed `ANOTACAO_CORRIGIDA`, notificação `ANOTACAO_EDITADA`.

- Response `200`: `AnotacaoResponse` atualizado.
- Erros: `400` validação, `401`, `403` role/vínculo/autoria/CSRF, `404`, `409` visibilidade imutável ou motivo ausente.

- Payload de edição privada (sem correção):

  ```json
  {
    "titulo": "Observação revisada",
    "conteudo": "A criança respondeu bem, com menor resistência do que na sessão anterior.",
    "visibilidade": "PRIVADA",
    "temas": "comunicação, rotina"
  }
  ```

- Payload de correção compartilhada (motivoCorrecao obrigatório):

  ```json
  {
    "titulo": "Observação pós-sessão (corrigida)",
    "conteudo": "Conteúdo corrigido após revisão clínica interna.",
    "visibilidade": "COMPARTILHADA",
    "temas": "comunicação",
    "motivoCorrecao": "Erro na descrição da resposta comportamental; texto corrigido para refletir o observado."
  }
  ```

### `GET /criancas/{criancaId}/anotacoes/{anotacaoId}/versoes`

- Role/autenticação: qualquer autenticado com vínculo; sem CSRF. Revalida vínculo e visibilidade.
- Response `200`: array de `VersaoResponse` — `{id,numero,titulo,conteudo,temas,motivoCorrecao,autorUsuarioId,criadoEm}`, ordenado por `numero` decrescente.
- Cada versão representa o estado anterior à correção; somente correções de anotações compartilhadas geram versões.

### `DELETE /criancas/{criancaId}/anotacoes/{anotacaoId}`

- Role/autenticação: `PROFISSIONAL` autor com vínculo ativo; CSRF requerido.
- Regra: anotação `COMPARTILHADA` não pode ser excluída — `SHARED_NOTE_PRESERVED` (business rule, 409).
- Response `204`: sem body.
- Erros: `401`, `403`, `404`, `409` exclusão de compartilhada.

### `GET /anotacoes/arquivo-proprio`

- Role/autenticação: `PROFISSIONAL` autenticado; sem CSRF. Rota independente de `criancaId`; retorna somente anotações de autoria do profissional autenticado, independente do vínculo atual com a criança.
- Response `200`: array de `ArquivoResponse` — `{id,criancaId,criancaNome,snapshotCapturadoEm,snapshotOrigem,snapshotHistoricoConfiavel,titulo,conteudo,temas,sessaoId,visibilidade,createdAt,updatedAt}`.
- `snapshotHistoricoConfiavel`: `true` quando `snapshotOrigem="CRIACAO"`; `false` quando `snapshotOrigem="MIGRACAO_V15"`. Valor `false` indica captura técnica do legado e não deve ser apresentado como verdade histórica ao profissional.
- Arquivo é somente leitura; não há edição ou exclusão por esta rota.
- Erros: `401`, `403` role não profissional, `404` perfil profissional ausente.

## Histórico anterior — não normativo

O conteúdo abaixo preserva a evolução do contrato. Afirmações de indisponibilidade, parcialidade, `offset`, DTOs antigos ou pendência posteriormente resolvida valem somente para a etapa em que foram escritas. Em caso de conflito, prevalece o contrato vigente acima e o código mergeado no PR #80.

> Atualização de 10/10/2026: em `GET /criancas/{id}/circulo/membros`, `acoesPermitidas` contém `podeRemover`, `podeSair`, `requerTransferenciaGestao` e `podeTransferirGestao`. Para o último gestor, `podeSair=false` e `requerTransferenciaGestao=true`; a tentativa direta continua retornando `409 LAST_MANAGER`.
>
> Foto profissional: `POST /profissionais/me/foto` (`multipart/form-data`, parte `file`) substitui a foto do próprio perfil; `DELETE /profissionais/me/foto` remove; `GET /profissionais/fotos/{key}` entrega JPEG/PNG armazenado. Limites: 5 MiB e 64–4096 px. Bytes, assinatura e decodificação são validados; `PUT /profissionais/me` não aceita `fotoPerfilUrl`.
> O `PUT /profissionais/me` não possui mais `fotoPerfilUrl`. A URL retornada é absoluta e configurável por `PUBLIC_API_URL`; sem essa variável, usa a origem HTTP observada e o context-path `/api`. Troca e remoção usam lock do perfil, persistência explícita e limpeza de arquivo sincronizada ao commit.

## Verificação de email e convite nominal (V12)

- `POST /auth/email-verification/request`: público, `{email}`, resposta neutra e rate limit por IP.
- `POST /auth/email-verification/confirm`: público, `{token}`, consumo único; token inválido/expirado/usado retorna `400 INVALID_EMAIL_VERIFICATION_TOKEN`.
- `GET /auth/email-verification/status`: autenticado, `{confirmado,confirmadoEm}`.
- `POST /vinculos/convites`: gestor ativo, `{criancaId,destinatarioEmail,papel}` com `RESPONSAVEL|PROFISSIONAL`; retorna token uma única vez e `PENDENTE_ACEITE`.
- `POST /vinculos/convites/aceitar`: destinatário autenticado com email confirmado; revalida gestor, criança e conta antes de ativar o vínculo.
- `GET /vinculos/convites/me`, `GET /vinculos/convites/criancas/{id}` e `DELETE /vinculos/convites/criancas/{id}/{conviteId}` consultam/cancelam conforme destinatário ou gestor.
- Primeiro gestor permanece indisponível até aprovação da prova de autoridade; confirmação de email não a substitui.

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

## Estado de congelamento da fotografia antiga (histórico superado)

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
# Complemento canônico — novo frontend (10/10/2026)

- `POST /criancas/cadastro-responsavel` cria criança pendente e pedido administrativo, sem acesso ativo.
- `GET|PATCH /administracao/pedidos-primeiro-gestor[/{id}]` exige `usuarios.administrador=true`; decisão registra referência mínima e operador.
- `PATCH /criancas/{id}/estado` e `/arquivamento` são exclusivos de gestor. Arquivada continua legível por vínculo e rejeita mutações.
- `PATCH /metas/{id}/conclusao` exige `resumoResultado`; `/reabertura` exige `motivo`, `novoPrazo` e `progressoInicial` 0–99.
- `GET /progresso/resumo-atual` e `/evolucao-historica?meses=3|6|12` são contratos distintos; ausência de registro é `metasSemDados`, não zero.
- Sessões não expõem `observacoes` privadas fora do autor. Estados canônicos: `AGENDADA|REALIZADA|CANCELADA|NAO_COMPARECEU`.
- Anotação usa `titulo`, `conteudo`, `temas`, `sessaoId`; correção compartilhada requer `motivoCorrecao`; `GET .../arquivo-proprio` retorna apenas autoria própria.
- Correção posterior da proposta histórica: `GET /criancas/{id}/feed?size=&antes=&antesId=` usa cursor por instante e identificador; `offset` nunca integrou o contrato vigente.
- `PUT /profissionais/me` não aceita `fotoPerfilUrl`; foto é mutação separada e serializada pelo mesmo lock pessimista.

Instantes são ISO-8601/UTC; cálculo local usa `America/Bahia` como fallback, sem inferir todos os municípios por UF. Política definitiva de retenção e implantação AWS não integram este contrato funcional.

## Correções de contrato de 10/10/2026

- `GET /anotacoes/arquivo-proprio` possui um único mapping canônico, em `ArquivoProprioController`.
- `resumoResultado` de conclusão de meta aceita até 2.000 caracteres e permanece integral na meta e no histórico. `eventos_feed.resumo` é somente uma projeção de apresentação de até 500 caracteres; quando reduzida, termina em `…`.
- `GET /progresso/evolucao-historica` aceita `timezone` IANA opcional. Valor inválido retorna `400 INVALID_ARGUMENT`; ausência usa `America/Bahia`. A API não deduz fuso por UF.
- A resposta de evolução expõe `categorias.{CATEGORIA}.{pontos,tendenciaPontosPercentuais,historicoInsuficiente}`. Cada ponto contém `average`, `amostra`, `metasSemDados`, `metasPausadas`, `alteracoes` e `composicaoAlterada`.
- `GET /criancas/{criancaId}/anotacoes/{anotacaoId}/versoes` revalida vínculo e visibilidade. Correção compartilhada produz uma versão anterior e `ANOTACAO_CORRIGIDA` atomicamente.
- `GET /dashboard/feed?size=5&antes=&antesId=` agrega somente eventos `CIRCULO` das crianças atualmente autorizadas. O cursor exige instante e ID juntos.
- Arquivo próprio inclui `snapshotCapturadoEm`, `snapshotOrigem` e `snapshotHistoricoConfiavel`. `MIGRACAO_V15` informa captura técnica do legado e nunca é apresentada como verdade histórica.

### Identidade, visibilidade do feed e coorte

- Em itens do feed, `id` é o ID único do evento e deve ser usado com `instante` no cursor; `recursoId` é o ID persistido do recurso indicado por `recursoTipo` e deve ser usado para navegação.
- `CIRCULO` exige vínculo atual com a criança. `GESTORES` exige adicionalmente vínculo atual `RESPONSAVEL_GESTOR` naquela mesma criança; a avaliação ocorre evento a evento também no feed agregado.
- Eventos restritos emitidos: `GESTAO_TRANSFERIDA` e `MEMBRO_REMOVIDO`. A descrição é mínima e não contém contatos, provas administrativas ou dados clínicos privados.
- O ponto mensal de progresso usa limite final exclusivo no fuso resolvido. A sequência é ordenada por instante e ID. Conclusão anterior exclui a meta até eventual reabertura; reabertura no ponto inicia nova fase, e conclusão ou pausa posterior prevalece conforme a última transição.

### Contrato de dashboards e eventos de gestão (V16)

`GET /dashboard/profissional` e `GET /dashboard/responsavel` fornecem contagens de metas EM_ANDAMENTO, sessões AGENDADA da semana local (segunda inclusiva até a segunda seguinte exclusiva), notificações não lidas (também as ocultadas do sino) e resumo atual. A média geral, quando disponível, é aritmética entre metas EM_ANDAMENTO que têm registros, com peso igual por meta. `media: null` junto de `metasComDados`/`metasSemDados` distingue ausência de amostra do valor 0. Metas pausadas e concluídas são contadas à parte. Sessões futuras contam desde o Clock atual.

Feed de dashboard usa `size=5`, detalhe `size=10`. `id` é a ocorrência para cursor junto a `instante`; `recursoTipo + recursoId` abre o recurso. `CIRCULO` depende de vínculo atual. `GESTORES` requer vínculo atual `RESPONSAVEL_GESTOR` na criança do evento, inclusive no agregado.

Catálogo de gestão: `PRIMEIRO_GESTOR_APROVADO` é GESTORES e nasce do histórico por trigger V16; `GESTAO_TRANSFERIDA` e `MEMBRO_REMOVIDO` são GESTORES; `MEMBRO_ENTROU` no aceite nominal ou aprovação de código/QR e `MEMBRO_SAIU` em saída voluntária são CIRCULO. Somente texto mínimo é projetado. Operações anteriores sem ocorrência persistida não recebem backfill inventado.
