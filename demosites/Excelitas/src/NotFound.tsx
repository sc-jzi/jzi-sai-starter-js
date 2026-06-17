import Head from 'next/head';
import Link from 'next/link';
import { JSX } from 'react';

/**
 * Rendered in case if we have 404 error
 */
const NotFound = (): JSX.Element => (
  <>
    <Head>
      <title>404: Page Not Found | Excelitas</title>
    </Head>
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-excelitas-gray-50 px-4 py-20 text-center">
      <p className="eyebrow mb-2">Error 404</p>
      <h1 className="mb-4 text-excelitas-gray-900">Page not found</h1>
      <p className="mb-8 max-w-md text-lg text-excelitas-gray-500">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link href="/" className="btn-excelitas">
        Return to homepage
      </Link>
    </div>
  </>
);

export default NotFound;
