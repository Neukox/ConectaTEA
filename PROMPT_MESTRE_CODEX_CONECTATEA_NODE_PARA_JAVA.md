# PROMPT MESTRE — CODEX — REFATORAÇÃO COMPLETA DO CONECTATEA DE NESTJS/NODE PARA JAVA/SPRING BOOT

## 0. PAPEL

Você é o engenheiro principal responsável por migrar o backend do projeto **ConectaTEA** de:

- Node.js;
- TypeScript;
- NestJS;
- Prisma;

para:

- **Java 21 LTS**;
- **Spring Boot 3.5.x** usando o patch estável compatível disponível no momento da execução;
- Maven;
- Spring Web;
- Spring Security;
- Spring Data JPA/Hibernate;
- PostgreSQL;
- Flyway;
- Jakarta Bean Validation;
- springdoc-openapi;
- JUnit 5;
- Mockito;
- Testcontainers;
- ZXing quando QR Code for necessário.

O frontend React/TypeScript deve continuar existindo.

Você não deve fazer uma tradução mecânica TypeScript → Java.

Você deve executar uma **migração funcional + arquitetural**, preservando comportamento legítimo e corrigindo problemas comprovados de segurança, contrato, modelagem e autorização.

---

# 1. REPOSITÓRIO

Repositório:

```text
https://github.com/Neukox/ConectaTEA
```

Branch principal:

```text
main
```

Antes de alterar qualquer arquivo:

1. confirme a branch atual;
2. confirme que o working tree está limpo ou registre as alterações existentes;
3. nunca descarte alterações não criadas por você;
4. crie uma branch específica, preferencialmente:

```text
refactor/backend-java
```

Caso a branch já exista, utilize-a sem sobrescrever trabalho.

---


# 1.1. PONTO DE RESTAURAÇÃO OBRIGATÓRIO E BRANCH DE TRABALHO

ANTES DE QUALQUER ALTERAÇÃO DE CÓDIGO, você deve criar um ponto de restauração Git e uma branch exclusiva de trabalho.

A sequência obrigatória é:

1. verificar a branch atual;
2. garantir que o working tree não contenha alterações não compreendidas;
3. sincronizar a `main` apenas com operação segura `--ff-only`, se houver remoto acessível;
4. registrar o SHA-base com `git rev-parse HEAD`;
5. criar uma branch de backup/restauração apontando exatamente para esse SHA;
6. criar uma branch de trabalho apontando para o mesmo SHA;
7. realizar toda a refatoração somente na branch de trabalho.

Formato recomendado:

```text
backup/pre-refactor-java-YYYYMMDD-HHMM
refactor/backend-java
```

Exemplo conceitual:

```bash
git switch main
git pull --ff-only
BASE_SHA=$(git rev-parse HEAD)

git branch backup/pre-refactor-java-20261001-1336 "$BASE_SHA"
git switch -c refactor/backend-java "$BASE_SHA"
```

Se uma das branches já existir:

- NÃO sobrescrever;
- NÃO deletar automaticamente;
- verificar se aponta para o SHA-base correto;
- se não apontar, criar um novo nome com timestamp ou sufixo.

Durante TODA a refatoração:

```text
branch permitida para commits:
refactor/backend-java
```

ou o nome equivalente criado por você.

É PROIBIDO:

- commitar diretamente em `main`;
- fazer `force push` em `main`;
- fazer `reset --hard` na `main`;
- deletar a branch de backup/restauração;
- reescrever o histórico da `main`;
- fazer merge na `main` sem validação final e aprovação humana.

Crie imediatamente:

```text
docs/refatoracao-java/BASELINE.md
```

Com:

```text
branch de origem
SHA-base
data/hora
branch de restauração
branch de trabalho
estado do working tree
remote principal
comandos executados
```

Esse arquivo é parte obrigatória da documentação da migração.

Se ocorrer problema crítico, a restauração deve ser possível com:

```text
backup/pre-refactor-java-...
```

ou com o SHA-base registrado.


# 2. REGRA PRINCIPAL

NÃO delete o backend NestJS no começo.

NÃO trabalhe na `main`. Toda alteração da migração deve acontecer exclusivamente na branch de trabalho criada na etapa de baseline.

Crie inicialmente:

```text
BackendJava/
```

Mantenha:

```text
Backend/
Frontend/
```

O backend NestJS é a referência para entender o comportamento atual.

Somente proponha a remoção do NestJS depois que:

- Java compilar;
- testes Java passarem;
- frontend compilar;
- contratos principais estiverem funcionando;
- autenticação estiver funcionando;
- autorização estiver funcionando;
- fluxos essenciais estiverem validados.

A remoção do backend Node deve ser uma etapa separada e claramente documentada.

---

# 3. PRIMEIRA ETAPA OBRIGATÓRIA — AUDITORIA

Antes de implementar Java, leia completamente:

```text
README.md
CLAUDE.md
.github/copilot-instructions.md
.github/instructions/BACKEND.instructions.md
.github/instructions/FRONTEND.instructions.md
docker-compose.yml

Backend/package.json
Backend/tsconfig.json
Backend/src/**
Backend/prisma/schema.prisma
Backend/prisma/migrations/**

Frontend/package.json
Frontend/src/api/**
Frontend/src/services/**
Frontend/src/features/**/services/**
Frontend/src/features/**/types/**
Frontend/src/features/**/schemas/**
Frontend/src/contexts/**
Frontend/src/components/ProtectedRoute.tsx
Frontend/src/components/RoleGuard.tsx
Frontend/src/routes/routes.tsx

docs/**
```

