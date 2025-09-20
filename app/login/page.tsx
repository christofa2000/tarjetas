'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(4, 'Mínimo 4 caracteres'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      // Mock API login (ya lo armamos en app/api/auth/login/route.ts)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        setError('root', { message: 'Credenciales inválidas' });
        return;
      }

      router.replace(next);
    } catch {
      setError('root', { message: 'Error de red. Intentá de nuevo.' });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 mt-8">
      <h1 className="text-2xl font-bold mb-4">Ingresar</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <input
            className="w-full border rounded p-2"
            placeholder="Email"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            className="w-full border rounded p-2"
            placeholder="Contraseña"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {errors.root?.message && (
          <p className="text-red-600 text-sm">{errors.root.message}</p>
        )}

        <button
          disabled={isSubmitting}
          className="w-full rounded bg-slate-900 text-white py-2"
        >
          {isSubmitting ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>

      <p className="text-xs text-slate-500 mt-4">
        * Demo: cualquier email/contraseña funciona (mock).
      </p>
    </div>
  );
}
