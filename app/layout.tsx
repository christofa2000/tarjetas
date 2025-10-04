// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Credit Cards Lab',
  description: 'Demo de login con Next.js + TS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      {/* Agregamos theme-fire en el body */}
      <body className="theme-fire min-h-screen">
        {/* Barra superior (gradiente fuego) */}
        <header className="app-bar">
          <div className="app-container flex items-center justify-between py-3">
            <div className="font-bold">Credit Cards Lab</div>
            <span className="badge-premium">Premium</span>
          </div>
        </header>

        <main className="app-container">
          {children}
        </main>
      </body>
    </html>
  );
}
