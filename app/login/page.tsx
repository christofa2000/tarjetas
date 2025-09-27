'use client';

import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuthStore from '@/lib/authStore';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(4, 'Mínimo 4 caracteres'),
});

type FormValues = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard';

  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      await login(data.email, data.password);
      router.replace(next);
    } catch {
      setError('root', { message: 'No se pudo iniciar sesión. Intenta de nuevo.' });
    }
  };

  return (
    <div className="mt-10 flex justify-center">
      <div className="card-fire w-full max-w-md space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold">Ingresa a tu cuenta</h1>
          <p className="text-sm text-black/80">
            Demo: cualquier email y contraseña son válidos. Guarda el token 123456 para las tarjetas.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-100">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-xl border border-white/30 bg-white/70 px-3 py-2 text-slate-900 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="demo@correo.com"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-black/80">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-black/80">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-xl border border-white/30 bg-white/70 px-3 py-2 text-slate-900 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="******"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-rose-200">{errors.password.message}</p>
            )}
          </div>

          {errors.root?.message && (
            <p className="text-sm text-black/80">{errors.root.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mt-10 text-center text-black/80">Cargando formulario...</div>}>
      <LoginForm />
    </Suspense>
  );
}
