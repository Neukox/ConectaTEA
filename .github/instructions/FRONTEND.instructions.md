---
applyTo: "Frontend/**/*.{ts,tsx}"
name: "ConectaTEA Frontend Instructions"
description: "This file provides specific guidelines for developing the ConectaTEA platform frontend using React, TypeScript, and Vite."
---

# Copilot Instructions - ConectaTEA Frontend

This file provides specific guidelines for developing the ConectaTEA platform frontend using React and TypeScript.

## 📋 Project Overview

ConectaTEA is a web platform for specialized monitoring of children with ASD (Autism Spectrum Disorder). The frontend is built with **React 19** and provides a modern, responsive interface to connect guardians and specialized professionals.

## 🏗️ Architecture and Tech Stack

### Framework and Language
- **React 19** with TypeScript 5
- **Vite 7** as build tool and dev server
- Functional components with hooks (no class components)

### Styling and UI
- **Tailwind CSS 4** for utility-first styling
- **Shadcn UI** (Radix UI primitives + Tailwind)
- **tailwindcss-animate** for animations
- **lucide-react** and **react-icons** for icons
- Custom component library in `src/components/ui/`

### Routing and Navigation
- **react-router-dom 7** for client-side routing
- Role-based route protection with `ProtectedRoute` component
- Separate routes for PROFISSIONAL and RESPONSAVEL roles

### HTTP Client and State Management
- **axios 1.13.2** for HTTP requests
- **React Context API** for global auth state (`AuthContext`)
- **Tanstack Query** for server state management, caching, and data synchronization
- HTTP-only cookies for JWT token storage

### Forms and Validation
- **react-hook-form** for form state management
- **zod 4** for schema validation
- Integration between react-hook-form and zod via `@hookform/resolvers`

### Data Visualization
- **recharts 3** for charts and graphs

## 🎯 Development Principles

### 1. Component Structure

Components should follow a clear, organized structure:

```
feature/
├── components/           # Feature-specific components
│   ├── FeatureCard.tsx
│   └── FeatureForm.tsx
├── hooks/               # Feature-specific hooks
│   └── useFeature.ts
├── types/               # TypeScript types/interfaces
│   └── feature.types.ts
└── FeaturePage.tsx      # Main page component
```

**Component file structure:**
```tsx
// 1. Imports (grouped)
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

// 2. Types/Interfaces
interface FeatureProps {
  title: string
  onSubmit: (data: FormData) => void
}

// 3. Component
export default function Feature({ title, onSubmit }: FeatureProps) {
  // Hooks
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // State
  const [isLoading, setIsLoading] = useState(false)
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, [])
  
  // Handlers
  const handleSubmit = () => {
    // Handler logic
  }
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### 2. Pages - Route Components

**Guidelines:**
- Pages are route-level components in `src/pages/`
- Use `PageLayout` wrapper for consistent layout
- Keep pages clean - delegate logic to custom hooks
- Use role-specific folders (`Profissional/`, `Responsavel/`)
- Always check user permissions with `ProtectedRoute` wrapper

**Example:**
```tsx
import { PageLayout } from '@/components/layout'
import { useDashboard } from '@/hooks/useDashboard'
import { SummaryCard } from '@/components/common/SummaryCard'

export default function Dashboard() {
  const { summary, isLoading } = useDashboard()
  
  if (isLoading) {
    return <PageLayout><div>Carregando...</div></PageLayout>
  }
  
  return (
    <PageLayout title="Dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <SummaryCard key={item.id} {...item} />
        ))}
      </div>
    </PageLayout>
  )
}
```

### 3. Custom Hooks - Business Logic Layer

**Guidelines:**
- Extract component logic into reusable hooks
- Use Tanstack Query for server state (`useQuery`, `useMutation`)
- Keep UI components focused on presentation
- Name hooks with `use` prefix
- Always handle loading, error, and success states

**Example with Tanstack Query:**
```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { buscarCriancas, cadastrarCrianca } from '@/api/protected/axiosCadastroCrianca'
import { useNotificacoes } from '@/api/barraNotificacao'