Também inspecione a árvore completa do repositório.

Não assuma que README, CLAUDE.md ou instruções estão 100% sincronizados com o código.

Quando documentação e código divergirem:

1. identifique a divergência;
2. use o código executável e o contrato consumido pelo frontend como evidência;
3. registre a decisão.

---

# 4. ENTREGÁVEIS DE AUDITORIA

Antes da primeira alteração estrutural, crie:

```text
docs/refatoracao-java/
```

e os arquivos:

```text
00_INVENTARIO_REPOSITORIO.md
01_ARQUITETURA_ATUAL.md
02_API_CONTRACT_ATUAL.md
03_MODELO_DADOS_ATUAL.md
04_PROBLEMAS_E_RISCOS.md
05_ARQUITETURA_JAVA_ALVO.md
06_PLANO_DE_MIGRACAO.md
07_DECISOES_ARQUITETURAIS.md
08_MATRIZ_PARIDADE.md
09_PLANO_DE_TESTES.md
10_SECURITY_REVIEW.md
BASELINE.md
```

Nunca pule essa etapa.

---

# 5. PROBLEMAS JÁ IDENTIFICADOS — CONFIRME NO CÓDIGO

Você deve confirmar cada item abaixo.

Não copie o problema para Java.

## 5.1 `.history`

Existe diretório `.history` contendo snapshots antigos, inclusive arquivos `.env`.

Ações:

- verificar se está versionado;
- remover `.history` da árvore atual;
- adicionar `.history/` ao `.gitignore`;
- não exibir valores de segredo em logs, documentação, resposta ou commit;
- produzir recomendação de rotação de credenciais;
- NÃO reescrever o histórico Git automaticamente;
- uma eventual reescrita histórica exige decisão humana explícita.

---

## 5.2 JWT secret default

Existe fallback de segredo JWT.

Em Java:

- `JWT_SECRET` obrigatório;
- ausência deve impedir startup em perfil não-test;
- nunca existir segredo padrão de produção.

---

## 5.3 IDOR em usuários

Audite:

```text
GET /users
GET /users/{id}
PUT /users/{id}
DELETE /users/{id}
```

O usuário comum não pode manipular arbitrariamente outro usuário apenas conhecendo ID.

Crie endpoints baseados no usuário autenticado, como:

```text
GET /api/users/me
PUT /api/users/me
```

Endpoints administrativos só devem existir se houver role administrativa real.

Não invente ADMIN sem necessidade funcional documentada.

---

## 5.4 IDOR em crianças

O backend atual possui operações globais de criança.

No Java:

profissional só pode consultar criança se:

```text
vinculo profissional-crianca válido
```

responsável só pode consultar criança se:

```text
vinculo responsavel-crianca válido
```

Aplicar isso a:

- detalhes;
- listagem;
- edição;
- exclusão;
- metas;
- progresso;
- sessões;
- dashboard;
- token;
- histórico.

---

## 5.5 Perfil profissional

Não permitir que um profissional altere perfil de outro apenas enviando `usuarioId`.

Preferir:

```text
GET /api/profissionais/me
PUT /api/profissionais/me
```

Rotas por ID podem existir para leitura pública/autorizada, mas edição deve usar identidade autenticada.

---

## 5.6 MetasGuard

O backend atual possui risco de interpretação incorreta da metadata de roles no `MetasGuard`.

Não portar o guard.

Reconstruir a autorização em Java.

---

## 5.7 SessoesGuard

Existe chamada potencialmente invertida entre `criancaId` e `profissionalId`.

Não portar o bug.

---

## 5.8 Senha temporária

O cadastro de criança não pode criar uma conta responsável autenticável usando senha fixa.

Remover completamente essa estratégia.

---

# 6. OBJETIVO FUNCIONAL DO CONECTATEA

O núcleo do sistema é:

> conectar família e profissionais em torno do acompanhamento da criança com TEA.

O MVP técnico atual envolve:

- usuários;
- profissionais;
- responsáveis;
- crianças;
- vínculos;
- consentimento;
- sessões;
- metas;
- progresso;
- dashboards;
- conexões profissionais.

Rede social ampla, marketplace e IA clínica não fazem parte desta migração a menos que já existam como código funcional necessário ao frontend.

Não invente funcionalidades novas.

---

# 7. ARQUITETURA-ALVO

Criar:

```text
BackendJava/
├── pom.xml
├── Dockerfile
├── .env.example
├── README.md
└── src/
    ├── main/
    │   ├── java/br/com/conectatea/
    │   │   ├── ConectaTeaApplication.java
    │   │   ├── config/
    │   │   ├── security/
    │   │   ├── shared/
    │   │   ├── auth/
    │   │   ├── usuario/
    │   │   ├── profissional/
    │   │   ├── crianca/
    │   │   ├── vinculo/
    │   │   ├── meta/
    │   │   ├── progresso/
    │   │   ├── sessao/
    │   │   ├── conexao/
    │   │   ├── dashboard/
    │   │   └── auditoria/
    │   └── resources/
    │       ├── application.yml
    │       ├── application-dev.yml
    │       ├── application-test.yml
    │       └── db/migration/
    └── test/
```

Use monólito modular.

Não criar microserviços.

---

# 8. PADRÃO INTERNO

Dentro de cada módulo, separar pelo menos:

```text
api/
application/
domain/
infrastructure/
```

Exemplo:

```text
crianca/
├── api/
│   ├── CriancaController.java
│   ├── request/
│   └── response/
├── application/
│   └── CriancaService.java
├── domain/
│   ├── Crianca.java
│   └── ...
└── infrastructure/
    └── CriancaRepository.java
```

