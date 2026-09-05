import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../api/client';
import { toast } from 'sonner';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'student';
  phone?: string;
  university_id?: string;
  managed_hostels?: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('hostelos_token');
    
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await apiClient.get('/auth/me');
      setUser(data.data.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('hostelos_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('hostelos_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('hostelos_token');
    setUser(null);
    window.location.href = '/'; // Force redirect to login page
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
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
