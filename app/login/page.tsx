'use client';

import useAuthStore from '@/lib/auth/store';
import { handleApiError } from '@/lib/utils/errorHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(4, 'Mínimo 4 caracteres'),
});

type FormValues = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') ?? '/dashboard';

  const login = useAuthStore(state => state.login);

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
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError('root', { message: errorMessage });
    }
  };

  const emailError = errors.email?.message;
  const passwordError = errors.password?.message;
  const emailErrorId = emailError ? 'email-error' : undefined;
  const passwordErrorId = passwordError ? 'password-error' : undefined;

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-10 shadow-2xl shadow-orange-200/40 backdrop-blur-2xl">
        <div
          className="pointer-events-none absolute -left-14 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-amber-300/70 via-orange-400/50 to-rose-400/60 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 right-[-3rem] h-48 w-48 rounded-full bg-gradient-to-br from-rose-300/60 via-orange-400/50 to-amber-300/60 blur-3xl"
          aria-hidden="true"
        />

        <header className="relative space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-100/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">
            Bienvenido
          </span>
          <h1 className="text-3xl font-semibold text-slate-900">Ingresa a tu cuenta demo</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Usa cualquier email y contrasena para iniciar sesion. Guarda el token temporal{' '}
            <strong>123456</strong> para revelar los datos sensibles de tus tarjetas.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="relative mt-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-slate-900 shadow-inner shadow-white/40 placeholder:text-slate-500 transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
              placeholder="demo@correo.com"
              autoComplete="email"
              aria-invalid={emailError ? 'true' : 'false'}
              aria-describedby={emailErrorId}
              {...register('email')}
            />
            {emailError && (
              <p id="email-error" role="alert" className="text-sm text-rose-500">
                {emailError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-slate-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-slate-900 shadow-inner shadow-white/40 placeholder:text-slate-500 transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
              placeholder="******"
              autoComplete="current-password"
              aria-invalid={passwordError ? 'true' : 'false'}
              aria-describedby={passwordErrorId}
              {...register('password')}
            />
            {passwordError && (
              <p id="password-error" role="alert" className="text-sm text-rose-500">
                {passwordError}
              </p>
            )}
          </div>

          {errors.root?.message && (
            <p role="alert" className="text-sm text-rose-500">
              {errors.root.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full focus-visible:ring-offset-[#FDF6EC] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="relative mt-6 text-center text-xs text-slate-500">
          Seguridad simulada: los tokens expiran automaticamente y puedes reintentar las veces que
          necesites.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="mt-10 text-center text-slate-500">Cargando formulario...</div>}
    >
      <LoginForm />
    </Suspense>
  );
}
