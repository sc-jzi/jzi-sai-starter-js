import {
  DEFAULT_PAGE_SIZE,
  MORE_LIKE_THIS_PAGE_SIZE,
  getEffectivePageSize,
  limitSearchResults,
  toSuggestionTerms,
} from '../../components/search-experience/search-components/constants';

describe('search experience helpers', () => {
  describe('getEffectivePageSize', () => {
    it('returns the configured page size when More like this is off', () => {
      expect(getEffectivePageSize(false, DEFAULT_PAGE_SIZE)).toBe(DEFAULT_PAGE_SIZE);
      expect(getEffectivePageSize(false, 12)).toBe(12);
    });

    it('returns three when More like this is on', () => {
      expect(getEffectivePageSize(true, DEFAULT_PAGE_SIZE)).toBe(MORE_LIKE_THIS_PAGE_SIZE);
      expect(getEffectivePageSize(true, 12)).toBe(3);
    });
  });

  describe('limitSearchResults', () => {
    it('returns all results when More like this is off', () => {
      const results = [1, 2, 3, 4, 5, 6];
      expect(limitSearchResults(results, false)).toEqual(results);
    });

    it('returns at most three results when More like this is on', () => {
      expect(limitSearchResults([1, 2, 3, 4, 5, 6], true)).toEqual([1, 2, 3]);
      expect(limitSearchResults([1, 2], true)).toEqual([1, 2]);
    });
  });

  describe('toSuggestionTerms', () => {
    it('maps QuerySuggestionItem objects to queryPlusText strings', () => {
      expect(
        toSuggestionTerms([
          { text: 'sitecore', queryPlusText: 'sitecore' },
          { text: 'sitecoreai', queryPlusText: 'sitecoreai' },
          { text: 'cloud', queryPlusText: 'sitecore cloud' },
        ])
      ).toEqual(['sitecore', 'sitecoreai', 'sitecore cloud']);
    });

    it('falls back to text when queryPlusText is missing', () => {
      expect(toSuggestionTerms([{ text: 'sitecore' }])).toEqual(['sitecore']);
    });

    it('keeps legacy string suggestions', () => {
      expect(toSuggestionTerms(['sitecore', 'sitecoreai'])).toEqual(['sitecore', 'sitecoreai']);
    });

    it('returns an empty array for missing or empty suggestions', () => {
      expect(toSuggestionTerms(undefined)).toEqual([]);
      expect(toSuggestionTerms(null)).toEqual([]);
      expect(toSuggestionTerms([])).toEqual([]);
    });
  });
});
