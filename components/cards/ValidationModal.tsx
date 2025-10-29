'use client';

import { APP_CONSTANTS } from '@/lib/constants/app';
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const validateTokenOnServer = async (token: string): Promise<{ success: boolean }> => {
  // Simula una llamada a backend. En modo demo solo aceptamos el token esperado.
  if (process.env.NODE_ENV === 'development') {
    // Solo loguear en desarrollo
    console.log(`[DEBUG] Validando token: "${token.substring(0, 3)}***"`);
  }
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: token === APP_CONSTANTS.AUTH.VALIDATION_TOKEN });
    }, 500);
  });
};

const useCountdown = (isOpen: boolean, onTimeout: () => void) => {
  const [remainingTime, setRemainingTime] = useState<number>(APP_CONSTANTS.AUTH.COUNTDOWN_SECONDS);
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
      setRemainingTime(APP_CONSTANTS.AUTH.COUNTDOWN_SECONDS);
      return;
    }

    setRemainingTime(APP_CONSTANTS.AUTH.COUNTDOWN_SECONDS);
    intervalRef.current = window.setInterval(() => {
      setRemainingTime(prev => {
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

  return { remainingTime, reset: () => setRemainingTime(APP_CONSTANTS.AUTH.COUNTDOWN_SECONDS) };
};

const ValidationModal = ({ isOpen, onClose, onSuccess }: ValidationModalProps) => {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<{ type: 'info' | 'error' | 'success'; message: string }>({
    type: 'info',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleTimeout = useCallback(() => {
    setStatus({ type: 'error', message: 'Tiempo agotado. Intenta de nuevo.' });
    setIsSubmitting(false);
  }, []);

  const { remainingTime, reset } = useCountdown(isOpen, handleTimeout);
  const progress = useMemo(
    () => Math.max(0, Math.round((remainingTime / APP_CONSTANTS.AUTH.COUNTDOWN_SECONDS) * 100)),
    [remainingTime]
  );

  const handleClose = () => {
    onClose();
    setToken('');
    setStatus({ type: 'info', message: '' });
    setIsSubmitting(false);
    reset();
  };

  // Focus trap y manejo de teclado
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus en el primer elemento al abrir
    firstElement.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscape);

    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setToken('');
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

    const { success } = await validateTokenOnServer(token);

    if (success) {
      setStatus({ type: 'success', message: 'Token validado. Mostrando datos...' });
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1200);
      return;
    }

    setStatus({ type: 'error', message: 'Token incorrecto.' });
    setIsSubmitting(false);
  };

  const statusClassName =
    status.type === 'success'
      ? 'text-emerald-500'
      : status.type === 'error'
      ? 'text-rose-500'
      : 'text-slate-600';

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-[modal-fade_220ms_ease-out]"
      onClick={handleClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        aria-live="polite"
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/40 bg-white/90 p-6 shadow-2xl shadow-orange-200/40 backdrop-blur-2xl animate-[modal-pop_240ms_cubic-bezier(0.16,1,0.3,1)]"
        onClick={event => event.stopPropagation()}
      >
        <div
          className="pointer-events-none absolute -top-20 right-[-3rem] h-44 w-44 rounded-full bg-gradient-to-br from-amber-200/60 via-orange-300/50 to-rose-300/60 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-[-4rem] h-44 w-44 rounded-full bg-gradient-to-br from-rose-200/60 via-orange-300/50 to-amber-200/60 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative space-y-2">
          <h3 id="dialog-title" className="text-lg font-semibold text-slate-900">
            Ingresa tu token
          </h3>
          <p id="dialog-description" className="text-sm leading-relaxed text-slate-600">
            Para proteger tu informacion necesitamos validar tu identidad con el token temporal de
            la sesion.
          </p>
        </div>

        <form className="relative mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">
              <span>Tiempo</span>
              <span>{remainingTime}s</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-slate-200/70"
              role="progressbar"
              aria-valuenow={remainingTime}
              aria-valuemin={0}
              aria-valuemax={APP_CONSTANTS.AUTH.COUNTDOWN_SECONDS}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 transition-all duration-200"
                style={{ width: `${progress}%` }}
                aria-hidden="true"
              />
            </div>
          </div>

          <input
            autoFocus
            type="password"
            maxLength={64}
            value={token}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setToken(event.target.value)}
            className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-lg tracking-[0.3em] text-slate-900 shadow-inner shadow-white/40 placeholder:text-slate-400 transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            placeholder="123456"
            disabled={isSubmitting}
            aria-describedby={status.message ? 'status-message' : undefined}
          />

          <div role="status" aria-live="polite" aria-atomic="true">
            {status.message && (
              <p id="status-message" className={`text-sm font-medium ${statusClassName}`}>
                {status.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-2xl border border-orange-200/70 bg-white/70 px-4 py-2 text-sm font-semibold text-orange-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FDF6EC]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!token || remainingTime <= 0 || isSubmitting}
              className="btn-primary whitespace-nowrap px-5 py-2 focus-visible:ring-offset-[#FDF6EC] disabled:cursor-not-allowed disabled:opacity-60"
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
