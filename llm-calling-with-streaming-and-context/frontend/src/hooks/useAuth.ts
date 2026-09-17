import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { fetchMe, loginUser, registerUser, logoutUser } from '../services/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await fetchMe();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, pass: string) => {
    const loggedIn = await loginUser(email, pass);
    setUser(loggedIn);
    setIsAuthModalOpen(false);
    return loggedIn;
  };

  const register = async (name: string, email: string, pass: string) => {
    const registered = await registerUser(name, email, pass);
    setUser(registered);
    setIsAuthModalOpen(false);
    return registered;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return {
    user,
    loading,
    isAuthModalOpen,
    setIsAuthModalOpen,
    login,
    register,
    logout,
    checkAuth,
  };
}
