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