export function useCriancas() {
  const queryClient = useQueryClient()
  const { mostrarNotificacao } = useNotificacoes()
  
  // Fetch children list
  const { data: criancas, isLoading, error } = useQuery({
    queryKey: ['criancas'],
    queryFn: buscarCriancas,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
  
  // Create child mutation
  const criarCriancaMutation = useMutation({
    mutationFn: cadastrarCrianca,
    onSuccess: (novaCrianca) => {
      queryClient.invalidateQueries({ queryKey: ['criancas'] })
      mostrarNotificacao({
        tipo: 'sucesso',
        mensagem: 'Criança cadastrada com sucesso!',
      })
    },
    onError: (error) => {
      mostrarNotificacao({
        tipo: 'erro',
        mensagem: error.message || 'Erro ao cadastrar criança',
      })
    },
  })
  
  return {
    criancas: criancas || [],
    isLoading,
    error,
    criarCrianca: criarCriancaMutation.mutate,
    isCreating: criarCriancaMutation.isPending,
  }
}
```

### 4. API Layer - HTTP Requests

**Guidelines:**
- Organize API calls by feature in `src/api/protected/`
- Use the configured axios instance from `apiClient.ts`
- Always handle errors with try-catch
- Return typed responses with TypeScript interfaces
- Include JWT token automatically via `withCredentials: true`

**Example:**
```tsx
// src/api/protected/axiosCriancas.ts
import api from '../apiClient'

export interface Crianca {
  id: number
  nome: string
  data_nascimento: string
  genero: string
  diagnostico: string
  responsavel_id: number
}

export interface CreateCriancaDto {
  nome: string
  data_nascimento: string
  genero: string
  diagnostico: string
  diagnosticoDetalhes?: string
  observacoes?: string
}

export async function buscarCriancas(): Promise<Crianca[]> {
  try {
    const response = await api.get<Crianca[]>('/criancas')
    return response.data
  } catch (error) {
    console.error('Erro ao buscar crianças:', error)
    throw error
  }
}

export async function cadastrarCrianca(data: CreateCriancaDto): Promise<Crianca> {
  try {
    const response = await api.post<Crianca>('/criancas', data)
    return response.data
  } catch (error) {
    console.error('Erro ao cadastrar criança:', error)
    throw error
  }
}

export async function buscarCriancaPorId(id: number): Promise<Crianca> {
  try {
    const response = await api.get<Crianca>(`/criancas/${id}`)
    return response.data
  } catch (error) {
    console.error(`Erro ao buscar criança #${id}:`, error)
    throw error
  }
}
```

### 5. Forms with React Hook Form + Zod

**Guidelines:**
- Use Zod for schema validation
- Integrate with react-hook-form via `zodResolver`
- Create reusable form schemas
- Show field-level error messages
- Handle form submission with loading states

**Example:**
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Zod schema
const criancaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  data_nascimento: z.string().refine((date) => {
    const age = new Date().getFullYear() - new Date(date).getFullYear()
    return age >= 0 && age <= 18
  }, 'Idade deve estar entre 0 e 18 anos'),
  genero: z.enum(['Masculino', 'Feminino', 'Outro']),
  diagnostico: z.string().min(1, 'Diagnóstico é obrigatório'),
})

type CriancaFormData = z.infer<typeof criancaSchema>

export function CriancaForm({ onSubmit }: { onSubmit: (data: CriancaFormData) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CriancaFormData>({
    resolver: zodResolver(criancaSchema),
  })
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register('nome')}
          placeholder="Nome da criança"
        />
        {errors.nome && (
          <p className="text-sm text-red-500">{errors.nome.message}</p>
        )}
      </div>
      
      <div>
        <Input
          {...register('data_nascimento')}
          type="date"
        />
        {errors.data_nascimento && (
          <p className="text-sm text-red-500">{errors.data_nascimento.message}</p>
        )}
      </div>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
      </Button>
    </form>
  )
}
```

### 6. Authentication and Route Protection

**Authentication Context:**
```tsx
// src/contexts/AuthContext.ts
import { createContext } from 'react'

export interface User {
  id: number
  name: string
  email: string
  tipo: 'PROFISSIONAL' | 'RESPONSAVEL'
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
```

**Protected Route Component:**
```tsx
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: Array<'PROFISSIONAL' | 'RESPONSAVEL'>
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return <div>Carregando...</div>
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (!allowedRoles.includes(user.tipo)) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}
```

### 7. Styling with Tailwind CSS

**Guidelines:**
- Use Tailwind utility classes (never inline styles)
- Use `cn()` utility for conditional classes
- Follow responsive design principles (mobile-first)
- Use Tailwind's design tokens (colors, spacing, etc.)
- Create component variants with `class-variance-authority`

**Example with `cn()` utility:**
```tsx
import { cn } from '@/lib/utils'

interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-lg font-semibold transition-colors',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        size === 'sm' && 'px-3 py-1 text-sm',
        size === 'md' && 'px-4 py-2 text-base',
        size === 'lg' && 'px-6 py-3 text-lg',
        className,
      )}
      {...props}
    />
  )
}
```

**Using `cva` for component variants:**
```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
```

### 8. Error Handling and Notifications

**Notification System:**
```tsx
import { useNotificacoes } from '@/api/barraNotificacao'

export function SomeComponent() {
  const { mostrarNotificacao } = useNotificacoes()
  
  const handleAction = async () => {
    try {
      await someApiCall()
      mostrarNotificacao({
        tipo: 'sucesso',
        mensagem: 'Operação realizada com sucesso!',
      })
    } catch (error) {
      mostrarNotificacao({
        tipo: 'erro',
        mensagem: error.message || 'Erro ao realizar operação',
      })
    }
  }
  
  return <button onClick={handleAction}>Executar</button>
}
```

**Error Boundaries (for React errors):**
```tsx
import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Algo deu errado.</div>
    }
    
    return this.props.children
  }
}
```

## 📊 UI Component Library (Shadcn UI)

### Available Components

The project uses Shadcn UI components in `src/components/ui/`:

- `button.tsx` - Button component with variants
- `input.tsx` - Input field component
- `dialog.tsx` - Modal/dialog component
- `calendar.tsx` - Date picker calendar
- `popover.tsx` - Popover/tooltip component
- `badge.tsx` - Badge/tag component
- `skeleton.tsx` - Loading skeleton
- `progress.tsx` - Progress bar
- `switch.tsx` - Toggle switch
- `tooltip.tsx` - Tooltip component

### Creating New UI Components

Use Shadcn CLI to add new components:

```bash
npx shadcn-ui@latest add [component-name]
```

**Example: Adding a Select component:**
```bash
npx shadcn-ui@latest add select
```

This will create `src/components/ui/select.tsx` with proper TypeScript types and Tailwind styles.

## 🎨 Code Patterns and Conventions

### Naming Conventions
- **Files**: kebab-case for components (`user-profile.tsx`), camelCase for utilities (`dateUtils.ts`)
- **Components**: PascalCase (`UserProfile`, `DashboardCard`)
- **Hooks**: camelCase with `use` prefix (`useAuth`, `useCriancas`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase (`User`, `AuthContextType`)

### Import Organization
```tsx
// 1. React and third-party imports
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// 2. UI component imports (absolute paths)
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// 3. Feature component imports
import { PageLayout } from '@/components/layout'

// 4. Hooks and utilities
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

// 5. Types
import type { User } from '@/contexts/AuthContext'

// 6. Assets
import logo from '@/assets/logo.svg'
```

### File Structure Best Practices

**✅ GOOD - Organized by feature:**
```
src/
├── features/
│   ├── criancas/
│   │   ├── components/
│   │   │   ├── CriancaCard.tsx
│   │   │   └── CriancaForm.tsx
│   │   ├── hooks/
│   │   │   └── useCriancas.ts
│   │   ├── types/
│   │   │   └── crianca.types.ts
│   │   └── CriancasPage.tsx
```

**❌ BAD - Everything in one folder:**
```
src/
├── components/
│   ├── CriancaCard.tsx
│   ├── MetaCard.tsx
│   ├── SessaoCard.tsx
│   ├── ProgressoCard.tsx
│   └── ... (dozens of files)
```

### TypeScript Best Practices

**✅ Use explicit types:**
```tsx
// Good
interface User {
  id: number
  name: string
  email: string
}

const user: User = { id: 1, name: 'João', email: 'joao@email.com' }

// Bad
const user = { id: 1, name: 'João', email: 'joao@email.com' }
```

**✅ Use union types for enums:**
```tsx
// Good
type UserType = 'PROFISSIONAL' | 'RESPONSAVEL'
type MetaStatus = 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA'

// Bad
const userType = 'PROFISSIONAL' // no type safety
```

**✅ Use proper typing for events:**
```tsx
// Good
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value)
}

// Bad
const handleChange = (e: any) => {
  console.log(e.target.value)
}
```

## 🔧 Development Commands

```bash
# Installation
npm install

# Development (hot reload on port 5173)
npm run dev

# Build for production
npm run build  # Runs TypeScript check + Vite build

# Preview production build
npm run preview

# Linting
npm run lint
```

## 🌐 Route Structure

### Route Configuration

Routes are defined in [Frontend/src/routes/routes.tsx](../../Frontend/src/routes/routes.tsx):

```tsx
<Routes>
  {/* Public routes */}
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  
  {/* PROFISSIONAL routes */}
  <Route
    path="/profissional/dashboard"
    element={
      <ProtectedRoute allowedRoles={['PROFISSIONAL']}>
        <Dashboard />
      </ProtectedRoute>
    }
  />
  
  {/* RESPONSAVEL routes */}
  <Route
    path="/responsavel/dashboard"
    element={
      <ProtectedRoute allowedRoles={['RESPONSAVEL']}>
        <Dashboard />
      </ProtectedRoute>
    }
  />
</Routes>
```

### Navigation

Use `useNavigate` hook for programmatic navigation:

```tsx
import { useNavigate } from 'react-router-dom'

function SomeComponent() {
  const navigate = useNavigate()
  
  const handleSuccess = () => {
    navigate('/profissional/dashboard')
  }
  
  return <button onClick={handleSuccess}>Go to Dashboard</button>
}
```

Use `Link` component for declarative navigation:

```tsx
import { Link } from 'react-router-dom'

function Navigation() {
  return (
    <nav>
      <Link to="/profissional/criancas">Crianças</Link>
      <Link to="/profissional/metas">Metas</Link>
    </nav>
  )
}
```

## ⚙️ Environment Variables

Create `.env` file in Frontend root:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Optional: Enable debug mode
VITE_DEBUG=true
```

**Accessing environment variables:**
```tsx
const API_URL = import.meta.env.VITE_API_URL
```

**Important:** All Vite env variables must be prefixed with `VITE_`

## 🧪 Testing (Future Implementation)

**Recommended testing setup:**
- **Vitest** for unit tests (Vite-native)
- **React Testing Library** for component tests
- **MSW** (Mock Service Worker) for API mocking

**Example test structure:**
```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    screen.getByText('Click me').click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## 📚 Resources and Documentation

- **React Docs:** https://react.dev
- **Vite Docs:** https://vitejs.dev
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Shadcn UI:** https://ui.shadcn.com
- **React Router:** https://reactrouter.com
- **Tanstack Query:** https://tanstack.com/query/latest
- **React Hook Form:** https://react-hook-form.com
- **Zod:** https://zod.dev

## ✅ Checklist for Creating New Features

- [ ] Create feature folder in `src/features/` or `src/pages/`
- [ ] Define TypeScript types/interfaces
- [ ] Create API functions in `src/api/protected/`
- [ ] Create custom hooks for business logic
- [ ] Implement UI components with Tailwind
- [ ] Add form validation with Zod (if applicable)
- [ ] Use Tanstack Query for server state management
- [ ] Implement proper error handling with notifications
- [ ] Add loading states and skeletons
- [ ] Protect routes with `ProtectedRoute` if needed
- [ ] Test responsiveness (mobile, tablet, desktop)
- [ ] Check TypeScript compilation (`npm run build`)
- [ ] Ensure no console errors or warnings

## 🚨 Common Pitfalls

1. **Forgetting to use `withCredentials: true`**: The axios client must send cookies with every request. This is already configured in `apiClient.ts`, but be careful not to override it.

2. **Not using Tanstack Query for server state**: Always use `useQuery` for fetching data and `useMutation` for data modifications. Never use `useState` + `useEffect` for API calls.

3. **Inline styles instead of Tailwind**: Always use Tailwind utility classes. Avoid `style={{ ... }}` unless absolutely necessary.

4. **Not handling loading and error states**: Every API call should have proper loading indicators and error messages.

5. **Hardcoding API URLs**: Always use environment variables (`import.meta.env.VITE_API_URL`).

6. **Not using TypeScript properly**: Avoid `any` type. Always define proper interfaces and types.

7. **Creating duplicate UI components**: Always check `src/components/ui/` before creating new UI components. Reuse existing components.

8. **Manual form state management**: Use `react-hook-form` instead of manual `useState` for form fields.

9. **Not invalidating queries after mutations**: Always use `queryClient.invalidateQueries()` after successful mutations to refresh cached data.

10. **Route protection on the client side only**: Route protection on the frontend is for UX only. The backend must always validate permissions.

## 🎯 Performance Best Practices

### 1. Code Splitting
```tsx
import { lazy, Suspense } from 'react'

// Lazy load heavy components
const Dashboard = lazy(() => import('./pages/Profissional/Dashboard'))

function App() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <Dashboard />
    </Suspense>
  )
}
```

### 2. Memoization
```tsx
import { useMemo, useCallback } from 'react'

function ExpensiveComponent({ data }) {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => /* expensive operation */)
  }, [data])
  
  // Memoize callbacks
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])
  
  return <div onClick={handleClick}>{processedData}</div>
}
```

### 3. Tanstack Query Optimization
```tsx
// Configure staleTime and cacheTime
const { data } = useQuery({
  queryKey: ['criancas'],
  queryFn: buscarCriancas,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
})

// Prefetch data for better UX
const queryClient = useQueryClient()
queryClient.prefetchQuery({
  queryKey: ['crianca', id],
  queryFn: () => buscarCriancaPorId(id),
})
```

### 4. Image Optimization
```tsx
// Use proper image formats and sizes
<img
  src="/images/avatar.webp"
  alt="Avatar"
  loading="lazy"
  width={200}
  height={200}
/>
```

---

**ConectaTEA Frontend** - Built with React, TypeScript, and Vite 💙

Always keep code clean, typed, and performant. When in doubt, refer to existing files as reference.