Não exagerar com abstrações.

Evitar interfaces vazias criadas apenas por “arquitetura”.

---

# 9. POM.XML

Incluir apenas dependências justificadas:

- spring-boot-starter-web;
- spring-boot-starter-security;
- spring-boot-starter-validation;
- spring-boot-starter-data-jpa;
- PostgreSQL driver;
- Flyway;
- springdoc-openapi;
- JWT library madura ou mecanismo Spring Security apropriado;
- ZXing;
- spring-boot-starter-test;
- spring-security-test;
- Testcontainers PostgreSQL.

Se utilizar Lombok, justifique.

Preferência: minimizar dependência de Lombok em entidades críticas.

---

# 10. CONFIGURAÇÃO

Utilizar configuração externa.

Exemplo de variáveis:

```text
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
JWT_SECRET
JWT_EXPIRATION
FRONTEND_ORIGINS
COOKIE_SECURE
```

Não commit:

- `.env`;
- segredo;
- token;
- password;
- chave privada.

Criar `.env.example` apenas com nomes e valores fictícios.

---

# 11. BANCO DE DADOS

Banco continua PostgreSQL.

Prisma deve ser substituído por:

```text
Spring Data JPA + Hibernate
```

Migrations:

```text
Flyway
```

Antes de criar migrations Java:

1. leia `schema.prisma`;
2. leia todas as migrations Prisma em ordem;
3. determine o estado final real;
4. documente divergências.

---

# 12. NOMENCLATURA DO BANCO NOVO

Preferir:

```text
usuarios
profissionais
criancas
vinculos_profissionais_criancas
vinculos_responsaveis_criancas
sessoes
metas
progressos
conexoes_profissionais
tokens_vinculo
consentimentos
historico_vinculos
audit_logs
locais_atendimento
redes_sociais
areas_atuacao
profissionais_areas_atuacao
```

Classes Java:

```text
Usuario
Profissional
Crianca
VinculoProfissionalCrianca
VinculoResponsavelCrianca
Sessao
Meta
Progresso
...
```

Não utilizar acentos em nomes de classes/tabelas.

---

# 13. MIGRAÇÃO DE DADOS

Não executar DROP destrutivo por padrão.

Se houver banco existente:

- criar plano;
- fazer backup;
- migrar em transação quando possível;
- validar contagens;
- validar FKs;
- validar relações;
- registrar rollback.

Se não houver necessidade de preservar dados de desenvolvimento, ainda assim documentar isso antes de recriar o schema.

---

# 14. MODELO DE RESPONSÁVEL — CORREÇÃO ESTRUTURAL

Não manter a regra:

```text
Crianca.responsavel_id obrigatório no momento da criação
```

A criança deve poder nascer como registro clínico provisório.

Sugestão:

```text
Crianca
VinculoResponsavelCrianca
ContatoResponsavelPendente
```

ou solução equivalente.

Requisitos:

- profissional cadastra criança;
- contato familiar pode existir sem conta;
- token seguro é gerado;
- responsável cria sua própria conta;
- token faz a associação;
- consentimento é confirmado;
- vínculo fica ativo;
- histórico é mantido.

Jamais criar senha fixa para conta pendente.

---

# 15. MÚLTIPLOS RESPONSÁVEIS

O novo modelo não deve bloquear arquiteturalmente a possibilidade de:

```text
1 criança → N responsáveis
```

Mesmo que a UI inicial trabalhe com apenas um responsável principal.

O relacionamento deve ser extensível.

---

# 16. PROFISSIONAL ↔ CRIANÇA

Criar entidade explícita.

Campos recomendados:

```text
id
profissional_id
crianca_id
status
data_vinculo
data_desvinculo
motivo_desvinculo
created_at
updated_at
```

Criar unique constraint adequada para vínculo ativo/registro conforme estratégia escolhida.

---

# 17. USUÁRIO

Campos mínimos:

```text
id
nome
email
password_hash
telefone
endereco
tipo
created_at
updated_at
```

Email:

- lowercase;
- trim;
- unique quando não nulo;
- validar em DB e aplicação.

Nunca retornar `password_hash`.

---

# 18. AUTENTICAÇÃO

Manter comportamento de login por email + senha.

Preferência:

- cookie HttpOnly;
- Secure em produção;
- configuração SameSite;
- nenhuma dependência obrigatória de localStorage.

Endpoints mínimos:

