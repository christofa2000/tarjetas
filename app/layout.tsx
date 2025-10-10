// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Credit Cards Lab',
  description: 'Demo de login con Next.js + TS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} relative min-h-screen bg-[#FDF6EC] text-slate-900 antialiased`}>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[-1] h-[28rem] bg-gradient-to-b from-amber-200/80 via-orange-100/50 to-transparent blur-3xl"
          aria-hidden="true"
        />

        <header className="app-bar">
          <div className="app-container">
            <div className="app-bar-inner">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-orange-200/50">
                  CC
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">Credit Cards Lab</p>
                  <p className="text-sm text-slate-600">Tu banca digital demo</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="hidden text-sm font-medium text-slate-500 sm:block">
                  Sesiones seguras con token temporal
                </span>
                <span className="badge-premium">Acceso demo</span>
              </div>
            </div>
          </div>
        </header>

        <main className="app-container pb-16 pt-28">{children}</main>
      </body>
    </html>
  );
}
