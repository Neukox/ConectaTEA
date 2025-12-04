# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ConectaTEA is a web platform for specialized monitoring of children with ASD (Autism Spectrum Disorder). It connects guardians and specialized professionals, facilitating care and development of children on the autism spectrum.

## Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 with tailwindcss-animate
- **UI Components**: Radix UI primitives (@radix-ui/react-dialog, @radix-ui/react-slot, @radix-ui/react-switch)
- **Icons**: lucide-react, react-icons
- **Routing**: react-router-dom 7
- **HTTP Client**: axios 1.13.2
- **Forms/Validation**: zod 4
- **Charts**: recharts 3

### Backend
- **Framework**: NestJS 10 with TypeScript
- **ORM**: Prisma 6.14.0
- **Database**: PostgreSQL
- **Authentication**: JWT with passport-jwt, bcrypt for password hashing
- **API Documentation**: Swagger (OpenAPI)
- **Validation**: class-validator, class-transformer

## Development Commands

### Backend (NestJS)
```bash
cd Backend
npm install                    # Install dependencies
npm run start:dev              # Start development server with hot reload
npm run build                  # Build for production
npm run start:prod             # Run production build
npm run lint                   # Run ESLint
npm run format                 # Format code with Prettier
npm run test                   # Run unit tests
npm run test:watch             # Run tests in watch mode
npm run test:cov               # Run tests with coverage
npm run test:e2e               # Run end-to-end tests

# Prisma commands
npm run prisma:migrate         # Run database migrations
npm run prisma:generate        # Generate Prisma Client
npm run prisma:studio          # Open Prisma Studio (DB GUI)
```

### Frontend (React + Vite)
```bash
cd Frontend
npm install                    # Install dependencies
npm run dev                    # Start development server (port 5173)
npm run build                  # Build for production (runs TypeScript check + Vite build)
npm run preview                # Preview production build
npm run lint                   # Run ESLint
```

## Architecture

### Monorepo Structure
```
ConectaTEA/
├── Backend/           # NestJS application
│   ├── src/
│   │   ├── auth/      # JWT authentication, guards, strategies
│   │   ├── users/     # User management
│   │   ├── profissionais/  # Professional profiles
│   │   ├── criancas/  # Children management
│   │   ├── conexoes/  # Professional connections (friend requests)
│   │   ├── metas/     # Goals for children
│   │   ├── prisma/    # Prisma service wrapper
│   │   └── private/   # Private/admin endpoints
│   └── prisma/
│       └── schema.prisma  # Database schema
└── Frontend/          # React application
    └── src/
        ├── api/       # API clients and HTTP utilities
        ├── components/ # Reusable UI components
        ├── contexts/  # React contexts (AuthContext)
        ├── hooks/     # Custom React hooks
        ├── layouts/   # Layout components
        ├── pages/     # Page components (route-specific)
        ├── routes/    # Route definitions
        └── lib/       # Utility functions
```

### Database Schema (Prisma)

The application uses PostgreSQL with the following core models:

- **User**: Base user table with fields `id`, `name`, `email`, `password`, `telefone`, `endereco`, `tipo` (PROFISSIONAL | RESPONSAVEL)
- **Profissional**: Professional profile extending User with `especialidade`, `registro_profissional`, `titulo`, `formacaoAcademica`, `sobre`, `fotoPerfilUrl`, `codigoIdentificacao`
- **Crianca**: Children records with `nome`, `data_nascimento`, `genero`, `diagnostico`, `diagnosticoDetalhes`, `observacoes`, `parentesco`
- **ConexaoProfissional**: Professional networking (connection requests) with status PENDENTE | ACEITO | RECUSADO
- **Meta**: Goals for children with categories (COMUNICACAO, SOCIAL, COGNITIVA, COMPORTAMENTAL) and priorities (BAIXA, MEDIA, ALTA)
- **Sessoes**: Session records linking professionals and children
- **LocalAtendimento**: Professional service locations
- **RedeSocial**: Social media links for professionals
- **AreaAtuacao**: Areas of expertise (many-to-many with Profissional)
- **AuditLog**: Audit trail for important actions

### Authentication Flow

1. **Backend**:
   - JWT tokens are issued upon login via `/auth/login`
   - Tokens are stored in HTTP-only cookies (cookie name: `jwt`)
   - JWT strategy extracts tokens from cookies OR Authorization header (Bearer token)
   - Guards protect routes: `@UseGuards(JwtAuthGuard)` for authentication, `@Roles()` decorator with `RolesGuard` for authorization

2. **Frontend**:
   - Token is stored in `localStorage` under key `token`
   - `api` client (axios instance in `api/apiClient.ts`) automatically adds `Authorization: Bearer <token>` header
   - `AuthContext` provides global auth state with `user`, `isAuthenticated`, `isLoading`
   - `ProtectedRoute` component wraps routes requiring authentication, checks user role

### API Structure

