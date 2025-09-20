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
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="max-w-md mx-auto p-4">{children}</div>
      </body>
    </html>
  );
}
