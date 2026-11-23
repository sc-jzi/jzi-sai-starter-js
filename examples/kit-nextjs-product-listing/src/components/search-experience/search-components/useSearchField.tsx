'use client';
import { useMemo } from 'react';
import { SearchField } from './models';

const EMPTY_SEARCH_FIELD: SearchField = {
  searchIndex: '',
  fieldsMapping: {},
  previewEnabled: false,
  autocompleteEnabled: false,
  moreLikeThisEnabled: false,
  fieldPreviewEnabled: {},
};

/**
 * Parses the component search field
 */
export const useSearchField = (value?: string | null) => {
  const {
    searchIndex,
    fieldsMapping,
    previewEnabled,
    autocompleteEnabled,
    moreLikeThisEnabled,
    fieldPreviewEnabled,
  } = useMemo((): SearchField => {
    const normalizedValue = value?.trim();

    // Empty datasource values are expected in some routes and should not log errors.
    if (!normalizedValue) {
      return EMPTY_SEARCH_FIELD;
    }

    try {
      return JSON.parse(normalizedValue) as SearchField;
    } catch (error) {
      console.warn('Search field JSON is invalid. Using defaults.', error);
      return EMPTY_SEARCH_FIELD;
    }
  }, [value]);

  return {
    searchIndex,
    fieldsMapping,
    previewEnabled: previewEnabled ?? false,
    autocompleteEnabled: autocompleteEnabled ?? false,
    moreLikeThisEnabled: moreLikeThisEnabled ?? false,
    fieldPreviewEnabled: fieldPreviewEnabled ?? {},
  };
};
