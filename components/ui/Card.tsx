import { PropsWithChildren, ReactNode } from 'react';

interface CardProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  accent?: ReactNode;
}

const Card = ({ title, subtitle, accent, children }: CardProps) => {
  return (
    <article className='relative overflow-hidden rounded-3xl border border-graphite/60 bg-charcoal text-lightgray shadow-2xl shadow-charcoal/40'>
      <div className='absolute inset-0 bg-charcoal-glow' aria-hidden='true' />

      <header className='relative flex items-center justify-between gap-4 bg-fire px-6 py-3 text-charcoal shadow-inner shadow-charcoal/30'>
        <div className='flex flex-col'>
          {subtitle && (
            <span className='text-xs font-medium uppercase tracking-[0.35em] text-charcoal/75'>{subtitle}</span>
          )}
          <h2 className='text-lg font-semibold'>{title}</h2>
        </div>
        {accent ? (
          <div className='inline-flex items-center gap-2 rounded-full bg-golden/90 px-4 py-1 text-xs font-semibold text-charcoal shadow-lg shadow-golden/40'>
            {accent}
          </div>
        ) : null}
      </header>

      <div className='relative flex flex-col gap-5 px-6 py-6'>
        <div className='flex items-center justify-between rounded-2xl border border-golden/30 bg-white/5 px-4 py-3 text-sm text-lightgray'>
          <span className='font-medium text-golden'>Numero</span>
          <span className='tracking-[0.4em] text-golden/80'>**** 4210</span>
        </div>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div className='space-y-1'>
            <span className='text-xs uppercase tracking-wide text-lightgray/70'>Titular</span>
            <p className='font-semibold text-white'>Juan Perez</p>
          </div>
          <div className='space-y-1'>
            <span className='text-xs uppercase tracking-wide text-lightgray/70'>Vence</span>
            <p className='font-semibold text-golden'>12/26</p>
          </div>
        </div>
        {children}
      </div>
    </article>
  );
};

export default Card;
