# ConectaTEA — matriz consolidada para o MVP e reformulação do frontend

Atualização: 10/10/2026. Visual: Alexandre (@CreadorLanda). Backend, banco, integração e AWS: Gabriel (@GabrielF0900). Alexandre mantém também #12 e #16; #10 mantém seu responsável atual, @PabloDiasx. Demais responsáveis existentes foram preservados.

## Base e situação da análise
As 15 imagens e o código foram auditados no snapshot [ed5c453fd2d800c14c00e93e9322c5530787f777](https://github.com/Neukox/ConectaTEA/tree/ed5c453fd2d800c14c00e93e9322c5530787f777). Esta atualização incorpora decisões aprovadas e transforma lacunas em tarefas verificáveis. **Não implementa APIs, migrations, frontend ou infraestrutura.** A auditoria Swagger foi estática (configuração, controllers/DTOs e testes existentes); não houve execução do backend nem consulta de um Swagger publicado.

Legenda: **atual** = identificado no código auditado; **aprovado** = regra de produto aceita; **a implementar** = mudança ainda necessária; **pendente** = decisão operacional específica. Rotas novas só serão consideradas existentes após implementação e confirmação no OpenAPI gerado. As decisões abaixo substituem propostas anteriores sobre os mesmos temas.

## Regras consolidadas — 10/10/2026
- Família governa vínculos por responsável gestor. Entrada requer aprovação e aceite; último gestor só sai após transferência. Profissional pode sair voluntariamente.
- Leitura por vínculo ativo: responsáveis veem todas as metas, progressos e sessões; anotações privadas só autor. Profissionais alteram somente atividades próprias.
- Desvinculação encerra acesso ativo e novas informações. Família conserva histórico compartilhado; autor terá arquivo somente leitura das próprias anotações, sem conteúdo alheio. Dados mínimos/retenção ainda pendentes.
- Metas: EM_ANDAMENTO/PAUSADA/CONCLUIDA; alertas de prazo separados; pausa/retomada do autor auditadas, sem novo progresso durante pausa.
- Gráficos: 0–100%, pesos iguais por categoria, concluídas do período incluídas, pausadas separadas, entrada de novas metas indicada, tendências em p.p., períodos 3/6/12 meses. Fórmula operacional/coorte deve ser documentada.
- IA do MVP limita-se a organizar texto próprio selecionado de anotação, com comparação, revisão e salvamento manual. Provedor/governança pendentes; falha não impede uso normal.
- Convites híbridos: nominal aprovado pelo gestor depende do aceite do destinatário correto; não nominal gera solicitação pendente para aprovação; proposta do profissional exige gestor. Código/QR não concedem acesso por posse.
- Histórico de notificações separado do sino; Limpar preserva histórico, Ler tudo marca leitura. Foto de perfil incluída; sem seletor de fuso, 2FA, dispositivos, planos ou busca global no MVP.
- Uso real com famílias. AWS região, orçamento, ambientes, disponibilidade, RPO/RTO, domínio e operação aguardam decisão em #52.

## Cobertura das 15 referências
| Referência | Visual Alexandre | APIs/banco/integração Gabriel |
|---|---|---|
| P01 Dashboard profissional | #24 | #64 |
| P02 Crianças profissional | #25 | #65 |
| P03 Detalhe profissional + Círculo | #36 / #35 | #76 / #75 |
| P04 Metas | #26 | #66 |
| P05 Progresso | #27 | #67 |
| P06 Sessões | #28 | #68 |
| P07 Anotações profissional | #29 | #69 |
| P08 Notificações profissional | #34 | #74 |
| P09 Perfil/configurações | #30 | #70 |
| R01 Dashboard responsável | #31 | #71 |
| R02 Minhas crianças | #38 | #78 |
| R03 Detalhe responsável + Círculo | #37 / #35 | #77 / #75 |
| R04 Vinculação | #32 | #72 |
| R05 Anotações compartilhadas | #33 | #73 |
| R06 Notificações responsável | #34 | #74 |

## Contratos comuns e passagem entre responsáveis
- Alexandre revisa a matriz em #21, envia tipos/props/eventos e discrepâncias; entrega layout/estados e PR pronto para integração. Não precisa refazer o inventário.
- Gabriel especifica requests/responses, enums, campos opcionais, filtros, paginação, ordenação, erros e datas antes das telas ficarem prontas. Faz modelo/Flyway/autorização e depois conecta serviços/hooks/cache.
- Cookie jwt HttpOnly, credentials e CSRF X-XSRF-TOKEN; /api como base. Campos nulos podem ser omitidos; clientes aceitam opcionais. Datas LocalDate em YYYY-MM-DD e timestamps ISO com offset.
- Cache por conta/criança, removido no logout/troca de conta. Permissões no servidor; actionsPermitidas no DTO serve à UI, não substitui autorização.
- Fixtures somente no desenvolvimento isolado. Componentes tratam carregando, vazio, erro/retry, salvando e acesso revogado.
- Filtros locais só sobre conjunto completo; se paginado, filtro/total pertencem ao servidor. Dados e ações das imagens não comprovam disponibilidade de API.
- Entrega visual pode ser revisada antes da integração. Issue de tela encerra seu fluxo funcional após integração vinculada; Alexandre não recebe responsabilidade de API por esse critério.

## Matriz operacional por tela/componente

### Shell autenticado — #23 → #63

| Elemento | Especificação |
|---|---|
| API atual | GET /auth/me, GET /auth/csrf, /users/me e /profissionais/me; cookie jwt HttpOnly e X-XSRF-TOKEN. |
| Blocos, ações e regras aprovadas | Nome, papel e foto reais; sidebar por papel, Crianças ativa nos detalhes; rotas protegidas de notificações e detalhe do responsável; sino comum, sem busca global no MVP. |
| Backend/banco e integração a executar | Restaurar sessão, logout, 401/403, cache isolado por usuário/criança e links com criancaId; remover cache no logout e não renderizar dados de outra conta. |
| Critério de aceite | Login, refresh, logout e troca de conta não reutilizam dados; mesma navegação nas 15 telas. |
| Pendência localizada | Nenhuma decisão de produto bloqueia o shell; avatar sem foto tem fallback. |

### Dashboard profissional — #24 → #64

| Elemento | Especificação |
|---|---|
| API atual | GET /dashboard/profissional, /dashboard/profissional/criancas, /dashboard/profissional/metas, /sessoes e /notificacoes/nao-lidas/count. |
| Blocos, ações e regras aprovadas | Visão organizada das crianças autorizadas; metas ativas = EM_ANDAMENTO; próximos compromissos e atalhos; separar contagem total de metas e metas ativas. |
| Backend/banco e integração a executar | Criar composição/agregação autorizada eficiente; enriquecer sessões com criança/autor; profissionaisAtivos atual conta conexões sociais e não equipe infantil; invalidar cards após mutações. |
| Critério de aceite | Contadores coincidem com listas filtradas e não incluem crianças arquivadas ou vínculos encerrados; atalhos preservam contexto. |
| Pendência localizada | Definir janela de nova notificação. Confirmar se card da semana conta sessões ou metas com prazo: a resposta anterior mistura os conceitos; não rotular um como outro. |

### Crianças do profissional — #25 → #65

| Elemento | Especificação |
|---|---|
| API atual | GET /criancas → {items,total}; GET/PUT/DELETE /criancas/{id}; POST /criancas. |
| Blocos, ações e regras aprovadas | Cards, busca combinada, filtros, criar/editar/arquivar, perfil e próxima sessão; cadastro estruturado de escola/escolaridade, cidade/UF, interesses e nível de suporte opcionais, além dos dados atuais; acompanhamento separado de arquivamento. |
| Backend/banco e integração a executar | Ampliar entidade/DTO/validação/Flyway para campos aprovados e status de acompanhamento; definir enums e editores no contrato; filtros/paginação e resumo dos cards; contato pendente não é vínculo de responsável. |
| Critério de aceite | Persistência após refresh; criação e edição validam campos; arquivamento bloqueia acesso; filtro sem resultado; sem inferir status pelo diagnóstico. |
| Pendência localizada | Fechar enum final de acompanhamento, obrigatoriedade e permissões dos novos campos em #62; bootstrap do primeiro gestor em #8/#72. |

### Metas — #26 → #66

| Elemento | Especificação |
|---|---|
| API atual | GET/POST /metas; PUT/DELETE /metas/{id}; PATCH /metas/{id}/progresso; resumo atual global do profissional. |
| Blocos, ações e regras aprovadas | Estados EM_ANDAMENTO, PAUSADA, CONCLUIDA; alerta de prazo separado; autor pausa/retoma com data/motivo; prazo preservado na pausa e confirmado/ajustado ao retomar; progresso 0–100 bloqueado durante pausa. |
| Backend/banco e integração a executar | Migrar status derivado VENCENDO/QUASE_CONCLUIDA para estado de trabalho e alertas; definir transições, pausa/retomada e conclusão; incluir autor/permissões no DTO; bloquear edição por profissional não autor no servidor; resumo por criança e histórico auditável. |
| Critério de aceite | Responsável lê todas as metas vinculadas; outro profissional lê mas não altera; pausa conserva histórico e rejeita atualização; autor retoma confirmando prazo; resumo conta apenas EM_ANDAMENTO como ativa. |
| Pendência localizada | Definir regra explícita de concluir/reabrir e janela de alerta no contrato; não assumir conclusão automática só por 100% sem registrar decisão. |

### Progresso — #27 → #67

| Elemento | Especificação |
|---|---|
| API atual | GET /progresso/resumo, /recentes, /distribuicao, /evolucao e /crianca; evolução atual é mapa de médias, não série temporal. |
| Blocos, ações e regras aprovadas | Séries de 3/6/12 meses; histórico 0–100 com autor/data; média por categoria com pesos iguais, concluídas do período incluídas, pausadas separadas; entrada de metas indicada; tendência em pontos percentuais; ausência de histórico explícita. |
| Backend/banco e integração a executar | Definir e implementar DTO de série com período, pontos, tamanho da amostra, baseline e composição; usar histórico completo e não só 10 recentes; contratos com criancaId e filtros válidos mesmo sem dados; responsáveis leem todo progresso autorizado. |
| Critério de aceite | Cenários com concluídas, pausadas, entrada de meta, histórico vazio e mudança de período têm resultados conferíveis; diferença 20→35 = +15 p.p.; gráficos sem alegações clínicas ou causalidade. |
| Pendência localizada | Fixar coorte, frequência dos pontos, corte temporal e regra de marcos em #62/#67; Capi usa dicas estáticas, IA aprovada é redação de anotação (#15), não insight clínico. |

### Sessões — #28 → #68

| Elemento | Especificação |
|---|---|
| API atual | GET/POST /sessoes; PUT/DELETE /sessoes/{id}; PATCH /sessoes/{id}/status; ainda sem GET individual. |
| Blocos, ações e regras aprovadas | Lista, filtros, agenda, detalhe e ações do autor; responsável lê sessões da criança; distinguir conteúdo compartilhado de observações internas; anotação a partir da sessão deve manter contexto. |
| Backend/banco e integração a executar | Enriquecer DTO com profissional/autor e nome da criança, definir consulta individual autorizada e filtros; alinhar semana da lista/resumo; máquina de transições e ownership no servidor; se associar anotação à sessão, adicionar vínculo validado no schema. |
| Critério de aceite | Profissional não autor não altera sessão; responsável só lê; datas e filtros consistentes; observações internas não vazam; criar/editar/concluir atualiza lista, detalhe e dashboards. |
| Pendência localizada | Fechar transições, local/modalidade e representação de objetivos; tipos novos/grupo só entram mediante contrato aprovado; definição do card semana em #62. |

### Anotações profissionais — #29 → #69

| Elemento | Especificação |
|---|---|
| API atual | GET/POST /criancas/{id}/anotacoes; GET/PUT/DELETE /criancas/{id}/anotacoes/{anotacaoId}; conteudo 10–3000, visibilidade PRIVADA/COMPARTILHADA. |
| Blocos, ações e regras aprovadas | Editor, filtros, autoria, visibilidade e histórico; privadas do autor, compartilhadas também no histórico da família; após saída arquivo próprio somente leitura; IA organiza texto próprio selecionado com comparação e aceite manual. |
| Backend/banco e integração a executar | Preservar gateway e eventos já implementados; definir título/temas/foto autor e migração das antigas se necessários à referência; autoria no servidor; contrato separado do arquivo pós-saída e escopo de IA #15; documentar mudança de visibilidade sem retirar histórico compartilhado já retido silenciosamente. |
| Critério de aceite | Privada alheia nunca é retornada; outro profissional não edita; responsável vê somente compartilhadas; saída bloqueia tela ativa e novas informações; arquivo não permite alterações; falha de IA não impede salvar normalmente. |
| Pendência localizada | Dados mínimos, retenção e regras de edição/remoção após compartilhamento precisam ser fechados em #8/#62; título/temas não podem ser preenchidos com ficção. |

### Perfil e configurações — #30 → #70

| Elemento | Especificação |
|---|---|
| API atual | GET/PUT /users/me; GET/PUT /profissionais/me; fotoPerfilUrl existe, upload não; PUT /users/me não altera email. |
| Blocos, ações e regras aprovadas | Perfil real e foto; edição dos campos suportados; não há seletor de fuso, 2FA, dispositivos ou planos no MVP; preferências só para canais/eventos realmente implementados. |
| Backend/banco e integração a executar | Definir upload/remoção de foto: formatos, tamanho, autorização, storage e URL; implementar validação/DTO e integração; não simular alteração de email; email de cadastro solicitado, recuperação e emails de anotações; documentar quais preferências são persistidas. |
| Critério de aceite | Campos persistem; erro de upload mantém formulário; foto não dá acesso indevido a dados; nenhuma configuração exibe sucesso sem persistência. |
| Pendência localizada | Conteúdo do email de cadastro e eventual verificação separada pendentes; convites nominais exigem email confirmado. Estratégia de fuso por localidade brasileira sem seletor ainda precisa de contrato (#62), storage #52. |

### Dashboard do responsável — #31 → #71

| Elemento | Especificação |
|---|---|
| API atual | GET /dashboard/responsavel, /criancas, /metas?criancaId=, /sessoes, /progresso/resumo?criancaId= e anotações compartilhadas. |
| Blocos, ações e regras aprovadas | Visão geral organizada de todas as crianças vinculadas com acesso a detalhes individuais; todas as metas, progressos e sessões; apenas anotações compartilhadas; próximos compromissos e atividade autorizada. |
| Backend/banco e integração a executar | Compor/agregar dados sem N+1; cards com IDs estáveis; médias não confundidas com avaliação clínica; nenhum dado privado ou de vínculo encerrado; invalidar após convite/desvinculação. |
| Critério de aceite | Duas crianças e profissionais distintos aparecem corretamente sem mistura; cards batem com detalhes e filtros; responsável não recebe ações de edição de atividades. |
| Pendência localizada | Mesmas definições pendentes de indicadores de #64 e séries #67; Círculo depende #8/#75. |

### Convites híbridos e vinculação — #32 → #72

| Elemento | Especificação |
|---|---|
| API atual | POST /criancas/{id}/tokens-vinculo (profissional), preview de token e confirmação atual do responsável com consentimento; hoje confirma vínculo diretamente, sem gestor/destinatário. |
| Blocos, ações e regras aprovadas | Código/QR são canais; nominal aprovado pelo gestor + destinatário correto aceita sem segunda aprovação; código não nominal gera solicitação pendente e aguarda gestor; proposta do profissional exige aprovação do gestor existente. |
| Backend/banco e integração a executar | Reformular serviço/DTO/entidades para destinatário, papel, emissor, aprovação/aceite e estados de convite/solicitação/vínculo separados; validar identidade/email confirmado; hash, expiração, cancelamento e consumo/reserva atômicos; recusa exige novo convite; criança arquivada não aceita token; auditar sem token bruto. |
| Critério de aceite | Código/QR mesmo fluxo; solicitante pendente não vê dados clínicos; email diferente não aceita nominal; duplo clique/replay/concorrência não duplicam; saída não reativa vínculo sem novo fluxo. |
| Pendência localizada | Sem gestor: profissional indica primeiro responsável nominal; email confirmado, aceite da gestão e do compartilhamento inicial. Processo para verificar autoridade desse primeiro responsável ainda deve ser definido; email não prova guarda. Domínio em #8, integração aqui. |

### Anotações compartilhadas do responsável — #33 → #73

| Elemento | Especificação |
|---|---|
| API atual | GET /criancas/{id}/anotacoes com filtros profissionalId, busca, ordenacao e visibilidade compartilhada. |
| Blocos, ações e regras aprovadas | Cards, filtros, leitura e contexto da criança/autor; nenhuma anotação privada; histórico compartilhado da família preservado após saída do autor. |
| Backend/banco e integração a executar | DTO com título/temas/foto somente quando contrato existir; filtrar por criança autorizada; links de notificações revalidam acesso; arquivo da família não é o arquivo privado do autor. |
| Critério de aceite | Busca e filtros combinados; conteúdo privado ausente de resposta/contadores; responsável não edita; histórico compartilhado preservado conforme #8. |
| Pendência localizada | Política de retenção e imutabilidade/snapshot de compartilhadas em #8/#62. |

### Notificações e sino — #34 → #74

| Elemento | Especificação |
|---|---|
| API atual | GET /notificacoes, /nao-lidas/count; PATCH /{id}/lida e /lidas; tipos atuais são eventos de anotações. |
| Blocos, ações e regras aprovadas | Páginas por papel com histórico; sino recentes com Limpar e Ler tudo distintos; Limpar remove do modal e preserva histórico; Ler tudo marca leitura; navegação para recurso autorizado. |
| Backend/banco e integração a executar | Definir persistência de ocultação do sino separada de lida; novos filtros/paginação só com contrato; sincronizar badge/página/modal/cache; DTO destino com criancaId/anotacaoId; revalidar autorização ao abrir registro antigo após saída. |
| Critério de aceite | Limpar não apaga histórico nem marca leitura implicitamente; ler tudo atualiza badge; sessão/conta isoladas; notificação antiga não reabre acesso à criança; nenhuma privada vira email/notificação indevida. |
| Pendência localizada | Janela de recente/nova e comportamento de limpar entre dispositivos em #62; MVP email: anotações, recuperação e cadastro; outros canais/eventos não aprovados. |

### Círculo de Cuidado — #35 → #75

| Elemento | Especificação |
|---|---|
| API atual | Vínculos profissionais/responsáveis existem no banco; API autorizada de membros/gestão ainda falta; diretório profissional e conexões sociais não comprovam vínculo. |
| Blocos, ações e regras aprovadas | Membros por vínculo da criança, gestor controla entrada e saída; profissionais leem atividades autorizadas e editam só próprias; gestor não pode sair/remover último gestor sem transferência. |
| Backend/banco e integração a executar | #8 implementa domínio, papéis, autorização e persistência; #75 publica DTO/consultas/ações e integra gestão: convidar, aprovar/recusar, aceitar, transferir gestão, desvincular/sair; DTO açõesPermitidas consistente com servidor. |
| Critério de aceite | Membros correspondem a vínculos da criança; pendente sem acesso; último gestor protegido mesmo em concorrência; saída revoga acesso ativo e preserva histórico; diretório não concede permissão. |
| Pendência localizada | Bootstrap, arquivo mínimo/retenção em #8/#62; blocos não relacionados ao círculo nas telas detalhe podem avançar. |

### Detalhe da criança profissional — #36 → #76

| Elemento | Especificação |
|---|---|
| API atual | GET /criancas/{id}, metas/progresso/sessões/anotações por criancaId; membros ainda faltam. |
| Blocos, ações e regras aprovadas | Perfil estruturado, abas, próximas sessões, atividades recentes e Círculo; sidebar Crianças; leitura da equipe, autoria governa ações; privadas apenas do próprio autor. |
| Backend/banco e integração a executar | Reutilizar contratos #65–#69 e #75; feed autorizado com tipo/data/autor/destino, excluir privados alheios; carregamento independente por aba; não duplicar domínio nem inferir membros do diretório. |
| Critério de aceite | URL direta/refresh funcionam; troca de criança não mantém conteúdo anterior; cada aba respeita autoria e vínculo; feed não vaza privados. |
| Pendência localizada | Campos #65, feed ordenação/limite #62; somente bloco Círculo aguarda #8/#75. |

### Detalhe da criança responsável — #37 → #77

| Elemento | Especificação |
|---|---|
| API atual | GET /criancas/{id} e consultas autorizadas por criancaId; rota React específica ainda falta. |
| Blocos, ações e regras aprovadas | Nova rota protegida com perfil, todas as metas/progressos/sessões, compartilhadas, equipe e atividades; ações de gestão somente gestor, atividades clínicas em leitura. |
| Backend/banco e integração a executar | Compor contratos #65–#75; excluir notas privadas/observações internas; feed autorizado; separar permissões gestor/membro e expor ações permitidas; carregar abas sob demanda. |
| Critério de aceite | URL direta funcional; responsável comum não aprova/desvincula; gestor só executa gestão; nenhum responsável altera atividades; saída encerra acesso. |
| Pendência localizada | Círculo #8/#75 e retenção; definição exata dos campos editáveis do perfil infantil em #62. |

### Minhas crianças — #38 → #78

| Elemento | Especificação |
|---|---|
| API atual | GET /criancas → {items,total}, consultas resumo por criança. |
| Blocos, ações e regras aprovadas | Busca, filtros, lista/cartões de todas as vinculadas; abrir detalhe correto; estados vazio e solicitar/vincular criança; acompanhamento diferente de arquivo. |
| Backend/banco e integração a executar | Reutilizar DTO ampliado #65 e composição autorizada, paginação se adotada; nova rota #37/#77; invalidar depois de entrada/saída; não renderizar contatos pendentes como criança vinculada. |
| Critério de aceite | Duas crianças, busca sem resultado e vínculo pendente/encerrado coerentes; links e botão vincular corretos. |
| Pendência localizada | Campos/filtros #62/#65; lista pode avançar antes do detalhe ficar completo. |

## Convites: estado e autorização
Convite/solicitação/vínculo são entidades/ciclos distintos. Os nomes exatos dos enums e rotas serão documentados em #8/#72.

| Origem | Aprovação | Aceite | Quando há acesso |
|---|---|---|---|
| Gestor envia nominal | Registrada na emissão pelo gestor | Destinatário autenticado e email confirmado | Após aceite válido |
| Código/QR não nominal | Gestor analisa identidade/papel e aprova | Solicitante registra aceite do termo | Só após ambos, nunca na leitura do QR |
| Profissional propõe entrada | Gestor existente aprova | Destinatário aceita | Após ambos |
| Primeiro responsável sem gestor | Processo de bootstrap/verificação a definir | Nominal aceita gestão e compartilhamento inicial | Após requisitos de bootstrap verificados |

Expiração, cancelamento e reserva/consumo atômicos impedem replay e tomada concorrente. Recusa/cancelamento/expiração requer novo convite. Desvincular não reativa acesso via token antigo. Preview só identificação mínima permitida, sem dados clínicos antes da autoridade validada. Preservar código/QR e fallback manual atuais, mudando a autorização do backend.

## Banco de dados e fronteiras de implementação
| Domínio | Trabalho | Issue |
|---|---|---|
| Vínculos/convites/consentimento | Papéis, aprovação/aceite, destinatário, estados, auditoria, transferência, último gestor, revogação | #8; conexão #72/#75 |
| Arquivo pós-saída | Snapshot/consulta restrita, somente próprias notas do autor; histórico compartilhado para família, retenção definida | #8/#69/#73 |
| Crianças | Campos estruturados opcionais, status separado de arquivamento, validação e migração | #65 |
| Metas/histórico | Estado explícito, pausa/motivo/data, alertas separados, autoria, progresso e migração | #66 |
| Séries | Histórico completo, agregações e contrato temporal com amostra/coorte documentados | #67 |
| Sessões | Autor no DTO, transições, detalhe, privacidade interna e relações aprovadas | #68 |
| Anotações | Título/temas se fechados, compatibilidade histórica, privacidade e arquivo | #69/#73 |
| Notificações | Ocultação do sino distinta da leitura/histórico; filtros e destino autorizado | #74 |
| Perfil | Upload/remoção foto, limites, storage; configurações realmente persistidas | #70/#52 |

Cada mudança persistente exige Flyway, validação, constraints/índices conforme consultas, teste de migração e compatibilidade de dados anteriores. Evitar duplicar domínio do Círculo em #75. #10 verifica autorização transversal. Não inventar dados clínicos para migrar campos novos.

## Decisões ainda necessárias
| Tema | O que falta fechar | Issue responsável |
|---|---|---|
| Arquivo após saída | Dados mínimos, retenção, imutabilidade/snapshot das compartilhadas, efeitos de edição/exclusão | #8 / #69 / #73 |
| Primeiro gestor | Como verificar autoridade do responsável; email confirmado prova controle da conta, não guarda | #8 / #72 |
| Metas e séries | Concluir/reabrir, janela de alerta, coorte/amostra/baseline e frequência dos pontos | #66 / #67 |
| Cadastro e sessões | Enums/campos finais, editores, transições, local/modalidade, objetivos e vínculo com anotação | #65 / #68 |
| Indicadores e notificações | Janela de nova/recente, persistência de limpar entre dispositivos, sessões da semana versus metas com prazo | #64 / #71 / #74 |
| Email e fuso | Conteúdo de cadastro/verificação e estratégia por localidade brasileira, sem seletor de fuso | #62 / #70 / #72 |
| IA | Provedor, política de dados/retencão, limites e custo; não bloqueia restante | #15 / #52 |
| AWS | Região, orçamento, ambientes, disponibilidade, RPO/RTO, domínio, alertas e operação | #52 |
Não são dúvidas sobre quem governa a equipe ou se metas podem pausar: essas decisões já foram aprovadas. Cada pendência bloqueia somente sua operação/ativação correspondente; antes do uso real, retenção/acesso/bootstrap e requisitos operacionais precisam estar fechados.

## Ordem e validação
1. #21/#62: alinhar contratos, tipos e pendências; #22/#23 e #63: componentes/shell.
2. Alexandre segue #12 (backend observabilidade), #34, #25, #26, #28, #29, #32, #33; Gabriel prepara e integra #74/#65/#66/#68/#69/#72/#73 em paralelo.
3. #27/#67 (séries), #24/#64 e #31/#71 (dashboards), #30/#70 (perfil).
4. #35/#75 após núcleo #8; #36/#76 e #37/#77 avançam em abas independentes. #38/#78 pode preceder detalhes completos e mantém navegação correta.
5. #16 documentação contínua; #39 visual e #79 E2E.
6. #52 arquitetura e decisões; #53 IaC/#54 rede/#55 banco; #56/#57 deploy; #58 HTTPS/#59 pipeline/#60 operação; #61 homologação final com restore/rollback.

Verificações de entrega: profissional A/B, gestor, responsável comum/não vinculado; criança arquivada; metas pausadas/concluídas; anotações privadas/compartilhadas; nominal destinatário incorreto e não nominal pendente; replay/concorrência; saída/arquivo/último gestor; troca de conta/cache; histórico vazio e tendências em p.p.; datas/fuso; câmera/fallback; persistência/URLs diretas; backup/restore/rollback em AWS. Evidenciar versão e resultados. Testes não foram executados nesta revisão documental.

## Inventário técnico atual — baseline auditado em 09/10/2026
As rotas/enums abaixo descrevem o código do snapshot, **antes** das mudanças acima. Exemplo: status derivado de meta e confirmação direta de vínculo ainda precisam de adaptação; não são o comportamento final aprovado.

### Contratos HTTP atuais

Rotas abaixo relativas a /api. P=profissional; R=responsável. Autenticação e CSRF conforme seção 2.

### Crianças e vínculos

**ChildResponse** = {id,nome,dataNascimento,idade,genero?,diagnostico?,diagnosticoDetalhes?,observacoes?}.

| Método / rota | Request/filtros | Response / regra |
|---|---|---|
| GET /criancas | nenhum parâmetro implementado | {items:ChildResponse[],total}; vinculadas e não arquivadas |
| GET /criancas/{id} | path id | ChildResponse; vínculo ativo |
| POST /criancas | {nome,dataNascimento,genero?,diagnostico?,diagnosticoDetalhes?,observacoes?,responsavelPendente?:{nome,telefone?,email?,parentesco}} | 201 {message,crianca}; P; nome não vazio e nascimento passado |
| PUT /criancas/{id} | mesmos campos infantis, sem responsavelPendente | ChildResponse; P vinculado |
| DELETE /criancas/{id} | — | 204; arquiva; P vinculado |
| POST /criancas/{id}/tokens-vinculo | sem body | {id,codigo,expiraEm,qrCodeDataUrl}; P vinculado |
| DELETE /criancas/{childId}/tokens-vinculo/{tokenId} | — | 204; P proprietário do token |
| GET /vinculos/tokens/{codigo}/preview | código path | {id,nome,dataNascimento,genero?}; autenticado |
| POST /vinculos/confirmar | {codigo,consentimentoAceito:true} | preview; R; token uso único |
| GET /vinculos/me | — | ChildResponse[]; R |
| DELETE /vinculos/criancas/{id} | — | 204; encerra próprio vínculo R |

### Metas

**MetaResponse** = {id,titulo,descricao?,categoria,prioridade,status,progresso,dataInicio,dataFim,criancaId}.
Categoria=COMUNICACAO,SOCIAL,COGNITIVA,COMPORTAMENTAL,AUTONOMIA,MOTORA.
Prioridade=BAIXA,MEDIA,ALTA.
Status=EM_ANDAMENTO,VENCENDO,QUASE_CONCLUIDA,CONCLUIDA. Não há PAUSADA.

| Método / rota | Request/filtros | Response / regra |
|---|---|---|
| GET /metas | criancaId,categoria,prioridade,status,periodo,search | MetaResponse[]; R precisa criancaId; com criança retorna metas da criança vinculada |
| GET /metas/resumo | sem criancaId | {totalMetas,metasEmAndamento,metasVencendo,metasConcluidas}; conjunto próprio P; R recebe 403 |
| GET /metas/{id} | — | MetaResponse; vínculo ativo à criança |
| POST /metas | {titulo,descricao?,categoria,prioridade,dataInicio,dataFim,criancaId} | 201 MetaResponse; P; início >= hoje |
| PUT /metas/{id} | {titulo,descricao?,categoria,prioridade,dataInicio,dataFim} | MetaResponse; P vinculado; não altera criança |
| PATCH /metas/{id}/progresso | {progresso:0..100,descricao?} | MetaResponse; histórico gravado |
| DELETE /metas/{id} | — | 204; P vinculado |

periodo=TODOS,HOJE,SEMANA,MES,ATRASADAS; considera dataFim. SEMANA=hoje..+7 dias, MES=hoje..+1 mês. Progresso=100 conclui; >=90 quase concluída; vencendo em até 7 dias aplica se não concluída/quase concluída. Meta vencida pode continuar EM_ANDAMENTO; atrasada é filtro calculado.

### Progresso

| GET / rota | Filtros | Response |
|---|---|---|
| /progresso/resumo | criancaId | {mediaProgresso,metasAtivas,metasConcluidas,criancasAtivas} |
| /progresso/recentes | criancaId,periodo=SEMESTRAL/ANUAL | últimas 10 {id,data,descricao?,diferenca,progressoAtual,metaId,metaTitulo,criancaId} |
| /progresso/distribuicao-categoria | criancaId | mapa categoria→contagem de metas |
| /progresso/evolucao-categoria | criancaId,periodo=SEMESTRAL/ANUAL | mapa categoria→média do progresso histórico |
| /progresso/crianca | criancaId | [{nome,progresso}], sem ID da criança |

R sempre fornece criancaId. Períodos atuais usam 183/365 dias. Em histórico vazio o método retorna antes de validar o período: não presumir validação uniforme sem metas. Novo contrato de séries deve validar período independentemente da massa.

### Sessões

**SessionResponse** = {id,dataHora,duracao,status,tipo,descricao?,observacoes?,criancaId}; sem profissionalId/local.
Tipo=TERAPIA_INDIVIDUAL,TERAPIA_OCUPACIONAL,FONOAUDIOLOGIA,AVALIACAO.
Status=AGENDADA,CONCLUIDA,EM_ANDAMENTO,PENDENTE,CANCELADA.

| Método / rota | Request/filtros | Response / regra |
|---|---|---|
| GET /sessoes | criancaId,status,tipo,periodo,search | SessionResponse[]; P próprias sem child; R vinculadas; com child exige vínculo |
| GET /sessoes/resumo | sem filtro infantil | {sessoesHoje,sessoesConcluidas,sessoesEstaSemana,sessoesPendentes}; pendentes conta AGENDADA |
| POST /sessoes | {criancaId,tipo,dataHora,duracao,descricao?,observacoes?} | 201 SessionResponse; P; data futura/presente, duração>=1 |
| PUT /sessoes/{id} | mesmos campos sem criancaId | SessionResponse; P vinculado |
| PATCH /sessoes/{id}/status | {status} | SessionResponse; P vinculado |
| DELETE /sessoes/{id} | — | 204; P vinculado |

search consulta descricao/observacoes, não nome da criança/profissional. Não há GET individual. SEMANA na lista é janela de 7 dias; no resumo é semana calendário. Não foi encontrada validação de sobreposição de horários ou autoria da sessão nas mutações: definir/testar a regra.

### Anotações

**AnotacaoResponse** = {id,criancaId,criancaNome,autorProfissionalId,autorNome,autorEspecialidade?,conteudo,visibilidade,createdAt,updatedAt,isAutor}.
visibilidade=PRIVADA/COMPARTILHADA. isAutor é conveniência de UX, não autorização.

| Método / rota | Request/filtros | Response / regra |
|---|---|---|
| GET /criancas/{criancaId}/anotacoes | visibilidade,profissionalId,busca,ordenacao=RECENTES/ANTIGAS | AnotacaoResponse[]; vínculo + visibilidade; R não pode filtrar PRIVADA |
| GET /criancas/{criancaId}/anotacoes/{anotacaoId} | — | AnotacaoResponse; IDs da URL devem coincidir |
| POST /criancas/{criancaId}/anotacoes | {conteudo,visibilidade} | 201; P vinculado; conteúdo 10..3000 |
| PUT /criancas/{criancaId}/anotacoes/{anotacaoId} | {conteudo,visibilidade} | response; somente autor |
| DELETE /criancas/{criancaId}/anotacoes/{anotacaoId} | — | 204; somente autor |

Sem titulo, temas, intervalo temporal, sessaoId ou paginação. Privada alheia na consulta individual retorna 404; falta de autoria para mutação retorna 403. O gateway React já chama APIs e só ativa mocks por flag em desenvolvimento.

### Notificações

**NotificacaoResponse** = {id,criancaId,anotacaoId?,tipo,titulo,mensagem,lida,lidaEm?,createdAt}.
tipo=ANOTACAO_CRIADA,ANOTACAO_EDITADA,ANOTACAO_EXCLUIDA,ANOTACAO_COMPARTILHADA,ANOTACAO_TORNADA_PRIVADA.

| Método / rota | Request | Response |
|---|---|---|
| GET /notificacoes | sem query implementada | NotificacaoResponse[]; só destinatário atual |
| GET /notificacoes/nao-lidas/count | — | {count} |
| PATCH /notificacoes/{id}/lida | sem body | NotificacaoResponse; alheia=404 |
| PATCH /notificacoes/lidas | sem body | {updated} |

Sem exclusão/paginação/filtros de servidor. Destinatários derivam dos vínculos ativos e usuários ativos; ator é excluído. Notificações persistidas não concedem acesso ao recurso nem somem automaticamente ao revogar vínculo. O frontend atual abre a página genérica de anotações. Emails são assíncronos/configurados por ambiente, não preferências por pessoa.

### Perfil e dashboard

| Rota | DTO e limites |
|---|---|
| GET /users/me | {id,name,email,telefone?,endereco?,tipo} |
| PUT /users/me | {name,telefone?,endereco?}; sem troca de email |
| DELETE /users/me | 204; desativação |
| GET/PUT /profissionais/me | {id,usuarioId,name,especialidade?,registroProfissional?,titulo?,formacaoAcademica?,sobre?,fotoPerfilUrl?,codigoIdentificacao}; PUT aceita campos profissionais, não nome |
| GET /profissionais?search= / {id} | diretório/perfil ativo, não integrantes do círculo |
| GET /dashboard/profissional | {totalCriancas,criancasEsteMes,profissionaisAtivos,profissionaisAtivosEsteMes,totalMetas,totalMetasEsteMes,taxaProgresso,taxaProgressoEsteMes} |
| GET /dashboard/profissional/criancas | [{id,nome,idade,diagnostico}] |
| GET /dashboard/profissional/metas | [{id,titulo,status,progresso,crianca}] — crianca é nome, sem criancaId nesse DTO |
| GET /dashboard/responsavel | {totalCriancas,totalMetas,sessoesProximas,taxaProgresso} |

taxaProgressoEsteMes é média das metas criadas no mês, não variação da taxa ante o mês anterior. Diretório profissional é autenticado, mas não exige vínculo infantil. Recursos acessórios /profissionais/me/locais-atendimento, redes-sociais, areas-atuacao existem; não equivalem ao local de uma sessão sem uma associação de domínio.


## Fontes e verificação Swagger

- [OpenApiConfig.java](https://github.com/Neukox/ConectaTEA/blob/ed5c453fd2d800c14c00e93e9322c5530787f777/BackendJava/src/main/java/br/com/conectatea/config/OpenApiConfig.java): esquema cookieAuth, tags e descrição de CSRF.
- [application.yml](https://github.com/Neukox/ConectaTEA/blob/ed5c453fd2d800c14c00e93e9322c5530787f777/BackendJava/src/main/resources/application.yml): context path /api, documentação, cookie/CORS e flags de email.
- [18_OPENAPI_SWAGGER.md](https://github.com/Neukox/ConectaTEA/blob/ed5c453fd2d800c14c00e93e9322c5530787f777/docs/refatoracao-java/18_OPENAPI_SWAGGER.md): localizações e evidências antigas.
- [12_API_CONTRACT_JAVA_CANONICO.md](https://github.com/Neukox/ConectaTEA/blob/ed5c453fd2d800c14c00e93e9322c5530787f777/docs/refatoracao-java/12_API_CONTRACT_JAVA_CANONICO.md): ler seções históricas como histórico, não falha atual.
- [ci.yml](https://github.com/Neukox/ConectaTEA/blob/ed5c453fd2d800c14c00e93e9322c5530787f777/.github/workflows/ci.yml): exporta/verifica openapi.json no CI e HTTP da UI; o arquivo gerado não foi localizado versionado.
- [testes de integração](https://github.com/Neukox/ConectaTEA/tree/ed5c453fd2d800c14c00e93e9322c5530787f777/BackendJava/src/test/java/br/com/conectatea/integration): testes OpenAPI e autorização.
- [referências profissionais](https://github.com/Neukox/ConectaTEA/tree/ed5c453fd2d800c14c00e93e9322c5530787f777/Frontend/Imagens%20Frontend/profissional) e [responsável](https://github.com/Neukox/ConectaTEA/tree/ed5c453fd2d800c14c00e93e9322c5530787f777/Frontend/Imagens%20Frontend/responsavel).

URLs locais documentadas: http://localhost:3000/api/swagger-ui/index.html, http://localhost:3000/api/v3/api-docs e /api/docs. Para fechar a verificação Swagger, executar o backend com banco de teste, exportar o JSON e comparar o documento gerado aos requests/responses e regras deste levantamento. Regras de vínculo/autoria precisam de código e testes: o schema OpenAPI sozinho não demonstra autorização relacional.