```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Se o JWT estiver em cookie, revisar CSRF corretamente.

Não simplesmente desabilitar CSRF sem documentar a razão.

---

# 19. SENHAS

Usar:

```text
BCryptPasswordEncoder
```

Regras:

- nunca logar senha;
- nunca retornar hash;
- não permitir senha padrão;
- não armazenar password em DTO de resposta.

---

# 20. RATE LIMIT

Adicionar proteção contra brute force no login.

Pode ser Bucket4j ou solução equivalente.

Não transformar isso em infraestrutura complexa.

---

# 21. AUTORIZAÇÃO

Criar serviço central, por exemplo:

```text
AuthorizationService
```

Métodos possíveis:

```java
canAccessCrianca(userId, criancaId)
isProfissionalLinkedToCrianca(profissionalId, criancaId)
isResponsavelLinkedToCrianca(responsavelId, criancaId)
canModifyMeta(userId, metaId)
canModifySessao(userId, sessaoId)
```

Não espalhar regras divergentes em controllers.

---

# 22. DTOs

Não expor entidades JPA diretamente.

Criar:

```text
request DTO
response DTO
```

Bean Validation:

- `@NotBlank`;
- `@Email`;
- `@Size`;
- `@Min`;
- `@Max`;
- `@Past`;
- `@PastOrPresent`;
- `@FutureOrPresent`;
- validações customizadas apenas quando realmente necessárias.

---

# 23. EXCEÇÕES

Criar tratamento global com:

```text
@RestControllerAdvice
```

Resposta consistente:

```json
{
  "timestamp": "...",
  "status": 400,
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "message": "...",
  "path": "/api/..."
}
```

Nunca retornar stack trace em produção.

---

# 24. DATAS

API:

```text
LocalDate = YYYY-MM-DD
Instant / OffsetDateTime = ISO-8601
```

Nunca usar `dd/mm/yyyy` como formato de transporte da API.

Frontend pode exibir pt-BR.

Backend não deve depender de parsing ambíguo.

---

# 25. TIMEZONE

Definir política explícita.

Sugestão:

- persistir eventos com hora em UTC;
- converter na UI;
- usar `LocalDate` quando hora/fuso não fizer sentido.

Não hardcodar `America/Sao_Paulo` em regra de domínio sem justificativa.

---

# 26. AUTENTICAÇÃO DO FRONTEND

Atualmente existem:

```text
apiClient.ts
httpClient.ts
```

e lógica híbrida:

- cookie;
- localStorage;
- Bearer Token.

Durante a migração:

1. escolher cookie HttpOnly como padrão;
2. unificar o cliente Axios;
3. remover dependência de token em localStorage;
4. manter `withCredentials: true`;
5. tratar 401 centralmente.

---

# 27. CADASTRO

Manter:

```http
POST /api/users/register
```

ou migrar para:

```http
POST /api/auth/register
```

Escolha um contrato canônico e atualize o frontend.

Se alterar rota, manter compatibilidade temporária ou atualizar todos os consumidores no mesmo PR.

---

# 28. CRIANÇAS

Implementar:

```http
POST /api/criancas
GET  /api/criancas
GET  /api/criancas/{id}
PUT  /api/criancas/{id}
```

DELETE exige decisão de negócio.

Para dados de saúde, considere:

- soft delete;
- status arquivado;

em vez de exclusão física imediata.

Se mudar o comportamento, documentar.

---

# 29. CRIAÇÃO DE CRIANÇA

Profissional autenticado.

O ID do profissional deve vir do principal autenticado.

Nunca do request body.

Fluxo:

1. validar profissional;
2. criar criança;
3. criar vínculo profissional-criança;
4. criar contato pendente do responsável se fornecido;
5. criar token;
6. criar evento de histórico;
7. retornar criança + token/QR conforme necessário.

Tudo transacional.

---

# 30. TOKENS DE VÍNCULO

Requisitos:

- criptograficamente aleatório;
- único;
- expiração;
- single-use;
- status;
- uso atômico;
- proteção contra replay.

Estados possíveis:

```text
PENDENTE
USADO
EXPIRADO
CANCELADO
```

Não utilizar GET para consumir token.

---

# 31. NOVO FLUXO DE VÍNCULO

Sugestão de contrato canônico:

```http
GET  /api/vinculos/tokens/{codigo}/preview
POST /api/vinculos/confirmar
GET  /api/vinculos/me
DELETE /api/vinculos/criancas/{criancaId}
GET  /api/vinculos/criancas/{criancaId}/historico
```

`preview`:

- não altera estado;
- não retorna dados excessivos;
- informa apenas o necessário.

`confirmar`:

- usuário responsável vem do JWT;
- não aceitar `responsavelId` arbitrário no body;
- token determina criança e profissional;
- consentimento deve ser explícito;
- operação transacional;
- token é consumido atomicamente.

---

# 32. CONSENTIMENTO

Registrar pelo menos:

```text
id
responsavel_id
crianca_id
profissional_id
aceito
termo_versao
finalidade
data_aceite
data_revogacao
ip
user_agent
created_at
```

Não afirmar conformidade jurídica automática.

Adicionar comentário/documentação:

> revisão jurídica necessária antes de produção com dados reais.

---

# 33. METAS

Preservar categorias:

```text
COMUNICACAO
SOCIAL
COGNITIVA
COMPORTAMENTAL
AUTONOMIA
MOTORA
```

Prioridades:

```text
BAIXA
MEDIA
ALTA
```

Status:

```text
EM_ANDAMENTO
VENCENDO
QUASE_CONCLUIDA
CONCLUIDA
```

Endpoints equivalentes.

---

# 34. PROGRESSO

Atualização de progresso deve ser transacional:

1. carregar meta;
2. autorizar usuário;
3. validar 0–100;
4. obter progresso anterior;
5. calcular status;
6. atualizar meta;
7. inserir histórico de progresso.

Não perder histórico.

---

# 35. ATENÇÃO À REGRA DE 90%

O código atual define:

```text
>=90 e <100 -> QUASE_CONCLUIDA
100 -> CONCLUIDA
```

e:

```text
<=7 dias para data final e <90 -> VENCENDO
```

Preservar inicialmente como regra de paridade.

Mas registrar em ADR que essa regra precisa ser validada com domínio clínico.

---

# 36. SESSÕES

Preservar:

Tipos:

```text
TERAPIA_INDIVIDUAL
TERAPIA_OCUPACIONAL
FONOAUDIOLOGIA
AVALIACAO
```

Status:

```text
AGENDADA
CONCLUIDA
EM_ANDAMENTO
PENDENTE
CANCELADA
```

Garantir vínculo antes de:

- criar;
- editar;
- alterar status;
- remover;
- visualizar.

---

# 37. DASHBOARD

Implementar consultas agregadas.

Evitar fazer:

```text
carregar tudo -> filtrar tudo em memória
```

quando SQL pode calcular.

Revisar nomenclatura:

- semana;
- mês;
- semestre;
- ano.

Testar datas.

---

# 38. CONEXÕES ENTRE PROFISSIONAIS

Preservar enquanto funcionalidade atual.

Estados:

```text
PENDENTE
ACEITO
RECUSADO
```

Regras:

- não conectar a si mesmo;
- impedir duplicidade indevida;
- só destinatário responde;
- só participantes removem;
- filtros não podem vazar dados de terceiros.

---

# 39. PERFIL PROFISSIONAL

Manter:

- especialidade;
- registro;
- título;
- formação;
- sobre;
- foto;
- código;
- locais;
- redes;
- áreas.

Atualização de coleções deve ser transacional.

Não utilizar `any` equivalente.

---

# 40. LEGACY `/private`

Mapear todos os consumidores frontend.

Se não houver necessidade:

1. migrar frontend;
2. marcar deprecated;
3. remover em etapa posterior.

Não manter rota duplicada sem motivo.

---

# 41. SWAGGER

Usar springdoc-openapi.

Swagger:

```text
/api/docs
```

ou equivalente documentado.

Documentar:

- autenticação;
- requests;
- responses;
- erros;
- enums.

---

# 42. LOGGING

Usar SLF4J.

Não usar:

```text
System.out.println
```

em produção.

Nunca logar:

- senha;
- JWT;
- segredo;
- diagnóstico completo sem necessidade;
- dados pessoais sensíveis.

---

# 43. AUDITORIA

Criar eventos de auditoria para ações relevantes.

Não misturar audit log com log operacional.

Possíveis eventos:

```text
LOGIN_SUCESSO
LOGIN_FALHA
VINCULO_CRIADO
VINCULO_REVOGADO
META_CRIADA
META_ATUALIZADA
SESSAO_CRIADA
REGISTRO_ACESSADO
```

Evitar registrar payload sensível inteiro.

---

# 44. TRANSAÇÕES

Usar `@Transactional` em casos compostos:

- cadastro profissional + perfil;
- criação criança + vínculo + token;
- confirmação de vínculo;
- progresso;
- remoções lógicas;
- atualização de coleções.

Não colocar transação em toda consulta simples.

---

# 45. REPOSITÓRIOS

Preferir:

```java
JpaRepository<Entity, Long>
```

Usar queries explícitas quando necessário.

Evitar N+1.

Utilizar:

- projections;
- `@EntityGraph`;
- queries JPQL;
- queries nativas somente quando justificadas.

---

# 46. IDS

O backend atual usa `Int`.

No Java, preferir `Long` para novos IDs.

Se isso causar incompatibilidade ou migração desnecessária no banco existente, documentar e preservar Integer temporariamente.

Não mudar sem analisar impacto.

---

# 47. OPEN SESSION IN VIEW

Definir:

```yaml
spring:
  jpa:
    open-in-view: false
