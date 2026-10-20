'use client';

import { useEffect, useState } from 'react';

export type ApexusAudience = '' | 'manufacturer' | 'covered-entity';

/** Reads the audience cookie set when a refund-service page is visited. */
export function useApexusAudience(): ApexusAudience {
  const [audience, setAudience] = useState<ApexusAudience>('');

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )apexus-audience=([^;]+)/);
    const value = match ? decodeURIComponent(match[1]) : '';
    if (value === 'manufacturer' || value === 'covered-entity') setAudience(value);
  }, []);

  return audience;
}
