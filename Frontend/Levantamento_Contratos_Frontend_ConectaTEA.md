# Matriz de contratos do novo frontend — decisões aprovadas

Atualizada em 10/10/2026 a partir da matriz local não rastreada fornecida no workspace e da inspeção visual das 15 referências. Esta cópia registra o estado real desta branch; a entrega não declara integração visual React concluída.

## Decisões consolidadas

- Conta pessoal e gestão da criança são independentes. `RESPONSAVEL_GESTOR`, `RESPONSAVEL` e `PROFISSIONAL` são papéis do vínculo.
- O primeiro gestor nasce somente de pedido de responsável legal confirmado e decisão de operador com capacidade administrativa específica. Email confirmado prova posse do endereço, não autoridade sobre a criança.
- Convite nominal exige destinatário autenticado/confirmado e aceite; código/QR cria solicitação pendente. Vínculos antigos não são promovidos.
- Criança usa `PENDENTE_CLASSIFICACAO`, `EM_ACOMPANHAMENTO`, `PAUSADO` ou `ENCERRADO`; arquivamento é ortogonal, preserva leitura histórica e bloqueia escrita.
- Sessão usa `AGENDADA`, `REALIZADA`, `CANCELADA` ou `NAO_COMPARECEU`; não há atendimento em tempo real.
- Meta usa `EM_ANDAMENTO`, `PAUSADA` ou `CONCLUIDA`. Conclusão e reabertura são ações explícitas e históricas.
- Progresso atual não presume zero para meta sem registro. Evolução usa pontos mensais 3/6/12, amostra, ausência de dados, alteração de composição e tendência em pontos percentuais.
- Anotação começa privada; compartilhar é explícito. Compartilhada não volta a privada, não admite exclusão comum e correção exige motivo/versão. Arquivo próprio independe do vínculo ativo.
- Instantes persistem em UTC. Indicadores usam localidade; fallback MVP `America/Bahia`, semana segunda–segunda com fim exclusivo.
- Retenção automática não foi definida e não é executada. AWS/storage durável é etapa de implantação separada.

## Cobertura das 15 telas

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

### Atualização V16 — dashboards, gestão no feed e validação

`GET /dashboard/profissional` e `GET /dashboard/responsavel` entregam `totalCriancas`, `metasAtivas`, `sessoesSemana`, `notificacoesNaoLidas` e `progressoAtual`; o dashboard responsável inclui também `sessoesProximas`. O resumo atual inclui somente metas EM_ANDAMENTO com progresso conhecido, cada meta com peso igual, e informa `metasComDados`, `metasSemDados`, `metasPausadas` e `metasConcluidas`. Média `null` é ausência de amostra; progresso real 0 permanece 0. Semana usa segunda-feira local até a segunda seguinte exclusiva. Notificações não lidas incluem as ocultadas do sino.

| Bloco | Endpoint e campos | Permissão/ação | Vazio/erro | Estado desta tranche |
|---|---|---|---|---|
| Dashboard profissional | `/dashboard/profissional`: totais de crianças/equipe/metas, `progressoAtual`, semana e não lidas | profissional autenticado e vínculos atuais | contagens 0; média null com amostra explícita; erro HTTP | implementação/build; E2E browser pendente |
| Dashboard responsável | `/dashboard/responsavel`: crianças em acompanhamento, metas ativas, semana/próximas sessões, não lidas, progresso | responsável e vínculos atuais | mesmos estados explícitos | implementação/build; E2E browser pendente |
| Feed agregado | `/dashboard/feed?size=5&antes=&antesId=` | CIRCULO por vínculo atual; GESTORES só gestor atual da criança do evento | lista vazia e cursor validado | teste PostgreSQL de cursor/visibilidade |
| Detalhe e feed | `/criancas/{id}`, `/criancas/{id}/feed?size=10` | autorização revalidada ao abrir recurso | erro contratual de acesso ou listas vazias | cobertura backend anterior; E2E browser pendente |

Eventos de gestão: primeiro gestor aprovado (`PRIMEIRO_GESTOR_APROVADO`, GESTORES, trigger transacional V16 sobre histórico); aceite nominal e aprovação código/QR (`MEMBRO_ENTROU`, CIRCULO); transferência e remoção (`GESTAO_TRANSFERIDA`/`MEMBRO_REMOVIDO`, GESTORES); saída voluntária (`MEMBRO_SAIU`, CIRCULO). Convite emitido/cancelado e solicitação recusada não alteram o círculo e não geram feed. O resumo do evento é mínimo, sem contato ou prova administrativa. Não há backfill fictício.

O Docker foi iniciado e a lacuna acima foi revalidada: `mvnw.cmd -B clean test` executou 132 testes, sem falhas, erros ou ignorados, em PostgreSQL 16. Flyway validou instalação limpa V1→V15, upgrade populado V7→V15 e `ddl-auto=validate`.

- P05 Progresso: consumir séries por categoria; não calcular uma média geral no cliente.
- P07 Anotações: formulário envia `titulo`, `conteudo`, `temas`, `sessaoId` na criação e `motivoCorrecao` ao corrigir compartilhada. Versões: `GET /criancas/{id}/anotacoes/{notaId}/versoes`.
- P01/R01 Dashboard: feed agregado em `GET /dashboard/feed?size=5`; cursor opcional usa `antes` e `antesId` juntos.
- P03/R03 Detalhe: feed individual em `GET /criancas/{id}/feed?size=10`; carregar mais repassa ambos os campos do cursor.
- P01/R01/P03/R03: navegar com `recursoTipo + recursoId`; nunca usar `id` para abrir o recurso. `id` é exclusivo da ocorrência e serve ao cursor com `instante`. Eventos `GESTORES` aparecem apenas ao gestor atual da criança correspondente, inclusive no agregado.
- Arquivo profissional: `GET /anotacoes/arquivo-proprio`, somente leitura. `snapshotHistoricoConfiavel=false` exige sinalização discreta de limitação do legado, sem buscar o nome atual.
