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
    <div className="space-y-8">
      <section className="card-fire">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">
              Dashboard
            </span>
            <h1 className="text-3xl font-semibold text-slate-900">
              Hola {user?.name ?? 'usuario'},
            </h1>
            <p className="text-sm leading-relaxed text-slate-600">
              Revisa tus tarjetas y valida los datos sensibles utilizando el token temporal <strong>123456</strong>.
              Los accesos expiran automaticamente para mantener la demo segura.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn-outline text-sm focus-visible:ring-offset-[#FDF6EC]"
          >
            Cerrar sesion
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-inner shadow-white/40">
            <p className="text-xs uppercase tracking-[0.35em] text-orange-500">Estado</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">Sesion activa</p>
            <p className="text-xs text-slate-500">Protegida por token temporal</p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-inner shadow-white/40">
            <p className="text-xs uppercase tracking-[0.35em] text-orange-500">Tarjetas</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">1 demo</p>
            <p className="text-xs text-slate-500">Actualiza los datos en tiempo real</p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-inner shadow-white/40">
            <p className="text-xs uppercase tracking-[0.35em] text-orange-500">Countdown</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">30 segundos</p>
            <p className="text-xs text-slate-500">Los datos visibles se ocultan despues</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <CreditCardItem />

        <aside className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-orange-100/40 backdrop-blur-xl">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recomendaciones rapidas</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Utiliza el boton <em>Mostrar datos</em> para iniciar el flujo protegido. Si el token expira, puedes
              solicitar uno nuevo sin perder la sesion.
            </p>
          </div>
          <div className="rounded-2xl bg-orange-50/70 p-4 text-sm text-orange-700 shadow-inner shadow-orange-100">
            <p className="font-semibold">Tip de seguridad</p>
            <p className="mt-1 leading-relaxed">
              El token simula un OTP de un solo uso. En una integracion real deberias invalidarlo al primer uso o al
              expirar el countdown.
            </p>
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-400" />
              Los interceptores de Axios renuevan tokens automaticamente.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-400" />
              El estado se mantiene con cookies httpOnly y persistencia local.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-400" />
              Puedes extender la demo con tarjetas y transacciones reales.
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
