'use client';
import { useSearchResultsActions, useSearchResultsSelectedFilters } from '@sitecore-search/react';

const buildRangeLabel = (min: number | undefined, max: number | undefined): string => {
  return typeof min === 'undefined'
    ? `< $${max}`
    : typeof max === 'undefined'
      ? ` > $${min}`
      : `$${min} - $${max}`;
};
const buildFacetLabel = (selectedFacet: any) => {
  if ('min' in selectedFacet || 'max' in selectedFacet) {
    return `${buildRangeLabel(selectedFacet.min, selectedFacet.max)}`;
  }
  return `${selectedFacet.valueLabel}`;
};

const Filter = () => {
  const selectedFacetsFromApi = useSearchResultsSelectedFilters();
  const { onRemoveFilter, onClearFilters } = useSearchResultsActions();
  return selectedFacetsFromApi.length > 0 ? (
    <div className="mb-4">
      <div className="mb-2 flex flex-row items-center justify-between">
        <h3 className="text-sm font-semibold md:text-base">Filters</h3>
        <button
          onClick={onClearFilters}
          className="text-opacity-75 text-sm font-medium text-gray-800 underline hover:text-gray-900 focus:outline-gray-900 dark:text-gray-100"
        >
          Clear Filters
        </button>
      </div>
      <div className="flex flex-wrap">
        {selectedFacetsFromApi.map((selectedFacet) => (
          <button
            key={`${selectedFacet.facetId}${selectedFacet.facetLabel}${selectedFacet.valueLabel}`}
            onClick={() => onRemoveFilter(selectedFacet)}
            className="whitespace-no-wrap relative m-1 max-w-full cursor-pointer overflow-hidden rounded-md bg-gray-400 py-1.5 pr-5 pl-2 text-xs font-medium text-ellipsis text-white before:absolute before:top-2/4 before:right-2 before:h-0.5 before:w-2.5 before:-rotate-45 before:bg-white before:content-[''] after:absolute after:top-2/4 after:right-2 after:h-0.5 after:w-2.5 after:rotate-45 after:bg-white after:content-[''] focus:outline-indigo-500"
          >
            {buildFacetLabel(selectedFacet)}
          </button>
        ))}
      </div>
    </div>
  ) : (
    <></>
  );
};

export default Filter;
