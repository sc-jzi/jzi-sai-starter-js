'use client';
import { useMemo } from 'react';
import { Field } from '@sitecore-content-sdk/nextjs';
import { SearchDocument, SearchFieldsMapping } from './models';
import { SearchItemTitle } from './SearchItem/SearchItemTitle';
import { SearchItemSummary } from './SearchItem/SearchItemSummary';
import { SearchItemLink } from './SearchItem/SearchItemLink';
import { SearchItemCategory } from './SearchItem/SearchItemCategory';
import { SearchItemTags } from './SearchItem/SearchItemTags';
import { SearchItemImage } from './SearchItem/SearchItemImage';

type SearchPreviewItemFields = {
  summary?: Field<string>;
  category?: Field<string>;
  title?: Field<string>;
  tags?: Field<string[] | string>;
  link?: Field<string>;
  image?: Field<string>;
};

interface SearchPreviewItemProps {
  data: SearchDocument;
  mapping: SearchFieldsMapping;
  /**
   * camelCase keys (tags, images, description, title, type, link) that are
   * enabled for display in the preview panel.
   */
  fieldPreviewEnabled: Record<string, boolean>;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
}

const getField = (
  fields: { [key: string]: string },
  key: keyof SearchDocument
): { value: string | string[] } | undefined => {
  if (!key) return undefined;
  const k = String(key);
  if (typeof fields?.[k] !== 'string') {
    return { value: fields[k] } as { value: string[] };
  }
  return { value: fields[k] } as { value: string };
};

/**
 * A compact preview card used inside the dropdown result preview panel.
 * Renders only the field slots that are both mapped and enabled via
 * `fieldPreviewEnabled` (camelCase keys: title, images, description, type, link, tags).
 */
export const SearchPreviewItem = ({
  data,
  mapping,
  fieldPreviewEnabled,
  onMouseDown,
}: SearchPreviewItemProps) => {
  const fields = useMemo((): SearchPreviewItemFields => {
    return {
      title:
        fieldPreviewEnabled.title && mapping.title
          ? (getField(data, mapping.title) as { value: string })
          : undefined,
      image:
        fieldPreviewEnabled.images && mapping.images
          ? (getField(data, mapping.images) as { value: string })
          : undefined,
      tags:
        fieldPreviewEnabled.tags && mapping.tags
          ? (getField(data, mapping.tags) as { value: string | string[] })
          : undefined,
      summary:
        fieldPreviewEnabled.description && mapping.description
          ? (getField(data, mapping.description) as { value: string })
          : undefined,
      category:
        fieldPreviewEnabled.type && mapping.type
          ? (getField(data, mapping.type) as { value: string })
          : undefined,
      link:
        fieldPreviewEnabled.link && mapping.link
          ? (getField(data, mapping.link) as { value: string })
          : undefined,
    };
  }, [data, mapping, fieldPreviewEnabled]);

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
      onMouseDown={onMouseDown}
    >
      {fields.image && (
        <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden bg-gray-100">
          <SearchItemImage image={fields.image} variant="list" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {fields.category && (
          <SearchItemCategory category={fields.category} className="text-xs text-gray-500" />
        )}
        {fields.title && (
          <SearchItemTitle
            text={fields.title}
            className="text-sm font-medium text-gray-900 truncate"
          />
        )}
        {fields.tags && <SearchItemTags tags={fields.tags} className="text-xs" />}
        {fields.summary && (
          <SearchItemSummary
            summary={fields.summary}
            className="text-xs text-gray-500 line-clamp-1"
          />
        )}
        {fields.link && (
          <SearchItemLink
            link={fields.link}
            onClick={() => {
              /* navigation handled by parent */
            }}
          />
        )}
      </div>
    </div>
  );
};
