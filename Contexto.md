# Contexto — ConectaTEA: transferência para Claude

Data: 10/10/2026. Responsável pelo projeto: Gabriel Falcão da Cruz. Colaborador: Alexandre Landa.

## 1. Como usar este documento

Este documento consolida o histórico técnico relevante disponível na conversa, decisões aprovadas e estado da última revisão. Não é transcrição literal nem comprovação de operações que não foram verificadas. O repositório pode ter recebido commits depois da revisão: confirme o HEAD, o diff e a CI antes de corrigir. Diferencie decisão de produto, implementação encontrada e validação executada.

Repositório: https://github.com/Neukox/ConectaTEA
Branch de preparação: `feat/preparacao-backend-banco-novo-frontend`.
Último SHA revisado: `04e65e5e31f0bea2638c407d86bfb7eac1bd525a`.
SHA anterior revisado: `c95127543c8de1208d7274fe130ace381d18bf1f`.
Matriz canônica no repositório: `Frontend/Levantamento_Contratos_Frontend_ConectaTEA.md`.
Contrato técnico citado anteriormente: `docs/refatoracao-java/12_API_CONTRACT_JAVA_CANONICO.md`.
Relatório de andamento citado anteriormente: `docs/refatoracao-java/14_RELATORIO_FASE_2_ANDAMENTO.md`.
Leia também AGENTS.md, README, ADRs, migrations e consumidores React.

## 2. Produto e objetivo

ConectaTEA conecta responsáveis por crianças autistas e profissionais em um Círculo de Cuidado. A família acompanha metas, progressos, sessões e anotações compartilhadas; profissionais gerenciam seus próprios registros. A preparação atual deve entregar backend Java e PostgreSQL suficientes para os contratos das 15 telas novas. O ambiente será utilizado por famílias reais, não somente demonstração.

Stack alvo: Java/Spring Boot, Spring Security, JPA, PostgreSQL, Flyway, Maven; frontend React/TypeScript/Tailwind. O backend anterior Node/TypeScript foi objeto de migração para Java. Preserve monólito modular em camadas, regras em serviços/domínio e contratos claros. Não converta novamente a stack nem reescreva o projeto inteiro.

## 3. Divisão de trabalho

Gabriel: planejamento, arquitetura, preparação e ajustes backend/banco, integração frontend/backend e infraestrutura AWS.
Alexandre: visual do frontend e atividades backend combinadas. As duas atividades citadas na ordem são #12 (observabilidade) e #16 (documentação). Atribuições reais devem ser consultadas no GitHub; este documento não comprova o estado atual do board.
O levantamento inicial #21 deixou de depender exclusivamente de Alexandre: Gabriel decidiu antecipar com IA a análise das imagens, Swagger e código. #62 foi citada para APIs/contratos.
Evite sobrecarregar Alexandre; visual e contratos podem avançar em paralelo, mas a issue de tela só fecha após visual e integração validados.

## 4. Histórico consolidado

1. Análise de documentos da ideia, requisitos, fluxo de cadastro e metas; decisão de migrar backend para Java mantendo React.
2. Criação/revisão de referências visuais: nove telas profissionais e seis responsáveis, sidebar consistente e seção selecionada, detalhes da criança com Círculo de Cuidado.
3. Organização de issues específicas do frontend, atividades backend, histórico de entregas antigas e issues AWS. Houve dificuldades de autenticação/login; não há credenciais neste documento.
4. Alinhamento com Alexandre sobre trabalho visual, backend e integração; definição da ordem de issues abaixo.
5. Levantamento de matriz por tela: blocos, campos, botões, filtros, contratos existentes, lacunas e permissões.
6. Aprovação progressiva das regras de compartilhamento, vínculos, metas, gráficos, notas, sessões, indicadores, convites e cadastro.
7. Rodadas de implementação por Codex, commits/push e revisão independente. Aprovação de CI nunca foi tratada como prova de cobertura total das telas.
8. Revisões anteriores encontraram problemas de schema, E2E, último gestor, concorrência de vínculos, fotos, confirmação de email e convites nominais. Algumas foram corrigidas em rodadas seguintes.
9. Em c951, os problemas destacados eram auditoria de sucesso com REQUIRES_NEW e ordem divergente de locks entre aceite/cancelamento. Os demais módulos ainda estavam incompletos.
10. Gabriel aprovou o conjunto de regras abaixo e solicitou implementação integral. O push até 04e adicionou primeiro gestor administrativo, sessões, metas, notas, feed e limpeza de fotos; a revisão identificou lacunas e uma regressão E2E.
11. Foram produzidas referências estáticas de home completa, login, registro e recuperação; Gabriel aprovou a ideia e pediu dinamismo futuro. Backend/banco continuam prioridade.
12. Gabriel decidiu transferir execução para Claude, com correção das falhas e conclusão dos módulos. Este documento é o handoff.

