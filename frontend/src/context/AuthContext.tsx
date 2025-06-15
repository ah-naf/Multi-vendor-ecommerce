"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios, { AxiosError } from "axios";
import { LoginCredentials, RegistrationData } from "@/types";

axios.defaults.baseURL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
axios.defaults.withCredentials = true;

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: string[];
  avatar?: string;
  initials?: string;
  name?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegistrationData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async (jwt: string) => {
    try {
      const { data } = await axios.get("/api/users/profile", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setUser(data);
      setIsAuthenticated(true);
      setError(null);
    } catch (err: unknown) {
      let errorMessage = "An unknown error occurred";
      if (axios.isAxiosError(err)) {
        errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch profile";
        if (err.response?.status === 401) {
          localStorage.removeItem("jwtToken");
          delete axios.defaults.headers.common["Authorization"];
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setError(null);
          setIsLoading(false);
          return;
        }
      } else if (err && typeof err === "object" && "message" in err) {
        errorMessage = (err as { message: string }).message;
      }
      setError(errorMessage);
      localStorage.removeItem("jwtToken");
      delete axios.defaults.headers.common["Authorization"];
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const saved = localStorage.getItem("jwtToken");
      if (saved) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${saved}`;
        setToken(saved);
        await fetchUserProfile(saved);
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.post("/api/auth/login", credentials);
      const { token: jwt, user: me } = data;

      localStorage.setItem("jwtToken", jwt);
      axios.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
      setToken(jwt);
      setUser(me);
      setIsAuthenticated(true);
      window.location.href = "/";
    } catch (err: unknown) {
      let message = "An unexpected error occurred";
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || err.message || "Login failed";
      } else if (err && typeof err === "object" && "message" in err) {
        message = (err as Error).message;
      }
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegistrationData) => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.post("/api/auth/register", userData);
    } catch (err: unknown) {
      let message = "An unexpected error occurred during registration.";
      if (axios.isAxiosError(err)) {
        message =
          err.response?.data?.message || err.message || "Registration failed";
      } else if (err && typeof err === "object" && "message" in err) {
        message = (err as Error).message;
      }
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.post("/api/auth/logout");
    } catch (err: unknown) {
      console.error("Logout API call failed:", err);
      let message =
        "An unexpected error occurred during server logout, logged out locally.";
      if (axios.isAxiosError(err)) {
        message =
          err.response?.data?.message ||
          err.message ||
          "Logout failed on server, logged out locally.";
      } else if (err && typeof err === "object" && "message" in err) {
        message = (err as Error).message;
      }
      setError(message);
    } finally {
      localStorage.removeItem("jwtToken");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const contextValue = {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
