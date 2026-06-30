'use client';

import { JSX } from 'react';
import { ComponentProps } from 'lib/component-props';
import SearchResultsWidget from './SearchResultsComponent';
import { useSearchParams } from 'next/navigation';
import QuestionsAnswers from './QuestionsAnswers';
import { SEARCH_WIDGET_ID } from '../../_data/customizations';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export type SearchResultsProps = ComponentProps & {
  params: { [key: string]: string };
};

export const SearchResults = (props: SearchResultsProps): JSX.Element => {
  const sxaStyles = `${props.params?.styles || ''}`;
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';

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

export const Default = SearchResults;
