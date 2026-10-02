# ConectaTEA — Análise Técnica Completa e Plano de Refatoração Node/NestJS → Java/Spring Boot

**Repositório analisado:** `Neukox/ConectaTEA`  
**Branch analisada:** `main`  
**Data da análise:** 01/10/2026  
**Objetivo:** compreender o código existente, identificar riscos e inconsistências e definir uma estratégia segura para transformar o backend NestJS/TypeScript em Java/Spring Boot, preservando o frontend React e o comportamento de negócio válido.

---

## 1. Resumo executivo

A migração é totalmente viável.

O ConectaTEA hoje é um monorepo com:

- Frontend em React + TypeScript + Vite.
- Backend em NestJS + TypeScript.
- Prisma ORM.
- PostgreSQL.
- JWT em cookie HTTP-only, com compatibilidade adicional por Bearer Token.
- Swagger/OpenAPI.
- Módulos de usuários, profissionais, crianças, conexões, metas, progresso, sessões, dashboard, vinculação, tokens de vínculo e rotas legadas.

A recomendação **não** é converter TypeScript linha por linha para Java. A melhor estratégia é uma **refatoração funcional e arquitetural**, preservando:

1. regras de negócio válidas;
2. contratos que o frontend realmente precisa;
3. dados e entidades relevantes;
4. fluxos de autenticação e autorização;
5. comportamento visual do frontend.

Ao mesmo tempo, a refatoração deve **corrigir problemas de segurança e inconsistências que existem no backend atual**, em vez de reproduzi-los em Java.

A arquitetura-alvo recomendada é:

> **Java 21 LTS + Spring Boot 3.5.x + Spring Security + Spring Data JPA/Hibernate + PostgreSQL + Flyway + Jakarta Validation + springdoc-openapi + JUnit 5 + Mockito + Testcontainers.**

O backend Java deve começar como um **monólito modular**, e não como microserviços.

---


# 1.1. Estratégia obrigatória de ponto de restauração e branch de trabalho

Antes de qualquer alteração no repositório, a refatoração deve criar um **ponto de restauração explícito** no Git.

A estratégia recomendada é:

```text
main
  |
  |--- backup/pre-refactor-java-YYYYMMDD-HHMM   <- ponto de restauração imutável
  |
  `--- refactor/backend-java                    <- branch de trabalho
```

Regras obrigatórias:

1. confirmar a branch atual;
2. confirmar que o `HEAD` atual da `main` representa o estado que deve ser preservado;
3. registrar o SHA do commit-base;
4. criar uma branch de backup/ponto de restauração a partir desse SHA;
5. criar a branch de trabalho a partir do mesmo SHA;
6. executar **toda a refatoração exclusivamente na branch de trabalho**;
7. não realizar commits diretamente na `main`;
8. não fazer `force push` na `main`;
9. não apagar a branch de restauração durante a refatoração;
10. não fazer merge na `main` até que toda a migração tenha sido validada.

Exemplo conceitual:

```bash
git checkout main
git pull --ff-only
git rev-parse HEAD

git branch backup/pre-refactor-java-20261001
git switch -c refactor/backend-java
```

Se a branch de backup ou a branch de trabalho já existirem, o agente deve:

- verificar o conteúdo;
- não sobrescrever;
- reutilizar somente se estiverem corretamente alinhadas ao commit-base;
- caso contrário, criar novos nomes sem apagar as existentes.

O SHA-base deve ser registrado em:

```text
docs/refatoracao-java/BASELINE.md
```

Esse arquivo deve conter:

- branch de origem;
- SHA-base;
- data/hora;
- branch de restauração;
- branch de trabalho;
- estado do working tree;
- comandos utilizados.

Em caso de falha grave, a recuperação deve ser possível voltando para a branch de restauração ou para o SHA-base registrado.


# 2. Escopo auditado

Foi inspecionada a estrutura completa da branch `main`.

Principais áreas identificadas:

- `.github/`
- `Backend/`
- `Frontend/`
- `docs/`
- `README.md`
- `CLAUDE.md`
- `docker-compose.yml`
- diretório `.history/`

No backend atual foram identificados aproximadamente **117 arquivos fora de `.history`**, incluindo:

- controllers;
- services;
- DTOs;
- guards;
- decorators;
- validators;
- Prisma schema;
- migrations;
- módulos NestJS;
- arquivos Docker/configuração.

No frontend há aproximadamente **258 arquivos**, incluindo:

- páginas;
- componentes;
- serviços HTTP;
- hooks;
- contextos;
- schemas Zod;
- tipos;
- integrações com API;
- rotas;
- dashboards.

Para a migração foram lidos em profundidade os pontos que determinam o contrato backend/frontend e as regras de negócio: autenticação, usuários, profissionais, crianças, conexões, metas, progresso, sessões, dashboard, vinculação, token de vínculo, Prisma schema, DTOs, guards, clientes Axios, services, tipos e rotas do frontend.

---

# 3. Arquitetura atual

```text
React + TypeScript + Vite
          |
       Axios
          |
          v
