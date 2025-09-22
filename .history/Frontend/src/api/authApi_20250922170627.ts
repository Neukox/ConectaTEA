//Nesse algoritmo eu irei desenvolver as ligações com frontend e backend no que se refere ao login, registro, logout.

// authApi.ts
import { api } from "./apiClient";
import { AxiosError } from "axios";

// Tipagem do retorno do login
interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    tipo: string;
  };
}

// Tipagem do retorno do registro
interface RegisterResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    tipo: string;
  };
}

// Tipagem do erro do servidor
interface ServerError {
  message: string;
  statusCode?: number;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/login", { 
      email: email.trim(), 
      password 
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const message = (error.response?.data as ServerError)?.message || 'Erro desconhecido';
      
      switch (status) {
        case 401:
          throw new Error('Email ou senha incorretos.');
        case 400:
          throw new Error(message || 'Dados inválidos. Verifique os campos e tente novamente.');
        case 500:
          throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
        default:
          throw new Error(`Erro ${status}: ${message}`);
      }
    }
    
    throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
  }
};

export const register = async (
  nome: string,
  email: string,
  senha: string,
  tipoUsuario: string
): Promise<RegisterResponse> => {
  try {
    // Validações básicas no frontend
    if (!nome?.trim()) {
      throw new Error('Nome é obrigatório');
    }
    
    if (!email?.trim()) {
      throw new Error('Email é obrigatório');
    }
    
    if (!senha || senha.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }
    
    if (!tipoUsuario?.trim()) {
      throw new Error('Tipo de usuário é obrigatório');
    }

    // Validação de email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error('Email inválido');
    }

    const response = await api.post("/users/register", {
      name: nome.trim(),
      email: email.trim().toLowerCase(),
      password: senha,
      tipo: tipoUsuario.toUpperCase(),
    });
    
    return response.data;
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    
    // Se é um erro que já lançamos com validação
    if (error instanceof Error && !error.message.includes('Request failed')) {
      throw error;
    }
    
    // Tratamento de erros do servidor
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const message = (error.response?.data as ServerError)?.message || 'Erro desconhecido';
      
      switch (status) {
        case 409:
          throw new Error('Este email já está registrado. Tente fazer login ou use outro email.');
        case 400:
          throw new Error(message || 'Dados inválidos. Verifique os campos e tente novamente.');
        case 500:
          throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
        default:
          throw new Error(`Erro ${status}: ${message}`);
      }
    }
    
    // Erro de rede ou outro
    throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
  }
};
