//Nesse algoritmo eu irei desenvolver as ligações com frontend e backend no que se refere ao login, registro, logout.

// authApi.ts
import { api } from "./apiClient"; // NOVO ARQUIVO PARA QUEBRAR CACHE DEFINITIVAMENTE

// Tipagem opcional do retorno do login
interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;  // O backend retorna 'name', não 'nome'
    email: string;
    tipo: string;  // O backend retorna 'tipo', não 'tipoUsuario'
  };
}

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post<AuthResponse>("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    throw error;
  }
};

export const register = async (
  nome: string,
  email: string,
  senha: string,
  tipoUsuario: string
) => {
  try {
    const response = await api.post("/users/register", {
      name: nome,
      email: email.trim(),
      password: senha,
      tipo: tipoUsuario.toUpperCase(),
    });
    return response.data;
  } catch (error: any) {
    console.error("Erro ao registrar usuário:", error);
    
    // Melhor tratamento de erros baseado no status HTTP
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'Erro desconhecido';
      
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
