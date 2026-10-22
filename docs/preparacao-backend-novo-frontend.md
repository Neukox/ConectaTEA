# Preparação do backend para o novo frontend

## Estado atual após o PR #80

O merge `41c7889103d44f19576878fba86135a078f99316` incorpora a preparação Java/PostgreSQL até V16. Estão implementados os contratos de estados infantis, Círculo, convites nominal e código/QR, aprovação administrativa do primeiro gestor, conclusão/reabertura de metas, séries por categoria, sessões ampliadas, versões/arquivo de anotações, feed individual/agregado, dashboards e fuso configurável. O contrato vigente está em [`refatoracao-java/12_API_CONTRACT_JAVA_CANONICO.md`](refatoracao-java/12_API_CONTRACT_JAVA_CANONICO.md) e a situação das telas em [`../Frontend/Levantamento_Contratos_Frontend_ConectaTEA.md`](../Frontend/Levantamento_Contratos_Frontend_ConectaTEA.md).

### Evidência consolidada

- SHA preparado: `32d3a90834ddfa3ce14b510c2b8a3fbdb814ca49`.
- [GitHub Actions 38138130356](https://github.com/Neukox/ConectaTEA/actions/runs/38138130356): `success`; jobs `backend-java`, `frontend` e `e2e` aprovados.
- Backend: 169 testes, zero falhas, erros ou ignorados. A cobertura inclui PostgreSQL 16, instalação limpa e upgrade populado até V16, Hibernate `ddl-auto=validate`, autorização, concorrência e rollbacks.
- E2E: um cenário React + Java + PostgreSQL aprovado. Ele confirma o fluxo codificado e a orquestração real, não as 15 telas nem homologação funcional humana.
- OpenAPI/Swagger: a CI consulta JSON/UI e verifica estrutura básica e `cookieAuth`; não há evidência de comparação exaustiva de todos os DTOs com todos os clientes TypeScript.

### Entregas vigentes

- Progresso atual centralizado em `LatestProgressService`, com desempate `(data,id)`, zero distinto de ausência, estados fora da média e pesos iguais por meta. Séries mensais por categoria expõem amostra, composição e tendência.
- Fuso injetado por `APP_TIME_ZONE`, IANA validado, fallback `America/Bahia` e override IANA por request. Não existe resolução individual persistida nem inferência por UF; agregados usam um único calendário.
- Primeiro gestor decidido por operador administrativo, com elegibilidade, histórico, auditoria e evento V16 transacionais. Recusa/replay/rollback e visibilidade restrita foram testados em PostgreSQL.
- Feed usa cursor `(antes,antesId)`, nunca offset; separa `id` da ocorrência de `recursoId` e revalida `CIRCULO`/`GESTORES` por criança.
- Metas têm pausa/retomada/conclusão/reabertura; sessões têm estados finais, correção e reagendamento; anotações têm título/temas/sessão, versões e arquivo próprio com snapshots.

### Limitações atuais

- A integração visual e homologação das 15 telas #63–#78 não estão comprovadas pelo único cenário E2E; #79 permanece parcial para sua matriz completa.
- Política final de retenção/expurgo e responsabilidades operacionais ainda precisam de decisão. O snapshot V15 resolve preservação técnica, não a governança jurídica final.
- O storage local de fotos é adequado a desenvolvimento/teste. Storage durável, secrets, backups, observabilidade, RPO/RTO, domínio/TLS e demais decisões AWS seguem em #52–#61.
- IA continua fora da preparação: fornecedor, governança, consentimento, retenção, limites e custos permanecem em #15.
- Portanto, esta preparação não declara prontidão para uso real com famílias.

### Rastreabilidade da #62

| Critério | Evidência | Estado |
|---|---|---|
| Matriz das 15 telas e contratos atuais | matriz Frontend + contrato canônico | consolidado documentalmente; integração visual pendente |
| Banco versionado e compatível | V8–V16 + `FlywaySchemaIntegrationTest` | instalação limpa/upgrade populado cobertos |
| Autorização e regras #8/#10 | testes de círculo, feed, primeiro gestor, autoria e snapshots | núcleo implementado; retenção/operação real pendentes |
| OpenAPI e consumidores | testes OpenAPI, build frontend e inspeção dos clientes | estrutura/build validados; equivalência exaustiva não comprovada |
| E2E #79 | um cenário real aprovado | parcial; não cobre 15 telas nem todos os papéis/erros |
| Produção e IA | nenhuma implantação nesta entrega | pendentes em #52–#61 e #15 |

## Histórico incremental — não normativo

As seções seguintes preservam os relatos por etapa/commit. Expressões como “bloqueado”, “parcial”, “em execução” ou “pendente de revalidação” descrevem o momento histórico e foram superadas quando contradizem o estado atual acima.

Data: 2026-10-10

## Incremento de email e convites nominais — V12

- `POST /auth/email-verification/request` responde sempre com mensagem neutra; tokens aleatórios de 256 bits são guardados somente como SHA-256, valem 24 horas por padrão e têm reenvio suprimido por cinco minutos.
- `POST /auth/email-verification/confirm` consome o token atomicamente. `GET /auth/email-verification/status` expõe apenas o estado da conta autenticada. O cadastro emite a verificação após persistir a conta; falha assíncrona de envio não desfaz cadastro e o reenvio permite recuperação.
- `POST /vinculos/convites` permite ao gestor emitir nominal para `RESPONSAVEL` ou `PROFISSIONAL`. `POST /vinculos/convites/aceitar` exige conta destinatária, email confirmado, conta/criança/emissor ainda válidos e token pendente antes de criar ou reativar vínculo.
- `GET /vinculos/convites/me`, `GET /vinculos/convites/criancas/{childId}` e `DELETE /vinculos/convites/criancas/{childId}/{inviteId}` cobrem consulta e cancelamento. Replay não reativa acesso.
- `RESPONSAVEL_GESTOR` é rejeitado com `FIRST_MANAGER_AUTHORITY_REQUIRED`: email confirmado não prova autoridade sobre a criança; bootstrap produtivo segue bloqueado por #8/#62.

Configuração: `EMAIL_VERIFICATION_TOKEN_TTL=PT24H`, `EMAIL_VERIFICATION_RESEND_INTERVAL=PT5M`, `FRONTEND_EMAIL_VERIFICATION_URL` e `EMAIL_VERIFICATION_RATE_LIMIT_PER_MINUTE=5`. A V12 adiciona `usuarios.email_confirmado_em`, tabela de tokens e índice parcial. Legados ficam não confirmados, sem bloqueio ou promoção retroativa.

Validação: 122 testes, sem falhas, erros ou ignorados; PostgreSQL 16/Testcontainers validou instalação limpa, `ddl-auto=validate` e upgrade V7→V12. Novos testes cobrem consumo único, destinatário incorreto, aceite e replay.

## Revisão após `e735812`

As fontes foram novamente verificadas em 10/10/2026: matriz local integral, 15 imagens e issues #8/#10/#62–#79. As decisões listadas como pendentes na matriz continuam pendentes nas issues; conteúdo ilustrativo das imagens não foi promovido a regra de produto.

Correções implementadas e validadas:

- O teste PostgreSQL de concorrência agora inspeciona ambos os `Future`: a transferência precisa concluir; a saída pode concluir ou retornar exclusivamente `LAST_MANAGER`. Qualquer outra falha faz o teste falhar.
- `acoesPermitidas` do último gestor retorna `podeSair=false` e `requerTransferenciaGestao=true`. O servidor continua protegendo a operação com transação e lock pessimista.
- Foto de perfil: `POST /profissionais/me/foto` recebe multipart `file`; `DELETE /profissionais/me/foto` remove; `GET /profissionais/fotos/{key}` lê o identificador opaco. JPEG/PNG são validados por assinatura e decodificação, limite 5 MiB e dimensões 64–4096 px. O JSON de perfil não pode mais apontar URL arbitrária. O storage local/teste implementa `ProfileImageStorage`; futura AWS deve fornecer outra implementação sem mudar o domínio.
- Consistência da foto: o serviço recebe o `usuarioId`, recarrega o perfil com lock pessimista dentro da transação e executa `saveAndFlush`. A compensação é registrada antes do `flush`: a nova imagem é apagada em rollback, inclusive quando o banco rejeita a atualização; a anterior só é removida após commit. Falha de limpeza pós-commit é registrada como recuperável e não converte atualização persistida em falso fracasso. O banco guarda referência opaca e o DTO produz URL absoluta usando `PUBLIC_API_URL` ou origem da requisição + `/api`; cache é privado e imutável por chave.
- Multipart está limitado a 5 MiB por arquivo e 6 MiB por request. Dimensões são lidas dos metadados antes da decodificação integral. A integração PostgreSQL realiza upload, novo GET, download, substituição, novo GET e remoção em requisições distintas.

| Módulo | Operação bloqueada | Decisão indispensável | Recomendação concreta |
|---|---|---|---|
| Convites/bootstrap | bootstrap produtivo e nominal/proposta completos | prova de autoridade e fluxo de email | validação manual auditada; email comprova apenas posse da conta |
| Metas/progresso | concluir/reabrir e série agregada | transições, coorte, baseline e granularidade | conclusão manual; pontos mensais com coorte explícita |
| Anotações/arquivo | arquivo pós-saída e snapshot | dados mínimos, retenção e efeitos de editar/excluir | snapshot imutável após definição jurídica de retenção |
| Perfil/email | foto e verificação de cadastro | limites/storage e regras de token/reenvio | validar assinatura/decodificação; storage substituível; token hash com rate limit |
| Dashboards/feed | feed composto e indicadores finais | tipos, janela, limite e semântica | cursor `(data,id)` e somente eventos de domínio aprovados |
| Crianças/sessões | acompanhamento e máquina final | enum, editores e transições | legado nulo; aprovar diagrama antes de persistir estados |

Esses itens permanecem na classificação 3. Não foi criada migration nesta revisão: nenhum dado pendente foi ativado e as duas correções não alteram persistência.

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
- #70: upload/substituição/remoção de foto estão implementados com storage local/teste substituível, limite de 5 MiB e URL pública configurável. A implementação AWS continua futura e nenhum recurso foi provisionado; verificação de email permanece dependente do contrato de produto.
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
| P09 Perfil/configurações #70 | `/users/me`, `/profissionais/me`, `POST/DELETE /profissionais/me/foto`, `GET /profissionais/fotos/{key}` | schema existente | próprio usuário/perfil; leitura autenticada da imagem | MockMvc + integração PostgreSQL/storage real | 1. Foto implementada e validada; campos atuais implementados | verificação de email ainda depende do contrato de produto; storage AWS é implantação futura |
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

### Convite nominal — consistência de reentrada e rastreabilidade (V13)

- A emissão, o cancelamento e o aceite nominal registram histórico e auditoria sem armazenar o token bruto. O aceite de responsável também registra o consentimento de compartilhamento; o aceite profissional não reutiliza essa finalidade de consentimento familiar.
- A reentrada sempre aplica o papel autorizado pela nova operação. Um antigo gestor convidado como `RESPONSAVEL` retorna como responsável comum; vínculo ativo existente retorna `ALREADY_LINKED` sem alterar papel ou reiniciar o vínculo. A mesma normalização foi aplicada à aprovação de solicitação por código/QR.
- Listagens usam autorização somente leitura. Emissão, aceite e cancelamento mantêm lock pessimista dos vínculos ativos para revalidar o gestor no instante da mutação.
- Convite pendente cujo `expiraEm` passou é projetado como `EXPIRADO` e deixa de participar da unicidade lógica de convites utilizáveis. A expiração é calculada, portanto a rejeição do aceite não depende de persistir uma mudança que seria revertida junto com a transação.
- `V13__nominal_invite_traceability.sql` permite consentimento sem profissional, classifica sua finalidade e adiciona índice parcial para consultas de convites nominais pendentes. A ativação do vínculo, o consentimento aplicável, o histórico e o consumo do convite permanecem na mesma transação.
- O bootstrap produtivo do primeiro gestor continua indisponível: falta definir a prova de autoridade sobre a criança. Recomendação: validação administrativa verificável, com evidência e decisão auditadas, antes da emissão nominal que concede `RESPONSAVEL_GESTOR`; confirmação de email isolada não atende esse requisito.

## Relatório de continuidade — 10/10/2026 (após `9103c72`)

Concluído nesta rodada:

- eliminado o mapping duplicado de `GET /anotacoes/arquivo-proprio`, mantendo o controller específico;
- protegido o feed contra textos acima dos limites de `titulo` (200) e `resumo` (500), sem reduzir o resultado original da meta;
- centralizada a resolução IANA de fuso, removida a inferência ambígua por UF e corrigido o cálculo de `YearMonth` no fuso resolvido;
- adicionados testes unitários dos limites de apresentação e da resolução de fuso.

Verificações reais:

- `mvnw.cmd -B clean test`: sucesso, 132 testes, 0 falhas/erros e 21 integrações puladas;
- Docker CLI instalado, mas daemon `desktop-linux` indisponível. Por isso contexto completo, Flyway limpo/upgrade, locks e rollback PostgreSQL não foram revalidados nesta rodada;
- nenhum recurso AWS foi provisionado e nenhuma decisão de retenção/IA foi criada.

Próximos passos concretos: reexecutar Testcontainers e E2E com Docker ativo; concluir serviço dedicado de série histórica por categoria e testes numéricos/coorte; validar snapshots legados do arquivo próprio; finalizar alinhamentos React ainda apontados na matriz.

## Continuidade V15 — sete áreas

| Área | Implementação | Evidência local | Estado real |
|---|---|---|---|
| Gráficos | `ProgressHistoryService`, séries/tendências por categoria, coorte mensal, amostra, ausência, pausas e mudanças | testes 50%, 70%, +20pp, 46,67% e categorias independentes | validado em unidade; casos históricos legados complexos continuam limitados pelo histórico disponível |
| Arquivo próprio | snapshot mínimo imutável na criação; legado marcado `MIGRACAO_V15` | Flyway limpa/upgrade e Hibernate validate | validado no schema; legado não é declarado snapshot histórico verdadeiro |
| Anotações | lock pessimista, repositório obrigatório, versões autorizadas, motivo e preservação de campos | serviço + PostgreSQL/contexto | validado; concorrência dedicada de duas correções deve permanecer no conjunto de regressão CI |
| Feed | `ANOTACAO_CORRIGIDA`, cursor validado, feed individual e agregado `/dashboard/feed` | contexto completo/OpenAPI | parcial: eventos administrativos anteriores não recebem backfill fictício |
| Dashboards | removido zero artificial; vínculos iniciados no mês, crianças ativas e Clock | compilação e contexto PostgreSQL | validado para os campos existentes; visual segue responsabilidade do frontend |
| Frontend/E2E | título, temas, sessão e motivo no schema/form/gateway; expectativas E2E locais preservadas | lint e build | build validado; E2E completo depende da orquestração de três processos |
| Banco | V15 aditiva com snapshot, origem, constraints, índice e visibilidade do feed | V1→V15 limpa e V7→V15 populada em PostgreSQL 16 | validado; rollback é de aplicação, sem remoção destrutiva do histórico |

A coorte de cada ponto histórico usa `[início local do mês, início local do mês seguinte)`; o mês atual termina em `Clock.instant()`. Meta concluída antes do início do ponto fica fora; conclusão dentro do ponto contribui com 100%; pausa no limite exclui contribuição e é contada separadamente. Ausência de progresso permanece `metasSemDados`.

## Continuidade V16 — dashboards, gestão no feed e validação

- Dashboard: os campos atuais seguem a semântica `/progresso/resumo-atual`: média aritmética das metas em andamento com dado (peso igual por meta), média `null` sem amostra, contagens com/sem dado e estados pausado/concluído separados. Semana local é segunda a segunda, com limite final exclusivo. Sessões próximas começam no Clock atual; não lidas incluem notificações ocultadas do sino.
- Eventos: convite nominal aceito e solicitação por código/QR aprovada projetam `MEMBRO_ENTROU`/CIRCULO via serviços de domínio; saída voluntária projeta `MEMBRO_SAIU`/CIRCULO; transferência e remoção projetam `GESTAO_TRANSFERIDA` e `MEMBRO_REMOVIDO`/GESTORES; aprovação do primeiro gestor é projetada transacionalmente do histórico por trigger V16. Leitura de GESTORES permanece restrita a gestores atuais da criança. Sem backfill sem prova persistida.
- Migration: `V16__first_manager_feed_event.sql` adiciona trigger de projeção do evento de aprovação do primeiro gestor. É aditiva e transacional; rollback da aplicação não desfaz migration nem remove histórico. Para upgrade, execute Flyway normalmente; não reverta removendo tabela/trigger de eventos.
- Evidência desta execução: `mvnw.cmd -B clean test` está em execução; migrations V1–V16 e `ddl-auto=validate` já iniciaram com sucesso em PostgreSQL 16 via Testcontainers. `npm.cmd run lint` aprovou com 0 erros/5 avisos; `npm.cmd run build` aprovou. O Playwright ainda depende da inicialização coordenada de backend e frontend, e será registrado com resultado real.
# Execução complementar aprovada — 10/10/2026

As decisões do prompt de execução substituem pendências equivalentes deste documento. A implementação aditiva está em `V14__frontend_contract_completion.sql`: bootstrap administrativo do primeiro gestor sem promoção legada, estados da criança, sessão/meta, versões de anotação, feed e fila de limpeza de fotos. A ordem global de locks de gestão é: (1) vínculos ativos da criança por ID, (2) convite/solicitação por ID, (3) vínculo-alvo. Leituras usam consultas sem lock de escrita.

Auditoria de sucesso agora participa da transação da mudança e é obrigatória; tentativa/falha usa API separada `recordAttempt` e nunca recebe resultado `SUCESSO`. A política de retenção continua pendente para lançamento e não há expurgo automático. O diretório local de fotos é apenas desenvolvimento; produção exige storage durável compartilhado, backup, monitoramento da fila `tarefas_limpeza_arquivo` e `PUBLIC_API_URL` público.

Provisionamento administrativo inicial é procedimento restrito de banco/secretaria: após validar o operador, executar `UPDATE usuarios SET administrador=true WHERE id=?` em mudança auditada operacionalmente. Cadastro público nunca escreve esse campo. Rollback da V14 é lógico/aplicacional; remover colunas/tabelas perderia histórico e não é suportado como rollback destrutivo.

## Fechamento das regressões finais — 10/10/2026

- Feed: `id` identifica exclusivamente a ocorrência e compõe o cursor; `recursoId` vem de `eventos_feed.recurso_id` e identifica o recurso a abrir. Tipos diferentes podem compartilhar o mesmo `recursoId` sem colisão.
- Visibilidade: eventos `CIRCULO` são vistos por vínculos atuais autorizados. Eventos `GESTORES` são retornados somente quando existe, para a criança do próprio evento, vínculo atual `RESPONSAVEL_GESTOR`. Perda de gestão ou desvinculação revoga imediatamente a leitura. Transferência de gestão e remoção de membro emitem projeções restritas, sem contatos, provas ou conteúdo privado, na mesma transação do domínio.
- Coorte: cada ponto representa o estado imediatamente anterior ao limite exclusivo do ponto. Meta concluída antes do início fica fora, exceto quando um evento `REABERTA` ocorre no intervalo; nesse caso ela volta à composição a partir dessa ocorrência. A última transição ordenada por `(instante,id)` decide se a fase termina em andamento, pausa ou conclusão. Progressos posteriores ao limite não participam.
- Concorrência de anotações: correções compartilhadas são serializadas pelo lock pessimista da anotação. O teste PostgreSQL com duas transações concorrentes comprova versões `1` e `2`, encadeamento do conteúdo anterior, dois eventos e resultado final consistente.

## Fechamento dos três pontos finais — 11/10/2026

- Resumo atual: `LatestProgressService` é a fonte canônica usada por dashboard e progresso. A consulta PostgreSQL retorna somente o último registro de cada meta, ordenado por `(data DESC, id DESC)`; em empate de data, vence o maior ID. Ausência continua diferente de zero, apenas metas `EM_ANDAMENTO` entram nas médias e a média geral tem peso igual por meta (não é média de médias). Pausadas/concluídas e resumos por categoria permanecem explícitos.
- Fuso dos dashboards: a fonte backend global é `APP_TIME_ZONE`, validada como IANA na inicialização; se ausente, o fallback explícito é `America/Bahia`. O parâmetro opcional `timezone` permite uma fonte confiável por requisição e valor inválido retorna o erro contratual `INVALID_ARGUMENT`/HTTP 400. O campo aditivo `fusoUtilizado` informa o calendário efetivo. O dashboard agregado usa uma única janela para todas as crianças: semana local `[segunda, segunda seguinte)`, mês por limites locais e próximas sessões a partir do `Clock` atual. Não existe resolução individual persistida por usuário/criança e nenhuma inferência é feita por UF.
- Indicadores/V16: testes focados cobrem zero versus ausência, estados de meta, categorias desbalanceadas, semana exclusiva, próximos eventos, múltiplas crianças e vazio. `LatestProgressPostgresIntegrationTest` comprova o desempate no PostgreSQL. `FirstManagerV16IntegrationTest` executa a aprovação administrativa real e comprova vínculo, histórico, exatamente um evento `PRIMEIRO_GESTOR_APROVADO`/`GESTORES`, IDs de ocorrência e recurso distintos, ausência de prova/motivo no feed e idempotência por rejeição da segunda decisão.

Evidência desta rodada: suíte focada de 21 testes aprovada; `mvnw.cmd -B clean test` aprovou 161 testes, sem falhas, erros ou ignorados, incluindo PostgreSQL 16, Flyway limpo V1→V16, upgrade populado e Hibernate `ddl-auto=validate`. `npm.cmd run lint` aprovou com 0 erros e 5 avisos preexistentes; `npm.cmd run build` aprovou. A primeira chamada local ao Playwright encontrou `ERR_CONNECTION_REFUSED` porque os serviços não estavam iniciados; a validação final abaixo usa orquestração isolada equivalente à CI.

### Complemento de validação — injeção de fuso e primeiro gestor/V16

- Injeção: `LocalTimeZoneResolver` mantém um único construtor com `@Value`, eliminando o caminho de produção que ignorava `APP_TIME_ZONE`. `DashboardTimeZoneSpringContextTest` sobe contexto Spring real e comprova `America/Manaus`, fallback `America/Bahia`, override de requisição, falha de inicialização para configuração inválida, HTTP 400 para parâmetro inválido e a janela semanal de Manaus em uma sessão próxima à virada de segunda-feira.
- Decisão administrativa: `FirstManagerV16IntegrationTest` usa PostgreSQL real para comprovar aprovação, recusa sem vínculo/evento e sem decisão posterior, solicitante inativo ou sem email confirmado, criança arquivada e operador sem capacidade administrativa. A recusa registra histórico/auditoria contratual e não deixa alterações parciais.
- Rollback: um trigger exclusivo do teste força erro ao gravar a auditoria de sucesso, depois que vínculo, decisão, histórico e evento V16 já foram produzidos na transação. Após o término dessa transação, uma nova transação confirma pedido ainda pendente e ausência de vínculo, histórico de aprovação, auditoria de sucesso e evento. O trigger de teste é removido ao final sem tocar em volumes de desenvolvimento.
- Visibilidade: os testes PostgreSQL do feed confirmam acesso do gestor atual, exclusão para responsável comum e profissional, revogação ao perder gestão e avaliação do papel separadamente por criança no agregado.
- CI do SHA base `55befb2945bfcd3e1862620aa81f4a9d5fc6d608`: execução 38136828275 concluída com sucesso, inclusive o job E2E React + Java + PostgreSQL.
- E2E local isolado: PostgreSQL 16 descartável na porta 55432, backend Java na 3000 e frontend Vite na 5173; health `UP`, OpenAPI/Swagger válidos e Playwright Chromium aprovou 1/1 cenário em 1,9 minuto. Os processos e o contêiner foram encerrados ao final.
- Verificação final do diff: `mvnw.cmd -B clean verify` aprovou 169 testes (0 falhas, 0 erros, 0 ignorados) e gerou o JAR, incluindo PostgreSQL 16, Flyway limpo/upgrade até V16 e Hibernate `ddl-auto=validate`. `npm.cmd run lint` terminou com 0 erros e 5 avisos preexistentes; `npm.cmd run build` foi aprovado.
