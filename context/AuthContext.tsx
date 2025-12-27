
// context/AuthContext.tsx
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, AuthContextType, ApiResponse } from '../types';
import { backendApi } from '../services/backendApi';
import { useNavigate } from 'react-router-dom';
import { load } from '@fingerprintjs/fingerprintjs';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Helper to check both persistent and session-only storage
  const getToken = (): string | null => localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
  
  const setToken = (token: string, remember: boolean) => {
    if (remember) {
      localStorage.setItem('jwt_token', token);
    } else {
      sessionStorage.setItem('jwt_token', token);
    }
  };

  const removeToken = () => {
    localStorage.removeItem('jwt_token');
    sessionStorage.removeItem('jwt_token');
  };

  const fetchUserProfile = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const response: ApiResponse<User> = await backendApi.getProfile(token);
      if (response.success) {
        setUser(response.data);
        return true;
      } else {
        setError(response.message || 'Failed to fetch user profile.');
        removeToken();
        setUser(null);
        return false;
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('An unexpected error occurred while fetching user profile.');
      removeToken();
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  const login = useCallback(async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response: ApiResponse<User> = await backendApi.login(email, password);
      if (response.success) {
        setToken(response.token as string, rememberMe);
        setUser(response.data as User);
        setError(null);
        navigate(response.data?.isAdmin ? '/admin/dashboard' : '/generator'); 
        return true;
      } else {
        setError(response.message || 'Login failed.');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred during login.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const signup = useCallback(async (name: string, email: string, password: string, country: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Initialize fingerprint
      const fp = await load();
      const { visitorId } = await fp.get();
      
      const response: ApiResponse<User> = await backendApi.register(name, email, password, country, visitorId);
      
      if (response.success) {
        // Signup usually follows the "remember" path to avoid immediate re-login
        setToken(response.token as string, true);
        setUser(response.data as User);
        setError(null);
        navigate('/generator');
        return true;
      } else {
        setError(response.message || 'Signup failed.');
        return false;
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred during signup.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    const token = getToken();
    if (token) {
      backendApi.logout(token);
    }
    removeToken();
    setUser(null);
    setError(null);
    navigate('/login');
  }, [navigate]);

  const updateUserCredits = useCallback((newCredits: number) => {
    setUser((prevUser) => (prevUser ? { ...prevUser, credits: newCredits } : null));
  }, []);

  const isAuthenticated = !!user;

  const value = {
    user,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUserCredits,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