- **Base URL**: `http://localhost:3000/api`
- **Global prefix**: `/api` for all routes
- **CORS**: Enabled for localhost:5173, 5174, 5175 with credentials
- **Documentation**: Swagger UI available at `http://localhost:3000/api/docs`

Key endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT)
- `GET /api/users/profile` - Get current user profile (protected)
- `GET /api/profissionais` - List professionals (protected)
- `POST /api/criancas` - Create child record (protected)
- `POST /api/conexoes/enviar` - Send connection request (protected)
- `GET /api/conexoes/recebidas` - Get received connection requests (protected)

### Frontend Routing

Routes are defined in [Frontend/src/routes/routes.tsx](Frontend/src/routes/routes.tsx). The app uses role-based routing:

- **Public routes**: `/`, `/login`, `/register`
- **PROFISSIONAL routes**: `/profissional/*` (dashboard, criancas, perfil, profissionais, metas, progresso, sessoes, configuracoes)
- **RESPONSAVEL routes**: `/responsavel/*` (currently only dashboard implemented)
- **Shared route**: `/dashboard` (redirects based on user type)

All protected routes use `<ProtectedRoute allowedRoles={[...]}>` wrapper.

### State Management

- **Authentication**: React Context (`AuthContext` + `AuthProvider`) in [Frontend/src/contexts/](Frontend/src/contexts/)
- **Notifications**: Custom notification system in [Frontend/src/api/barraNotificacao/](Frontend/src/api/barraNotificacao/)
- **No global state library**: Uses React hooks and Context API

### UI Component System

The app uses a custom component library built on Radix UI primitives:
- Components are in [Frontend/src/components/ui/](Frontend/src/components/ui/)
- Styling uses Tailwind with `tailwind-merge` for conditional classes
- `class-variance-authority` for variant-based component APIs
- Utility function `cn()` in [Frontend/src/lib/utils.ts](Frontend/src/lib/utils.ts) for className merging

## Environment Setup

### Backend Environment Variables

Create `Backend/.env` file with:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/conectatea
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=7d
JWT_LENGTH=256
```

### Frontend Environment Variables

Create `Frontend/.env` file with:
```env
VITE_API_URL=http://localhost:3000/api
```

## Development Workflow

1. **Database First**: When changing database schema, edit `Backend/prisma/schema.prisma` then run `npm run prisma:migrate` in Backend directory
2. **TypeScript Strict Mode**: Both frontend and backend use strict TypeScript. Always run type checks before committing
3. **ESLint Configuration**: Frontend uses flat config (eslint.config.js). Backend uses traditional .eslintrc format
4. **Port Allocation**:
   - Frontend: 5173 (Vite default)
   - Backend: 3000 (NestJS)
   - PostgreSQL: 5432 (default)

## Key Patterns & Conventions

### Backend (NestJS)
- **Module structure**: Each feature has its own module with controller, service, and DTOs
- **DTOs**: Use class-validator decorators for validation (`@IsString()`, `@IsEmail()`, etc.)
- **Guards**: Authentication via `JwtAuthGuard`, authorization via `RolesGuard` with `@Roles()` decorator
- **Prisma integration**: `PrismaService` is a wrapper around Prisma Client, injected into services
- **Error handling**: NestJS built-in exception filters handle validation errors

### Frontend (React)
- **Hooks over classes**: All components are functional with hooks
- **Custom hooks**: Reusable logic in [Frontend/src/hooks/](Frontend/src/hooks/) (e.g., `useAuth`, `useConfirmacao`, `useDashboard`)
- **API organization**: API calls are organized by feature in [Frontend/src/api/protected/](Frontend/src/api/protected/) (e.g., `axiosCadastroCrianca.ts`, `axiosProfissionais.ts`)
- **Route protection**: Use `ProtectedRoute` component wrapper, never check auth inline
- **Styling approach**: Tailwind utility classes, avoid inline styles

## Testing

### Backend
- **Framework**: Jest with ts-jest
- **Test files**: `*.spec.ts` files alongside source
- **Coverage directory**: `Backend/coverage/`
- **E2E tests**: Use `test/jest-e2e.json` config

### Frontend
- **No test setup yet**: Tests are not currently configured in the frontend

## Common Pitfalls

1. **Cookie vs localStorage**: Backend sends JWT in cookies, but frontend also stores in localStorage. Both are checked by the backend (cookie-first, then Authorization header).

2. **CORS credentials**: The backend has `credentials: true` in CORS config, and frontend axios has `withCredentials: true`. Both are required for cookies to work.

3. **UserType enum**: Database enum is `PROFISSIONAL | RESPONSAVEL` (all caps). Ensure consistency when checking roles.

4. **Prisma Client**: After schema changes, always run `prisma generate` to update the Prisma Client types.

5. **Route duplication**: The routes file has duplicate route definitions for `/profissional/perfil/:id` (lines 92-98 and 100-106). This is a known issue.

6. **Global API prefix**: All backend routes are prefixed with `/api`. Frontend API client includes this in baseURL.