Commits do último conjunto revisado:
- 52b6b76: auditoria vinculada à transação de domínio.
- 6acf6f7: primeiro gestor e ordem de locks.
- e6bfc66: sessões, metas, anotações e feed.
- 1b14905: serialização de perfil e reprocessamento de limpeza de fotos.
- 03469e2 e 04e65e5: documentação/matriz.

## 5. Regras aprovadas: vínculos e gestão

- Conta pessoal é independente da gestão de cada criança.
- Papéis do vínculo: RESPONSAVEL_GESTOR, RESPONSAVEL e PROFISSIONAL.
- Família controla a equipe; profissionais não autorizam unilateralmente outros membros.
- Primeiro responsável: conta ativa, email confirmado, declaração de relação/responsabilidade legal, pedido de validação administrativa com decisão de operador autorizado, motivo e referência.
- Email confirmado prova posse do endereço, não autoridade legal.
- Capacidade administrativa deve ser provisionada de forma restrita, nunca por campo público de cadastro.
- Profissional que inicia cadastro de criança deve seguir fluxo de espera/validação do gestor; não assume autoridade de gestor.
- Não promover responsáveis legados automaticamente.
- Gestão pode ser compartilhada entre responsáveis legais autorizados. Transferência exige sucessor autorizado e aceite conforme contrato; preservar histórico.
- Impedir saída, remoção ou desativação do último gestor sem sucessor.
- Nominal: conta destinatária correta, ativa, confirmada e aceite; pode convidar profissional, responsável comum ou gestor em círculo já gerenciado.
- Código/QR gera solicitação pendente de aprovação, nunca acesso imediato.
- Completar solicitação de entrada do profissional e aprovação do gestor.
- Saída encerra acesso à criança e a informações novas; reentrada não restaura automaticamente privilégios antigos.
- Registrar histórico e notificações internas de gestão. Não criar emails de gestão não aprovados.

## 6. Regras aprovadas: crianças e sessões

### Crianças
- Estados EM_ACOMPANHAMENTO, PAUSADO e ENCERRADO; PENDENTE_CLASSIFICACAO para legado sem informação confiável.
- Gestor administra campos familiares e estado de acompanhamento.
- Arquivamento é independente do estado: oculta da lista padrão, preserva leitura histórica autorizada e bloqueia escritas em todos os módulos.
- Arquivar não desvincula automaticamente; reativação explícita.
- Histórico deve registrar estado anterior verdadeiro, autor, data e motivo.
- Listas com busca, filtros, paginação, limites e ordenação determinística no banco.
- Os detalhes exatos dos campos devem ser conferidos na matriz; não inventar campos aprovados ausentes neste resumo.

### Sessões
- AGENDADA, REALIZADA, CANCELADA, NAO_COMPARECEU; sem atendimento em tempo real.
- Somente profissional autor atualmente vinculado altera.
- AGENDADA passa aos estados finais; não comparecimento somente após horário previsto.
- Reagendamento preserva valores anteriores; correção de estado final exige motivo e histórico.
- Campos: criança, autor, início, duração, modalidade presencial/online, local/instruções, objetivos, descrição compartilhada, observação privada e anotação opcional.
- Responsáveis e demais profissionais autorizados veem dados compartilhados; não editam registros de outros autores.
- Observação privada nunca aparece para terceiros, nem em feed/dashboard/associações.

## 7. Regras aprovadas: metas e gráficos

