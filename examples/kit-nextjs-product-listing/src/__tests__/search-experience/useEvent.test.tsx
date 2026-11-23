import { renderHook } from '@testing-library/react';
import { useEvent } from '../../components/search-experience/search-components/useEvent';

const mockEvent = jest.fn();
const mockUseSitecore = jest.fn();

jest.mock('@sitecore-content-sdk/events', () => ({
  event: (...args: unknown[]) => mockEvent(...args),
}));

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  useSitecore: () => mockUseSitecore(),
}));

const defaultOptions = {
  query: 'speaker',
  uid: 'component-1',
  searchIndexId: 'sync-main-index',
  pageSize: 20,
  numResults: 20,
  totalResults: 24,
};

const mockPage = ({
  isEditing = false,
  isPreview = false,
  itemLanguage = 'en',
}: {
  isEditing?: boolean;
  isPreview?: boolean;
  itemLanguage?: string;
} = {}) => ({
  page: {
    mode: { isEditing, isPreview },
    layout: {
      sitecore: {
        route: { itemLanguage },
      },
    },
  },
});

const setNodeEnv = (value: string) => {
  Object.defineProperty(process.env, 'NODE_ENV', {
    value,
    configurable: true,
  });
};

describe('useEvent', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    setNodeEnv('production');
    mockUseSitecore.mockReturnValue(mockPage());
  });

  afterEach(() => {
    setNodeEnv(originalNodeEnv ?? 'test');
  });

  it('sends SC_SEARCH_WIDGET_VIEW with searchData and sc_aisearch', () => {
    const { result } = renderHook(() => useEvent(defaultOptions));

    result.current('viewed');

    expect(mockEvent).toHaveBeenCalledWith({
      type: 'SC_SEARCH_WIDGET_VIEW',
      page: 'search',
      channel: 'web',
      language: 'en',
      searchData: {
        request: {
          keyword: 'speaker',
          num_requested: 20,
          num_results: 20,
          total_results: 24,
        },
      },
      sc_aisearch: {
        metadata: {
          version: '1.0',
        },
        data: {
          componentId: 'component-1',
          configId: 'sync-main-index',
        },
      },
    });
  });

  it('sends SC_SEARCH_WIDGET_CLICK for click interactions', () => {
    const { result } = renderHook(() => useEvent(defaultOptions));

    result.current('clicked');

    expect(mockEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SC_SEARCH_WIDGET_CLICK',
      })
    );
  });

  it('does not send events in editing mode', () => {
    mockUseSitecore.mockReturnValue(mockPage({ isEditing: true }));
    const { result } = renderHook(() => useEvent(defaultOptions));

    result.current('viewed');

    expect(mockEvent).not.toHaveBeenCalled();
  });

  it('does not send events in preview mode', () => {
    mockUseSitecore.mockReturnValue(mockPage({ isPreview: true }));
    const { result } = renderHook(() => useEvent(defaultOptions));

    result.current('viewed');

    expect(mockEvent).not.toHaveBeenCalled();
  });

  it('does not send events in development', () => {
    setNodeEnv('development');
    const { result } = renderHook(() => useEvent(defaultOptions));

    result.current('viewed');

    expect(mockEvent).not.toHaveBeenCalled();
  });
});
