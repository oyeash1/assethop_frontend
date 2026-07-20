// src/core/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { authStore } from '../store/auth.store';
import { api } from '../api/client';

export function useAuth() {
  const [state, setState] = useState(() => {
    const authData = authStore.get();
    return {
      user: authData?.user || null,
      cibil: authStore.getCibil()
    };
  });

  useEffect(() => {
    const unsubscribe = authStore.subscribe((newData) => {
      setState(newData);
    });
    return unsubscribe;
  }, []);

  const login = (userData) => {
    authStore.set({ user: userData });
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout API Error:', err);
    } finally {
      authStore.clear();
    }
  };

  const setCibil = (score) => {
    authStore.setCibil(score);
  };

  const updateUser = (newUserData) => {
    const authData = authStore.get();
    authStore.set({ ...authData, user: { ...(authData?.user || {}), ...newUserData } });
  };

  return {
    ...state,
    isAuthenticated: !!state.user,
    login,
    logout,
    setCibil,
    updateUser
  };
}
