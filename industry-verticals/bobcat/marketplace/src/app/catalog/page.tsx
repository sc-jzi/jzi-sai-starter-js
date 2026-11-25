import { Suspense } from 'react';
import EnrichmentApp from '@/components/EnrichmentApp';

/** Full screen extension point route (register it as /catalog in App studio). */
export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="pe-loading">Loading…</div>}>
      <EnrichmentApp />
    </Suspense>
  );
}
