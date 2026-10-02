# E2E — ConectaTEA

Suíte de homologação ponta a ponta do ConectaTEA com Playwright.

Arquitetura exercitada:

`Chromium/Playwright → React/Vite → Spring Boot/Spring Security → JPA → PostgreSQL`.

## Execução local

Com PostgreSQL, backend e frontend em execução:

```bash
cd E2E
npm install
npx playwright install chromium
npm run test:e2e
```

No CI, o job `e2e` sobe PostgreSQL, backend Java e frontend Vite e executa Chromium headless.

Em falha, trace, screenshot, vídeo e relatório HTML são preservados quando disponíveis.
