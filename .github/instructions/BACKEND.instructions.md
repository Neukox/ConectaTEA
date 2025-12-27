---
applyTo: "Backend/**/*.ts"
name: "ConectaTEA Backend Instructions"
description: "This file provides specific guidelines for developing the ConectaTEA platform backend using NestJS."
---

# Copilot Instructions - ConectaTEA Backend

This file provides specific guidelines for developing the ConectaTEA platform backend using NestJS.

## 📋 Project Overview

ConectaTEA is a web platform for specialized monitoring of children with ASD (Autism Spectrum Disorder). The backend is built with **NestJS** and provides a secure RESTful API to connect guardians and specialized professionals.

## 🏗️ Architecture and Tech Stack

### Framework and Language
- **NestJS 10** with TypeScript 5
- **Node.js 18+**
- Modular architecture based on dependency injection

### Database and ORM
- **PostgreSQL 12+** as primary database
- **Prisma 6.14.0** as ORM
- Versioned migrations in `prisma/migrations/`
- Schema defined in `prisma/schema.prisma`

### Authentication and Security
- **JWT** (JSON Web Tokens) with `@nestjs/jwt` and `passport-jwt`
- Tokens stored in HTTP-only cookies (`jwt` cookie)
- Passwords encrypted with **bcrypt** (salt rounds: 10)
- Custom guards: `JwtAuthGuard` (authentication) and `RolesGuard` (authorization)
- `@Roles()` decorator for role-based access control

### Validation and Documentation
- **class-validator** and **class-transformer** for DTO validation
- **Swagger/OpenAPI** for automatic API documentation (available at `/api/docs`)
- Global prefix: `/api` for all routes

## 🎯 Development Principles

### 1. Module Structure
Each feature should follow the standard NestJS structure:

```
feature/
├── feature.controller.ts   # HTTP Endpoints
├── feature.service.ts      # Business Logic
├── feature.module.ts       # Module Configuration
└── dto/                    # Data Transfer Objects
    ├── create-feature.dto.ts
    └── update-feature.dto.ts
```

**Complete module example:**
```typescript
// feature.module.ts
import { Module } from '@nestjs/common';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService], // Export if other modules need it
})
export class FeatureModule {}
```

### 2. Controllers - Presentation Layer

**Guidelines:**
- Use Swagger decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`)
- Validate input with typed DTOs
- Keep controllers lean - delegate logic to services
- Use `@UseGuards(JwtAuthGuard)` for protected routes
- Use `@Roles('PROFISSIONAL', 'RESPONSAVEL')` for role-based authorization

**Example:**
```typescript
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Profissionais')
@Controller('profissionais')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProfissionaisController {
  constructor(private readonly service: ProfissionaisService) {}

  @Get()
  @ApiOperation({ summary: 'List all professionals' })
  @Roles('PROFISSIONAL', 'RESPONSAVEL')
  async findAll() {
    return await this.service.findAll();
  }
}
```

### 3. Services - Business Logic Layer

**Guidelines:**
- Inject `PrismaService` for database access
- Implement all business logic
- Throw specific NestJS exceptions (`BadRequestException`, `NotFoundException`, etc.)
- Use Prisma transactions (`prisma.$transaction`) for operations requiring atomicity
- Always use `select` or `include` in Prisma to control returned data (never expose passwords)

**Example:**
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfissionaisService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.profissional.findMany({
      select: {
        id: true,
        especialidade: true,
        usuario: {
          select: {
            id: true,
            name: true,
            email: true,
            // NEVER include password
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const profissional = await this.prisma.profissional.findUnique({
      where: { id },
    });

    if (!profissional) {
      throw new NotFoundException(`Professional #${id} not found.`);
    }

    return profissional;
  }
}
```

### 4. DTOs - Data Validation

**Guidelines:**
- Use classes (not interfaces) for DTOs
- Apply validation decorators from `class-validator`
- Document with Swagger decorators (`@ApiProperty`)
- Create separate DTOs for create and update
- Use `@IsEnum()` to validate specific types (e.g., `UserType`)

**Example:**
```typescript
import { IsString, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva', description: 'User full name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'joao@email.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  password: string;

  @ApiProperty({ enum: UserType, example: 'RESPONSAVEL' })
  @IsEnum(UserType, { message: 'Type must be PROFISSIONAL or RESPONSAVEL.' })
  tipo: UserType;
}
```

### 5. Prisma - Data Management

**Prisma Schema:**
- Use enums for fixed types (`UserType`, `StatusConexao`, etc.)
- Always define relations explicitly with `@relation`
- Use `@default(now())` for automatic timestamps
- Prefer `Int @id @default(autoincrement())` for IDs

**Prisma Queries:**
```typescript
// ✅ GOOD - Explicit control of returned data
await this.prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    // password: false (not returned by default if not listed)
  },
});

