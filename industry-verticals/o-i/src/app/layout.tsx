import './globals.scss';
import { Lato } from 'next/font/google';

const lato = Lato({
  subsets: ['latin'],
  variable: '--font-lato',
  weight: ['400', '700'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={lato.variable}>
      <body style={{ fontFamily: 'var(--brand-body-font)' }}>{children}</body>
    </html>
  );
}
