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
  { label: 'User 1 - Commercial Fleet Managers', taxonomy: 'Commercial Fleet Managers' },
  { label: 'User 2 - Automotive Service Professionals', taxonomy: 'Automotive Service Professionals' },
  { label: 'User 3 - Industrial & Heavy Duty Operations', taxonomy: 'Industrial & Heavy Duty Operations' },
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
        <SelectTrigger className="h-9 w-[min(100%,15rem)] border-[#00316d]/25 bg-white text-[#00316d] shadow-sm">
          <SelectValue placeholder="Demo login" />
        </SelectTrigger>
        <SelectContent align="end" side="bottom" sideOffset={6} className="z-[250]">
          {DEMO_USERS.map((user) => (
            <SelectItem key={user.taxonomy} value={user.taxonomy}>
              {user.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
