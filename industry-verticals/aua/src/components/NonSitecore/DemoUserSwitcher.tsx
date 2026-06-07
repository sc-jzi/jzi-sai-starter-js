'use client';

import { useEffect, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DEMO_TAXONOMY_CHANGE_EVENT, DEMO_TAXONOMY_STORAGE_KEY } from '@/lib/demo-taxonomy';

const DEMO_USERS = [
  { label: 'User 1 - Urology Residents & Trainees', taxonomy: 'Urology Residents & Trainees' },
  { label: 'User 2 - Community Practice Urologists', taxonomy: 'Community Practice Urologists' },
  { label: 'User 3 - Academic & Research Urologists', taxonomy: 'Academic & Research Urologists' },
] as const;

export function DemoUserSwitcher() {
  const [taxonomy, setTaxonomy] = useState('');

  useEffect(() => {
    const storedTaxonomy = window.localStorage.getItem(DEMO_TAXONOMY_STORAGE_KEY) ?? '';
    setTaxonomy(storedTaxonomy);
  }, []);

  const handleValueChange = (value: string) => {
    setTaxonomy(value);
    window.localStorage.setItem(DEMO_TAXONOMY_STORAGE_KEY, value);
    window.dispatchEvent(new CustomEvent(DEMO_TAXONOMY_CHANGE_EVENT, { detail: { taxonomy: value } }));
  };

  return (
    <div className="demo-user-switcher header-top-links__item flex items-center px-4" role="listitem">
      <Select value={taxonomy || undefined} onValueChange={handleValueChange}>
        <SelectTrigger className="h-9 w-[min(100%,15rem)] border-[#00316d]/25 bg-white text-[#00316d] shadow-sm [&_svg]:text-[#00316d]">
          <SelectValue placeholder="Demo login" />
        </SelectTrigger>
        <SelectContent
          align="end"
          side="bottom"
          sideOffset={6}
          className="z-[9999] min-w-[min(calc(100vw-2rem),22rem)] border-[#d2d2d2] bg-white text-[#333] shadow-lg"
        >
          {DEMO_USERS.map((user) => (
            <SelectItem
              key={user.taxonomy}
              value={user.taxonomy}
              className="cursor-pointer text-[#333] focus:bg-[#e8f2f8] focus:text-[#003d5b] data-[highlighted]:bg-[#e8f2f8] data-[highlighted]:text-[#003d5b]"
            >
              {user.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
