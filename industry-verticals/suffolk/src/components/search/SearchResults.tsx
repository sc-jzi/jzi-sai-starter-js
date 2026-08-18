'use client';

import { JSX, Suspense } from 'react';
import { ComponentProps } from 'lib/component-props';
import { useSearchParams } from 'next/navigation';
import SearchResultsWidget from './SearchResultsComponent';
import QuestionsAnswers from './QuestionsAnswers';
import { SEARCH_WIDGET_ID } from '../../_data/customizations';
import { isSitecoreSearchConfigured } from 'src/lib/sitecore-search';

export type SearchResultsProps = ComponentProps & {
  params: { [key: string]: string };
};

const SearchResultsInner = (props: SearchResultsProps): JSX.Element => {
  const sxaStyles = `${props.params?.styles || ''}`;
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';

  if (!isSitecoreSearchConfigured()) {
    return <div className={sxaStyles} />;
  }

  return (
    <div key={query} className={`${sxaStyles}`}>
      <QuestionsAnswers
        key={`${query}-questions`}
        rfkId="rfkid_qa"
        defaultKeyphrase={query}
        defaultRelatedQuestions={3}
      />
      <SearchResultsWidget rfkId={SEARCH_WIDGET_ID} defaultKeyphrase={query} />
    </div>
  );
};

export const SearchResults = (props: SearchResultsProps): JSX.Element => {
  return (
    <Suspense fallback={null}>
      <SearchResultsInner {...props} />
    </Suspense>
  );
};

export const Default = SearchResults;