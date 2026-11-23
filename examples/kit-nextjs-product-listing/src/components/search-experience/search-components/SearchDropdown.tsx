'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { cn } from 'lib/utils';
import { DICTIONARY_KEYS, toSuggestionTerms } from './constants';
import { SearchDocument, SearchFieldsMapping } from './models';
import { SearchPreviewItem } from './SearchPreviewItem';

interface SearchDropdownProps {
  /** Autocomplete term suggestions. Pass an empty array to hide the autocomplete panel. */
  terms: Array<string | { text?: string; queryPlusText?: string }>;
  /** Preview result documents. Pass an empty array to hide the preview panel. */
  previewResults: SearchDocument[];
  previewTotal: number;
  mapping: SearchFieldsMapping;
  /**
   * PascalCase keys (Title, Images, Description, Type, Link, Tags) that are
   * enabled for display in the preview panel.
   */
  fieldPreviewEnabled: Record<string, boolean>;
  /** Called when the user selects an autocomplete term. */
  onTermSelect: (term: string) => void;
  /** Called when the user selects a preview result item. */
  onPreviewSelect: (item: SearchDocument) => void;
}

const SearchIcon = () => (
  <svg
    className="w-4 h-4 text-gray-400 flex-shrink-0"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

/**
 * Dropdown displayed below the search input when autocomplete or result preview
 * (or both) are enabled and the user has typed a query.
 *
 * Layout rules:
 * - Two-panel side-by-side layout when BOTH features have content.
 * - Single-panel layout when only one feature has content.
 */
export const SearchDropdown = ({
  terms,
  previewResults,
  previewTotal,
  mapping,
  fieldPreviewEnabled,
  onTermSelect,
  onPreviewSelect,
}: SearchDropdownProps) => {
  const t = useTranslations();
  const suggestionTerms = toSuggestionTerms(terms);

  const hasAutocomplete = suggestionTerms.length > 0;
  const hasPreview = previewResults.length > 0;

  if (!hasAutocomplete && !hasPreview) return null;

  const twoPanel = hasAutocomplete && hasPreview;

  return (
    <div
      className={cn(
        'absolute left-0 right-0 top-full mt-1 z-50',
        'bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden',
        'flex divide-x divide-gray-100'
      )}
      role="listbox"
    >
      {/* Autocomplete panel */}
      {hasAutocomplete && (
        <div className={cn('flex flex-col py-2', twoPanel ? 'w-2/5' : 'w-full')}>
          <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
            {t(DICTIONARY_KEYS.AUTOCOMPLETE) || 'Autocomplete'}
          </p>
          <ul>
            {suggestionTerms.map((term) => (
              <li key={term}>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                  onMouseDown={(e) => {
                    // Prevent input blur before the click fires
                    e.preventDefault();
                    onTermSelect(term);
                  }}
                >
                  <SearchIcon />
                  <span>
                    <strong>{term.split(' ')[0]}</strong> {term.split(' ').slice(1).join(' ')}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Result preview panel */}
      {hasPreview && (
        <div className={cn('flex flex-col py-2', twoPanel ? 'w-3/5' : 'w-full')}>
          <div className="flex items-center justify-between px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              {t(DICTIONARY_KEYS.RESULT_PREVIEW) || 'Result Preview'}
            </p>
            <span className="text-xs text-gray-400">
              {previewTotal} {t(DICTIONARY_KEYS.MATCHES) || 'matches'}
            </span>
          </div>
          <ul>
            {previewResults.map((result) => (
              <li key={result.sc_item_id}>
                <SearchPreviewItem
                  data={result}
                  mapping={mapping}
                  fieldPreviewEnabled={fieldPreviewEnabled}
                  onMouseDown={(e) => {
                    // Prevent input blur before the click fires
                    e.preventDefault();
                    onPreviewSelect(result);
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