NestJS + TypeScript
          |
        Prisma
          |
          v
     PostgreSQL
```

A estrutura backend segue o padrão típico do NestJS:

```text
Controller
   ↓
Service
   ↓
PrismaService
   ↓
PostgreSQL
```

Existem guards específicos para:

- autenticação JWT;
- roles;
- existência de profissional;
- vínculo em metas;
- vínculo em sessões;
- responsável-criança.

Essa organização pode ser traduzida de forma limpa para Spring Boot, mas não deve ser mapeada mecanicamente.

---

# 4. Domínios existentes no código

## 4.1 Usuário

Modelo base:

- id;
- name;
- email;
- password;
- telefone;
- endereco;
- tipo;
- criado_em.

Tipos:

- PROFISSIONAL;
- RESPONSAVEL.

---

## 4.2 Profissional

Extensão do usuário com:

- especialidade;
- registro profissional;
- título;
- formação acadêmica;
- biografia;
- foto;
- código de identificação;
- locais de atendimento;
- redes sociais;
- áreas de atuação.

---

## 4.3 Criança

Contém:

- nome;
- data de nascimento;
- gênero;
- diagnóstico;
- detalhes de diagnóstico;
- observações;
- parentesco;
- responsável;
- status de vínculo.

Relacionamentos:

- sessões;
- metas;
- profissionais;
- tokens;
- consentimentos;
- histórico de vínculos.

---

## 4.4 Profissional ↔ Criança

Tabela intermediária com:

- profissional;
- criança;
- status do vínculo;
- data de vínculo;
- data de desvínculo;
- motivo.

---

## 4.5 Sessões

Contém:

- data;
- duração;
- status;
- tipo;
- descrição;
- observações;
- criança;
- profissional.

---

## 4.6 Metas

Contém:

- título;
- descrição;
- categoria;
- prioridade;
- status;
- percentual de progresso;
- datas;
- criança;
- profissional.

---

## 4.7 Progresso

Histórico de alterações de metas com:

- progresso anterior;
- progresso atual;
- data;
- descrição;
- status;
- profissional.

---

## 4.8 Vinculação

O código atual possui uma tentativa de implementar:

1. profissional cadastra criança;
2. token de vínculo é criado;
3. QR Code é gerado;
4. responsável valida token;
5. consentimento é registrado;
6. profissional-criança passa para VINCULADO;
7. criança-responsável passa para VINCULADO;
8. histórico é registrado.

A ideia é boa, mas a implementação precisa ser redesenhada.

---

# 5. API atual relevante

## Autenticação

```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

## Usuários

```http
POST   /api/users/register
GET    /api/users
GET    /api/users/{id}
PUT    /api/users/{id}
DELETE /api/users/{id}
```

## Profissionais

```http
GET /api/profissionais
GET /api/profissionais?usuarioId={id}
PUT /api/profissionais/usuario/{usuarioId}
```

## Crianças

```http
POST   /api/criancas
GET    /api/criancas
GET    /api/criancas/{id}
PUT    /api/criancas/{id}
DELETE /api/criancas/{id}
GET    /api/criancas/{id}/codigo-vinculo
```

## Conexões profissionais