### Metas
- Estados EM_ANDAMENTO, PAUSADA, CONCLUIDA. Prazo próximo/atrasado são alertas separados.
- Somente autor vinculado altera.
- Conclusão explícita a partir de andamento ou pausa, exige resumo do resultado, data/autor e progresso 100%.
- Registrar 100% isoladamente não conclui automaticamente.
- Reabertura exige motivo, novo prazo e progresso inicial 0..99, retorna a EM_ANDAMENTO.
- Pausar/retomar registra motivo/data. Prazo permanece registrado; ao retomar, confirmar ou ajustar.
- Pausada não recebe novos progressos.
- Preserve todas as transições; não sobrescreva eventos antigos de conclusão/reabertura.

### Resumo atual
- Média por categoria com pesos iguais, somente metas em andamento.
- Último progresso conhecido por meta; ausência não equivale a zero.
- Quantidades com/sem dados; pausadas e concluídas separadas.

### Histórico
- Séries mensais por categoria para 3, 6, 12 meses; mês atual parcial.
- Reconstruir estado e composição naquele momento, sem usar estado atual para reescrever passado.
- Composição inclui metas em andamento no início e iniciadas/retomadas no período, a partir do momento relevante.
- Concluídas no período permanecem na composição daquele período com 100%.
- Pausadas ficam excluídas enquanto pausadas e são informadas separadamente.
- Não inserir zero em metas sem registro.
- Indicar entrada, pausa, retomada, reabertura e alteração de composição.
- Tendência: último ponto válido menos primeiro válido, em pontos percentuais; menos de dois pontos = histórico insuficiente.
- Indicador operacional, não avaliação clínica.
- Exemplo obrigatório: 40+60 => média50; depois60+80 =>70 e +20pp; nova meta registrada0 =>46,67 com aviso de composição.
- Definir e documentar limites e coortes precisamente, com testes, preservando essas decisões; não simplificar para todas as metas criadas até o fim do mês.

## 8. Regras aprovadas: anotações

- Título, conteúdo, temas/tags e sessão opcional.
- Privadas somente autor; compartilhamento explícito.
- Compartilhadas são parte do histórico da criança e podem ser lidas por responsáveis/profissionais atualmente autorizados, inclusive novos membros.
- Autor que sai perde acesso ativo; a família e equipe atual mantêm as compartilhadas com autoria preservada.
- Somente autor vinculado corrige compartilhadas, com motivo e versão anterior preservada.
- Compartilhadas não voltam a privadas e não admitem exclusão comum.
- Controle concorrente para não perder correções/versões.
- Associação de sessão exige mesma criança e autorização; não expor privados pela associação.
- Arquivo do autor após saída: próprias privadas e compartilhadas, somente leitura, mínimo de dados preservados de identificação; sem contatos, equipe atual, progresso ou dados de terceiros.
- Contrato do arquivo é separado do contrato ativo, sem botão/permissão de editar.
- Não executar purga automática nem inventar prazo de retenção. Política final precisa ser definida antes do lançamento.

## 9. Dashboards, feed, notificações, fuso

- Dashboard geral organizado de várias crianças; individual nos detalhes.
- Contagem crianças: vínculo ativo, EM_ACOMPANHAMENTO, não arquivadas.
- Metas ativas: EM_ANDAMENTO.
- Sessões da semana: AGENDADA entre segunda local e segunda seguinte, fim exclusivo. A explicação inicial do usuário confundiu metas/sessões; a definição consolidada aprovada é esta.
- Próximas sessões a partir de agora.
- Rótulo Notificações não lidas; inclui não lidas ocultadas do sino.
- Sino permite limpar/ocultar e ler tudo, sem apagar histórico de notificações.
- Feed persistente: criação/conclusão/reabertura de meta, progresso, agendamento/realização/cancelamento de sessão, compartilhamento/correção de anotação e gestão conforme permissões.
- Preservar eventos repetidos; não inferir apenas de updated_at e estado atual.
- Dashboard5, detalhe10 e carregar mais por cursor estável (instante e ID único do evento).
- Sem conteúdo/títulos/contagens privados. Referências administrativas não expostas indiscriminadamente.
- Revalidar autorização ao abrir recurso.
- Instantes UTC; limites locais no fuso por localidade. America/Bahia é fallback de informação insuficiente, não padrão obrigatório de todo Brasil. Sem seletor visual de fuso no MVP; sem inferência ambígua.
- Emails: cadastro/verificação, recuperação de senha e anotações. Feed não gera email automático adicional.

