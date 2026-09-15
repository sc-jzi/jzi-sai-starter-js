import './globals.scss';
import { Source_Sans_3 } from 'next/font/google';

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans-3',
  weight: ['400', '600', '700'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sourceSans3.variable}>
      <body style={{ fontFamily: 'var(--brand-body-font)' }}>{children}</body>
    </html>
  );
}
