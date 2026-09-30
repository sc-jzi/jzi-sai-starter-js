import './globals.scss';
import { Source_Sans_3 } from 'next/font/google';

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={sourceSans.className}
      style={{
        ['--brand-heading-font' as string]: sourceSans.style.fontFamily,
        ['--brand-body-font' as string]: sourceSans.style.fontFamily,
      }}
    >
      <body>{children}</body>
    </html>
  );
}