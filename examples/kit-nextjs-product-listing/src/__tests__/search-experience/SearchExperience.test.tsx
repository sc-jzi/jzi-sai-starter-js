/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Default as SearchExperienceDefault } from '../../components/search-experience/SearchExperience';
import { LoadMore as SearchExperienceLoadMore } from '../../components/search-experience/SearchExperience.LoadMore';

const mockUseSearch = jest.fn();
const mockUseInfiniteSearch = jest.fn();
const mockUseSuggest = jest.fn();
const mockUsePathname = jest.fn(() => '/');
const mockAppRouterPush = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      SearchExperience_LoadMore: 'Load more',
      SearchExperience_ResultsFound: 'results found',
      SearchExperience_PreviousPage: 'Previous',
      SearchExperience_NextPage: 'Next',
      SearchExperience_SearchInputPlaceholder: 'Search items...',
    };
    return translations[key] || key;
  },
}));

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: mockAppRouterPush, replace: jest.fn() }),
  usePathname: () => mockUsePathname(),
}));

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  useSitecore: () => ({
    page: { mode: { isEditing: false, isPreview: false } },
  }),
  withDatasourceCheck: () => (Component: React.ComponentType) => Component,
}));

jest.mock('@sitecore-content-sdk/nextjs/search', () => ({
  useSearch: (...args: unknown[]) => mockUseSearch(...args),
  useInfiniteSearch: (...args: unknown[]) => mockUseInfiniteSearch(...args),
  useSuggest: (...args: unknown[]) => mockUseSuggest(...args),
}));

jest.mock('../../components/search-experience/search-components/SearchItem', () => ({
  SearchItem: ({ data }: { data: { sc_item_id: string } }) => (
    <div data-testid="search-item">{data.sc_item_id}</div>
  ),
}));

jest.mock(
  '../../components/search-experience/search-components/SearchItem/SearchItemTitle',
  () => ({
    SearchItemTitle: ({ text }: { text: { value: string } }) => <span>{text.value}</span>,
  })
);

jest.mock('../../components/search-experience/search-components/useEvent', () => ({
  useEvent: () => jest.fn(),
}));

jest.mock('../../components/search-experience/search-components/useRouter', () => ({
  useRouter: () => ({ setRouterQuery: jest.fn() }),
}));

const makeResults = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    sc_item_id: `item-${index + 1}`,
    Description: '',
    Price: '',
    ProductName: `Product ${index + 1}`,
    AmpPower: '',
    Link: '',
  }));

const createProps = (config: Record<string, unknown> = {}) =>
  ({
    params: { columns: '3', pageSize: 6 },
    fields: {
      search: {
        value: JSON.stringify({
          searchIndex: 'index-1',
          fieldsMapping: {},
          ...config,
        }),
      },
    },
    rendering: { uid: 'uid-1' },
  }) as any;

