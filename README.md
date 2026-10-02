# ConectaTEA 🧩

Plataforma para acompanhamento de crianças com TEA, conectando responsáveis e profissionais especializados.

## 🏗️ Arquitetura

### Diagrama da Arquitetura

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐    ORM     ┌─────────────────┐
│                 │ ──────────────► │                 │ ─────────► │                 │
│  Frontend       │                 │  Backend        │            │  PostgreSQL     │
│  React + Vite   │ ◄────────────── │  NestJS         │ ◄───────── │  Database       │
│  TypeScript     │     JSON        │  TypeScript     │   Prisma   │                 │
└─────────────────┘                 └─────────────────┘            └─────────────────┘
```

### Stack Tecnológico

- **Frontend**: React + TypeScript + Vite + Axios
- **Backend principal**: Java 21 + Spring Boot + JPA + Flyway
- **Backend legado**: NestJS + Prisma preservado temporariamente para referência e migração
- **Database**: PostgreSQL
- **Autenticação**: JWT + Guards
- **Validação**: DTOs + Class-validator

## ⚡ Funcionalidades Principais

### 🔐 Sistema de Autenticação

- Login/registro seguro com JWT
- Guards de autenticação em rotas protegidas
- Middleware de validação de tokens

### 👥 Gestão de Profissionais

- Cadastro completo de perfil profissional
- Especialidades, locais de atendimento, redes sociais
- Sistema de conexões entre profissionais
- Envio, aceite, recusa e remoção de solicitações

### 👶 Gestão de Crianças

- CRUD completo para crianças cadastradas
- Vinculação com responsáveis
- Acompanhamento de desenvolvimento

### 🔗 Sistema de Conexões

- Solicitações de amizade entre profissionais
- Status: PENDENTE, ACEITO, RECUSADO
- Listagem de conexões por profissional
- Remoção de conexões existentes

## 🛠️ Instalação e Configuração do Projeto

### Pré-requisitos

- Node.js (v16+)
- npm (v8+)
- PostgreSQL (v12+) (local ou Docker)
- Docker (opcional, para execução do banco, e outros serviços)

### Backend principal (Java/Spring Boot)

```bash
cd BackendJava
./mvnw spring-boot:run
# API em http://localhost:3000/api
# Swagger em http://localhost:3000/api/docs
```

Variáveis obrigatórias e instruções completas estão em `BackendJava/.env.example` e `BackendJava/README.md`. O NestJS permanece temporariamente como referência para homologação.

### Backend legado (NestJS)

`Backend/` não participa do runtime alvo. Ele permanece preservado para auditoria, planejamento da migração de dados e rollback até autorização explícita da Fase 4.

### Frontend (React)

```bash
cd Frontend
npm install
npm run dev
# Aplicação rodando em http://localhost:5173
```

### Banco de Dados

```bash
docker compose up postgres
```

### Ambiente Docker (opcional)

[docker-compose.yml](./docker-compose.yml) para orquestração de serviços (PostgreSQL, etc).

No diretório raiz do projeto, execute:

```bash
docker-compose up -d
```

Para parar os serviços:

```bash
docker-compose down
```

Para ver logs:

```bash
docker-compose logs -f {service_name}
```

## Documentação da API

para ver todos os endpoints e detalhes, rode o backend e acesse:

```bash
http://localhost:3000/api/docs
```

## 📂 Estrutura Modular

```
BackendJava/src/main/java/br/com/conectatea/
├── auth/           # Autenticação JWT
├── users/          # Usuários do sistema
├── profissionais/  # Perfis profissionais
├── criancas/       # Gestão de crianças
├── conexoes/       # Sistema de conexões
└── prisma/         # Configurações (Prisma)

Frontend/src/
├── api/            # Cliente HTTP + endpoints
├── assets/         # Imagens, estilos, etc.
├── pages/          # Componentes de página
├── components/     # Componentes reutilizáveis
├── hooks/          # Hooks customizados
├── config/         # Configurações globais
├── lib/            # Utilitários e helpers
├── context/        # Contextos React
├── features/       # Funcionalidades específicas
├── services/       # Serviços de negócios
└── routes/         # Definição de rotas
```

---

**ConectaTEA** - Conectando cuidado especializado para crianças com TEA 💙
