"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

// Configure Axios defaults
axios.defaults.baseURL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
axios.defaults.withCredentials = true;

// Interfaces
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string; // Optional as per previous User model
  roles: string[];
  avatar?: string; // Optional
  initials?: string; // Optional
  name?: string; // Optional, often derived
}

export interface AuthContextType {
  user: User | null;
  token: string | null; // Added token state
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  // fetchUser is internal, no need to expose if loadUserOnMount handles it
}

// Create AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch user profile using a token
  const fetchUserProfile = async (jwt: string) => {
    try {
      const { data } = await axios.get("/api/users/profile", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setUser(data);
      setIsAuthenticated(true);
      setError(null);
    } catch (err: any) {
      // on 401 we simply force logout; on other errors, show them
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        // token expired or invalid → clear it
      } else {
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.message || "Failed to fetch profile"
            : "Unknown error"
        );
      }
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
      // whether we had a token or not, the check is done
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials: any) => {
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
    } catch (err: any) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Login failed"
          : "Unexpected login error"
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      // Assuming registration does not auto-login.
      // If it does, this logic needs to mirror login success (set token, user, etc.)
      await axios.post("/api/auth/register", userData);
      // Potentially: toast.success("Registration successful! Please login.");
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Registration failed");
      } else {
        setError("An unexpected error occurred during registration.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.post("/api/auth/logout"); // Backend logout
    } catch (err: any) {
      // Log error but proceed with client-side logout anyway
      console.error("Logout API call failed:", err);
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Logout failed on server, logged out locally."
        );
      } else {
        setError(
          "An unexpected error occurred during server logout, logged out locally."
        );
      }
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

// useAuth Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
