'use client';

import type { ComponentProps, JSX } from 'react';
import { FilterEqual, WidgetDataType, useSearchResults, widget } from '@sitecore-search/react';
import ArticleCard from './ArticleCard';
import { useSearchTracking, type Events } from '../../hooks/useSearchTracking';
import { isSitecoreSearchConfigured } from 'src/lib/sitecore-search';

type HomeHighlightedProps = {
  type: string;
  source: string;
  widget: string;
};

export const HomeHighlightedComponent = ({ type = 'Article', source, widget }: HomeHighlightedProps): JSX.Element => {
  const {
    queryResult: { data: { content: articles = [] } = {} },
  } = useSearchResults({
    query: (query) => {
      query.getRequest().setSearchFilter(new FilterEqual('type', type));

      if (source !== '') {
        const sources = source.split('|');
        sources.forEach((source) => {
          query.getRequest().addSource(source.trim());
        });
      }
    },
  });

  const articlesToShow = articles.slice(0, 4);
  const { handleSearch } = useSearchTracking();

  return (
    <div className="container mx-auto px-4">
      <div className="my-12 text-center">
        <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Get Inspired</h2>
        <p className="text-xl text-gray-600">
          Discover amazing products and articles from our latest stories
        </p>
      </div>

      <div className="my-10 flex w-full justify-around text-gray-900 dark:text-gray-200">
        <div className="grid grid-cols-4 gap-x-5 gap-y-3">
          {articlesToShow.map((a, index) => (
            <ArticleCard
              article={a}
              key={a?.id ?? index}
              index={index}
              onItemClick={(e) =>
                handleSearch(e, {
                  url: a.url,
                  widgetId: widget,
                  entityType: 'content',
                  events: ['EntityPageView', 'SearchClickEvent'] as Events[],
                  entityId: a.id,
                  itemIndex: index,
                })
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const HomeHighlightedWidget = widget(HomeHighlightedComponent, WidgetDataType.SEARCH_RESULTS, 'content');

const HomeHighlighted = (props: ComponentProps<typeof HomeHighlightedWidget>) => {
  if (!isSitecoreSearchConfigured()) {
    return null;
  }

  return <HomeHighlightedWidget {...props} />;
};

export default HomeHighlighted;
