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
| P06 Sessões | `/sessoes` e `/sessoes/{id}/status` | autor administra; responsável sem observação privada | V14; teste de privacidade existente | parcial — histórico de correção/reagendamento ainda sem endpoint |
| P07 Anotações | `/criancas/{id}/anotacoes` | título, temas, sessão, compartilhamento e versões | V14; testes existentes requerem atualização | implementada com validação pendente |
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
