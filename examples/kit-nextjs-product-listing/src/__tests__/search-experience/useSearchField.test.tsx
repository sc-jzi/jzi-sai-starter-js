import { renderHook } from '@testing-library/react';
import { useSearchField } from '../../components/search-experience/search-components/useSearchField';

describe('useSearchField', () => {
  it('defaults moreLikeThisEnabled to false when the field is empty', () => {
    const { result } = renderHook(() => useSearchField(''));

    expect(result.current.moreLikeThisEnabled).toBe(false);
    expect(result.current.previewEnabled).toBe(false);
    expect(result.current.autocompleteEnabled).toBe(false);
  });

  it('parses moreLikeThisEnabled from the search field JSON', () => {
    const { result } = renderHook(() =>
      useSearchField(
        JSON.stringify({
          searchIndex: 'index-1',
          fieldsMapping: {},
          moreLikeThisEnabled: true,
        })
      )
    );

    expect(result.current.searchIndex).toBe('index-1');
    expect(result.current.moreLikeThisEnabled).toBe(true);
  });

  it('defaults moreLikeThisEnabled to false when the key is missing', () => {
    const { result } = renderHook(() =>
      useSearchField(
        JSON.stringify({
          searchIndex: 'index-1',
          fieldsMapping: {},
        })
      )
    );

    expect(result.current.moreLikeThisEnabled).toBe(false);
  });

  it('keeps camelCase fieldPreviewEnabled keys saved by the search controls app', () => {
    const { result } = renderHook(() =>
      useSearchField(
        JSON.stringify({
          searchIndex: 'index-1',
          fieldsMapping: { title: 'ProductName' },
          fieldPreviewEnabled: { title: true, images: false },
        })
      )
    );

    expect(result.current.fieldPreviewEnabled).toEqual({ title: true, images: false });
  });
});
