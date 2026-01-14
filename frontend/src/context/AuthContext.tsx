import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { AuthResponse } from '../api/auth';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF';
  organizationId?: string;
  organizationName?: string;
  organization?: {
    id: string;
    name: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (organizationName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  organizationId: string | null;
  organizationName: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Initialize auth state from localStorage once on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      // This setState in effect is intentional for bootstrapping auth state
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (organizationName: string, email: string, password: string) => {
    try {
      const response: AuthResponse = await authApi.login({ organizationName, email, password });
      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      toast.success('Login successful!');
    } catch (error: any) {
      // Show specific error message
      let errorMessage = 'Login failed. Please check your organization name, email, and password.';
      
      if (error?.isNetworkError) {
        errorMessage = error.message || 'Cannot connect to backend server. Please make sure backend is running on http://localhost:4000';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'ADMIN',
        organizationId: user?.organizationId || null,
        organizationName: user?.organizationName || user?.organization?.name || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
