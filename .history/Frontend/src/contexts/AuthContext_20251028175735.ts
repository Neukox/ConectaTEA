import { createContext } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  tipo: 'PROFISSIONAL' | 'RESPONSAVEL';
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  refreshAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);