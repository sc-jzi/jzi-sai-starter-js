'use client';
import {
  FormEvent,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter as useNextRouter } from 'next/navigation';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import { useSearch } from '@sitecore-content-sdk/nextjs/search';
import { cn } from 'lib/utils';
import { SearchDocument, SearchExperienceProps } from './search-components/models';
import { SearchItem } from './search-components/SearchItem';
import { SearchSkeletonItem } from './search-components/SearchSkeletonItem';
import { useEvent } from './search-components/useEvent';
import { useSearchField } from './search-components/useSearchField';
import { useParams } from './search-components/useParams';
import { useDebouncedCallback } from './search-components/useDebounce';
import { gridColsClass } from './search-components/constants';

const PreviewSearchInner = (props: SearchExperienceProps) => {
  const { page } = useSitecore();
  const { params } = props;
  const router = useNextRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { searchIndex, fieldsMapping } = useSearchField(props.fields?.search?.value);
  const { styles, id, pageSize, columns } = useParams(params);

  const { isEditing, isPreview } = page.mode;
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const canSearch = !isEditing && !isPreview && Boolean(searchIndex);
  const showResultsPanel = isOpen && inputValue.trim().length > 0;
  const hasSearchQuery = searchQuery.trim().length > 0;

  const { results, isLoading, isSuccess, isError, error } = useSearch<SearchDocument>({
    searchIndexId: searchIndex,
    page: 1,
    pageSize,
    query: searchQuery,
    enabled: canSearch && hasSearchQuery,
    keepPreviousData: true,
  });

  const sendEvent = useEvent({ query: searchQuery, uid: props.rendering.uid });

  const setDebouncedQuery = useDebouncedCallback((value: string) => {
    setSearchQuery(value);
  });

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setInputValue('');
    setSearchQuery('');
  }, []);

  const openSearch = useCallback(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (isSuccess) {
      sendEvent('viewed');
    }
  }, [isSuccess, sendEvent]);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeSearch();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSearch();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, closeSearch]);

  const onInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      if (isEditing || isPreview) return;
      setDebouncedQuery(value);
    },
    [isEditing, isPreview, setDebouncedQuery]
  );

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const query = inputValue.trim();
      if (!query) return;

      closeSearch();
      router.push(`/search?q=${encodeURIComponent(query)}`);
    },
    [closeSearch, inputValue, router]
  );

  const columnCount = Number(columns) || 3;

  return (
    <div
      ref={containerRef}
      className={cn('component preview-search relative', styles)}
      id={id ? id : undefined}
    >
      {!isOpen ? (
        <button
          type="button"
          onClick={openSearch}
          className="p-3 text-gray-500 transition-colors hover:text-gray-700"
          aria-label="Open search"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      ) : (
        <div className="relative min-w-[16rem] md:min-w-[24rem]">
          <form onSubmit={onSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                id="search-input"
                name="query"
                type="text"
                value={inputValue}
                onChange={(event) => onInputChange(event.target.value)}
                autoComplete="off"
                placeholder="Ask me anything"
                className="w-full rounded-md border border-gray-300 px-4 py-3 pl-11 text-lg focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-expanded={showResultsPanel}
                aria-controls="preview-search-results"
              />
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
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
            </div>
            <button
              type="button"
              onClick={closeSearch}
              className="p-3 text-gray-500 transition-colors hover:text-gray-700"
              aria-label="Close search"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </form>

          {showResultsPanel && (
            <div
              id="preview-search-results"
              className="absolute right-0 z-50 mt-2 flex h-[400px] w-full min-w-[20rem] justify-center bg-gray-100 pt-0 shadow-[2px_5px_5px_5px_rgba(0,0,0,0.3)] md:w-[32rem] lg:w-[40rem]"
              role="listbox"
            >
              {isError && error && (
                <div className="flex w-full items-center justify-center p-6 text-center text-sm text-red-600">
                  Something went wrong. Try again.
                </div>
              )}

              {!isError && (
                <div
                  className={cn(
                    'relative grid flex-[3] list-none gap-3 overflow-y-auto bg-white p-2',
                    gridColsClass(columnCount),
                    { 'opacity-60': isLoading && results.length > 0 }
                  )}
                >
                  {results.map((result) => (
                    <SearchItem
                      variant={columnCount === 1 ? 'list' : 'card'}
                      key={result.sc_item_id}
                      data={result}
                      mapping={fieldsMapping}
                      onClick={() => {
                        sendEvent('clicked');
                        closeSearch();
                      }}
                    />
                  ))}

                  {(((isLoading || !hasSearchQuery) && results.length === 0) ||
                    (isEditing && results.length === 0)) &&
                    Array.from({ length: pageSize }).map((_, index) => (
                      <SearchSkeletonItem
                        variant={columnCount === 1 ? 'list' : 'card'}
                        key={index}
                        mapping={fieldsMapping}
                      />
                    ))}

                  {!isLoading && hasSearchQuery && results.length === 0 && (
                    <div className="col-span-full flex items-center justify-center p-6 text-sm text-gray-600">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const Default = (props: SearchExperienceProps) => (
  <Suspense fallback={null}>
    <PreviewSearchInner {...props} />
  </Suspense>
);
