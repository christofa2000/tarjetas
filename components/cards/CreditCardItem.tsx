'use client';

const LABEL_CLASSES = "text-xs uppercase tracking-wide text-slate-200/80";
const VALUE_CLASSES = "font-semibold text-white";

function formatExpiry(): string {
  const now = new Date();
  const month = String(((now.getMonth() + 1) % 12) || 12).padStart(2, '0');
  const year = String(now.getFullYear() + 3).slice(-2);
  return month + '/' + year;
}

export default function CreditCardItem() {
  const expiry = formatExpiry();

  return (
    <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-700 to-indigo-500 p-6 shadow-xl text-white">
      <div className="absolute inset-y-0 right-0 w-32 translate-x-12 rounded-full bg-indigo-400/30 blur-3xl" aria-hidden />

      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-indigo-100">Credit Card</p>
          <h2 className="mt-1 text-lg font-semibold">Banco Demo</h2>
        </div>
        <span className="rounded-full border border-white/40 px-3 py-1 text-xs font-medium text-indigo-100">Platinum</span>
      </header>

      <div className="mt-8 flex items-center gap-3">
        <div className="h-8 w-12 rounded-lg bg-gradient-to-br from-orange-400 to-yellow-400" aria-hidden />
        <div className="h-10 w-16 rounded bg-white/20 backdrop-blur" aria-hidden />
      </div>

      <div className="mt-6 space-y-2">
        <p className="text-sm tracking-[0.4em] text-slate-100/70">**** **** **** 4210</p>
        <p className="text-xl tracking-[0.35em]">5128 8043 2210 4210</p>
      </div>

      <dl className="mt-8 grid grid-cols-3 gap-4 text-sm">
        <div className="col-span-2">
          <dt className={LABEL_CLASSES}>Titular</dt>
          <dd className={VALUE_CLASSES + ' mt-1'}>Demo User</dd>
        </div>
        <div>
          <dt className={LABEL_CLASSES}>Vence</dt>
          <dd className={VALUE_CLASSES + ' mt-1'}>{expiry}</dd>
        </div>
        <div>
          <dt className={LABEL_CLASSES}>Saldo</dt>
          <dd className={VALUE_CLASSES + ' mt-1'}>$ 2.450,00</dd>
        </div>
        <div>
          <dt className={LABEL_CLASSES}>Disponible</dt>
          <dd className={VALUE_CLASSES + ' mt-1'}>$ 7.550,00</dd>
        </div>
        <div>
          <dt className={LABEL_CLASSES}>CVV</dt>
          <dd className={VALUE_CLASSES + ' mt-1'}>748</dd>
        </div>
      </dl>

      <footer className="mt-8 flex items-center justify-between text-xs text-indigo-100/80">
        <span>Virtual Card - Demo Bank</span>
        <span>Contactless</span>
      </footer>
    </article>
  );
}
