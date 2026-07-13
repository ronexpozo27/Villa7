import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../api/authApi';
import type { RolUsuario } from '../types';

interface UsuarioInfo {
  nombre: string;
  correo: string;
  rol: RolUsuario;
}

interface AuthContextType {
  usuario: UsuarioInfo | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (correo: string, contrasenia: string) => Promise<void>;
  register: (nombre: string, correo: string, contrasenia: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<UsuarioInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial check for credentials stored in localStorage
    const savedToken = localStorage.getItem('accessToken');
    const savedUsuario = localStorage.getItem('usuario');

    if (savedToken && savedUsuario) {
      try {
        setAccessToken(savedToken);
        setUsuario(JSON.parse(savedUsuario));
      } catch (e) {
        // Corrupted localStorage, clear it
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('usuario');
      }
    }
    setIsLoading(false);

    // Listen for logout events from the axios client (e.g. refresh token expired)
    const handleAuthLogout = () => {
      logout();
    };

    window.addEventListener('auth-logout', handleAuthLogout);
    return () => {
      window.removeEventListener('auth-logout', handleAuthLogout);
    };
  }, []);

  const login = async (correo: string, contrasenia: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(correo, contrasenia);
      setAccessToken(response.accessToken);
      setUsuario(response.usuario);

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('usuario', JSON.stringify(response.usuario));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (nombre: string, correo: string, contrasenia: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(nombre, correo, contrasenia);
      setAccessToken(response.accessToken);
      setUsuario(response.usuario);

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('usuario', JSON.stringify(response.usuario));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAccessToken(null);
    setUsuario(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuario');
  };

  return (
    <AuthContext.Provider value={{ usuario, accessToken, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
