# Homologação E2E — Playwright

## Arquitetura validada

`Chromium/Playwright -> React/Vite -> Spring Boot/Spring Security -> JPA -> PostgreSQL 16`.

O job usa banco efêmero e exclusivo do GitHub Actions. Nenhum banco real é migrado.

## Escopo automatizado

A suíte `E2E/tests/conectatea.e2e.spec.js` cobre:

1. cadastro/login de profissional e responsável;
2. dashboards separados por role;
3. sessão por cookie e `/auth/me`;
4. rejeição de mutação sem CSRF;
5. cadastro de criança pela UI;
6. criação de meta pela UI;
7. atualização de progresso;
8. sessão persistida e exibida;
9. geração de token/QR;
10. preview, consentimento e vínculo;
11. replay de token rejeitado;
12. IDOR básico;
13. conexão entre profissionais;
14. indicadores de dashboard;
15. desvinculação e bloqueio de acesso posterior.

## Limites

Esta suíte não substitui os testes manuais reservados ao aprendizado: controllers, matriz completa de IDOR, auditoria/histórico, rate limit/429, concorrência AB/BA e integrações específicas com JUnit/MockMvc/Testcontainers.

E2E verde não equivale a certificação de produção ou conformidade jurídica.


## Resultado final da execução

- Commit homologado: `f264d8320693ec376affd67d63aba6b129f2783f`.
- GitHub Actions: `37037277203`.
- `frontend`: success.
- `backend-java`: success.
- `e2e`: success.

### Falhas reais encontradas pelo E2E

1. **CSRF de SPA** — a primeira execução chegou ao cadastro de criança, mas a mutação recebeu 403. Foi implementado bootstrap de CSRF autenticado e handler próprio de SPA, preservando cookie `XSRF-TOKEN` e header `X-XSRF-TOKEN`.
2. **Lista de crianças desatualizada** — depois do 201 da API, a página continuava com o estado local antigo. O callback do cadastro passou a recarregar a listagem.

Essas falhas demonstram por que build/CI de camadas isoladas não substituem homologação ponta a ponta.
