'use client';
import { CheckIcon } from '@radix-ui/react-icons';
import type { SearchResponseFacet } from '@sitecore-search/react';
import { useSearchResultsActions } from '@sitecore-search/react';
import {
  AccordionFacets,
  FacetItem,
  RangeFacet,
  SearchResultsAccordionFacets,
  SearchResultsFacetValueRange,
} from '@sitecore-search/ui';

type PriceFacetProps = {
  min: number;
  max: number;
};

const PriceFacet = ({ min, max }: PriceFacetProps) => {
  return (
    <SearchResultsFacetValueRange
      max={max}
      min={min}
      autoAdjustValues={false}
      className="relative mb-8 flex h-5 w-full touch-none items-center select-none"
    >
      <RangeFacet.Track className="relative h-[3px] grow rounded-full bg-gray-400">
        <RangeFacet.Range className="absolute h-full rounded-full bg-gray-700" />
      </RangeFacet.Track>
      <RangeFacet.Start className="block h-5 w-5 cursor-pointer rounded-[10px] bg-[white] text-center text-[10px] leading-5 shadow-[0_2px_10px_grey] hover:bg-gray-700 focus:shadow-[0_0_0_3px_grey]">
        {(value) => <span className="absolute top-[30px] left-0 text-sm">${value}</span>}
      </RangeFacet.Start>
      <RangeFacet.End className="block h-5 w-5 cursor-pointer rounded-[10px] bg-[white] text-center text-[10px] leading-5 shadow-[0_2px_10px_grey] hover:bg-gray-700 focus:shadow-[0_0_0_3px_grey]">
        {(value) => <span className="absolute top-[30px] left-0 text-sm">${value}</span>}
      </RangeFacet.End>
    </SearchResultsFacetValueRange>
  );
};

type SearchFacetsProps = {
  facets: SearchResponseFacet[];
};

const SearchFacets = ({ facets }: SearchFacetsProps) => {
  const { onFacetClick } = useSearchResultsActions();
  return (
    <SearchResultsAccordionFacets
      defaultFacetTypesExpandedList={['type']}
      onFacetTypesExpandedListChange={() => {}}
      onFacetValueClick={onFacetClick}
      className="w-full"
    >
      {facets.map((f) => (
        <AccordionFacets.Facet
          facetId={f.name}
          key={f.name}
          className="mb-4 block rounded-lg border border-b border-gray-200 bg-white p-6 shadow-sm"
        >
          <AccordionFacets.Header className="flex">
            <AccordionFacets.Trigger className="text-sm font-semibold focus:outline-gray-700 md:text-base">
              {f.label}
            </AccordionFacets.Trigger>
          </AccordionFacets.Header>
          <AccordionFacets.Content className="mt-8">
            {f.name !== 'price' ? (
              <AccordionFacets.ValueList className="mt-2 flex list-none flex-col space-y-2">
                {f.value.map((v, index: number) => (
                  <FacetItem
                    key={v.id}
                    {...{
                      index,
                      facetValueId: v.id,
                    }}
                    className="group flex cursor-pointer items-center text-sm"
                  >
                    <AccordionFacets.ItemCheckbox className="form-checkbox hover:border-heading aria-checked:hover:bg-heading aria-checked:focus:bg-heading h-5 w-5 flex-none cursor-pointer rounded border border-gray-300 transition duration-500 ease-in-out focus:outline-gray-700 aria-checked:bg-gray-700">
                      <AccordionFacets.ItemCheckboxIndicator className="h-5 w-5 text-white">
                        <CheckIcon />
                      </AccordionFacets.ItemCheckboxIndicator>
                    </AccordionFacets.ItemCheckbox>
                    <AccordionFacets.ItemLabel className="ms-4 -mt-0.5 text-sm">
                      {v.text} {v.count && `(${v.count})`}
                    </AccordionFacets.ItemLabel>
                  </FacetItem>
                ))}
              </AccordionFacets.ValueList>
            ) : (
              <PriceFacet
                min={Math.floor(f.value[0].min)}
                max={Math.floor(f.value[f.value.length - 1].max)}
              />
            )}
          </AccordionFacets.Content>
        </AccordionFacets.Facet>
      ))}
    </SearchResultsAccordionFacets>
  );
};

export default SearchFacets;
