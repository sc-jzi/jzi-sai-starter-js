'use client';

import { useRouter } from 'next/navigation';
import { usePreviewSearchActions } from '@sitecore-search/react';
import { PreviewSearch } from '@sitecore-search/ui';

type SuggestionBlockProps = {
  items: Array<{ text: string }>;
  title: string;
  blockId: string;
  filterAttribute?: string;
  disabled?: boolean;
};

const SuggestionBlock = ({
  items,
  title,
  blockId,
  filterAttribute,
  disabled,
}: SuggestionBlockProps) => {
  const { onSuggestionClick } = usePreviewSearchActions();
  const router = useRouter();
  return (
    <>
      {items.length > 0 && (
        <PreviewSearch.SuggestionsGroup
          className="flex flex-1 flex-col"
          id={blockId}
          filterAttribute={filterAttribute}
        >
          <h2 className="m-2 box-border block pl-1 text-lg font-bold dark:text-gray-100">
            {title}
          </h2>
          {items.map(({ text }) => (
            <PreviewSearch.SuggestionTrigger
              className="focus:text-bold cursor-pointer p-2 text-sm hover:bg-white hover:text-gray-900 hover:outline-none focus:bg-white focus:outline-none data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:outline-none dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200 dark:focus:bg-gray-700 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-200"
              id={text}
              key={text}
              asChild
              disabled={disabled}
            >
              <a
                onClick={() => {
                  onSuggestionClick({
                    name: blockId,
                    title,
                    value: text,
                    displayName: text,
                  });
                  router.push('/search?q=' + text);
                }}
              >
                {text}
              </a>
            </PreviewSearch.SuggestionTrigger>
          ))}
        </PreviewSearch.SuggestionsGroup>
      )}
    </>
  );
};

export default SuggestionBlock;
