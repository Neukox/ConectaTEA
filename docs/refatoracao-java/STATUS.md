# Status

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
