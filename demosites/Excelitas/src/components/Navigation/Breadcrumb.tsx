import { Fragment, JSX } from 'react';
import Link from 'next/link';
import { ComponentProps } from 'lib/component-props';

function formatBreadcrumb(text: string) {
  return decodeURIComponent(text);
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
    name = propItem.title.value;
  }
  return formatBreadcrumb(name);
}

function getBreadcrumbUrl(propItem: contextItem) {
  return propItem?.url?.path;
}

const Breadcrumb = (props: BreadcrumbProps): JSX.Element => {
  if (props?.fields?.data?.item === null) {
    return <div></div>;
  }

  const propItem = props.fields.data.item;
  const propItemAncestors = props.fields.data.item.ancestors;
  const breadcrumbs = [];

  const sxaStyles = `${props.params?.styles || ''}`;

  const pageItems = {
    title: getBreadcrumbTitle(propItem),
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
    <li key={index}>
      {bc.className === 'active' ? (
        <span className="font-medium text-excelitas-gray-900" aria-current="page">
          {bc.title}
        </span>
      ) : (
        <Link
          href={bc.url}
          title={bc.title}
          className="text-excelitas-gray-500 transition-colors hover:text-excelitas-green"
        >
          {bc.title}
        </Link>
      )}
    </li>
  ));

  return (
    <nav className={`breadcrumb py-4 ${sxaStyles}`} aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        <li>
          <Link href="/" className="text-excelitas-gray-500 transition-colors hover:text-excelitas-green">
            Home
          </Link>
        </li>
        {breadcrumbListItems.map((item, i) => (
          <Fragment key={i}>
            <li className="text-excelitas-gray-300" aria-hidden="true">
              /
            </li>
            {item}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
};

export const Default = Breadcrumb;
