export const DEBOUNCE_TIME = 400;

export const DEFAULT_PAGE_SIZE = 6;

export const MORE_LIKE_THIS_PAGE_SIZE = 3;

export const getEffectivePageSize = (
  moreLikeThisEnabled: boolean,
  configuredPageSize: number
): number => (moreLikeThisEnabled ? MORE_LIKE_THIS_PAGE_SIZE : configuredPageSize);

export const limitSearchResults = <T>(results: T[], moreLikeThisEnabled: boolean): T[] =>
  moreLikeThisEnabled ? results.slice(0, MORE_LIKE_THIS_PAGE_SIZE) : results;

/**
 * `useSuggest` returns `QuerySuggestionItem` objects (`text`, `queryPlusText`).
 * SearchDropdown expects plain strings, so normalize here.
 */
export const toSuggestionTerms = (
  suggestions: Array<{ text?: string; queryPlusText?: string } | string> | undefined | null
): string[] => {
  if (!suggestions?.length) return [];

  return suggestions
    .map((item) => {
      if (typeof item === 'string') {
        return item.trim();
      }

      return (item.queryPlusText || item.text || '').trim();
    })
    .filter((term) => term.length > 0);
};

export const gridColsClass = (value = 3): string => {
  const cols = Number(value) || 3;
  const map: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
  };

  const baseClass = map[Math.max(1, Math.min(cols, 3))];

  // Always use 1 column on mobile, then apply the configured columns from md breakpoint
  return `grid-cols-1 md:${baseClass}`;
};

export const DICTIONARY_KEYS = {
  RESULTS_FOUND: 'SearchExperience_ResultsFound',
  NO_RESULTS_FOUND: 'SearchExperience_NoResultsFound',
  TRY_ADJUSTING_YOUR_SEARCH: 'SearchExperience_TryAdjustingYourSearch',
  CLEAR_SEARCH: 'SearchExperience_ClearSearch',
  SOMETHING_WENT_WRONG: 'SearchExperience_SomethingWentWrong',
  TRY_AGAIN: 'SearchExperience_TryAgain',
  LOAD_MORE: 'SearchExperience_LoadMore',
  SEARCH_INPUT_PLACEHOLDER: 'SearchExperience_SearchInputPlaceholder',
  PREVIOUS_PAGE: 'SearchExperience_PreviousPage',
  NEXT_PAGE: 'SearchExperience_NextPage',
  READ_MORE: 'SearchExperience_ReadMore',
  AUTOCOMPLETE: 'SearchExperience_Autocomplete',
  RESULT_PREVIEW: 'SearchExperience_ResultPreview',
  MATCHES: 'SearchExperience_Matches',
};