```http
POST   /api/conexoes/enviar
GET    /api/conexoes/recebidas
GET    /api/conexoes/enviadas
GET    /api/conexoes
PUT    /api/conexoes/{id}/responder
DELETE /api/conexoes/{id}
GET    /api/conexoes/profissional/{profissionalId}
GET    /api/conexoes/filtrar
```

## Metas

```http
POST   /api/metas
GET    /api/metas
GET    /api/metas/resumo
GET    /api/metas/{id}
PUT    /api/metas/{id}
PATCH  /api/metas/{id}/progresso
DELETE /api/metas/{id}
```

## Progresso

```http
GET /api/progresso/recentes
GET /api/progresso/resumo
GET /api/progresso/evolucao-categoria
GET /api/progresso/distribuicao-categoria
GET /api/progresso/crianca
```

## Sessões

```http
POST   /api/sessoes
GET    /api/sessoes
GET    /api/sessoes/resumo
PUT    /api/sessoes/{id}
PATCH  /api/sessoes/{id}/status
DELETE /api/sessoes/{id}
```

## Dashboard

```http
GET /api/dashboard/profissional
GET /api/dashboard/profissional/criancas
GET /api/dashboard/profissional/metas
GET /api/dashboard/responsavel
```

## Vinculação existente no backend

```http
GET  /api/vinculacao/historico/{criancaId}
GET  /api/vinculacao/validar/{codigo}
POST /api/vinculacao/vincular
```

---

# 6. Problemas críticos encontrados

## P0 — Segurança

### 6.1 `.history` versionado com snapshots de `.env`

O repositório contém um diretório `.history` com várias versões de arquivos `.env`.

Isso é um risco grave.

Mesmo que os valores atuais não sejam mais utilizados, qualquer segredo que tenha sido commitado deve ser considerado potencialmente comprometido.

### Ação

- remover `.history` da árvore versionada;
- adicionar `.history/` ao `.gitignore`;
- nunca copiar valores dos `.env` antigos;
- rotacionar credenciais que possam ter sido usadas;
- não reescrever o histórico Git automaticamente sem backup e decisão explícita.

---

### 6.2 JWT possui segredo padrão no código

Há fallback semelhante a:

```text
JWT_SECRET || conectatea-secret-key
```

Em produção isso não pode existir.

### Java

Spring Boot deve falhar na inicialização se o segredo obrigatório não existir.

---

### 6.3 Endpoints de usuários possuem risco de IDOR

Hoje qualquer usuário autenticado consegue potencialmente:

- listar usuários;
- buscar outro usuário por ID;
- atualizar outro usuário por ID;
- excluir outro usuário por ID.

O backend Java não deve reproduzir isso.

---

### 6.4 Crianças não são filtradas adequadamente por vínculo

`GET /criancas` usa consulta global.

Isso pode expor crianças de outros profissionais.

`GET`, `PUT`, `DELETE` e acesso ao código de vínculo também precisam validar propriedade/vínculo.

Esse é um ponto especialmente crítico porque envolve dados de saúde e menores.

---

### 6.5 Perfil profissional pode ser atualizado por ID recebido na URL

O endpoint:

```text
PUT /profissionais/usuario/{usuarioId}
```

não deve confiar apenas no ID da URL.

Para edição do próprio perfil, o ID deve ser obtido da identidade autenticada.

---

### 6.6 Problema no `MetasGuard`

O decorator de roles grava uma coleção de roles, mas o guard específico tenta recuperar uma role simples.

Isso pode impedir a validação específica do vínculo.

Na prática, a migração Java deve reconstruir a autorização do zero com regras explícitas.

---

### 6.7 Argumentos invertidos no guard de sessões

O método de vínculo profissional-criança utiliza assinatura:

```text
(criancaId, profissionalId)
```

mas em parte do fluxo de sessão há chamada com:

```text
(profissionalId, criancaId)
```

Isso pode negar acesso válido ou produzir comportamento incorreto.

---

### 6.8 Autorização precisa ser baseada em relação com o caso

Não basta:

```text
role == PROFISSIONAL
```

Também é necessário validar:

```text
profissional está vinculado a esta criança?
```

Da mesma forma:

```text
responsável está vinculado a esta criança?
```

