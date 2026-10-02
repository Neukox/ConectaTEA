# Baseline da Fase 2

- Data/hora: 2026-10-01, America/Bahia
- Branch: `refactor/backend-java`
- SHA inicial: `51200322442f6268497f1c1d1c802f885c0b8168`
- Working tree inicial: limpo e alinhado com `origin/refactor/backend-java`
- `main`: `13df172543a633ea0e8c11b054533d0a0d71f4d7`
- Restauração local/remota: `backup/pre-refactor-java-20261001-1408` em `13df172543a633ea0e8c11b054533d0a0d71f4d7`

## Estado do CI

- Frontend: sucesso segundo a auditoria recebida.
- Backend Java: falha.
- Causa confirmada no repositório: `BackendJava/mvnw` está versionado no modo `100644`, enquanto o runner Linux executa `./mvnw -B verify` e requer `100755`.
- Limitação da auditoria local: GitHub CLI não está instalado, portanto o log remoto bruto não pôde ser consultado deste ambiente.

## Pendências principais

- corrigir permissão do Maven Wrapper e revalidar o CI;
- adicionar MockMvc e integração PostgreSQL/Testcontainers/Flyway;
- bloquear JWT de usuário desativado e testar CSRF;
- padronizar erros e contratos HTTP;
- corrigir crianças, vínculos, metas, progresso, sessões, conexões e dashboard;
- implementar auditoria/histórico;
- alinhar todos os consumidores frontend;
- validar o fluxo E2E principal e atualizar a documentação canônica.

