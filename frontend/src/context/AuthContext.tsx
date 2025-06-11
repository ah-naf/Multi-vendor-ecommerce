"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Configure Axios defaults
axios.defaults.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
axios.defaults.withCredentials = true;

// Interfaces
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>; // Added fetchUser to the type
}

// Create AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/users/profile');
      setUser(response.data);
    } catch (err: any) {
      setUser(null);
      if (axios.isAxiosError(err) && err.response?.status !== 401) {
        // Don't set error for 401s during initial fetch, as it just means user is not logged in
        setError(err.response?.data?.message || 'Failed to fetch user');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/auth/login', credentials);
      setUser(response.data);
    } catch (err: any) {
      setUser(null);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Login failed');
      } else {
        setError('An unexpected error occurred during login.');
      }
      throw err; // Re-throw to allow components to handle it
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post('/api/auth/register', userData);
      // Optionally, log the user in directly or fetch user data after registration
      // For now, let's assume registration doesn't auto-login, user needs to login separately
      // Or, call fetchUser() if backend auto-logins or if you want to confirm registration by fetching profile
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Registration failed');
      } else {
        setError('An unexpected error occurred during registration.');
      }
      throw err; // Re-throw
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Logout failed');
      } else {
        setError('An unexpected error occurred during logout.');
      }
      // Even if logout API call fails, client-side state should reflect logout
      setUser(null);
      // throw err; // Optionally re-throw if components need to react to failed logout API call
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const contextValue = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    fetchUser, // Ensure fetchUser is part of the context value
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
