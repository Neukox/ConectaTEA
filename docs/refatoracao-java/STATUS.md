# Status

## Fase 2.5 — crianças

### Implementado
- Create e update usam DTOs separados; datas externas seguem `YYYY-MM-DD`.
- Create retorna `{message,crianca}` e listagem retorna `{items,total}`.
- `responsavelPendente` é persistido em `contatos_responsaveis_pendentes`; não
  é criada conta nem senha temporária.
- Criança arquivada desaparece da listagem e é negada pela autorização central,
  mesmo quando o ID e um vínculo antigo são conhecidos.
- Decisão de acesso histórico registrada no ADR-007.

### Testes
- MockMvc cobre create, envelope, data ISO e DTO inválido.
- Teste unitário cobre IDOR sem vínculo e bloqueio de criança arquivada.
- Testes focados: 4 executados, sem falha.

### Riscos restantes
- Contrato React ainda será ajustado na Fase 2.13.
- Integração PostgreSQL do fluxo completo depende do Docker/CI.

## Fase 2.4 — usuários/profissionais

### Implementado no backend
- Registro retorna o envelope canônico `{message,user}` e mantém a criação
  transacional do perfil quando o tipo é `PROFISSIONAL`.
- Senha canônica permanece com mínimo de oito caracteres.
- Perfis usam `GET /profissionais`, `GET/PUT /profissionais/me` e
  `GET /profissionais/{id}`; contas desativadas não aparecem na listagem.
- Busca textual foi implementada para nome, especialidade e título.

### Testes
- MockMvc cobre registro, validação de senha, conflito de e-mail, listagem,
  busca, conta desativada e 404.
- `mvnw test`: 23 encontrados, 19 executados sem falha, 4 containers ignorados.

### Riscos restantes
- O frontend ainda será migrado das rotas `/private/*` na Fase 2.13.
- Locais, redes sociais e áreas de atuação permanecem no NestJS temporariamente,
  registrados na matriz de paridade; portanto o módulo ainda está parcial.

## Fase 2.3 — segurança/auth

### Implementado e testado localmente
- Autenticação por JWT agora recarrega o usuário pelo ID e só cria o contexto
  quando a conta existe e continua ativa.
- Role e identidade usadas na autorização vêm do banco, não de claims antigas.
- Erros globais mapeiam validação, argumento inválido, ausência, credenciais,
  acesso negado, integridade e concorrência para HTTP/JSON previsível.
- Entry point 401 e access denied 403 também retornam JSON padronizado.
- MockMvc cobre 401, DTO inválido, cookie JWT HttpOnly e CSRF com/sem header.

### Validação
- `BackendJava/mvnw.cmd -B -f BackendJava/pom.xml verify`: sucesso.
- 17 testes encontrados; 13 executados sem falha e 4 Testcontainers ignorados
  pela indisponibilidade local do Docker.

### Riscos restantes
- Autorização relacional e criança arquivada serão reforçadas junto aos módulos.
- A execução PostgreSQL e o status remoto do CI continuam pendentes do runner.

## Fase 2.2 — testes base / Testcontainers

### Implementado
- Perfil de teste deixou de configurar H2 e `ddl-auto=create-drop`.
- Base de integração criada com PostgreSQL 16, Testcontainers, Flyway e
  `ddl-auto=validate`.
- Testes cobrem subida da V1 do zero, tabelas essenciais, unicidade de e-mail
  sem distinção de caixa, constraint de tipo de usuário e query JPA real.

### Validação local
- `BackendJava/mvnw.cmd -B -f BackendJava/pom.xml verify`: sucesso.
- Testes unitários executados: 8, sem falhas.
- Testes PostgreSQL: 4 cenários preparados, mas ignorados localmente porque o
  Docker Engine não está ativo. A execução real permanece pendente no CI.

### Risco restante
- A subfase só pode ser marcada como testada após o runner executar os quatro
  testes contra o container PostgreSQL; não há fallback H2.

## Fase 2.1 — CI

### Diagnóstico
- O job `backend-java` falha porque `BackendJava/mvnw` foi versionado como arquivo não executável (`100644`) e o runner Linux chama `./mvnw`.
- O job frontend estava verde no baseline informado.

### Correção
- O modo Git do wrapper será alterado para `100755`, mantendo o comando canônico no workflow.

### Validação
- `git ls-files -s BackendJava/mvnw`: `100755` após a correção.
- `BackendJava/mvnw.cmd -B test`: sucesso, 6 testes.
- `BackendJava/mvnw.cmd -B verify`: sucesso.
- Novo run remoto: pendente do push/execução do GitHub Actions.

## Fases A–J

### Concluído
- baseline, inventário e decisões iniciais;
- bootstrap Spring Boot, Flyway e modelo-alvo;
- auth por cookie, CSRF, CORS e autorização relacional;
- implementações iniciais dos módulos funcionais.

### Testes executados
- `BackendJava/mvnw.cmd -B test`: sucesso, 6 testes.
- `BackendJava/mvnw.cmd -B verify`: sucesso, JAR executável gerado.
- `Frontend/npm.cmd run build`: sucesso; aviso de bundle grande.
- `Frontend/npm.cmd run lint`: sucesso; 11 avisos, zero erros.
- `docker compose config`: sucesso com segredo efêmero.
- `docker compose build backend-java`: não executado; Docker Desktop/engine não estava ativo (named pipe ausente).

### Pendências
- ampliar testes Testcontainers/MockMvc, rate limit, auditoria de acesso e homologação E2E.

### Riscos
- migração de dados reais exige backup e janela controlada; consentimento exige revisão jurídica.

### Próxima fase
- alinhar frontend, compilar, testar e validar Compose.
