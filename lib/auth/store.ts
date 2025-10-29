'use client';

import api from '@/lib/api/client';
import { AuthenticationError } from '@/lib/utils/errorHandler';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearTokens, loadTokensFromStorage, setTokens } from './token';
import type { AuthState, LoginResponse } from './types';

if (typeof window !== 'undefined') {
  loadTokensFromStorage();
}

const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      async login(email, password) {
        try {
          const { data } = await api.post<LoginResponse>('/api/auth/login', { email, password });
          const { user, accessToken, refreshToken, expiresAt } = data;

          if (!user || !accessToken || !refreshToken || typeof expiresAt !== 'number') {
            throw new AuthenticationError('Invalid login response');
          }

          setTokens(accessToken, refreshToken, expiresAt);
          set({ user });
        } catch (error) {
          // Re-throw como AuthenticationError si no lo es ya
          if (error instanceof AuthenticationError) {
            throw error;
          }
          throw new AuthenticationError(
            error instanceof Error ? error.message : 'Authentication failed'
          );
        }
      },
      async logout() {
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
      partialize: state => ({ user: state.user }),
    }
  )
);

export default useAuthStore;
export type { AuthState, User } from './types';
