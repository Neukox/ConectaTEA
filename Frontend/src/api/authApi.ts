//Nesse algoritmo eu irei desenvolver as ligações com frontend e backend no que se refere ao login, registro, logout.
// ATUALIZADO PARA TRABALHAR COM COOKIES SEGUROS

// authApi.ts
import { api } from './apiClient'
import { getApiErrorMessage } from './errors'

export type UserRole = 'PROFISSIONAL' | 'RESPONSAVEL'

export interface AuthUser {
  id: number
  name: string
  email: string
  telefone?: string | null
  endereco?: string | null
  tipo: UserRole
}

// Tipagem do retorno do login (sem token, pois agora está no cookie)
interface AuthResponse {
  message: string
  user: AuthUser
}

// Tipagem do retorno do registro
interface RegisterResponse {
  message: string
  user: AuthUser
}

// Tipagem do retorno do logout
interface LogoutResponse {
  message: string
}

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/login", {
      email: email.trim(),
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Email ou senha incorretos.'))
  }
};

export const register = async (
  nome: string,
  email: string,
  senha: string,
  tipoUsuario: UserRole
): Promise<RegisterResponse> => {
  try {
    // Validações básicas no frontend
    if (!nome?.trim()) {
      throw new Error("Nome é obrigatório");
    }

    if (!email?.trim()) {
      throw new Error("Email é obrigatório");
    }

    if (!senha || senha.length < 8) {
      throw new Error('Senha deve ter pelo menos 8 caracteres')
    }

    if (!tipoUsuario?.trim()) {
      throw new Error("Tipo de usuário é obrigatório");
    }

    // Validação de email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error("Email inválido");
    }

    const response = await api.post("/users/register", {
      name: nome.trim(),
      email: email.trim().toLowerCase(),
      password: senha,
      tipo: tipoUsuario,
    });

    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Não foi possível criar a conta.'))
  }
};

export const logout = async (): Promise<LogoutResponse> => {
  try {
    const response = await api.post<LogoutResponse>("/auth/logout");

    return response.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Erro de conexão durante logout.'))
  }
};

// Nova função para verificar se o usuário está autenticado e obter seus dados
export const checkAuth = async (): Promise<AuthUser | null> => {
  try {
    const response = await api.get<AuthResponse>('/auth/me')
    return response.data.user
  } catch {
    return null
  }
}