// ❌ BAD - Returns everything, including passwords
await this.prisma.user.findMany();

// ✅ GOOD - Use transactions for atomic operations
await this.prisma.$transaction(async (prisma) => {
  const user = await prisma.user.create({ data: userData });
  await prisma.profissional.create({ data: { usuario_id: user.id, ... } });
  return user;
});
```

**Migrations:**
```bash
# Create new migration after changing schema.prisma
npm run prisma:migrate

# Generate Prisma Client after changes
npm run prisma:generate

# Open Prisma Studio to view data
npm run prisma:studio
```

### 6. JWT Authentication

**Authentication Flow:**
1. **Login:** `POST /api/auth/login` → validates credentials → generates JWT → stores in cookie
2. **Protected routes:** Token extracted from cookie (`jwt`) or header `Authorization: Bearer <token>`
3. **Validation:** `JwtStrategy` validates token and injects user into `request`

**Implementation:**
```typescript
// auth.service.ts
async login(loginDto: LoginDto, response: Response) {
  const { email, password } = loginDto;
  
  const usuario = await this.prisma.user.findFirst({ where: { email } });
  if (!usuario) {
    throw new UnauthorizedException('Email not registered.');
  }

  const senhaCorreta = await bcrypt.compare(password, usuario.password);
  if (!senhaCorreta) {
    throw new UnauthorizedException('Incorrect password.');
  }

  const payload = { userId: usuario.id, email: usuario.email, tipo: usuario.tipo };
  const token = this.jwtService.sign(payload);

  // Secure cookie
  response.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return { message: 'Login successful.', user: { ... } };
}
```

### 7. Error Handling

**Use specific exceptions:**
- `BadRequestException` - Invalid data (400)
- `UnauthorizedException` - Not authenticated (401)
- `ForbiddenException` - No permission (403)
- `NotFoundException` - Resource not found (404)
- `ConflictException` - Conflict (e.g., duplicate email) (409)
- `InternalServerErrorException` - Internal error (500)

**Example:**
```typescript
// ✅ GOOD
if (!user) {
  throw new NotFoundException('User not found.');
}

// ❌ BAD - Never throw generic Error
if (!user) {
  throw new Error('User not found');
}
```

### 8. Security and Best Practices

**Sensitive Data Protection:**
```typescript
// ✅ ALWAYS exclude password when returning users
select: {
  id: true,
  name: true,
  email: true,
  // password not included
}

// ❌ NEVER return password
const user = await this.prisma.user.findUnique({ where: { id } });
return user; // DANGEROUS - includes password hash
```

**Input Validation:**
```typescript
// ✅ Validate and sanitize inputs
const emailTrimmed = email.trim().toLowerCase();
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
if (!emailRegex.test(emailTrimmed)) {
  throw new BadRequestException('Invalid email.');
}

// ✅ Validate enum types
if (!Object.values(UserType).includes(tipo as UserType)) {
  throw new BadRequestException('Invalid user type.');
}
```

**Rate Limiting and CORS:**
```typescript
// main.ts
app.enableCors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true, // For cookies
});

app.setGlobalPrefix('api'); // All routes start with /api
```

## 📊 Database Models

### Main Prisma Models

**User** (Base user):
- `id`, `name`, `email`, `password`, `telefone`, `endereco`, `tipo` (enum: PROFISSIONAL | RESPONSAVEL)
- Relationships: `criancas[]`, `profissional?`, `auditLogs[]`

**Profissional** (Professional profile):
- `id`, `usuario_id`, `especialidade`, `registro_profissional`, `titulo`, `formacaoAcademica`, `sobre`, `fotoPerfilUrl`, `codigoIdentificacao`
- Relationships: `usuario`, `sessoes[]`, `prof_crianca[]`, `conexoesEnviadas[]`, `conexoesRecebidas[]`, `locaisAtendimento[]`, `redesSociais[]`, `areasAtuacao[]`

**Crianca** (Child record):
- `id`, `nome`, `data_nascimento`, `genero`, `diagnostico`, `diagnosticoDetalhes`, `observacoes`, `parentesco` (enum), `responsavel_id`
- Relationships: `responsavel`, `sessoes[]`, `metas[]`, `prof_crianca[]`

**ConexaoProfissional** (Professional network):
- `id`, `remetente_id`, `destinatario_id`, `status` (enum: PENDENTE | ACEITO | RECUSADO), `criado_em`, `atualizado_em`
- "Friendship" system between professionals

**Meta** (Development goals):
- `id`, `crianca_id`, `titulo`, `descricao`, `categoria` (enum: COMUNICACAO | SOCIAL | COGNITIVA | COMPORTAMENTAL), `prioridade` (enum: BAIXA | MEDIA | ALTA), `status` (enum), `data_inicio`, `data_fim`, `progresso`, `profissional_id`

## 🔧 Development Commands

```bash
# Installation
npm install

