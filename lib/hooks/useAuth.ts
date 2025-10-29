'use client';

import useAuthStore from '@/lib/auth/store';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Hook personalizado para manejar autenticación
 * Proporciona una interfaz simplificada y optimizada del store
 */
export const useAuth = () => {
  const router = useRouter();

  const user = useAuthStore(state => state.user);
  const storeLogout = useAuthStore(state => state.logout);

  const logout = useCallback(async () => {
    await storeLogout();
    router.replace('/login');
  }, [storeLogout, router]);

  return {
    user,
    logout,
    isAuthenticated: !!user,
  };
};
