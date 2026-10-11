# ContinuacaoContexto — Hand-off para IA continuadora

**LEIA PRIMEIRO:** Contexto.md na raiz do repositório e Frontend/Levantamento_Contratos_Frontend_ConectaTEA.md.
Ambos são obrigatórios antes de qualquer implementação.

**Branch de trabalho:** feat/preparacao-backend-banco-novo-frontend
**Worktree local:** BackendJava/.worktrees/preparacao-novo-frontend-2
**SHA base revisado:** 04e65e5e31f0bea2638c407d86bfb7eac1bd525a
**Data início desta sessão:** 10/10/2026 — trabalho interrompido a pedido de Gabriel.

---

## O que foi feito nesta sessão

### PROBLEMA A — Anotações HTTP 400 ✅ CORRIGIDO

**Causa confirmada:** AnotacaoDtos exigia titulo @NotBlank, mas frontend envia apenas {conteudo, visibilidade}.

**Arquivos alterados:**

1. BackendJava/src/main/java/br/com/conectatea/anotacao/api/AnotacaoDtos.java
   - titulo em CreateRequest e UpdateRequest passou de @NotBlank para @Size(max=100) (opcional)
   - Adicionado método tituloResolvido() que retorna "Anotação" quando titulo é null/blank

2. BackendJava/src/main/java/br/com/conectatea/anotacao/api/AnotacaoController.java
   - criar() e atualizar() usam request.tituloResolvido() em vez de request.titulo()

3. BackendJava/src/main/java/br/com/conectatea/anotacao/application/AnotacaoService.java
   - Método atualizar (8 params) reescrito para legibilidade
   - Rejeita COMPARTILHADA→PRIVADA com BusinessRuleException("SHARED_NOTE_IMMUTABLE_VISIBILITY") — 409
   - Correção de COMPARTILHADA exige motivo não-vazio (CORRECTION_REASON_REQUIRED) — 409
   - Salva versão antes de corrigir compartilhada

4. E2E/tests/conectatea.e2e.spec.js
   - DELETE de compartilhada: 204 → 409 (SHARED_NOTE_PRESERVED)
   - Adicionado DELETE de privada para validar deleção válida
   - Adicionado teste COMPARTILHADA→PRIVADA esperando 409 (SHARED_NOTE_IMMUTABLE_VISIBILITY)
   - motivoCorrecao adicionado na edição de nota compartilhada (editedShared)
   - Adicionado teste PRIVADA→COMPARTILHADA (privateToShared) com 200
   - Contagem de notificações: count==2, updated==2 (editedShared + privateToShared)

ATENCAO: verificar se contagem de notificações (2) está correta com execução real — depende do momento de vinculação do responsável no fluxo.

---

## O que AINDA PRECISA ser feito (por ordem de prioridade)

### PROBLEMA B — Progresso após desvinculação ❌

Arquivo: BackendJava/.../progresso/api/ProgressoController.java

Causa: allowedMetas sem criancaId chama metas.findByProfissionalId() sem filtrar por vínculo ativo.

Correção:
1. Adicionar em VinculoProfissionalRepository:
   @Query("select distinct v.criancaId from VinculoProfissionalCrianca v where v.profissionalId=:id and v.status=:status")
   List<Long> findCriancaIdsByProfissionalIdAndStatus(@Param("id") Long id, @Param("status") StatusVinculo status);

2. Em allowedMetas sem criancaId:
   var ids = professionalLinks.findCriancaIdsByProfissionalIdAndStatus(professional.getId(), StatusVinculo.VINCULADO);
   return ids.isEmpty() ? List.of() : metas.findByCriancaIdIn(ids);

3. Aplicar em TODAS as rotas: /resumo, /resumo-atual, /evolucao-historica, /recentes, /historico, /distribuicao-categoria, /evolucao-categoria, /crianca
4. Revisar MetaController, SessaoController, DashboardController, FeedController.

---

### PROBLEMA C — Gráficos históricos incorretos ❌

Arquivo: ProgressoController.java método historicalEvolution

Problemas:
- ZoneId.of("America/Bahia") fixo → usar fuso por localidade, Bahia só como fallback
- Não filtra PAUSADAS da composição mensal
- Usa estado atual em vez de eventos históricos
- Coorte incorreta

Regras Contexto.md §7:
- Series mensais por categoria 3/6/12 meses
- Reconstruir estado histórico (não usar estado atual)
- Pausadas excluídas enquanto pausadas (informar separadamente)
- Ausência ≠ zero
- Tendência em pp; <2 pontos válidos = insuficiente
- Fuso por localidade

Pode precisar de tabela historico_metas com eventos — verificar se existe.

---

### PROBLEMA D — Arquivo próprio ❌

Arquivo: AnotacaoService.java método arquivoProprio

Causa: Usa mapear() com dados atuais da criança e isAutor=true.