```

Controllers não devem depender de lazy-loading.

---

# 48. FLYWAY

Flyway deve ser a única fonte de evolução de schema no Java.

Não usar:

```text
ddl-auto=create
ddl-auto=update
```

em produção.

Produção:

```text
ddl-auto=validate
```

Testes podem usar configuração específica.

---

# 49. TESTES — REGRA OBRIGATÓRIA

Não migrar feature sem testes correspondentes.

Criar:

```text
unit
integration
security
contract
```

---

# 50. TESTES DE AUTENTICAÇÃO

Cobrir:

- login correto;
- senha errada;
- email inexistente;
- cookie criado;
- token expirado;
- logout;
- `/auth/me`;
- ausência de credencial;
- segredo obrigatório.

---

# 51. TESTES DE AUTORIZAÇÃO

Criar testes negativos.

Exemplos:

```text
Profissional A não acessa criança de B.
Responsável A não acessa criança de B.
Profissional sem vínculo não altera meta.
Profissional sem vínculo não altera sessão.
Responsável não usa endpoint exclusivo de profissional.
```

Esses testes são obrigatórios.

---

# 52. TESTES DE VÍNCULO

Cobrir:

- token válido;
- token inválido;
- expirado;
- usado;
- cancelado;
- concorrência de duas confirmações;
- usuário errado;
- consentimento false;
- histórico criado;
- vínculo criado;
- token consumido uma única vez.

---

# 53. TESTES DE META

Cobrir:

- criação;
- edição;
- filtro;
- autorização;
- progresso;
- 0%;
- 89%;
- 90%;
- 99%;
- 100%;
- vencendo;
- histórico de progresso.

---

# 54. TESTES DE SESSÃO

Cobrir:

- criar;
- editar;
- status;
- filtros;
- vínculo;
- datas;
- duração;
- autorização.

---

# 55. TESTCONTAINERS

Utilizar PostgreSQL real em testes de integração.

Não confiar exclusivamente em H2 porque comportamento PostgreSQL pode divergir.

---

# 56. TESTES DO FRONTEND

Não é obrigatório reescrever toda UI.

Mas os services alterados devem ser validados.

Se já houver framework de teste, usar.

Se não houver, adicionar somente se justificável e de modo pequeno.

No mínimo:

```text
npm run build
npm run lint
```

devem passar.

---

# 57. CONTRACT TEST

Criar documentação/matriz:

```text
endpoint antigo
consumidor frontend
endpoint novo
payload antigo
payload novo
compatível?
```

Arquivo:

```text
docs/refatoracao-java/08_MATRIZ_PARIDADE.md
```

Nenhuma rota usada pelo frontend pode simplesmente desaparecer.

---

# 58. ORDEM DE IMPLEMENTAÇÃO

Executar em PR/commits pequenos.

## Fase A

```text
chore(java): bootstrap Spring Boot backend
```

## Fase B

```text
feat(java-db): add JPA model and Flyway
```

## Fase C

```text
feat(java-auth): migrate authentication
```

## Fase D

```text
feat(java-security): implement relationship authorization
```

## Fase E

```text
feat(java-users): migrate user and professional modules
```

## Fase F

```text
feat(java-children): migrate children and links
```

## Fase G

```text
feat(java-goals): migrate metas and progress
```

## Fase H

```text
feat(java-sessions): migrate sessions
```

## Fase I

```text
feat(java-dashboard): migrate dashboard
```

## Fase J

```text
feat(java-connections): migrate professional connections
```

## Fase K

```text
refactor(frontend): align API contracts
```

## Fase L

```text
test(java): complete integration and security tests
```

## Fase M

```text
docs(java): finalize migration documentation
```

Não é obrigatório usar exatamente essas mensagens, mas manter commits semanticamente pequenos.

---

# 59. FRONTEND — NÃO QUEBRAR DESIGN

Ao modificar frontend:

NÃO refazer layout sem necessidade.

Alterar apenas:

- contratos;
- clients;
- services;
- types;
- autenticação;
- rota quebrada;
- bugs diretamente ligados à migração.

Preservar CSS e design.

---

# 60. DUPLICAÇÕES A CORRIGIR

Confirmar e corrigir:

- rota duplicada `/profissional/perfil/:id`;
- dois clientes Axios concorrentes;
- módulo Nest duplicado na configuração;
- rotas legacy redundantes;
- tipos repetidos;
- lógica de autenticação duplicada.

---

# 61. DATA CONTRACT

Crie DTOs consistentes.

Exemplo para criança:

```json
{
  "id": 1,
  "nome": "Nome",
  "dataNascimento": "2018-05-15",
  "idade": 8,
  "genero": "Masculino",
  "diagnostico": "...",
  "observacoes": "...",
  "statusVinculoResponsavel": "VINCULADO",
  "statusVinculoProfissional": "VINCULADO"
}
```

Escolher camelCase na API.

Não misturar:

```text
crianca_id
criancaId
data_nascimento
dataNascimento
```

A persistência pode usar snake_case.

API deve ser consistente.

---

# 62. COMPATIBILIDADE

Quando mudar snake_case → camelCase na API:

- atualizar todos os consumidores;
- ou criar aliases temporários;
- documentar.

Não quebrar silenciosamente.

---

# 63. PAGINAÇÃO

Listagens potencialmente grandes devem estar preparadas para paginação.

Não precisa obrigatoriamente alterar a UI agora.

Mas novos repositórios/services não devem impedir futura paginação.

---

# 64. SOFT DELETE

Avaliar soft delete para:

- criança;
- usuário;
- registros clínicos.

Não implementar automaticamente se o comportamento legal não estiver definido.

Documentar decisão em ADR.

Evitar hard delete irreversível sem decisão explícita.

---

# 65. HEALTH DATA

O sistema manipula dados potencialmente sensíveis.

Aplicar:

- least privilege;
- minimização;
- logs limitados;
- HTTPS em produção;
- configuração segura;
- auditoria;
- segregação de acesso.

Não declarar “LGPD compliant” apenas porque controles foram adicionados.

---

# 66. CORS

Remover lista local hardcoded do código.

Configurar via ambiente.

Dev:

```text
http://localhost:5173
```

Produção:

origens explicitamente permitidas.

Nunca usar:

```text
*
```

com credentials.

---

# 67. COOKIE

Produção:

```text
HttpOnly=true
Secure=true
```

SameSite de acordo com topologia frontend/backend.

Path apropriado.

MaxAge configurável.

---

# 68. CSRF

Como autenticação usa cookie, CSRF deve ser tratado conscientemente.

Opções:

- SameSite + CSRF token;
- Spring Security CSRF com cookie/token apropriado.

Documentar a escolha.

---

# 69. QR CODE

Não é necessário armazenar base64 no banco se puder ser regenerado pelo código.

Preferência:

- armazenar token;
- gerar QR sob demanda;
- ou armazenar arquivo privado.

Documentar a decisão.

---

# 70. OBSERVABILIDADE

Adicionar:

- Spring Boot Actuator;
- health;
- readiness;
- logs estruturados.

Não expor endpoints sensíveis do Actuator publicamente.

---

# 71. DOCKER

Criar Dockerfile multi-stage.

Exemplo lógico:

```text
maven build
↓
JRE runtime
```

Não executar aplicação como root se fácil evitar.

---

# 72. DOCKER COMPOSE

Atualizar `docker-compose.yml` para permitir:

```text
postgres
backend-java
frontend
```

Durante transição, backend Nest pode continuar como perfil opcional.

Não expor senha real.

---

# 73. CI

Criar GitHub Actions se ainda não existir.

Pipeline mínimo:

```text
backend-java:
  mvn test
  mvn verify

