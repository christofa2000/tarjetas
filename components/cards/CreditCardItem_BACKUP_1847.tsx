'use client';

<<<<<<< HEAD
import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { detectCardBrand, isValidLuhn } from '@/lib/cardUtils';

interface CreditCardItemProps {
  cardName?: string;
  cardNumber?: string;
  cardholder?: string;
  expiration?: string;
=======
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';

const TOKEN_CODE = '123456';
const COUNTDOWN_SECONDS = 20;

interface CreditCardItemProps {
  cardName?: string;
  cardNumber?: string | null;
  cardholder?: string | null;
  expiration?: string | null;
  brand?: string | null;
>>>>>>> 6f0aeead562ad2fa2b06a2d55c69f724dc3e69ea
}

const normalizeDigits = (value?: string | null) => (value ?? '').replace(/\D/g, '');

const groupIntoChunks = (value: string) => value.match(/.{1,4}/g)?.join(' ') ?? value;

<<<<<<< HEAD
=======
const formatCardNumber = (value?: string | null) => {
  const digits = normalizeDigits(value);
  if (!digits) {
    return '---- ---- ---- ----';
  }
  return groupIntoChunks(digits.padEnd(16, '0').slice(0, 16));
};

>>>>>>> 6f0aeead562ad2fa2b06a2d55c69f724dc3e69ea
const maskCardNumber = (value?: string | null) => {
  const digits = normalizeDigits(value);

  if (!digits) {
    return '**** **** **** ****';
  }
<<<<<<< HEAD

  const maskedDigits = `${digits.slice(0, -4).replace(/./g, '*')}${digits.slice(-4)}`;
  return groupIntoChunks(maskedDigits);
=======
  const masked = digits
    .padEnd(16, '*')
    .split('')
    .map((char, index) => (index < Math.max(0, digits.length - 4) ? '*' : char))
    .join('');
  return groupIntoChunks(masked.slice(0, 16));
>>>>>>> 6f0aeead562ad2fa2b06a2d55c69f724dc3e69ea
};

// Lazy load del modal para que la tarjeta se renderice rapido en el dashboard.
const ValidationModal = dynamic(() => import('./ValidationModal'));

const CreditCardItem = ({
  cardName = 'Visa Gold',
  cardNumber = '4111111111111111',
<<<<<<< HEAD
  cardholder = 'Juan Perez',
=======
  cardholder = 'Juan Pérez',
>>>>>>> 6f0aeead562ad2fa2b06a2d55c69f724dc3e69ea
  expiration = '12/26',
}: CreditCardItemProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

<<<<<<< HEAD
  const formattedCardNumber = useMemo(
    () => groupIntoChunks(normalizeDigits(cardNumber)),
    [cardNumber],
  );
  const maskedCardNumber = useMemo(() => maskCardNumber(cardNumber), [cardNumber]);
  const brand = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);
  const isCardNumberValid = useMemo(() => isValidLuhn(cardNumber), [cardNumber]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleValidationSuccess = () => {
    setShowSensitiveData(true);
    setIsModalOpen(false);

    // Ocultar los datos sensibles luego de 30 segundos.
    setTimeout(() => setShowSensitiveData(false), 30_000);
  };

  return (
    <>
      <div className="flex w-full max-w-sm flex-col rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{brand}</p>
            <h2 className="mt-1 text-2xl font-semibold">{cardName}</h2>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-widest text-slate-200">
=======
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
>>>>>>> 6f0aeead562ad2fa2b06a2d55c69f724dc3e69ea
            {showSensitiveData ? 'Datos visibles' : 'Datos ocultos'}
          </span>
        </header>

<<<<<<< HEAD
        <div className="mt-8 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-slate-400">Numero</span>
              {!isCardNumberValid && (
                <span className="text-xs font-medium text-amber-400">Numero invalido</span>
              )}
            </div>
=======
        <div className="space-y-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-slate-200/70">Número</span>
>>>>>>> 6f0aeead562ad2fa2b06a2d55c69f724dc3e69ea
            <p className="mt-1 font-mono text-xl tracking-widest">
              {showSensitiveData ? formattedCardNumber : maskedCardNumber}
            </p>
          </div>
<<<<<<< HEAD
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-slate-400">Titular</span>
              <p className="mt-1 text-lg font-medium">{showSensitiveData ? cardholder : '**** ****'}</p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase tracking-widest text-slate-400">Vence</span>
              <p className="mt-1 font-mono text-lg">{showSensitiveData ? expiration : '**/**'}</p>
=======

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
>>>>>>> 6f0aeead562ad2fa2b06a2d55c69f724dc3e69ea
            </div>
          </div>
        </div>

<<<<<<< HEAD
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          aria-label="Mostrar datos sensibles de la tarjeta"
        >
=======
        <button type="button" onClick={handleOpenModal} className="btn-primary text-sm">
>>>>>>> 6f0aeead562ad2fa2b06a2d55c69f724dc3e69ea
          Mostrar datos
        </button>
      </div>

      {isModalOpen && (
<<<<<<< HEAD
        <ValidationModal isOpen={isModalOpen} onClose={handleCloseModal} onSuccess={handleValidationSuccess} />
=======
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
>>>>>>> 6f0aeead562ad2fa2b06a2d55c69f724dc3e69ea
      )}
    </>
  );
};

export default CreditCardItem;
