'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { detectCardBrand, isValidLuhn } from '@/lib/cardUtils';

interface CreditCardItemProps {
  cardName?: string;
  cardNumber?: string;
  cardholder?: string;
  expiration?: string;
}

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
  cardName = 'Visa Gold',
  cardNumber = '4111111111111111',
  cardholder = 'Christian Papa',
  expiration = '12/26',
}: CreditCardItemProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

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
            {showSensitiveData ? 'Datos visibles' : 'Datos ocultos'}
          </span>
        </div>

        <div className="mt-8 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-slate-400">Numero</span>
              {!isCardNumberValid && (
                <span className="text-xs font-medium text-amber-400">Numero invalido</span>
              )}
            </div>
            <p className="mt-1 font-mono text-xl tracking-widest">
              {showSensitiveData ? formattedCardNumber : maskedCardNumber}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-slate-400">Titular</span>
              <p className="mt-1 text-lg font-medium">{showSensitiveData ? cardholder : '**** ****'}</p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase tracking-widest text-slate-400">Vence</span>
              <p className="mt-1 font-mono text-lg">{showSensitiveData ? expiration : '**/**'}</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          aria-label="Mostrar datos sensibles de la tarjeta"
        >
          Mostrar datos
        </button>
      </div>

      {isModalOpen && (
        <ValidationModal isOpen={isModalOpen} onClose={handleCloseModal} onSuccess={handleValidationSuccess} />
      )}
    </>
  );
};

export default CreditCardItem;
