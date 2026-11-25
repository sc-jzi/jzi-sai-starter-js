import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Product Enrichment', description: 'Enrich PIM products in SitecoreAI' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
