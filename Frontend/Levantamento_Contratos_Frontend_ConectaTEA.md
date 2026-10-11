# Matriz consolidada dos contratos do novo frontend

Estado vigente após o merge do PR #80 (`41c7889`), revisado em 11/10/2026. Esta seção substitui as classificações incrementais preservadas no histórico ao final. O contrato técnico vigente está em [`../docs/refatoracao-java/12_API_CONTRACT_JAVA_CANONICO.md`](../docs/refatoracao-java/12_API_CONTRACT_JAVA_CANONICO.md).

## Estado atual das 15 telas

“API/banco validado” não significa tela homologada. O E2E conhecido percorre um fluxo real, não as 15 telas.

| Tela | Contratos principais | Estado de API/banco e testes | Pendência real |
|---|---|---|---|
| P01 Dashboard profissional | `/dashboard/profissional?timezone=`, `/dashboard/feed` | Indicadores/fuso cobertos; feed/cursor/visibilidade em PostgreSQL | composição visual completa |
| P02 Crianças profissional | CRUD, `/estado`, `/arquivamento` | campos, estados, autorização e Flyway cobertos | filtros/edição no visual final |
| P03 Detalhe/Círculo profissional | detalhe, membros, metas, sessões, anotações, feed | composição dinâmica por vínculos ativos, campos opcionais, ordem e autorização cobertos | layout responsivo/animações, homologação das abas e URL direta |
| P04 Metas | CRUD, progresso, pausa/retomada, conclusão/reabertura | transições, autoria e histórico cobertos | integração visual das ações/erros |
| P05 Progresso | `/resumo-atual`, `/evolucao-historica` | serviço canônico, coorte, categorias e desempate PostgreSQL cobertos | gráficos/estados sem dados no visual final |
| P06 Sessões | CRUD, detalhe, status, correção, reagendamento | campos, autoria e privacidade implementados/testados | homologação visual; concorrência HTTP específica |
| P07 Anotações profissional | CRUD, versões, arquivo próprio | snapshots, lock e concorrência PostgreSQL cobertos | revisão visual completa |
| P08 Notificações profissional | histórico, sino, limpar, leitura, badge | semânticas e contratos HTTP cobertos | navegação visual para todos os destinos |
| P09 Perfil/configurações | usuário, perfil, foto, locais, redes, áreas | foto/rollback/storage local cobertos em PostgreSQL | tela completa e storage AWS |
| R01 Dashboard responsável | `/dashboard/responsavel?timezone=`, feed | múltiplas crianças, semana exclusiva, próximas sessões e fuso cobertos | composição visual completa |
| R02 Minhas crianças | `/criancas`, `/vinculos/me` | vínculo ativo, arquivo e autorização implementados | busca/filtros no visual final |
| R03 Detalhe/Círculo responsável | detalhe, membros, solicitações, gestão, feed | gestor/comum, ações calculadas, perda de gestão, ordem e autorização por criança cobertos | layout responsivo/animações e homologação das abas/ações |
| R04 Vincular | código/QR, nominal, solicitações, primeiro gestor | V16; replay, elegibilidade, recusa e rollback PostgreSQL cobertos | experiência visual e procedimento administrativo de produção |
| R05 Anotações compartilhadas | lista/detalhe/versões | privadas excluídas; vínculo, snapshot e visibilidade cobertos | homologação visual e política final de retenção |
| R06 Notificações responsável | histórico, sino, leitura, badge | isolamento por destinatário/autorização coberto | navegação/estados visuais |

## Evidência consolidada

