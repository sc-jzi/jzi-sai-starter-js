'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams, usePathname, useRouter as useAppRouter } from 'next/navigation';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import { useSearch, useSuggest } from '@sitecore-content-sdk/nextjs/search';
import { cn } from 'lib/utils';
import { SearchDocument, SearchExperienceProps } from './search-components/models';
import { SearchEmptyResults } from './search-components/SearchEmptyResults';
import { SearchError } from './search-components/SearchError';
import { SearchItem } from './search-components/SearchItem';
import { SearchSkeletonItem } from './search-components/SearchSkeletonItem';
import { SearchPagination } from './search-components/SearchPagination';
import { SearchInput } from './search-components/SearchInput';
import { SearchDropdown } from './search-components/SearchDropdown';
import { useEvent } from './search-components/useEvent';
import { useSearchField } from './search-components/useSearchField';
import { useParams } from './search-components/useParams';
import {
  DICTIONARY_KEYS,
  getEffectivePageSize,
  gridColsClass,
  limitSearchResults,
  toSuggestionTerms,
} from './search-components/constants';
import { useRouter } from './search-components/useRouter';

export const Default = (props: SearchExperienceProps) => {
  const { page } = useSitecore();
  const { params } = props;
  const t = useTranslations();

  const {
    searchIndex,
    fieldsMapping,
    previewEnabled,
    autocompleteEnabled,
    fieldPreviewEnabled,
    moreLikeThisEnabled,
  } = useSearchField(props.fields.search.value);

  const { styles, id, pageSize: configuredPageSize, columns } = useParams(params);
  const pageSize = getEffectivePageSize(moreLikeThisEnabled, configuredPageSize);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const appRouter = useAppRouter();
  const seedItemUrl =
    typeof window === 'undefined' ? pathname : new URL(pathname, window.location.origin).toString();

  const { isEditing, isPreview } = page.mode;
  const [pageNumber, setPageNumber] = useState(1);
  const [inputValue, setInputValue] = useState<string>((searchParams.get('q') as string) || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchEnabled, setSearchEnabled] = useState<boolean>(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const searchWrapperRef = useRef<HTMLDivElement>(null);

  const { total, totalPages, results, isLoading, isSuccess, isError, error } =
    useSearch<SearchDocument>({
      searchIndexId: searchIndex,
      page: pageNumber,
      pageSize,
      enabled: searchEnabled,
      ...(moreLikeThisEnabled ? { seedItemUrl } : { query: searchQuery }),
    });

  const { setRouterQuery } = useRouter();

  const displayedResults = limitSearchResults(results ?? [], moreLikeThisEnabled);
  const sendEvent = useEvent({
    query: searchQuery,
    uid: props.rendering.uid,
    searchIndexId: searchIndex,
    pageSize,
    numResults: displayedResults.length,
    totalResults: total ?? 0,
  });

  // Dropdown feature hooks — use inputValue (live) so suggestions update as the user types.
  const dropdownEnabled = !moreLikeThisEnabled && !isEditing && !isPreview;
  const suggestEnabled = (autocompleteEnabled || previewEnabled) && dropdownEnabled;

  const { querySuggestions, previewResults } = useSuggest<SearchDocument>({
    query: inputValue,
    searchIndexId: searchIndex,
    enabled: suggestEnabled,
  });

  // Filter results according to which features are enabled.
  const terms = autocompleteEnabled ? toSuggestionTerms(querySuggestions) : [];
  const dropdownPreviewResults = previewEnabled ? previewResults : [];
  const previewTotal = dropdownPreviewResults.length;

  // Close the dropdown when the user clicks outside the search wrapper.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSuccess) {
      sendEvent('viewed');
    }
  }, [isSuccess, sendEvent]);

  useEffect(() => {
    const routerQuery = (searchParams.get('q') as string) || '';

    setSearchQuery(routerQuery);

    if (!routerQuery) {
      setPageNumber(1);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isEditing || isPreview) return;

    setSearchEnabled(true);
  }, [isEditing, isPreview]);

  const onSearchChange = useCallback(
    (value: string, debounced: boolean = true) => {
      setInputValue(value);
      setDropdownVisible(value.length > 0 && dropdownEnabled);

      if (isEditing || isPreview) return;

      setRouterQuery(value, debounced);
    },
    [setRouterQuery, isEditing, isPreview, dropdownEnabled]
  );

  const onDropdownTermSelect = useCallback(
    (term: string) => {
      setDropdownVisible(false);
      onSearchChange(term, false);
    },
    [onSearchChange]
  );

  const onDropdownPreviewSelect = useCallback(
    (item: SearchDocument) => {
      setDropdownVisible(false);

      const linkField = fieldsMapping.link;
      const link = linkField ? item[linkField] : undefined;
      if (typeof link !== 'string' || !link.trim()) return;

      const href = link.trim();
      try {
        const { protocol } = new URL(href, window.location.origin);
        if (protocol === 'http:' || protocol === 'https:') {
          appRouter.push(href);
        }
      } catch (error) {
        console.error('Failed to parse search result link.', error);
      }
    },
    [appRouter, fieldsMapping.link]
  );

  return (
    <div className={`component search-experience ${styles}`} id={id ? id : undefined}>
      <div className="component-content">
        <div
          className={cn('max-w-7xl mx-auto p-6', {
            'pt-24 lg:pt-32': !isEditing,
          })}
        >
          <div className="mb-8">
            {!moreLikeThisEnabled && (
              <div ref={searchWrapperRef} className="relative">
                <SearchInput
                  value={inputValue}
                  onChange={(value) => onSearchChange(value, true)}
                  onFocus={() => {
                    if (inputValue.length > 0 && dropdownEnabled) setDropdownVisible(true);
                  }}
                />
                {dropdownVisible && (
                  <SearchDropdown
                    terms={terms}
                    previewResults={dropdownPreviewResults}
                    previewTotal={previewTotal}
                    mapping={fieldsMapping}
                    fieldPreviewEnabled={fieldPreviewEnabled}
                    onTermSelect={onDropdownTermSelect}
                    onPreviewSelect={onDropdownPreviewSelect}
                  />
                )}
              </div>
            )}

            <p className="text-gray-600 mb-6">
              {total} {t(DICTIONARY_KEYS.RESULTS_FOUND) || 'results found'}
            </p>
          </div>

          {isError && error && (
            <SearchError error={error} onTryAgain={() => onSearchChange('', false)} />
          )}

          {!isLoading && !isError && total === 0 && (
            <SearchEmptyResults
              query={searchQuery}
              onClearSearch={() => onSearchChange('', false)}
            />
          )}

          <div className={cn('grid gap-6 mb-8', gridColsClass(Number(columns)))}>
            {!isLoading &&
              displayedResults.map((result) => (
                <SearchItem
                  variant={Number(columns) === 1 ? 'list' : 'card'}
                  key={result.sc_item_id}
                  data={result}
                  mapping={fieldsMapping}
                  onClick={() => sendEvent('clicked')}
                />
              ))}

            {(((isEditing || isPreview) && total === 0) || isLoading) &&
              Array.from({ length: pageSize }).map((_, index) => (
                <SearchSkeletonItem
                  variant={Number(params.columns) === 1 ? 'list' : 'card'}
                  key={index}
                  mapping={fieldsMapping}
                />
              ))}
          </div>

          {!moreLikeThisEnabled && !isLoading && !isError && results.length > 0 && (
            <SearchPagination
              currentPage={pageNumber}
              totalPages={totalPages}
              onPageChange={(page: number) => setPageNumber(page)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
