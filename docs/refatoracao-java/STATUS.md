# Status

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