- CI do SHA `32d3a90834ddfa3ce14b510c2b8a3fbdb814ca49`: [run 38138130356](https://github.com/Neukox/ConectaTEA/actions/runs/38138130356), sucesso nos jobs backend, frontend e E2E. Backend: 169 testes, zero falhas, erros ou ignorados; E2E React + Java + PostgreSQL: um cenário aprovado.
- A cobertura inclui instalação limpa e upgrade populado até V16, Hibernate `ddl-auto=validate`, autorização, locks e rollbacks. A CI verifica a estrutura básica do OpenAPI/Swagger; não comprova comparação exaustiva com todos os clientes TypeScript.
- Ainda não há prova de integração visual/homologação das 15 telas. Retenção final, AWS/storage de produção e fornecedor/governança de IA permanecem pendentes; não há prontidão declarada para famílias reais.

## Rastreabilidade da #62

| Critério | Entrega/evidência | Estado |
|---|---|---|
| Contratos, DTOs, enums, filtros, autorização e erros | contrato canônico, controllers/records e esta matriz | preparação técnica consolidada |
| Flyway/constraints/índices/legado | V8–V16 e `FlywaySchemaIntegrationTest` | instalação limpa e upgrade cobertos |
| OpenAPI executável | `/api/v3/api-docs`, Swagger e testes de integração | estrutura básica validada; auditoria TypeScript exaustiva não comprovada |
| Domínio/autorização #8/#10 | círculo, primeiro gestor, autoria, feed e testes PostgreSQL | núcleo implementado; retenção/operação real pendentes |
| Telas #63–#78 | APIs e consumidores parcialmente preparados | integração visual completa não comprovada |
| E2E #79 | um cenário integrado real na CI | parcial para a matriz completa de fluxos |
| Produção e IA | fora do PR #80 | #52–#61 e #15 permanecem abertas |

## Histórico incremental — não normativo

As seções abaixo registram o caminho até V16. Menções a “parcial”, “pendente de revalidação” ou contratos anteriores descrevem apenas aquela etapa e não substituem o estado consolidado acima.

Atualizada em 10/10/2026 a partir da matriz local não rastreada fornecida no workspace e da inspeção visual das 15 referências. Esta cópia registra o estado real desta branch; a entrega não declara integração visual React concluída.

## Decisões consolidadas

- Conta pessoal e gestão da criança são independentes. `RESPONSAVEL_GESTOR`, `RESPONSAVEL` e `PROFISSIONAL` são papéis do vínculo.
- O círculo de cuidado é lido em `GET /criancas/{id}/circulo/membros`: somente vínculos ativos compõem os cartões; pendências ficam fora. A resposta traz IDs estáveis, nome, tipo, papel, foto/especialidade/parentesco opcionais e ações autorizadas pelo servidor. A ordem é gestores, responsáveis e profissionais, depois nome e IDs. O frontend consulta ao abrir e após cada mutação confirmada, e recalcula localmente posições e animações; não há geometria no contrato nem no banco.
- O primeiro gestor nasce somente de pedido de responsável legal confirmado e decisão de operador com capacidade administrativa específica. Email confirmado prova posse do endereço, não autoridade sobre a criança.
- Convite nominal exige destinatário autenticado/confirmado e aceite; código/QR cria solicitação pendente. Vínculos antigos não são promovidos.
- Criança usa `PENDENTE_CLASSIFICACAO`, `EM_ACOMPANHAMENTO`, `PAUSADO` ou `ENCERRADO`; arquivamento é ortogonal, preserva leitura histórica e bloqueia escrita.
- Sessão usa `AGENDADA`, `REALIZADA`, `CANCELADA` ou `NAO_COMPARECEU`; não há atendimento em tempo real.
- Meta usa `EM_ANDAMENTO`, `PAUSADA` ou `CONCLUIDA`. Conclusão e reabertura são ações explícitas e históricas.
- Progresso atual não presume zero para meta sem registro. Evolução usa pontos mensais 3/6/12, amostra, ausência de dados, alteração de composição e tendência em pontos percentuais.
- Anotação começa privada; compartilhar é explícito. Compartilhada não volta a privada, não admite exclusão comum e correção exige motivo/versão. Arquivo próprio independe do vínculo ativo.
- Instantes persistem em UTC. Indicadores usam localidade; fallback MVP `America/Bahia`, semana segunda–segunda com fim exclusivo.
- Retenção automática não foi definida e não é executada. AWS/storage durável é etapa de implantação separada.

## Fotografia pré-V14 das 15 telas (histórico superado)

| Tela | Endpoint principal | Dados/ações e autorização | Banco/teste | Estado |
|---|---|---|---|---|
| P01 Dashboard profissional | `GET /dashboard/profissional`, `/criancas/{id}/feed?size=5` | vínculos ativos, metas, próximas sessões, feed compartilhado | V14 índices; testes HTTP pendentes | parcial |
| P02 Crianças profissional | `GET /criancas` | busca, status, arquivo, paginação; leitura vinculada | V14 status; unitários existentes | implementada com validação pendente |
| P03 Detalhe/Círculo profissional | `GET /criancas/{id}`, `/circulo`, `/feed` | histórico autorizado; privado excluído | V11/V14; autorização existente | implementada com validação pendente |
| P04 Metas | `/metas`, `PATCH /conclusao`, `/reabertura`, `/pausa`, `/retomada` | somente autor altera | V8/V14; domínio | implementada com validação pendente |
| P05 Progresso | `/progresso/resumo-atual`, `/evolucao-historica` | médias sem zero presumido e tendência | V14 índices; exemplo numérico pendente | implementada com validação pendente |
| P06 Sessões | `/sessoes`, `PATCH /sessoes/{id}/status`, `/correcao`, `/reagendamento` | autor administra; responsável sem observação privada; correções preservam motivo/histórico | V14; privacidade e migrations validadas | implementada com validação pendente — falta concorrência HTTP específica |
| P07 Anotações | `/criancas/{id}/anotacoes` | título, temas, sessão, compartilhamento e versões | V14; testes unitários/HTTP atualizados | implementada e validada |
| P08 Notificações | `/notificacoes`, `/nao-lidas/count` | não lidas incluem ocultadas do sino | V7/V9; testes existentes | implementada e validada antes desta tranche |
| P09 Perfil | `/profissionais/me`, `/me/foto` | PUT e foto serializados; limpeza reprocessável | V14 fila; concorrência PostgreSQL pendente | implementada com validação pendente |
| R01 Dashboard responsável | `GET /dashboard/responsavel`, feed `size=5` | todas as crianças ativas autorizadas | consultas agregadas existentes | parcial |
| R02 Minhas crianças | `GET /criancas` | busca/status/paginação | V14 | implementada com validação pendente |
| R03 Detalhe/Círculo responsável | `/criancas/{id}`, `/circulo`, `/feed?size=10` | consulta compartilhada, carregar mais determinístico | V11/V14 | implementada com validação pendente |
| R04 Vincular | `/vinculos/confirmar`, `/solicitacoes`, `/convites` | nominal e código pendente; primeiro gestor administrativo | V11–V14; concorrência existente | implementada com validação pendente |
| R05 Anotações compartilhadas | `/criancas/{id}/anotacoes` | somente compartilhadas; filtros | V6/V14 | implementada com validação pendente |
| R06 Notificações | `/notificacoes`, `/nao-lidas/count` | histórico, ler e ocultar independentes | V7/V9 | implementada e validada antes desta tranche |

## Compatibilidade React

O frontend deve trocar o rótulo “Novas notificações” por “Notificações não lidas”; tratar `PENDENTE_VALIDACAO_ADMINISTRATIVA`; usar os novos enums; nunca renderizar observação privada; e consumir os contratos de resumo/evolução em vez de inferir médias. Essas mudanças de cliente são contratuais e não reformulam o visual de Alexandre.

Validação desta tranche: `mvn clean test` executou 128 testes, sem falhas ou testes ignorados, com PostgreSQL 16 real via Testcontainers, instalação limpa das 14 migrations e validação Hibernate. Isso não substitui os cenários marcados como pendentes na tabela.

## Continuidade de validação — 10/10/2026

- Arquivo próprio: rota canônica única `GET /anotacoes/arquivo-proprio`; sem permissões de edição no DTO.
- Conclusão de meta: o cliente pode enviar `resumoResultado` com até 2.000 caracteres. O recurso preserva o texto; cards/feed recebem projeção de no máximo 500 caracteres, com `…` quando reduzida.
- Histórico de progresso: `timezone` é IANA opcional; omissão usa o fallback documentado. O frontend não deve enviar UF como fuso.
- Evidência desta continuidade: 132 testes backend passaram em compilação limpa; 21 integrações Testcontainers foram puladas porque o daemon Docker local estava indisponível. Assim, migrations/locks/contexto PostgreSQL permanecem **pendentes de revalidação nesta execução**, sem invalidar a evidência anterior registrada acima.

### Atualização V15

### Atualização V16 — dashboards, gestão no feed e validação (histórico de fechamento)

Atualização final de 11/10/2026: os dashboards aceitam `timezone` IANA opcional e retornam o campo aditivo `fusoUtilizado`. Na ausência do parâmetro, todo o agregado usa uma única configuração backend `APP_TIME_ZONE`, cujo fallback é `America/Bahia`; não há inferência por UF nem fuso individual persistido neste MVP. Valor inválido retorna HTTP 400 (`INVALID_ARGUMENT`). A média geral de `progressoAtual` usa peso igual por meta com dado, enquanto `categorias` em `/progresso/resumo-atual` mantém médias internas por meta. O último registro desempata por `data` e depois pelo maior `id`.

`GET /dashboard/profissional` e `GET /dashboard/responsavel` entregam `totalCriancas`, `metasAtivas`, `sessoesSemana`, `notificacoesNaoLidas` e `progressoAtual`; o dashboard responsável inclui também `sessoesProximas`. O resumo atual inclui somente metas EM_ANDAMENTO com progresso conhecido, cada meta com peso igual, e informa `metasComDados`, `metasSemDados`, `metasPausadas` e `metasConcluidas`. Média `null` é ausência de amostra; progresso real 0 permanece 0. Semana usa segunda-feira local até a segunda seguinte exclusiva. Notificações não lidas incluem as ocultadas do sino.

| Bloco | Endpoint e campos | Permissão/ação | Vazio/erro | Estado desta tranche |
|---|---|---|---|---|
| Dashboard profissional | `/dashboard/profissional`: totais de crianças/equipe/metas, `progressoAtual`, semana e não lidas | profissional autenticado e vínculos atuais | contagens 0; média null com amostra explícita; erro HTTP | implementação, contexto Spring e E2E browser validados |
| Dashboard responsável | `/dashboard/responsavel`: crianças em acompanhamento, metas ativas, semana/próximas sessões, não lidas, progresso | responsável e vínculos atuais | mesmos estados explícitos | implementação, contexto Spring e E2E browser validados |
| Feed agregado | `/dashboard/feed?size=5&antes=&antesId=` | CIRCULO por vínculo atual; GESTORES só gestor atual da criança do evento | lista vazia e cursor validado | teste PostgreSQL de cursor/visibilidade |
| Detalhe e feed | `/criancas/{id}`, `/criancas/{id}/feed?size=10` | autorização revalidada ao abrir recurso | erro contratual de acesso ou listas vazias | cobertura backend anterior; E2E browser pendente |

Eventos de gestão: primeiro gestor aprovado (`PRIMEIRO_GESTOR_APROVADO`, GESTORES, trigger transacional V16 sobre histórico); aceite nominal e aprovação código/QR (`MEMBRO_ENTROU`, CIRCULO); transferência e remoção (`GESTAO_TRANSFERIDA`/`MEMBRO_REMOVIDO`, GESTORES); saída voluntária (`MEMBRO_SAIU`, CIRCULO). Convite emitido/cancelado e solicitação recusada não alteram o círculo e não geram feed. O resumo do evento é mínimo, sem contato ou prova administrativa. Não há backfill fictício.

Validação complementar de 11/10/2026: `LocalTimeZoneResolver` possui um único construtor de produção, portanto o Spring sempre injeta `app.time-zone`/`APP_TIME_ZONE`. Testes com contexto Spring real cobrem configuração Manaus, fallback Bahia, override IANA, rejeição de configuração e parâmetro inválidos e virada semanal no fuso configurado. Em PostgreSQL, a decisão administrativa cobre aprovação, recusa definitiva, inelegibilidade e rollback provocado; a verificação posterior ao rollback ocorre em nova transação e confirma ausência de vínculo, decisão, histórico, auditoria de sucesso e evento. A visibilidade `GESTORES` é recalculada por criança no feed agregado e é revogada com a perda da gestão.

O fluxo E2E React + Java + PostgreSQL foi confirmado tanto na CI do SHA `55befb2945bfcd3e1862620aa81f4a9d5fc6d608` quanto localmente em banco PostgreSQL 16 descartável: 1/1 cenário Playwright aprovado, incluindo validação de health, OpenAPI e Swagger antes do navegador.

O Docker foi iniciado e a lacuna acima foi revalidada: `mvnw.cmd -B clean test` executou 132 testes, sem falhas, erros ou ignorados, em PostgreSQL 16. Flyway validou instalação limpa V1→V15, upgrade populado V7→V15 e `ddl-auto=validate`.

- P05 Progresso: consumir séries por categoria; não calcular uma média geral no cliente.
- P07 Anotações: formulário envia `titulo`, `conteudo`, `temas`, `sessaoId` na criação e `motivoCorrecao` ao corrigir compartilhada. Versões: `GET /criancas/{id}/anotacoes/{notaId}/versoes`.
- P01/R01 Dashboard: feed agregado em `GET /dashboard/feed?size=5`; cursor opcional usa `antes` e `antesId` juntos.
- P03/R03 Detalhe: feed individual em `GET /criancas/{id}/feed?size=10`; carregar mais repassa ambos os campos do cursor.
- P01/R01/P03/R03: navegar com `recursoTipo + recursoId`; nunca usar `id` para abrir o recurso. `id` é exclusivo da ocorrência e serve ao cursor com `instante`. Eventos `GESTORES` aparecem apenas ao gestor atual da criança correspondente, inclusive no agregado.
- Arquivo profissional: `GET /anotacoes/arquivo-proprio`, somente leitura. `snapshotHistoricoConfiavel=false` exige sinalização discreta de limitação do legado, sem buscar o nome atual.
