'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/lib/authStore';

const CreditCardItem = dynamic(() => import('@/components/cards/CreditCardItem'), {
  ssr: false,
  loading: () => <p className="text-sm text-slate-200">Cargando...</p>,
});

export default function DashboardPage() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <div className="mt-8 space-y-6">
      <section className="card-fire">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">Hola {user?.name ?? 'usuario'},</h1>
            <p className="mt-1 text-sm text-black/80">
              Puedes consultar tus tarjetas y validar los datos sensibles con tu token temporal (123456).
            </p>
          </div>
          <button type="button" onClick={handleLogout} className="btn-outline text-sm">
            Cerrar sesion
          </button>
        </div>
      </section>

      <CreditCardItem />
    </div>
  );
}