## 10. Perfil, fotos e IA

Perfil: consultar matriz para campos; foto aprovada. Upload/remoção devem ser consistentes com PUT do perfil, sem perda de alterações concorrentes. Arquivos novos removidos em rollback, antigos após commit. Falha de limpeza persistida com retry idempotente. Storage configurável e durável na implantação; AWS fica separada.

IA básica aprovada: ajudar profissional a organizar redação de uma anotação própria selecionada, comparar sugestão, revisar e salvar manualmente. Sem diagnóstico, indicação de tratamento, alteração de progresso ou publicação automática. Enviar apenas texto selecionado, evitando identificação da criança e prontuário completo. Provedor continua pendente por qualidade/custo/tratamento e retenção de dados; ausência de IA não bloqueia o restante. Não contratar provedor nem enviar dados reais nesta tarefa.

## 11. Telas e ordem de Alexandre

Profissional: dashboard; crianças; detalhe/Círculo de Cuidado; metas; progresso; sessões; anotações; notificações; configurações/perfil.
Responsável: dashboard; minhas crianças; detalhe/Círculo; vincular criança; anotações compartilhadas; notificações.
Arquivos de imagens podem ter sufixos (1)/(2). Verificar referências existentes; anexos desta conversa chegaram a ficar inacessíveis por caminhos temporários. Este MD não embute imagens nem substitui inspeção visual.

Ordem anteriormente comunicada (reavaliar dependências atuais):
1. #21 levantamento contratos/imagens.
2. #22 identidade/componentes/assets Capi; #23 header/sidebar.
3. #12 observabilidade backend.
4. #34 notificações; #25 crianças; #26 metas; #28 sessões; #29 anotações; #32 código/QR/consentimento; #33 compartilhadas responsável.
5. #27 progresso; #24 dashboard profissional; #31 dashboard responsável; #30 perfil.
6. #35 Círculo (depende regras/contratos #8); #36 detalhe profissional; #37 detalhe responsável; #38 minhas crianças.
7. #16 documentação durante desenvolvimento.
8. #39 revisão das15telas, responsividade, acessibilidade, regressões.
Gabriel integra cada tela após entrega visual. Confirmar títulos/atribuições no GitHub antes de atualizar issues.

Home/login/registro/recuperação: referências estáticas produzidas e aprovadas. Sugestões de animação: Capi respirando suavemente, ondas, entrada gradual de cards, hover, conexões do círculo e FAQ; respeitar prefers-reduced-motion. Não implementar home dinâmica durante correção backend sem necessidade.

## 12. AWS: backlog e decisões pendentes

Solicitado criar/atribuir a Gabriel: arquitetura/custos; infraestrutura como código preferencialmente Terraform; rede/IAM; PostgreSQL com backup/restauração; deploy Java e health; hospedagem frontend/API; domínio/HTTPS/cookies/CORS/CSRF; pipeline/rollback; logs/métricas/alertas/Budgets; homologação/restauração.
Ainda decidir região/orçamento, ambientes separados, disponibilidade, perda de dados tolerada/tempo de recuperação, domínio e canal/responsável alertas. Não provisionar recursos por este handoff. Uso real com famílias exige finalizar essas decisões e retenção antes de lançamento.

## 13. Última revisão: problemas concretos

| Prioridade | Evidência | Correção |
|---|---|---|
| Alta | E2E criação anotação recebe400 em vez201; DTO exige titulo e gateway não envia | Alinhar formulário/schema/tipos/gateway e E2E; motivo para correção; regras novas de compartilhamento |
| Alta | ProgressoController.allowedMetas sem criancaId usa findByProfissionalId sem vínculo ativo | Filtrar autorização atual e revisar todas consultas globais/porID; autoria não substitui vínculo |
| Alta | evolucao-historica não usa eventos de estado, retorna média geral e fuso fixo Bahia | Coortes históricas por categoria, pausas/retomadas/reaberturas, localidade, testes numéricos |
| Alta | arquivoProprio usa mapear normal, nome atual criança e isAutor=true | Snapshot mínimo e DTO próprio somente leitura |
| Alta | criar anotação aceita sessaoId sem validação relacional | Mesma criança/autor autorizado, rejeitar associação indevida |
| Média | FeedController UNION de estado atual, última conclusão/reabertura e offset | Eventos persistidos, correções, gestão filtrada, cursor único e feed agregado |
| Média | AdministracaoGestorController.decidir não revalida solicitante/estado criança | Conta ativa/confirmada, situação criança, atomicidade e concorrência |
| Média | V14 renomeia observacoes e atribui PRESENCIAL/converte status legados | Upgrade com dados, preservar origem, compatibilidade implantação/rollback |

