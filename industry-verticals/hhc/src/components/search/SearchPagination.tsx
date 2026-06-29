'use client';
import { ArrowLeftIcon, ArrowRightIcon } from '@radix-ui/react-icons';
import { useSearchResultsActions } from '@sitecore-search/react';
import { Pagination } from '@sitecore-search/ui';

type SearchPaginationProps = {
  currentPage: number;
  totalPages: number;
};

const SearchPagination = ({ currentPage, totalPages }: SearchPaginationProps) => {
  const { onPageNumberChange } = useSearchResultsActions();
  return (
    <Pagination.Root
      currentPage={currentPage}
      defaultCurrentPage={1}
      totalPages={totalPages}
      onPageChange={(v) =>
        onPageNumberChange({
          page: v,
        })
      }
      className="mt-4 flex"
    >
      <Pagination.PrevPage
        onClick={(e) => e.preventDefault()}
        className="mx-2 my-0 cursor-pointer hover:text-gray-700 focus:outline-gray-700 data-[current=true]:hidden dark:hover:text-gray-400 dark:focus:outline-gray-400"
      >
        <ArrowLeftIcon />
      </Pagination.PrevPage>
      <Pagination.Pages>
        {(pagination) =>
          Pagination.paginationLayout(pagination, {
            boundaryCount: 1,
            siblingCount: 1,
          }).map(({ page, type }) =>
            type === 'page' ? (
              <Pagination.Page
                key={page}
                aria-label={`Page ${page}`}
                page={page as number}
                onClick={(e) => e.preventDefault()}
                className="mx-2 my-0 cursor-pointer hover:text-gray-700 focus:outline-gray-700 data-[current=true]:pointer-events-none data-[current=true]:text-gray-700 data-[current=true]:no-underline dark:hover:text-gray-400 dark:focus:outline-gray-400 dark:data-[current=true]:text-gray-400"
              >
                {page}
              </Pagination.Page>
            ) : (
              <span key={type}>...</span>
            )
          )
        }
      </Pagination.Pages>
      <Pagination.NextPage
        onClick={(e) => e.preventDefault()}
        className="mx-2 my-0 cursor-pointer hover:text-gray-700 focus:outline-gray-700 data-[current=true]:hidden dark:hover:text-gray-400 dark:focus:outline-gray-400"
      >
        <ArrowRightIcon />
      </Pagination.NextPage>
    </Pagination.Root>
  );
};

export default SearchPagination;