---

# 7. Problemas funcionais

## 7.1 Frontend e backend de vinculação estão fora de sincronia

Frontend espera:

```http
GET    /vinculacao/validar/{codigo}
POST   /vinculacao/confirmar
GET    /vinculacao/meus-vinculos
DELETE /vinculacao/crianca/{id}
```

Backend possui:

```http
GET  /vinculacao/validar/{codigo}
POST /vinculacao/vincular
GET  /vinculacao/historico/{criancaId}
```

Além disso, o frontend espera que `validarCodigo` retorne dados da criança, enquanto o backend retorna apenas uma mensagem.

Essa parte precisa ser consolidada durante a migração.

---

## 7.2 GET altera estado

O atual:

```http
GET /vinculacao/validar/{codigo}
```

marca o token como usado.

GET não deveria causar mutação dessa natureza.

Novo desenho:

```http
GET /vinculos/tokens/{codigo}/preview
POST /vinculos/confirmar
```

Preview consulta.

Confirmar consome o token.

---

## 7.3 Criação da criança cria um usuário RESPONSAVEL artificial

Ao cadastrar uma criança, o backend cria um usuário responsável e define uma senha temporária fixa:

```text
senha-temporaria
```

Isso deve ser removido.

O cadastro clínico provisório não deve criar uma conta autenticável com senha conhecida.

Sugestão:

- criar `ResponsavelContato`/`ContatoResponsavelPendente`;
- ou permitir que a criança exista sem `usuario_responsavel_id`;
- quando o responsável criar sua conta, ele reivindica o vínculo usando token.

---

## 7.4 `responsavel_id` obrigatório conflita com o fluxo de negócio desejado

O schema atual obriga toda criança a possuir imediatamente um `User` responsável.

Mas o fluxo documentado prevê:

> profissional cadastra primeiro e responsável entra depois.

O modelo Java deve refletir o fluxo correto.

---

## 7.5 Formato de datas inconsistente

O frontend converte:

```text
YYYY-MM-DD
```

para:

```text
dd/mm/yyyy
```

antes de enviar.

O backend utiliza transformação para `Date`.

Isso é frágil e dependente do parser JavaScript.

Novo contrato:

```text
LocalDate -> YYYY-MM-DD
OffsetDateTime/Instant -> ISO-8601
```

Sem conversões manuais para `dd/mm/yyyy` na API.

---

## 7.6 Possível crash em listagem de crianças

Há acesso direto:

```text
crianca.prof_crianca[0]
```

sem garantir que exista relacionamento.

Deve ser corrigido.

---

## 7.7 Resumo de dashboard tem variável incoerente

Existe variável chamada como se fosse mensal, mas calculada com início da semana.

A refatoração deve separar:

- `metasEstaSemana`;
- `metasEsteMes`.

---

## 7.8 Sessões e timezone

O backend formata datas em string local antes de algumas operações.

Recomendação:

- persistir timestamps como UTC quando horário for relevante;
- usar `Instant`/`OffsetDateTime`;
- usar `LocalDate` para datas sem horário;
- formatar para pt-BR apenas na camada de apresentação.

---

## 7.9 AppModule contém módulos repetidos

`ConexoesModule` e `MetasModule` aparecem mais de uma vez.

É um sinal de dívida de manutenção.

---

## 7.10 Frontend contém rota duplicada

`/profissional/perfil/:id` aparece duplicada.

Deve ser eliminada.

---

# 8. Problemas de dados e modelagem

## 8.1 Email não possui unicidade coerente no banco

Há migrations removendo unicidade do email, mas o serviço de registro trata email como único.

Isso deixa uma janela para condição de corrida.

Recomendação:

- normalizar email em lowercase;
- índice único no banco para email não nulo;
- tratar violação de constraint;
- não depender apenas de consulta prévia.

---

## 8.2 Entidades possuem nomenclatura inconsistente

Exemplos:

- `Sessoes` no plural;
- `ProfissionalCriança` com caractere acentuado;
- snake_case e camelCase misturados;
- enums e strings concorrendo.

No Java:

- classes no singular;
- nomes sem acentos;
- tabelas em snake_case;
- mapeamento explícito.

