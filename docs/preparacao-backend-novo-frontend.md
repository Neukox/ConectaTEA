# Preparação do backend para o novo frontend

Data: 2026-10-10

Base: `origin/main` em `ed5c453fd2d800c14c00e93e9322c5530787f777`

Branch: `feat/preparacao-backend-banco-novo-frontend`

## Escopo implementado

Esta entrega prepara o núcleo independente de #65–#69 e #74, sem reformular o React e sem provisionar AWS. A matriz `Frontend/Levantamento_Contratos_Frontend_ConectaTEA.md` foi lida na cópia de trabalho original (ela estava não rastreada e foi preservada). As issues #8, #10, #12, #15, #16, #21–#39 e #52–#79 foram consultadas em 10/10/2026 pela API pública do GitHub; `gh` não estava instalado.

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

`V8__prepare_new_frontend_core.sql` e `V9__notification_bell_visibility.sql` são aditivas e compatíveis com o schema V7:

1. converte `VENCENDO`/`QUASE_CONCLUIDA` antigos para `EM_ANDAMENTO` (eram alertas derivados);
2. adiciona pausa coerente e `eventos_metas` com índices;
3. adiciona campos opcionais de criança e validações sem preencher conteúdo clínico;
4. a V9 adiciona `ocultada_sino` com default `false` e índice por usuário.

A aplicação anterior não compreende `PAUSADA`; portanto, durante rollout, a versão nova deve entrar antes de usuários pausarem metas. O novo schema permanece legível pela versão anterior enquanto nenhum estado novo for gravado, e as colunas aditivas são ignoradas pelo Hibernate antigo. Não há promessa de rollback automático de dados após uso de `PAUSADA`.

## Segurança e contratos comuns

- Autenticação segue cookie JWT HttpOnly, `credentials: include`, CORS e CSRF `X-XSRF-TOKEN` existentes.
- Autorização é aplicada em detalhes e mutações; IDs alheios não ganham acesso por DTO, UI ou notificação.
- Datas civis usam `YYYY-MM-DD`; timestamps usam ISO-8601 com offset/UTC conforme os contratos existentes.
- Validação retorna 400; ausência 404; falta de vínculo/autoria 403; conflito otimista pode retornar 409 pelo handler existente.

## Validação executada

- `mvnw.cmd -q -DskipTests compile`: sucesso.
- `mvnw.cmd test`: 96 testes, 0 falhas, 0 erros, 13 ignorados.
- Os 13 testes Testcontainers (Flyway, PostgreSQL, concorrência e OpenAPI gerado) foram ignorados porque nenhum Docker daemon estava disponível. Assim, criação/upgrade real de PostgreSQL e Swagger em runtime permanecem sem validação nesta máquina.
- Clientes React foram inspecionados sem alterações. O frontend atual ainda tipa `VENCENDO` e `QUASE_CONCLUIDA`; a integração visual deve migrar para `PAUSADA` e usar os booleanos de alerta.

## Bloqueios e trabalho restante

- #8/#72/#75: não ativar bootstrap do primeiro gestor para famílias reais até definir verificação de autoridade; retenção/arquivo de anotações compartilhadas também aguarda decisão. O modelo atual de token não foi apresentado como contrato híbrido pronto.
- #67: série bruta 3/6/12 está pronta; coorte, frequência, baseline e composição calculada continuam pendentes, logo nenhum cálculo arbitrário foi publicado.
- #68: máquina final de transições, modalidade/local/objetivos e eventual associação de anotação dependem de contrato.
- #69/#73: arquivo pós-saída e efeitos de edição/exclusão de compartilhadas aguardam política de dados mínimos/retenção.
- #70: upload de foto depende de limites e estratégia de storage; não foi simulada persistência nem provisionada AWS.
- #64/#71/#76–78: composições finais e feed aguardam os contratos bloqueados acima e o visual de #24–#38.
- #15: IA permanece desativada até provedor, governança, retenção, consentimento e custos serem decididos.
- #52–#61: futuro deploy deve configurar PostgreSQL gerenciado, storage da foto, secrets, domínio/TLS, observabilidade, backups/RPO/RTO e região/orçamento. Nenhum recurso AWS foi criado.

## Próxima integração do frontend

Alexandre deve atualizar os tipos de meta, adicionar ações de pausa/retomada, exibir alertas por booleanos, consumir os novos campos opcionais da criança, usar `GET /sessoes/{id}` e separar o histórico de notificações do conteúdo do sino. A integração deve continuar revalidando 401/403 e limpando cache por conta/criança.
