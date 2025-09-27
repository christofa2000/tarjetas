'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from 'react';

const COUNTDOWN_SECONDS = 20;

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const validatePasswordOnServer = async (password: string): Promise<{ success: boolean }> => {
  // Simula una llamada a backend. En modo demo aceptamos cualquier password.
  console.log(`Simulando validacion en el servidor para: "${password}"`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
};

const useCountdown = (isOpen: boolean, onTimeout: () => void) => {
  const [remainingTime, setRemainingTime] = useState(COUNTDOWN_SECONDS);
  const intervalRef = useRef<number | null>(null);

  const clearCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      clearCountdown();
      setRemainingTime(COUNTDOWN_SECONDS);
      return;
    }

    setRemainingTime(COUNTDOWN_SECONDS);
    intervalRef.current = window.setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearCountdown();
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearCountdown;
  }, [isOpen, onTimeout]);

  return { remainingTime, reset: () => setRemainingTime(COUNTDOWN_SECONDS) };
};

const ValidationModal = ({ isOpen, onClose, onSuccess }: ValidationModalProps) => {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'info' | 'error' | 'success'; message: string }>({
    type: 'info',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTimeout = useCallback(() => {
    setStatus({ type: 'error', message: 'Tiempo agotado. Intentalo de nuevo.' });
    setIsSubmitting(false);
  }, []);

  const { remainingTime, reset } = useCountdown(isOpen, handleTimeout);

  const handleClose = () => {
    onClose();
    setPassword('');
    setStatus({ type: 'info', message: '' });
    setIsSubmitting(false);
    reset();
  };

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setStatus({ type: 'info', message: '' });
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting || remainingTime <= 0) {
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: 'info', message: 'Validando...' });

    const { success } = await validatePasswordOnServer(password);

    if (success) {
      setStatus({ type: 'success', message: 'Contrasena validada. Mostrando datos...' });
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1200);
      return;
    }

    setStatus({ type: 'error', message: 'Contrasena incorrecta.' });
    setIsSubmitting(false);
  };

  const statusClassName =
    status.type === 'success' ? 'text-emerald-500' :
    status.type === 'error' ? 'text-rose-500' :
    'text-slate-600';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onClick={handleClose}
      hidden={!isOpen}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="dialog-title" className="text-lg font-semibold text-slate-900">
          Ingresa tu contrasena
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Para proteger tu informacion necesitamos validar tu identidad.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="text-sm font-medium text-slate-600">Tiempo restante: {remainingTime}s</div>

          <input
            autoFocus
            type="password"
            maxLength={64}
            value={password}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-lg tracking-widest outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
            placeholder="******"
            disabled={isSubmitting}
          />

          {status.message && <p className={`text-sm font-medium ${statusClassName}`}>{status.message}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!password || remainingTime <= 0 || isSubmitting}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition enabled:hover:bg-emerald-400 enabled:focus-visible:outline-none enabled:focus-visible:ring-2 enabled:focus-visible:ring-emerald-200 enabled:focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {isSubmitting ? 'Validando...' : 'Validar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ValidationModal;