---

## 8.3 `RedeSocialTipo` existe, mas campo usa `String`

Escolher uma abordagem única.

---

## 8.4 Consentimento é insuficiente como trilha jurídica

O atual consentimento registra:

- aceito;
- data;
- IP;
- user-agent.

Mas faltam campos importantes para uma trilha mais robusta:

- versão do termo;
- finalidade;
- origem;
- revogação;
- data de revogação;
- ator;
- documento/versão apresentada.

Validação jurídica profissional continua necessária.

---

## 8.5 Auditoria atual é limitada

O `AuditLog` cobre poucas ações.

Um sistema com dados sensíveis deve conseguir registrar, de maneira controlada:

- acesso a registro;
- alteração;
- criação;
- exclusão lógica;
- concessão/revogação de vínculo;
- alterações de permissão.

Nunca registrar senha, JWT ou dados sensíveis desnecessários no log.

---

# 9. Testes

A árvore analisada não contém suíte de testes funcional atual.

Esse é um dos maiores riscos da migração.

Não se deve apagar o NestJS e reescrever tudo de uma vez.

A migração deve criar uma rede de segurança com:

- JUnit 5;
- Mockito;
- MockMvc;
- Testcontainers PostgreSQL;
- testes de integração;
- testes de segurança;
- testes de contrato.

---

# 10. Arquitetura Java recomendada

```text
BackendJava/
├── pom.xml
├── Dockerfile
├── src/
│   ├── main/
│   │   ├── java/br/com/conectatea/
│   │   │   ├── ConectaTeaApplication.java
│   │   │   ├── config/
│   │   │   ├── security/
│   │   │   ├── shared/
│   │   │   ├── auth/
│   │   │   ├── usuario/
│   │   │   ├── profissional/
│   │   │   ├── crianca/
│   │   │   ├── vinculo/
│   │   │   ├── meta/
│   │   │   ├── progresso/
│   │   │   ├── sessao/
│   │   │   ├── conexao/
│   │   │   ├── dashboard/
│   │   │   └── auditoria/
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-test.yml
│   │       └── db/migration/
│   └── test/
```

---

# 11. Organização interna de cada módulo

Exemplo:

```text
meta/
├── api/
│   ├── MetaController.java
│   ├── request/
│   └── response/
├── application/
│   └── MetaService.java
├── domain/
│   ├── Meta.java
│   ├── StatusMeta.java
│   └── ...
└── infrastructure/
    └── MetaRepository.java
```

Não é necessário implementar Clean Architecture completa.

A meta é:

- separar HTTP;
- separar regra de negócio;
- separar persistência;
- impedir controllers gigantes;
- impedir entidades JPA vazarem diretamente para API.

---

# 12. Equivalência de tecnologias

| Node/NestJS atual | Java recomendado |
|---|---|
| NestJS | Spring Boot |
| Prisma | Spring Data JPA/Hibernate |
| class-validator | Jakarta Bean Validation |
| Passport JWT | Spring Security |
| bcrypt | BCryptPasswordEncoder |
| SwaggerModule | springdoc-openapi |
| date-fns | java.time |
| QRCode | ZXing |
| Jest | JUnit 5 |
| mocks Jest | Mockito |
| Prisma migrations | Flyway |
| ConfigModule | Spring Configuration Properties |
| Guards | Security + authorization services/interceptors |

---

# 13. Estratégia para o banco

Não destruir automaticamente o banco existente.

## Fase 1

Documentar o schema Prisma final.

## Fase 2

Criar modelo relacional alvo em snake_case.

## Fase 3

Criar migrations Flyway.

## Fase 4

Criar script de migração/importação caso exista dado que precise ser preservado.

## Fase 5

Validar contagem e integridade.

---

# 14. Modelo de vínculo recomendado

Em vez de obrigar a criança a possuir imediatamente um usuário responsável:

```text
Crianca
  |
  +-- ContatoResponsavelPendente (opcional)
  |
  +-- VinculoResponsavel (0..N)
  |
  +-- VinculoProfissional (0..N)
```

Isso permite:

