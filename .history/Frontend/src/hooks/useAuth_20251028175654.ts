import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { checkAuth } from '../api/authApi';

interface User {
  id: number;
  name: string;
  email: string;
  tipo: 'PROFISSIONAL' | 'RESPONSAVEL';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = async () => {
    try {
      const userData = await checkAuth();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    setUser,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useRole = () => {
  const { user } = useAuth();
  return {
    isProfissional: user?.tipo === 'PROFISSIONAL',
    isResponsavel: user?.tipo === 'RESPONSAVEL',
    userType: user?.tipo,
  };
};