import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MGA Rendering Engine',
  description: 'Internal AI rendering tool for MGA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto min-h-screen max-w-6xl p-6">{children}</main>
      </body>
    </html>
  );
}
