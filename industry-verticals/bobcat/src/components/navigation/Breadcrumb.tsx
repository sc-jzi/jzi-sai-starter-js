'use client';

import { JSX } from 'react';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { productOf } from 'lib/pim/product-context';

function formatBreadcrumb(text: string) {
  text = decodeURIComponent(text);
  return text;
}

type contextItem = {
  url: { path: string };
  name: string;
  pageTitle: { value: string };
  displayName: string;
  title: { value: string };
  ancestors: contextItem[];
};

type BreadcrumbProps = ComponentProps & {
  fields: {
    data: {
      item: contextItem;
      ancestors: contextItem[];
    };
  };
};

function getBreadcrumbTitle(propItem: contextItem) {
  let name = propItem.pageTitle?.value;
  if (!name) {
    name = propItem.name;
  }
  if (!name) {
    name = propItem.displayName;
  }
  if (!name) {
    name = propItem.title?.value ?? '';
  }
  return formatBreadcrumb(name);
}

function getBreadcrumbUrl(propItem: contextItem) {
  return propItem?.url?.path;
}

/** The current page's crumb; on a PIM product page (the category's `*` item) the product's model, not "*". */
const useCurrentTitle = (item: contextItem): string => {
  const { page } = useSitecore();
  return productOf(page)?.model || getBreadcrumbTitle(item);
};

const Breadcrumb = (props: BreadcrumbProps): JSX.Element => {
  const currentTitle = useCurrentTitle(props?.fields?.data?.item ?? ({} as contextItem));
  if (props?.fields?.data?.item === null) {
    return <div></div>;
  }

  const propItem = props.fields.data.item;
  const propItemAncestors = props.fields.data.item.ancestors;
  const breadcrumbs = [];

  const sxaStyles = `${props.params?.styles || ''}`;

  const pageItems = {
    title: currentTitle,
    url: getBreadcrumbUrl(propItem),
    className: 'active',
  };

  breadcrumbs.push(pageItems);

  if (propItemAncestors) {
    propItemAncestors.map((parent) => {
      breadcrumbs.push({
        title: getBreadcrumbTitle(parent),
        url: getBreadcrumbUrl(parent),
        className: 'inactive',
      });
    });
  }

  const breadcrumbListItems = breadcrumbs.reverse().map((bc, index) => (
    <li key={index} className={bc.className}>
      <a title={bc.title} href={bc.url}>
        {bc.title}
      </a>
    </li>
  ));

  return (
    <nav className={`breadcrumb ${sxaStyles}`} aria-label="breadcrumbs">
      <ol className="list">{breadcrumbListItems}</ol>
    </nav>
  );
};

export const Default = Breadcrumb;

// Bobcat: a slim band of small links (Home › … › parent) with drawn triangle separators; the current page is plain text.
export const Bobcat = (props: BreadcrumbProps): JSX.Element => {
  const item = props?.fields?.data?.item;
  const currentTitle = useCurrentTitle(item ?? ({} as contextItem));
  if (!item) {
    return <div className="breadcrumb-bobcat component" />;
  }
  const ancestors = [...(item.ancestors ?? [])].reverse();
  const id = props.params?.RenderingIdentifier;
  return (
    <nav
      className={`component breadcrumb-bobcat ${props.params?.styles || ''}`}
      aria-label="Breadcrumb"
      id={id ? id : undefined}
    >
      <ol className="breadcrumb-bobcat__list">
        {ancestors.map((a, i) => (
          <li key={i} className="breadcrumb-bobcat__item">
            <a className="breadcrumb-bobcat__link" href={getBreadcrumbUrl(a)}>
              {getBreadcrumbTitle(a)}
            </a>
          </li>
        ))}
        <li className="breadcrumb-bobcat__item breadcrumb-bobcat__item--current" aria-current="page">
          <span>{currentTitle}</span>
        </li>
      </ol>
    </nav>
  );
};
