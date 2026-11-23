'use client';
import { useCallback } from 'react';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import { event } from '@sitecore-content-sdk/events';

type SearchInteractionType = 'clicked' | 'viewed';

type UseEventOptions = {
  query: string;
  uid?: string;
  searchIndexId: string;
  pageSize: number;
  numResults: number;
  totalResults: number;
};

/**
 * This hook is used to send events to SitecoreCloud.
 */
export const useEvent = ({
  query,
  uid,
  searchIndexId,
  pageSize,
  numResults,
  totalResults,
}: UseEventOptions) => {
  const { page } = useSitecore();
  const { isEditing, isPreview } = page.mode;
  const { route } = page?.layout?.sitecore;

  const sendEvent = useCallback(
    (type: SearchInteractionType) => {
      if (process.env.NODE_ENV === 'development' || isEditing || isPreview) return;

      event({
        type: type === 'viewed' ? 'SC_SEARCH_WIDGET_VIEW' : 'SC_SEARCH_WIDGET_CLICK',
        page: 'search',
        channel: 'web',
        language: route?.itemLanguage,
        searchData: {
          request: {
            keyword: query ?? '',
            num_requested: pageSize,
            num_results: numResults,
            total_results: totalResults,
          },
        },
        sc_aisearch: {
          metadata: {
            version: '1.0',
          },
          data: {
            componentId: uid ?? '',
            configId: searchIndexId,
          },
        },
      });
    },
    [
      route?.itemLanguage,
      uid,
      query,
      searchIndexId,
      pageSize,
      numResults,
      totalResults,
      isEditing,
      isPreview,
    ]
  );

  return sendEvent;
};