Outras pendências: composição final dashboards/detalhes; testes específicos novos módulos; solicitações profissionais/profissional-first; cadastro/email em falhas; foto concorrência/retry; OpenAPI e upgrade do banco.

Arquivos para começar (prefixo BackendJava/src/main/java/br/com/conectatea/):
- progresso/api/ProgressoController.java
- anotacao/api/AnotacaoDtos.java, application/AnotacaoService.java
- dashboard/api/FeedController.java
- vinculo/api/AdministracaoGestorController.java, PrimeiroGestorController.java
- vinculo/application/ConviteNominalService.java
- auditoria/application/AuditLogService.java
- profissional/application/ProfileImageService.java, ProfileImageCleanupService.java
- meta/api/MetaController.java
- crianca/api/GestaoCriancaController.java
- Frontend/src/features/Anotacoes/services/ApiAnotacoesGateway.ts
- BackendJava/src/main/resources/db/migration/V14* e E2E/tests/conectatea.e2e.spec.js.

Detalhes adicionais encontrados: feed tabela eventos_feed criada mas rota ainda não a utiliza; datas+IDs de recursos diferentes não garantem ordem total; correções compartilhadas contam versões sem lock explícito; aprovação gestor registra referência administrativa no histórico que feed retorna genericamente. Confirmar tudo no código atual antes de reportar.

Os dois problemas anteriores receberam correção de código: AuditLogService.record agora REQUIRED para SUCESSO, recordAttempt REQUIRES_NEW separado; aceite/cancelamento bloqueiam vínculos antes de convite. Isso ainda requer evidência de rollback e concorrência, não apenas leitura.

## 14. Evidência de testes da última revisão

CI: https://github.com/Neukox/ConectaTEA/actions/runs/38081353478
SHA04e65e5. Backend-java sucesso:128 testes,0falhas,0erros,0ignorados. Frontend job sucesso. E2E falha (também retry) na linha219: anotação compartilhada,201esperado,400recebido.
As14migrations foram instaladas em banco vazio PostgreSQL16 e aplicação iniciou. Isso não valida upgrade de base populada nem todos os fluxos novos.
A revisão leu código e logs GitHub; não executou esses128testes localmente. Não atribuir resultados da CI a execução local.

## 15. Critério de conclusão e restrições

- Trabalhar branch existente, preservando alterações de Gabriel/Alexandre.
- Sem merge/main/backup, forcepush, reset destrutivo ou apagar banco para passar teste.
- Sem AWS nesta etapa.
- Migração já aplicada não é reescrita: usar nova migration corretiva e explicar sequência.
- SOLID/Clean Code com responsabilidade clara, transações adequadas, validação central e dependências explícitas; sem abstrações gratuitas.
- Testes reais de permissão/transição/concorrência/rollback; mocks sozinhos insuficientes para locks.
- Matrizes15telas: bloco→rota→campos/ação→permissão→evidência.
- Compilar/testar/build/E2E, instalação limpa+upgrade, Hibernate validate, OpenAPI, tratamento consistente de erros.
- Registrar limitações e status real (implementado/validado/parcial/pendente).
- Conventional Commits em português, git add relacionado, commits coerentes e push. CI deve ser do SHA enviado.
- Conclusão100% significa escopo contratual backend/banco das15telas validado; não significa software100%sem bugs, visual concluído, AWS pronta, retenção resolvida ou IA com fornecedor escolhido.

## 16. Prompt mestre para execução no Claude

Use o prompt na mensagem que acompanha este arquivo. Este contexto é obrigatório. Primeiro confirme se os problemas ainda existem no HEAD, depois implemente e valide. Não repita uma correção já resolvida nem pare apenas em um plano.