frontend:
  npm ci
  npm run lint
  npm run build
```

Nunca colocar segredo diretamente no YAML.

---

# 74. QUALITY GATE

Antes de declarar módulo concluído:

```bash
cd BackendJava
./mvnw test
./mvnw verify
```

Frontend:

```bash
cd Frontend
npm ci
npm run lint
npm run build
```

Docker:

```bash
docker compose build
```

Se algum comando falhar:

- corrigir;
- não esconder;
- registrar causa se depender de ambiente externo.

---

# 75. MAVEN WRAPPER

Adicionar Maven Wrapper:

```text
mvnw
mvnw.cmd
.mvn/
```

Permite build reproduzível.

---

# 76. JAVA STYLE

Regras:

- nomes claros;
- métodos curtos;
- sem `Object`/Map indiscriminado;
- sem retornar entidade JPA;
- sem repositories em controller;
- sem lógica de autorização duplicada;
- sem catches genéricos que escondem erro;
- sem comentários que apenas repetem o código.

---

# 77. NULL

Evitar `Optional` em campos de entidade.

Usar `Optional` principalmente em retorno de repository quando fizer sentido.

DTOs devem representar opcionalidade explicitamente.

---

# 78. RECORDS

Pode usar Java Records para response/request DTOs quando compatível com validação e serialização.

Entidades JPA não devem ser records.

---

# 79. MAPPERS

Não adicionar MapStruct obrigatoriamente.

Se o volume justificar, use.

Caso contrário, mapeamento manual explícito é aceitável.

Evitar camada de mapper gigantesca sem necessidade.

---

# 80. ENUMS

Mapear com:

```java
@Enumerated(EnumType.STRING)
```

Nunca ordinal.

---

# 81. CONCORRÊNCIA DO TOKEN

Confirmação de token precisa ser segura contra duas requisições simultâneas.

Use uma abordagem como:

- update condicional;
- lock pessimista;
- optimistic locking;

e teste com integração.

---

# 82. OPTIMISTIC LOCKING

Considere `@Version` em entidades que possam sofrer edição concorrente relevante.

Não adicionar em tudo sem motivo.

Metas pode ser candidata.

---

# 83. AUDITORIA DE CREATED/UPDATED

Criar base ou mecanismo de auditoria JPA para:

```text
createdAt
updatedAt
```

em entidades relevantes.

---

# 84. API VERSIONING

Não é obrigatório criar `/v1` agora.

Se adicionar, atualizar frontend.

Preferência nesta migração: manter `/api`.

---

# 85. RESPONSE ENVELOPE

Não é obrigatório envolver tudo em:

```json
{"data": ...}
```

Escolha padrão e mantenha consistência.

Não copiar inconsistências atuais.

Documentar contratos no OpenAPI.

---

# 86. ERROS DE VALIDAÇÃO

Retornar lista de erros por campo.

Exemplo:

```json
{
  "code": "VALIDATION_ERROR",
  "fields": {
    "email": "Email inválido"
  }
}
```

---

# 87. BRASILIAN PHONE

Existe validação customizada de telefone.

Migrar somente se realmente usada pelo formulário.

Criar validator Java com testes.

Não acoplar persistência ao formato visual.

Idealmente normalizar telefone.

---

# 88. AGE RANGE

Existe regra de idade 0–18 no código atual.

Confirme requisito de negócio.

Preservar inicialmente se ainda estiver nos documentos.

Criar teste.

Registrar que é regra de produto, não limitação técnica inevitável.

---

# 89. META DATE VALIDATION

Preservar:

```text
dataInicio não pode ser passado
dataFim >= dataInicio
```

Testar.

---

# 90. SESSION DATE VALIDATION

Revisar se sessão histórica pode ou não ser cadastrada.

O código atual proíbe passado.

Não inventar nova regra.

Documentar decisão.

---

# 91. PROFISSIONAL CODE

Atualmente existe código como:

```text
PROF0001
```

Preservar se utilizado pela UI.

Não usar como chave primária.

---

# 92. CONNECTION DUPLICATION

O schema atual removeu constraint de conexão e o service tenta controlar duplicação na aplicação.

No novo banco, criar modelo robusto.

Evitar corrida entre duas requisições.

Pode usar constraint ou representação canônica do par.

---

# 93. DASHBOARD PERFORMANCE

Usar queries agregadas.

Adicionar índices para:

- profissional_id;
- crianca_id;
- status;
- data;
- created_at;
- updated_at;
- token.codigo;
- email.

Confirmar via migration.

---

# 94. ÍNDICES

Não criar índices aleatórios.

Basear nos filtros reais.

Documentar.

---

# 95. N+1

Verificar consultas:

- profissionais;
- crianças;
- metas;
- sessões;
- dashboard.

Criar integration test/SQL inspection quando útil.

---

# 96. LEGACY DATA

Prisma usa nomes de tabelas derivados dos models.

Antes de mapear JPA, inspecione migrations SQL para descobrir nomes reais.

Não suponha nomes.

---

# 97. README

Atualizar README principal.

Deve explicar:

- arquitetura atual;
- Java backend;
- como executar;
- variáveis;
- Docker;
- testes;
- Swagger;
- migration status.

---

# 98. DOCUMENTAÇÃO DE DESENVOLVIMENTO

Criar:

```text
BackendJava/README.md
```

Com:

```text
pré-requisitos
setup
database
run
test
debug
Docker
migrations
security
Swagger
```

---

# 99. ADRs

Criar decisões em:

```text
docs/refatoracao-java/adr/
```

No mínimo:

```text
ADR-001-java-spring-boot.md
ADR-002-modular-monolith.md
ADR-003-auth-cookie.md
ADR-004-database-migration.md
ADR-005-responsavel-link-model.md
ADR-006-api-contract.md
```

---

# 100. NÃO FAZER

Não:

- migrar para microserviços;
- adicionar Kafka;
- adicionar Redis sem necessidade;
- adicionar Kubernetes;
- criar CQRS;
- criar event sourcing;
- usar arquitetura excessivamente abstrata;
- mudar frontend visual;
- remover funcionalidades sem mapear;
- copiar bugs;
- copiar segredos;
- inventar dados;
- inventar testes passando;
- afirmar que compilou sem executar;
- afirmar que endpoint funciona sem validar;
- apagar banco;
- force push;
- reescrever `main`;
- commitar `.env`.

---

# 101. EXECUÇÃO AUTÔNOMA

Você deve trabalhar de forma autônoma dentro desta especificação.

Quando encontrar ambiguidade:

1. tente resolver pelo código;
2. consulte frontend;
3. consulte migrations;
4. consulte documentação;
5. escolha a opção mais conservadora;
6. registre decisão em ADR.

Somente pare para pedir decisão humana se a escolha:

- puder apagar dados;
- puder reescrever histórico Git;
- puder alterar regra clínica;
- puder alterar modelo jurídico;
- exigir segredo externo;
- exigir custo/infraestrutura externa significativa.

---

# 102. RELATÓRIO POR FASE

Após cada fase, atualizar:

```text
docs/refatoracao-java/STATUS.md
```

Formato:

```md
## Fase X

