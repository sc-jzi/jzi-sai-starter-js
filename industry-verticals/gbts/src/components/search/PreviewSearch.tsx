'use client';

import type { ChangeEvent, SyntheticEvent } from 'react';
import { useCallback } from 'react';
import type { PreviewSearchInitialState } from '@sitecore-search/react';
import { WidgetDataType, usePreviewSearch, widget } from '@sitecore-search/react';
import { ArticleCard, PreviewSearch } from '@sitecore-search/ui';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Spinner from './Spinner';
import SuggestionBlock from './SuggestionBlock';
import { PREVIEW_WIDGET_ID } from '../../_data/customizations';
import { useSearchTracking, type Events } from '../../hooks/useSearchTracking';

const SEARCH_CONFIG = {
  source: process.env.NEXT_PUBLIC_SEARCH_SOURCE as string,
};

type ArticleModel = {
  id: string;
  title: string;
  image_url: string;
  url: string;
  source_id?: string;
  name: string;
};

type PreviewSearchComponentProps = {
  defaultItemsPerPage?: number;
  isOpen: boolean;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

type InitialState = PreviewSearchInitialState<'itemsPerPage' | 'suggestionsList'>;

export const PreviewSearchComponent = ({
  defaultItemsPerPage = 6,
  isOpen,
  setIsSearchOpen,
}: PreviewSearchComponentProps) => {
  const router = useRouter();
  const { handleSearch } = useSearchTracking();

  const {
    actions: { onKeyphraseChange },
    queryResult,
    queryResult: {
      isFetching,
      isLoading,
      data: { suggestion: { title_context_aware: articleSuggestions = [] } = {} } = {},
    },
  } = usePreviewSearch<ArticleModel, InitialState>({
    state: {
      suggestionsList: [{ suggestion: 'title_context_aware', max: 6 }],
      itemsPerPage: defaultItemsPerPage,
    },
    query: (query): any => {
      if (SEARCH_CONFIG.source !== '') {
        const sources = SEARCH_CONFIG.source.split('|');
        sources.forEach((source) => {
          query.getRequest().addSource(source.trim());
        });
      }
    },
  });

  const loading = isLoading || isFetching;

  const keyphraseHandler = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const target = event.target;
      onKeyphraseChange({ keyphrase: target.value });
    },
    [onKeyphraseChange]
  );

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    if (isOpen) setIsSearchOpen(false);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const target = e.target.query as HTMLInputElement;
    router.push(`/search?q=${target.value}`);
    target.value = '';
  };

  return (
    <PreviewSearch.Root>
      <form
        onSubmit={handleSubmit}
        className="relative w-[min(42rem,calc(100vw-8rem))]"
      >
        <svg
          className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
          />
        </svg>
  
        <PreviewSearch.Input
          name="query"
          className="h-11 w-full rounded-lg border border-slate-300 bg-white py-2 pr-12 pl-11 text-base text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-[#00254c] focus:ring-2 focus:ring-[#00254c]/20 focus:outline-none"
          onChange={keyphraseHandler}
          autoComplete="off"
          placeholder="Search articles and resources"
          autoFocus
        />
  
        <button
          type="button"
          onClick={() => setIsSearchOpen(false)}
          className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close search"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
      </form>
  
      <PreviewSearch.Content
        className="
          z-[100]
          mt-2
          flex
          max-h-[32rem]
          w-[min(56rem,calc(100vw-2rem))]
          overflow-hidden
          rounded-xl
          border
          border-slate-200
          bg-white
          shadow-[0_20px_50px_rgba(15,23,42,0.22)]
        "
      >
        <Spinner loading={loading} />
  
        {!loading && (
          <>
            {articleSuggestions.length > 0 && (
              <PreviewSearch.Suggestions
                className="
                  hidden
                  w-56
                  shrink-0
                  list-none
                  border-r
                  border-slate-200
                  bg-slate-50
                  p-4
                  md:block
                "
              >
                <SuggestionBlock
                  blockId="title_context_aware"
                  items={articleSuggestions}
                  title="Suggestions"
                />
              </PreviewSearch.Suggestions>
            )}
  
            <PreviewSearch.Results defaultQueryResult={queryResult}>
              {({
                isFetching: isResultsFetching,
                data: { content: articles = [] } = {},
              }) => (
                <PreviewSearch.Items
                  data-loading={isResultsFetching}
                  className="
                    grid
                    max-h-[32rem]
                    flex-1
                    list-none
                    grid-cols-1
                    gap-4
                    overflow-y-auto
                    bg-white
                    p-4
                    sm:grid-cols-2
                    lg:grid-cols-3
                  "
                >
                  <Spinner loading={isResultsFetching} />
  
                  {!isResultsFetching &&
                    articles.map((article, index) => (
                      <PreviewSearch.Item key={article.id} asChild>
                        <PreviewSearch.ItemLink
                          onClick={(event) =>
                            handleSearch(event, {
                              url: article.url,
                              widgetId: PREVIEW_WIDGET_ID,
                              entityType: 'content',
                              events: [
                                'EntityPageView',
                                'PreviewSearchClickEvent',
                              ] as Events[],
                              entityId: article.id,
                              itemIndex: index,
                            })
                          }
                          href={article.url}
                          className="
                            group
                            block
                            min-w-0
                            overflow-hidden
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            text-slate-900
                            no-underline
                            transition
                            hover:-translate-y-0.5
                            hover:border-slate-300
                            hover:shadow-lg
                            focus:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-[#00254c]
                          "
                        >
                          <ArticleCard.Root className="h-full">
                            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                              {article.image_url ? (
                                <Image
                                  src={article.image_url}
                                  alt=""
                                  fill
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                                  className="object-cover transition duration-300 group-hover:scale-105"
                                  unoptimized
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                                  No image available
                                </div>
                              )}
                            </div>
  
                            <div className="p-4">
                              <ArticleCard.Title className="m-0 line-clamp-2 text-sm leading-5 font-semibold text-slate-900">
                                {article.name || article.title}
                              </ArticleCard.Title>
  
                              <span className="mt-3 inline-flex items-center text-xs font-semibold text-[#00254c]">
                                View result
                                <span
                                  className="ml-1 transition-transform group-hover:translate-x-1"
                                  aria-hidden="true"
                                >
                                  →
                                </span>
                              </span>
                            </div>
                          </ArticleCard.Root>
                        </PreviewSearch.ItemLink>
                      </PreviewSearch.Item>
                    ))}
  
                  {!isResultsFetching && articles.length === 0 && (
                    <li className="col-span-full flex min-h-40 items-center justify-center px-6 text-center text-sm text-slate-500">
                      Start typing to search articles and resources.
                    </li>
                  )}
                </PreviewSearch.Items>
              )}
            </PreviewSearch.Results>
          </>
        )}
      </PreviewSearch.Content>
    </PreviewSearch.Root>
  );
};

const PreviewSearchWidget = widget(
  PreviewSearchComponent,
  WidgetDataType.PREVIEW_SEARCH,
  'content'
);
export default PreviewSearchWidget;
