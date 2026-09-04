import './globals.scss';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;1,400&family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}