Correção:
- Criar record ArquivoProprioView (sem dados atuais da criança, sem isAutor)
- Criar DTO AnotacaoDtos.ArquivoResponse separado
- Endpoint separado fora do path de criancaId (ex: /anotacoes/arquivo-proprio)
- Sem contatos, equipe atual, progresso, dados de terceiros

---

### PROBLEMA E — Associação anotação/sessão ❌

Arquivo: AnotacaoService.java método criar (7 params)

Adicionar validação:
  if (sessaoId != null) {
    sessao = sessaoRepository.findById(sessaoId).orElseThrow();
    if (!sessao.getCriancaId().equals(criancaId)) throw BusinessRuleException("SESSION_CHILD_MISMATCH", ...);
    if (!sessao.getProfissionalId().equals(profissional.getId())) throw AccessDeniedException(...);
  }

---

### PROBLEMA F — Feed incompleto ❌

Arquivo: dashboard/api/FeedController.java

Causa: UNION de estado atual; tabela eventos_feed existe (V14) mas não usada.

Correção:
- Migrar para eventos_feed
- Criar FeedService que persiste eventos ao criar metas/sessões/anotações
- Cursor: ?antes=<instant>&antesId=<id> (não offset)
- Filtrar eventos de gestão por permissão

---

### PROBLEMA G — Primeiro gestor ❌

Arquivo: AdministracaoGestorController.java método decidir

Adicionar revalidações:
  var sol = usuarios.findById(pedido.getSolicitanteUsuarioId()).orElseThrow();
  if (!sol.isAtivo() || !sol.isEmailConfirmado()) throw BusinessRuleException("APPLICANT_NOT_ELIGIBLE", ...);
  var crianca = criancas.findById(pedido.getCriancaId()).orElseThrow();
  if (crianca.isArquivada()) throw BusinessRuleException("CHILD_ARCHIVED", ...);

Também faltam: GET /administracao/pedidos-primeiro-gestor/{id}, endpoint de consulta de solicitação para o responsável, profissional-first.

---

### PROBLEMA H — V14 migration ⚠️

Verificar se UPDATE sessoes SET status='AGENDADA' WHERE status IN ('PENDENTE','EM_ANDAMENTO') causou dano em dados reais.
Se V14 já foi aplicada: criar V15 corretiva (não reescrever V14).
Verificar entidade Sessao.java — enum deve ter: AGENDADA, REALIZADA, CANCELADA, NAO_COMPARECEU.

---

## Módulos não iniciados (Fase 2)

- Convites: profissional-first, expiração, cancelamento, concorrência, audit
- Metas: POST /metas/{id}/concluir (com resumo), /reabrir (com motivo e prazo), /pausar, /retomar; bloquear progresso quando pausada
- Cadastro: reenvio de verificação, expiração de token, atomicidade, falha de envio não bloqueia cadastro
- Crianças: campos novos (escola, cidade/UF, interesses, nível suporte), histórico de status, arquivamento
- Sessões: GET individual, modalidade, localInstrucoes, objetivos, observacaoPrivada, máquina de estados
- Dashboards: sessões da semana (segunda→segunda local), feed persistente integrado
- Perfil/fotos: upload, remoção, retry idempotente, concorrência

---

## Arquivos-chave

BackendJava/.worktrees/preparacao-novo-frontend-2/
  anotacao/api/AnotacaoDtos.java                 ← ALTERADO
  anotacao/api/AnotacaoController.java            ← ALTERADO
  anotacao/application/AnotacaoService.java       ← ALTERADO
  progresso/api/ProgressoController.java          ← CORRIGIR B e C
  dashboard/api/FeedController.java               ← CORRIGIR F
  vinculo/api/AdministracaoGestorController.java  ← CORRIGIR G
  meta/infrastructure/MetaRepository.java         ← ADICIONAR query findByCriancaIdIn
  vinculo/infrastructure/VinculoProfissionalRepository.java ← ADICIONAR query de criancaIds
  shared/api/ApiExceptionHandler.java             ← BusinessRuleException → HTTP 409

Migrations:
  V14__frontend_contract_completion.sql  ← APLICADA, revisar H
  V15__*.sql                             ← CRIAR se necessário

E2E:
  E2E/tests/conectatea.e2e.spec.js       ← ALTERADO

---

## Convenções importantes

- BusinessRuleException → HTTP 409 CONFLICT (ver ApiExceptionHandler.java)
- Compartilhada nunca volta a PRIVADA (409 SHARED_NOTE_IMMUTABLE_VISIBILITY)
- Compartilhada não pode ser deletada (409 SHARED_NOTE_PRESERVED)
- Autoria não substitui vínculo ativo
- Commits: Conventional Commits em português por entrega coerente
- Push: git push origin feat/preparacao-backend-banco-novo-frontend
- NÃO: merge, force push, reset destrutivo, apagar banco, alterar main/backup
- NÃO: AWS, IA provider, dados reais a provedores externos nesta tarefa

---

*Criado em 10/10/2026. Continue pelos problemas B, C, D, E, F, G, H nessa ordem, depois os módulos restantes, compile, teste e faça push.*