describe('SearchExperience', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');

    mockUseSearch.mockReturnValue({
      total: 6,
      totalPages: 2,
      results: makeResults(6),
      isLoading: false,
      isSuccess: true,
      isError: false,
      error: null,
    });

    mockUseInfiniteSearch.mockReturnValue({
      total: 6,
      loadMore: jest.fn(),
      results: makeResults(6),
      isLoading: false,
      isLoadingMore: false,
      error: null,
      isError: false,
      isSuccess: true,
      hasNextPage: true,
    });

    mockUseSuggest.mockReturnValue({
      querySuggestions: [],
      previewResults: [],
    });
    mockAppRouterPush.mockReset();
  });

  it('navigates to the mapped link when a preview item is selected', () => {
    mockUseSuggest.mockReturnValue({
      querySuggestions: [],
      previewResults: [
        {
          sc_item_id: 'preview-item',
          Description: '',
          Price: '',
          ProductName: 'Preview Product',
          AmpPower: '',
          Link: '/products/preview-item',
        },
      ],
    });

    render(
      <SearchExperienceDefault
        {...createProps({
          previewEnabled: true,
          fieldsMapping: { title: 'ProductName', link: 'Link' },
          fieldPreviewEnabled: { title: true },
        })}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Search items...'), {
      target: { value: 'preview' },
    });
    fireEvent.mouseDown(screen.getByText('Preview Product'));

    expect(mockAppRouterPush).toHaveBeenCalledWith('/products/preview-item');
  });

  it('does not navigate when a preview item has no mapped link', () => {
    mockUseSuggest.mockReturnValue({
      querySuggestions: [],
      previewResults: [
        {
          sc_item_id: 'preview-item',
          Description: '',
          Price: '',
          ProductName: 'Preview Product',
          AmpPower: '',
          Link: '/products/preview-item',
        },
      ],
    });

    render(
      <SearchExperienceDefault
        {...createProps({
          previewEnabled: true,
          fieldsMapping: { title: 'ProductName' },
          fieldPreviewEnabled: { title: true },
        })}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Search items...'), {
      target: { value: 'preview' },
    });
    fireEvent.mouseDown(screen.getByText('Preview Product'));

    expect(mockAppRouterPush).not.toHaveBeenCalled();
  });

  it('does not navigate when the preview item has no usable mapped link', () => {
    mockUseSuggest.mockReturnValue({
      querySuggestions: [],
      previewResults: [
        {
          sc_item_id: 'preview-item',
          Description: '',
          Price: '',
          ProductName: 'Preview Product',
          AmpPower: '',
          Link: 'javascript:alert(1)',
        },
      ],
    });

    render(
      <SearchExperienceDefault
        {...createProps({
          previewEnabled: true,
          fieldsMapping: { title: 'ProductName', link: 'Link' },
          fieldPreviewEnabled: { title: true },
        })}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Search items...'), {
      target: { value: 'preview' },
    });
    fireEvent.mouseDown(screen.getByText('Preview Product'));

    expect(mockAppRouterPush).not.toHaveBeenCalled();
  });

  it('shows the search bar, pagination, and all results in Suggest mode', () => {
    render(<SearchExperienceDefault {...createProps({ moreLikeThisEnabled: false })} />);

    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getAllByTestId('search-item')).toHaveLength(6);
    expect(mockUseSearch).toHaveBeenCalledWith(expect.objectContaining({ pageSize: 6, query: '' }));
    expect(mockUseSearch.mock.calls[0][0].seedItemUrl).toBeUndefined();
  });

  it('hides the search bar and pagination and shows three items when More like this is enabled', () => {
    mockUsePathname.mockReturnValue('/products/cloud');
    render(<SearchExperienceDefault {...createProps({ moreLikeThisEnabled: true })} />);

    expect(screen.queryByPlaceholderText('Search items...')).not.toBeInTheDocument();
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('search-item')).toHaveLength(3);
    expect(mockUseSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        pageSize: 3,
        seedItemUrl: new URL('/products/cloud', window.location.origin).toString(),
      })
    );
    expect(mockUseSearch.mock.calls[0][0].query).toBeUndefined();
  });

  it('shows the search bar and Load more in the LoadMore variant', () => {
    render(<SearchExperienceLoadMore {...createProps({ moreLikeThisEnabled: false })} />);

    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Load more' })).toBeInTheDocument();
    expect(screen.getAllByTestId('search-item')).toHaveLength(6);
    expect(mockUseInfiniteSearch).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: 6, query: '' })
    );
    expect(mockUseInfiniteSearch.mock.calls[0][0].seedItemUrl).toBeUndefined();
  });

  it('hides the search bar and Load more and shows three items when More like this is enabled', () => {
    mockUsePathname.mockReturnValue('/products/cloud');
    render(<SearchExperienceLoadMore {...createProps({ moreLikeThisEnabled: true })} />);

    expect(screen.queryByPlaceholderText('Search items...')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
    expect(screen.getAllByTestId('search-item')).toHaveLength(3);
    expect(mockUseInfiniteSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        pageSize: 3,
        seedItemUrl: new URL('/products/cloud', window.location.origin).toString(),
      })
    );
    expect(mockUseInfiniteSearch.mock.calls[0][0].query).toBeUndefined();
  });
});
