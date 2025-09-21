'use client';

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import useAuthStore from '@/lib/authStore';

const COUNTDOWN_SECONDS = 20;

interface CreditCardItemProps {
  cardName?: string;
  cardNumber?: string;
  cardholder?: string;
  expiration?: string;
  brand?: string;
}

const normalizeDigits = (value?: string | null) => (value ?? '').replace(/\D/g, '');

const groupIntoChunks = (value: string) => value.match(/.{1,4}/g)?.join(' ') ?? value;

const formatCardNumber = (value?: string | null) => {
  const digits = normalizeDigits(value);
  if (!digits) {
    return '---- ---- ---- ----';
  }
  return groupIntoChunks(digits);
};

const maskCardNumber = (value?: string | null) => {
  const digits = normalizeDigits(value);
  if (!digits) {
    return '**** **** **** ****';
  }
  const maskedDigits = digits
    .split('')
    .map((char, index) => (index < Math.max(0, digits.length - 4) ? '*' : char))
    .join('');
  return groupIntoChunks(maskedDigits);
};

const CreditCardItem = ({
  cardName = 'Visa Gold',
  cardNumber = '4111111111111111',
  cardholder = 'Juan PÃ©rez',
  expiration = '12/26',
  brand = 'Visa',
}: CreditCardItemProps) => {
  const userPassword = useAuthStore((state) => state.lastPassword);
  const expectedToken = userPassword?.trim() ?? '';

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
    const { value } = event.target;
    setToken(value.slice(0, 64));
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    setToken('');
    setStatusMessage(expectedToken ? '' : 'No encontramos una contraseÃ±a activa. IniciÃ¡ sesiÃ³n para validar.');
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
  }, [cleanupTimers, expectedToken, isModalOpen]);

  useEffect(() => {
    if (!isModalOpen || remainingTime > 0) {
      return;
    }

    setStatusMessage('ContraseÃ±a invÃ¡lida (tiempo agotado).');
    cleanupTimers();

    autoCloseRef.current = window.setTimeout(() => {
      handleCloseModal();
    }, 1200);

    return () => {
      if (autoCloseRef.current !== null) {
        window.clearTimeout(autoCloseRef.current);
        autoCloseRef.current = null;
      }
    };
  }, [cleanupTimers, handleCloseModal, isModalOpen, remainingTime]);

  useEffect(() => {
    return () => {
      cleanupTimers();
    };
  }, [cleanupTimers]);

  const handleTokenSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (remainingTime <= 0) {
        return;
      }

      if (!expectedToken) {
        setStatusMessage('No encontramos una contraseÃ±a activa. IniciÃ¡ sesiÃ³n para validar.');
        return;
      }

      if (token === expectedToken) {
        setStatusMessage('ContraseÃ±a correcta. Mostrando datosâ€¦');
        setShowSensitiveData(true);
        cleanupTimers();

        autoCloseRef.current = window.setTimeout(() => {
          handleCloseModal();
        }, 1200);
      } else {
        setStatusMessage('ContraseÃ±a incorrecta.');
      }
    },
    [cleanupTimers, expectedToken, handleCloseModal, remainingTime, token],
  );

  const isSuccessMessage = statusMessage.startsWith('ContraseÃ±a correcta');
  const statusClassName = isSuccessMessage ? 'text-emerald-500' : 'text-rose-500';

  return (
    <>
      <div className='flex w-full max-w-sm flex-col rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-2xl'>
        <div className='flex items-start justify-between'>
          <div>
            {brand ? (
              <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>{brand}</p>
            ) : (
              <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>Tarjeta</p>
            )}
            <h2 className='mt-1 text-2xl font-semibold'>{cardName}</h2>
          </div>
          <span className='rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-widest text-slate-200'>
            {showSensitiveData ? 'Datos visibles' : 'Datos ocultos'}
          </span>
        </div>

        <div className='mt-8 space-y-4'>
          <div>
            <span className='text-xs uppercase tracking-widest text-slate-400'>NÃºmero</span>
            <p className='mt-1 font-mono text-xl tracking-widest'>
              {showSensitiveData ? formattedCardNumber : maskedCardNumber}
            </p>
          </div>
          <div className='flex items-center justify-between'>
            <div>
              <span className='text-xs uppercase tracking-widest text-slate-400'>Titular</span>
              <p className='mt-1 text-lg font-medium'>{showSensitiveData ? cardholder : '**** ****'}</p>
            </div>
            <div className='text-right'>
              <span className='text-xs uppercase tracking-widest text-slate-400'>Vence</span>
              <p className='mt-1 font-mono text-lg'>{showSensitiveData ? expiration : '**/**'}</p>
            </div>
          </div>
        </div>

        <button
          type='button'
          onClick={() => setIsModalOpen(true)}
          className='mt-8 inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'
        >
          Mostrar datos
        </button>
      </div>

      {isModalOpen && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm'
          onClick={handleCloseModal}
        >
          <div
            role='dialog'
            aria-modal='true'
            className='w-full max-w-sm rounded-xl bg-white p-6 shadow-xl'
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className='text-lg font-semibold text-slate-900'>IngresÃ¡ tu contraseÃ±a</h3>
            <p className='mt-2 text-sm text-slate-600'>Usamos la contraseÃ±a del usuario para validar antes de mostrar los datos sensibles.</p>

            <form className='mt-6 space-y-4' onSubmit={handleTokenSubmit}>
              <div className='text-sm font-medium text-slate-600'>
                TenÃ©s {remainingTime}s
              </div>

              <input
                autoFocus
                type='password'
                maxLength={64}
                value={token}
                onChange={handleTokenChange}
                className='w-full rounded-lg border border-slate-200 px-3 py-2 text-lg tracking-widest outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200'
                placeholder='******'
              />

              {statusMessage && (
                <p className={`text-sm font-medium ${statusClassName}`}>{statusMessage}</p>
              )}

              <div className='flex items-center justify-end gap-3 pt-2'>
                <button
                  type='button'
                  onClick={handleCloseModal}
                  className='rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2'
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  disabled={!token || remainingTime <= 0 || !expectedToken}
                  className='rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition enabled:hover:bg-emerald-400 enabled:focus-visible:outline-none enabled:focus-visible:ring-2 enabled:focus-visible:ring-emerald-200 enabled:focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-emerald-300'
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