- cadastro clínico antes da conta familiar;
- mais de um responsável;
- troca de responsável autorizado;
- histórico de vínculo;
- revogação;
- portabilidade de histórico.

---

# 15. Autenticação recomendada

Para a primeira versão Java:

- cookie `HttpOnly`;
- `Secure` em produção;
- `SameSite=Lax` ou `Strict` conforme arquitetura;
- CSRF analisado corretamente;
- JWT curto ou sessão segura;
- nenhuma senha/token em localStorage;
- sem fallback de segredo;
- BCrypt;
- rate limiting no login;
- mensagens de erro que não vazem informação desnecessária.

O frontend deve usar **uma única estratégia de autenticação**.

Hoje existem dois clientes Axios e lógica híbrida de cookie + localStorage.

Isso deve ser unificado.

---

# 16. Autorização recomendada

Não utilizar apenas roles.

Exemplo:

```text
PROFISSIONAL
  AND
está vinculado à criança
```

para:

- metas;
- progresso;
- sessões;
- dados da criança;
- dashboard;
- histórico.

Para responsável:

```text
RESPONSAVEL
  AND
possui vínculo ativo com a criança
```

---

# 17. Rotas legadas

`/private/*` deve ser considerada rota de compatibilidade temporária.

Plano:

1. mapear quem ainda utiliza;
2. atualizar frontend;
3. marcar deprecated;
4. remover quando não houver consumidor.

---

# 18. Frontend

A migração deve manter o React.

Não há motivo técnico para reescrever frontend em Java.

Mudanças frontend necessárias:

- unificar `apiClient.ts` e `httpClient.ts`;
- remover Bearer/localStorage se cookie for padrão;
- corrigir vinculação;
- corrigir formatos de datas;
- corrigir rotas duplicadas;
- ajustar DTOs para contrato Java;
- manter componentes visuais sempre que possível.

---

# 19. Ordem recomendada de implementação Java

1. infraestrutura do projeto;
2. configuração;
3. banco e Flyway;
4. autenticação;
5. autorização;
6. usuários;
7. profissionais;
8. crianças;
9. vínculo;
10. metas;
11. progresso;
12. sessões;
13. dashboard;
14. conexões profissionais;
15. auditoria;
16. compatibilidade frontend;
17. testes de contrato;
18. Docker;
19. CI;
20. remoção gradual do NestJS.

---

# 20. Estratégia de migração segura

Não substituir `Backend/` imediatamente.

Criar:

```text
BackendJava/
```

Manter temporariamente:

```text
Backend/
```

Fluxo:

```text
NestJS atual
      |
      | referência comportamental
      v
BackendJava
      |
      | testes + contrato
      v
Frontend React
```

Só quando houver paridade:

- marcar NestJS como legado;
- desligar;
- opcionalmente remover em PR posterior.

---

# 21. Definition of Done da migração

A refatoração só está completa quando:

- Java compila;
- testes passam;
- frontend compila;
- login funciona;
- logout funciona;
- cadastro funciona;
- roles funcionam;
- profissional só vê crianças autorizadas;
- responsável só vê crianças autorizadas;
- metas respeitam vínculo;
- sessões respeitam vínculo;
- token não pode ser reutilizado;
- token expirado falha;
- vinculação registra consentimento;
- dashboards funcionam;
- Swagger/OpenAPI funciona;
- Docker funciona;
- PostgreSQL funciona;
- não há segredos versionados;
- nenhum endpoint crítico depende de ID fornecido pelo cliente quando a identidade autenticada já resolve o ator;
- documentação foi atualizada.

---

# 22. Conclusão

A transformação do ConectaTEA para Java pode melhorar bastante o projeto se for tratada como **migração arquitetural**, e não como tradução automática.

O maior ganho não será simplesmente:

> “agora o backend está em Java”.

O maior ganho será:

> “agora o ConectaTEA tem um backend modular, testável, seguro, com contratos claros e regras de acesso compatíveis com um sistema que manipula dados sensíveis.”

O arquivo `PROMPT_MESTRE_CODEX_CONECTATEA_NODE_PARA_JAVA.md` acompanha esta análise e contém instruções operacionais para o Codex executar a migração.
