'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/lib/authStore';

const CreditCardItem = dynamic(() => import('@/components/cards/CreditCardItem'), {
  ssr: false,
  loading: () => <p>Cargando...</p>,
});

export default function DashboardPage() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <div className="mt-8 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <CreditCardItem />

      <button
        onClick={handleLogout}
        className="rounded bg-slate-900 px-4 py-2 text-white"
      >
        Cerrar sesion
      </button>
    </div>
  );
}
