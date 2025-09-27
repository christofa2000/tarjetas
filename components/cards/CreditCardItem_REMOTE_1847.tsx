'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';

const TOKEN_CODE = '123456';
const COUNTDOWN_SECONDS = 20;

interface CreditCardItemProps {
  cardName?: string;
  cardNumber?: string | null;
  cardholder?: string | null;
  expiration?: string | null;
  brand?: string | null;
}

const normalizeDigits = (value?: string | null) => (value ?? '').replace(/\D/g, '');

const groupIntoChunks = (value: string) => value.match(/.{1,4}/g)?.join(' ') ?? value;

const formatCardNumber = (value?: string | null) => {
  const digits = normalizeDigits(value);
  if (!digits) {
    return '---- ---- ---- ----';
  }
  return groupIntoChunks(digits.padEnd(16, '0').slice(0, 16));
};

const maskCardNumber = (value?: string | null) => {
  const digits = normalizeDigits(value);
  if (!digits) {
    return '**** **** **** ****';
  }
  const masked = digits
    .padEnd(16, '*')
    .split('')
    .map((char, index) => (index < Math.max(0, digits.length - 4) ? '*' : char))
    .join('');
  return groupIntoChunks(masked.slice(0, 16));
};

const CreditCardItem = ({
  cardName = 'Visa Gold',
  cardNumber = '4111111111111111',
  cardholder = 'Juan Pérez',
  expiration = '12/26',
  brand = 'Visa',
}: CreditCardItemProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = useState('');
  const [remainingTime, setRemainingTime] = useState(COUNTDOWN_SECONDS);
  const [statusMessage, setStatusMessage] = useState('');
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const countdownRef = useRef<number | null>(null);
  const autoCloseRef = useRef<number | null>(null);

  const formattedCardNumber = useMemo(() => formatCardNumber(cardNumber), [cardNumber]);
  const maskedCardNumber = useMemo(() => maskCardNumber(cardNumber), [cardNumber]);

  const cleanupTimers = useCallback(() => {
    if (countdownRef.current !== null) {
      window.clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (autoCloseRef.current !== null) {
      window.clearTimeout(autoCloseRef.current);
      autoCloseRef.current = null;
    }
  }, []);

  const resetModalState = useCallback(() => {
    setToken('');
    setStatusMessage('');
    setRemainingTime(COUNTDOWN_SECONDS);
    cleanupTimers();
  }, [cleanupTimers]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    resetModalState();
  }, [resetModalState]);

  const handleTokenChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setToken(event.target.value.replace(/[^0-9]/g, '').slice(0, 6));
  }, []);

  const handleOpenModal = useCallback(() => {
    setShowSensitiveData(false);
    setIsModalOpen(true);
  }, []);

  const handleTokenSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (remainingTime <= 0) {
        return;
      }

      if (token === TOKEN_CODE) {
        setStatusMessage('Token correcto. Mostrando datos...');
        setShowSensitiveData(true);
        cleanupTimers();
        autoCloseRef.current = window.setTimeout(() => {
          handleCloseModal();
        }, 1200);
      } else {
        setStatusMessage('Token inválido. Verifica e intenta de nuevo.');
      }
    },
    [cleanupTimers, handleCloseModal, remainingTime, token]
  );

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    setToken('');
    setStatusMessage('');
    setRemainingTime(COUNTDOWN_SECONDS);

    const intervalId = window.setInterval(() => {
      setRemainingTime((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          countdownRef.current = null;
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    countdownRef.current = intervalId;

    return () => {
      cleanupTimers();
    };
  }, [cleanupTimers, isModalOpen]);

  useEffect(() => {
    if (!isModalOpen || remainingTime > 0) {
      return;
    }

    setStatusMessage('Token inválido (tiempo agotado).');
    autoCloseRef.current = window.setTimeout(() => {
      handleCloseModal();
    }, 1000);
  }, [handleCloseModal, isModalOpen, remainingTime]);

  const statusClassName = statusMessage.startsWith('Token correcto') ? 'text-emerald-500' : 'text-rose-500';

  return (
    <>
      <div className="card-fire max-w-md space-y-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-200/70">
              {brand ?? 'Tarjeta'}
            </p>
            <h2 className="mt-1 text-2xl font-semibold">{cardName ?? 'Tarjeta sin nombre'}</h2>
          </div>
          <span className="badge-premium text-xs">
            {showSensitiveData ? 'Datos visibles' : 'Datos ocultos'}
          </span>
        </header>

        <div className="space-y-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-slate-200/70">Número</span>
            <p className="mt-1 font-mono text-xl tracking-widest">
              {showSensitiveData ? formattedCardNumber : maskedCardNumber}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-slate-200/70">Titular</span>
              <p className="mt-1 text-lg font-medium">
                {showSensitiveData ? cardholder ?? 'Sin titular' : '**** ****'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase tracking-widest text-slate-200/70">Vencimiento</span>
              <p className="mt-1 font-mono text-lg">
                {showSensitiveData ? expiration ?? '--/--' : '**/**'}
              </p>
            </div>
          </div>
        </div>

        <button type="button" onClick={handleOpenModal} className="btn-primary text-sm">
          Mostrar datos
        </button>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900">Introduce el token</h3>
            <p className="mt-2 text-sm text-slate-600">
              Tienes {remainingTime}s para validar tu identidad con el token 123456.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleTokenSubmit}>
              <input
                autoFocus
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={token}
                onChange={handleTokenChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-lg tracking-widest outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                placeholder="123456"
                disabled={remainingTime <= 0}
              />

              {statusMessage && (
                <p className={`text-sm font-medium ${statusClassName}`}>{statusMessage}</p>
              )}

              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Tiempo restante: {remainingTime}s</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-outline text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!token || remainingTime <= 0}
                  className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Validar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreditCardItem;