### Concluído
- ...

### Testes executados
- comando
- resultado

### Pendências
- ...

### Riscos
- ...

### Próxima fase
- ...
```

---

# 103. MATRIZ DE PARIDADE

Criar tabela semelhante:

| Módulo | NestJS | Java | Frontend validado | Testes | Status |
|---|---|---|---|---|---|
| Auth | sim | sim | sim | sim | concluído |
| Users | sim | ... | ... | ... | ... |

Nunca declarar migração concluída sem preencher a matriz.

---

# 104. CHECKLIST FINAL

## Git / Restauração

- [ ] SHA-base registrado.
- [ ] Branch de restauração criada.
- [ ] Branch de trabalho criada.
- [ ] Todos os commits da refatoração foram feitos na branch de trabalho.
- [ ] Nenhum commit da refatoração foi feito diretamente na `main`.
- [ ] Branch de restauração preservada.
- [ ] `BASELINE.md` atualizado.

## Build

- [ ] Backend Java compila.
- [ ] Maven verify passa.
- [ ] Frontend build passa.
- [ ] Frontend lint passa.
- [ ] Docker build passa.

## Auth

- [ ] Register.
- [ ] Login.
- [ ] Logout.
- [ ] Me.
- [ ] Cookie.
- [ ] Expiração.
- [ ] 401.

## Segurança

- [ ] Sem default JWT secret.
- [ ] Sem senha temporária.
- [ ] Sem IDOR em users.
- [ ] Sem IDOR em crianças.
- [ ] Sem IDOR em profissionais.
- [ ] Autorização relacional.
- [ ] CORS configurável.
- [ ] CSRF documentado.
- [ ] `.history` não versionado na árvore nova.
- [ ] Nenhum segredo novo commitado.

## Crianças

- [ ] Cadastro.
- [ ] Listagem filtrada.
- [ ] Detalhes autorizados.
- [ ] Edição autorizada.
- [ ] Vínculo.

## Metas

- [ ] CRUD.
- [ ] Filtros.
- [ ] Resumo.
- [ ] Progresso.
- [ ] Status.
- [ ] Histórico.
- [ ] Segurança.

## Sessões

- [ ] Criar.
- [ ] Listar.
- [ ] Filtrar.
- [ ] Editar.
- [ ] Status.
- [ ] Segurança.

## Vinculação

- [ ] Preview não mutável.
- [ ] Confirmar.
- [ ] Token single-use.
- [ ] Expiração.
- [ ] Consentimento.
- [ ] Histórico.
- [ ] Desvinculação.

## Dashboard

- [ ] Profissional.
- [ ] Responsável.
- [ ] Crianças.
- [ ] Metas.
- [ ] Datas corretas.

## Infra

- [ ] Flyway.
- [ ] PostgreSQL.
- [ ] Testcontainers.
- [ ] Swagger.
- [ ] Actuator seguro.
- [ ] Docker.
- [ ] CI.

---

# 105. RESULTADO FINAL ESPERADO

Ao terminar, o repositório deve se aproximar de:

```text
ConectaTEA/
├── Backend/                  # legado temporário
├── BackendJava/              # backend principal Java
├── Frontend/
├── docs/
│   └── refatoracao-java/
├── docker-compose.yml
└── README.md
```

Depois da validação integral, preparar um PR separado para eventualmente remover:

```text
Backend/
```

---

# 106. DEFINIÇÃO FINAL DE SUCESSO

A missão não é:

> converter TypeScript para Java.

A missão é:

> reconstruir o backend do ConectaTEA em Java/Spring Boot com paridade funcional, contrato claro, testes, segurança relacional, modelagem coerente e uma base adequada para evolução real do produto.

Preserve o que funciona.

Corrija o que está inseguro ou inconsistente.

Não aumente escopo sem necessidade.

Documente todas as decisões importantes.

Execute testes reais antes de afirmar sucesso.

---

# 107. PRIMEIRA RESPOSTA DO CODEX

Antes de editar código, sua primeira saída deve conter:

1. branch atual, SHA-base, branch de restauração criada e branch de trabalho criada;
2. resumo da árvore;
3. módulos encontrados;
4. dependências principais;
5. endpoints detectados;
6. modelos Prisma detectados;
7. consumidores frontend detectados;
8. divergências backend/frontend;
9. riscos P0/P1/P2;
10. plano de fases;
11. arquivos que serão criados;
12. comandos que serão usados para validar.

Depois disso, inicie a auditoria documental e a implementação por fases.

Não comece apagando ou substituindo o backend atual.