# Development (hot reload)
npm run start:dev

# Build for production
npm run build
npm run start:prod

# Testing
npm run test          # Unit tests
npm run test:watch    # Tests in watch mode
npm run test:cov      # Tests with coverage
npm run test:e2e      # End-to-end tests

# Linting and formatting
npm run lint          # ESLint
npm run format        # Prettier

# Prisma
npm run prisma:migrate    # Run migrations
npm run prisma:generate   # Generate Prisma Client
npm run prisma:studio     # Open database GUI
```

## 🌐 API Endpoints

### Base URL: `http://localhost:3000/api`

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login (returns JWT in cookie)
- `POST /api/auth/logout` - Logout (clears cookie)

**Users (protected):**
- `GET /api/users/profile` - Authenticated user profile
- `PUT /api/users/profile` - Update profile

**Professionals (protected):**
- `GET /api/profissionais` - List professionals
- `GET /api/profissionais?usuarioId={id}` - Search professional by user ID
- `PUT /api/profissionais/usuario/:usuarioId` - Update professional profile

**Children (protected):**
- `POST /api/criancas` - Register child
- `GET /api/criancas` - List guardian's children
- `PUT /api/criancas/:id` - Update child
- `DELETE /api/criancas/:id` - Remove child

**Connections (protected):**
- `POST /api/conexoes/enviar` - Send connection request
- `GET /api/conexoes/recebidas` - List received requests
- `GET /api/conexoes/enviadas` - List sent requests
- `PUT /api/conexoes/:id/aceitar` - Accept connection
- `PUT /api/conexoes/:id/recusar` - Decline connection

## ⚙️ Environment Variables

Create `.env` file in Backend root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/conectatea"

# JWT
JWT_SECRET="conectatea-secret-key-change-in-production"
JWT_EXPIRATION="7d"
JWT_LENGTH="256"

# Node
NODE_ENV="development"
PORT="3000"
```

## 🎨 Code Patterns

### Naming Conventions
- **Files:** kebab-case (e.g., `user-profile.service.ts`)
- **Classes:** PascalCase (e.g., `UserProfileService`)
- **Variables/Functions:** camelCase (e.g., `getUserProfile()`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `JWT_SECRET`)
- **Prisma Enums:** UPPER_SNAKE_CASE (e.g., `UserType.PROFISSIONAL`)

### TypeScript
- Always use `async/await` (don't use callbacks)
- Prefer `interface` for pure types, `class` for DTOs
- Enable TypeScript strict mode
- Always type public function returns

### Imports
```typescript
// 1. Node/NestJS imports
import { Injectable, NotFoundException } from '@nestjs/common';

// 2. External library imports
import * as bcrypt from 'bcrypt';

// 3. Project imports (use relative paths)
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

// 4. Prisma type imports
import { UserType } from '@prisma/client';
```

## 🧪 Testing

### Test Structure
```typescript
describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a user', async () => {
    const userData = { name: 'Test', email: 'test@test.com', password: '123456', tipo: 'RESPONSAVEL' };
    jest.spyOn(prisma.user, 'create').mockResolvedValue({ id: 1, ...userData });

    const result = await service.create(userData);
    expect(result).toHaveProperty('id');
  });
});
```

## 📚 Resources and Documentation

- **NestJS Docs:** https://docs.nestjs.com
- **Prisma Docs:** https://www.prisma.io/docs
- **Swagger UI:** http://localhost:3000/api/docs (after starting server)
- **Passport JWT:** http://www.passportjs.org/packages/passport-jwt/

## ✅ Checklist for Creating New Features

- [ ] Create module, controller, and service
- [ ] Create DTOs with complete validation
- [ ] Add Swagger decorators (`@ApiTags`, `@ApiOperation`)
- [ ] Implement authentication/authorization guards if needed
- [ ] Update Prisma schema if there are new models
- [ ] Create and run Prisma migration
- [ ] Never expose sensitive data (passwords, tokens) in responses
- [ ] Add unit tests
- [ ] Validate errors and edge cases
- [ ] Document in main README if it's an important public endpoint

---

**ConectaTEA Backend** - Built with NestJS, TypeScript, and Prisma 💙

Always keep code clean, documented, and secure. When in doubt, refer to existing files as reference.
