'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './axios';
import { setTokens, clearTokens, loadTokensFromStorage } from './token';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

type LoginResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

if (typeof window !== 'undefined') {
  loadTokensFromStorage();
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (email, password) => {
        const { data } = await api.post<LoginResponse>('/api/auth/login', { email, password });
        const { user, accessToken, refreshToken, expiresAt } = data;

        if (!user || !accessToken || !refreshToken || typeof expiresAt !== 'number') {
          throw new Error('Invalid login response');
        }

        setTokens(accessToken, refreshToken, expiresAt);
        set({ user });
      },
      logout: async () => {
        try {
          await api.post('/api/auth/logout');
        } finally {
          clearTokens();
          set({ user: null });
        }
      },
    }),
    {
      name: 'auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useAuthStore;
