import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getUser, getToken, setUser as saveUser, setToken as saveToken, logout as performLogout } from '../utils/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getUser());
  const [token, setToken] = useState<string | null>(getToken());

  useEffect(() => {
    setUser(getUser());
    setToken(getToken());
  }, []);

  const login = (newUser: User, newToken: string) => {
    saveUser(newUser);
    saveToken(newToken);
    setUser(newUser);
    setToken(newToken);
  };

  const logout = () => {
    performLogout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
