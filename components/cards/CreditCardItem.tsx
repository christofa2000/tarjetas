'use client';

import { APP_CONSTANTS } from '@/lib/constants/app';
import { detectCardBrand, isValidLuhn } from '@/lib/utils/cardUtils';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

interface CreditCardItemProps {
  cardName?: string;
  cardNumber?: string;
  cardholder?: string;
  expiration?: string;
}

type CardTheme = {
  gradient: string;
  border: string;
  badge: string;
  chip: string;
};

const CARD_THEMES: Record<string, CardTheme> = {
  Visa: {
    gradient: 'from-black via-gray-900 to-black',
    border: 'from-gray-700 via-gray-800 to-gray-700',
    badge: 'bg-white/15 text-white shadow-inner shadow-black/50',
    chip: 'bg-white/20',
  },
  Mastercard: {
    gradient: 'from-amber-500 via-rose-500 to-amber-600',
    border: 'from-amber-200 via-rose-200 to-amber-300',
    badge: 'bg-black/30 text-amber-100 shadow-inner shadow-black/30',
    chip: 'bg-black/30',
  },
  'American Express': {
    gradient: 'from-teal-400 via-emerald-500 to-emerald-600',
    border: 'from-teal-200 via-emerald-200 to-teal-300',
    badge: 'bg-white/20 text-emerald-50 shadow-inner shadow-emerald-900/30',
    chip: 'bg-white/20',
  },
  Discover: {
    gradient: 'from-yellow-400 via-orange-500 to-amber-500',
    border: 'from-yellow-200 via-orange-200 to-amber-200',
    badge: 'bg-black/25 text-amber-100 shadow-inner shadow-black/30',
    chip: 'bg-black/25',
  },
  default: {
    gradient: 'from-slate-900 via-slate-800 to-slate-900',
    border: 'from-orange-200 via-rose-200 to-orange-200',
    badge: 'bg-white/15 text-white shadow-inner shadow-slate-900/30',
    chip: 'bg-white/15',
  },
};

const normalizeDigits = (value?: string | null) => (value ?? '').replace(/\D/g, '');

const groupIntoChunks = (value: string) => value.match(/.{1,4}/g)?.join(' ') ?? value;

const maskCardNumber = (value?: string | null) => {
  const digits = normalizeDigits(value);

  if (!digits) {
    return '**** **** **** ****';
  }

  const maskedDigits = `${digits.slice(0, -4).replace(/./g, '*')}${digits.slice(-4)}`;
  return groupIntoChunks(maskedDigits);
};

// Lazy load del modal para que la tarjeta se renderice rapido en el dashboard.
const ValidationModal = dynamic(() => import('./ValidationModal'));

const CreditCardItem = ({
  cardName = 'Visa Black Card',
  cardNumber = '4111111111111111',
  cardholder = 'Christian Papa',
  expiration = '12/26',
}: CreditCardItemProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const formattedCardNumber = useMemo(
    () => groupIntoChunks(normalizeDigits(cardNumber)),
    [cardNumber]
  );
  const maskedCardNumber = useMemo(() => maskCardNumber(cardNumber), [cardNumber]);
  const brand = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);
  const isCardNumberValid = useMemo(() => isValidLuhn(cardNumber), [cardNumber]);
  const theme = useMemo(() => CARD_THEMES[brand] ?? CARD_THEMES.default, [brand]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleValidationSuccess = () => {
    setShowSensitiveData(true);
    setIsModalOpen(false);

    // Ocultar los datos sensibles después del timeout configurado
    setTimeout(() => setShowSensitiveData(false), APP_CONSTANTS.AUTH.DATA_VISIBILITY_TIMEOUT_MS);
  };

  return (
    <>
      <div
        className="group relative w-full"
        style={{
          maxWidth: APP_CONSTANTS.CARD.MAX_WIDTH,
          aspectRatio: APP_CONSTANTS.CARD.ASPECT_RATIO,
        }}
      >
        <div
          className={`absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-r ${theme.border} opacity-80 blur-xl transition duration-500 group-hover:opacity-95`}
          aria-hidden="true"
        />
        <div
          className={`relative flex flex-col justify-between overflow-hidden rounded-[28px] bg-gradient-to-br ${theme.gradient} p-6 text-white shadow-2xl shadow-slate-950/40 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_32px_64px_rgba(15,23,42,0.55)] h-full min-h-0`}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22)_0%,_rgba(255,255,255,0)_55%)] opacity-80 transition duration-500 group-hover:opacity-100"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-24 top-1/3 h-48 w-48 rotate-12 bg-white/15 blur-2xl transition duration-500 group-hover:-right-16"
            aria-hidden="true"
          />

          <div className="relative flex-1 flex flex-col min-h-0">
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                  {brand}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">{cardName}</h2>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] ${theme.badge}`}
              >
                {showSensitiveData ? 'Datos visibles' : 'Datos ocultos'}
              </span>
            </div>

            <div className="relative mt-6 flex items-center justify-between">
              <div
                className={`h-10 w-14 rounded-xl border border-white/25 ${theme.chip} backdrop-blur-sm`}
                aria-hidden="true"
              />
              <span className="text-xs uppercase tracking-[0.4em] text-white/70">LAB</span>
            </div>

            <div className="relative mt-5 space-y-4 flex-1">
              <div>
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-white/60">
                  <span>Numero</span>
                  {!isCardNumberValid && (
                    <span className="font-semibold text-amber-200 text-xs">Numero invalido</span>
                  )}
                </div>
                <p className="mt-2 font-mono text-xl tracking-[0.3em]">
                  {showSensitiveData ? formattedCardNumber : maskedCardNumber}
                </p>
              </div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-[0.35em] text-white/60">Titular</span>
                  <p className="mt-1.5 text-base font-medium tracking-wide">
                    {showSensitiveData ? cardholder : '**** ****'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase tracking-[0.35em] text-white/60">Vence</span>
                  <p className="mt-1.5 font-mono text-base tracking-[0.3em]">
                    {showSensitiveData ? expiration : '**/**'}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-4 w-full inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/15 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-black/25 transition duration-200 hover:-translate-y-0.5 hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              aria-label="Mostrar datos sensibles de la tarjeta"
            >
              Mostrar datos
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ValidationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleValidationSuccess}
        />
      )}
    </>
  );
};

export default CreditCardItem;
