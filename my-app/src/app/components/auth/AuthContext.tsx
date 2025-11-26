"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import jwt from 'jsonwebtoken';

interface Seller {
  seller_id: string;
  email: string;
  name: string;
  bio?: string | null;
  profile_image?: string | null;
  birthday?: string | null;
  created_at: string;
}

interface AuthContextType {
  user: Seller | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Seller | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt.decode(token) as any;
        if (decoded && decoded.exp * 1000 > Date.now()) {
          setUser({
            seller_id: decoded.sellerId,
            email: decoded.email,
            name: decoded.name,
            bio: null,
            profile_image: null,
            birthday: null,
            created_at: new Date().toISOString()
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Token decode error:', error);
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { token, seller } = await response.json();
        localStorage.setItem('token', token);
        setUser(seller);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};