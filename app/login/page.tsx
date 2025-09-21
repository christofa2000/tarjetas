'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuthStore from '@/lib/authStore';

const schema = z.object({
  email: z.string().email('Email inv\u00E1lido'),
  password: z.string().min(4, 'M\u00EDnimo 4 caracteres'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
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
    } catch (error) {
      setError('root', { message: 'No se pudo iniciar sesi\u00F3n. Intenta de nuevo.' });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 mt-8">
      <h1 className="text-2xl font-bold mb-4">Ingresar</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <input
            className="w-full rounded border border-white/10 bg-white/90 text-slate-900 placeholder:text-slate-500 p-2"
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
            className="w-full rounded border border-white/10 bg-white/90 text-slate-900 placeholder:text-slate-500 p-2"
            placeholder="Contrase\u00F1a"
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
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="text-xs text-slate-500 mt-4">
        * Demo: cualquier email/contrase\u00F1a funciona (mock).
      </p>
    </div>
  );
}



