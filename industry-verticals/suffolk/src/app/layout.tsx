import './globals.scss';
import '../assets/suffolk/colors.css';
import '../assets/suffolk/typography.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Arimo:wght@400;700&family=Heebo:wght@400;500;700&family=BenchNine:wght@400;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}