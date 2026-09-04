'use client';

import { JSX } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  Text,
  Link,
  useSitecore,
  NextImage,
} from '@sitecore-content-sdk/nextjs';
import useVisibility from 'src/hooks/useVisibility';

type JsonField<T = string> = { jsonValue?: Field<T> };
type JsonImageField = { jsonValue?: ImageField };
type JsonLinkField = { jsonValue?: LinkField };

interface ArticleChild {
  id?: string;
  name?: string;
  url?: { path?: string };
  title?: JsonField;
  excerpt?: JsonField;
  thumbnail?: JsonImageField;
  created?: { value?: string };
}

interface GraphQLDatasource {
  title?: JsonField;
  title1?: JsonField;
  text1?: JsonField;
  image1?: JsonImageField;
  link1?: JsonLinkField;
  title2?: JsonField;
  text2?: JsonField;
  image2?: JsonImageField;
  link2?: JsonLinkField;
  title3?: JsonField;
  text3?: JsonField;
  image3?: JsonImageField;
  link3?: JsonLinkField;
  title4?: JsonField;
  text4?: JsonField;
  image4?: JsonImageField;
  link4?: JsonLinkField;
  children?: { results?: ArticleChild[] };
}

interface Fields {
  Title1?: Field<string>;
  Text1?: Field<string>;
  Image1?: ImageField;
  Link1?: LinkField;
  Title2?: Field<string>;
  Text2?: Field<string>;
  Image2?: ImageField;
  Link2?: LinkField;
  Title3?: Field<string>;
  Text3?: Field<string>;
  Image3?: ImageField;
  Link3?: LinkField;
  Title4?: Field<string>;
  Text4?: Field<string>;
  Image4?: ImageField;
  Link4?: LinkField;
  data?: { datasource?: GraphQLDatasource };
}

export type FourColumnCtaProps = {
  params: { [key: string]: string };
  fields: Fields;
};

type StoryCard = {
  key: string;
  image?: ImageField;
  title?: Field<string>;
  text?: Field<string>;
  link?: LinkField;
};

const emptyText: Field<string> = { value: '' };
const emptyImage: ImageField = { value: {} };
const emptyLink: LinkField = { value: { href: '' } };

const parseSitecoreDate = (value?: string): number => {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) {
    return parsed;
  }

  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
  if (!match) {
    return 0;
  }

  return Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6])
  );
};

const getDatasource = (fields?: Fields): GraphQLDatasource | undefined =>
  fields?.data?.datasource;

const getPromoColumns = (fields?: Fields): StoryCard[] => {
  const datasource = getDatasource(fields);

  return [1, 2, 3, 4].map((index) => {
    const key = String(index) as '1' | '2' | '3' | '4';
    return {
      key,
      image: datasource?.[`image${key}` as const]?.jsonValue || fields?.[`Image${key}` as const],
      title: datasource?.[`title${key}` as const]?.jsonValue || fields?.[`Title${key}` as const],
      text: datasource?.[`text${key}` as const]?.jsonValue || fields?.[`Text${key}` as const],
      link: datasource?.[`link${key}` as const]?.jsonValue || fields?.[`Link${key}` as const],
    };
  });
};

const getArticleStories = (fields?: Fields): StoryCard[] => {
  const datasource = getDatasource(fields);
  const children = datasource?.children?.results || [];
  const articles = children.filter(
    (item) =>
      item?.name &&
      item.name !== 'Data' &&
      (item.title?.jsonValue?.value || item.thumbnail?.jsonValue?.value)
  );

  if (!articles.length) {
    return [];
  }

  const hasDates = articles.some((item) => parseSitecoreDate(item.created?.value) > 0);
  const sorted = hasDates
    ? [...articles].sort(
        (left, right) =>
          parseSitecoreDate(right.created?.value) - parseSitecoreDate(left.created?.value)
      )
    : [...articles].reverse();

  const tag = datasource?.title?.jsonValue || { value: 'News & Insights' };

  return sorted.slice(0, 4).map((item, index) => ({
    key: item.id || item.name || String(index),
    image: item.thumbnail?.jsonValue,
    title: item.title?.jsonValue,
    text: tag,
    link: {
      value: {
        href: item.url?.path || '#',
        text: 'Read story',
      },
    },
  }));
};

const getStories = (fields?: Fields): StoryCard[] => {
  const articles = getArticleStories(fields);
  return articles.length ? articles : getPromoColumns(fields);
};

const hasStoryLink = (link?: LinkField): boolean =>
  Boolean(link?.value?.href && link.value.href !== '#');

export const Default = (props: FourColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const columns = getPromoColumns(props.fields);

  const Column = ({
    image,
    title,
    text,
    link,
    delay,
  }: {
    image?: ImageField;
    title?: Field<string>;
    text?: Field<string>;
    link?: LinkField;
    delay?: number;
  }) => {
    const [isVisible, domRef] = useVisibility(delay);
    return (
      <div
        className={`col-sm-12 col-lg-3 ${
          !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
        }`}
        ref={domRef}
      >
        <Link field={link || emptyLink}>
          <div className="content-wrapper">
            <NextImage field={image || emptyImage} width={300} height={300} />
            <div className="text-wrapper">
              <h2>
                <Text field={title || emptyText} />
              </h2>
              <p>
                <Text field={text || emptyText} />
              </p>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div
      className={`component component-spaced four-column-cta ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="row">
          {columns.map((column, index) => (
            <Column
              key={column.key}
              image={column.image}
              title={column.title}
              text={column.text}
              link={column.link}
              delay={index * 500}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const CovistaStories = (props: FourColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const stories = getStories(props.fields);

  const Card = ({ image, title, text, link }: Omit<StoryCard, 'key'>) => {
    const inner = (
      <>
        <div className="cv-stories__media">
          <NextImage field={image || emptyImage} width={480} height={260} />
        </div>
        {(isPageEditing || text?.value) && (
          <p className="cv-stories__tag">
            <Text field={text || emptyText} />
          </p>
        )}
        <h3 className="cv-stories__title">
          <Text field={title || emptyText} />
        </h3>
      </>
    );

    return (
      <div className="cv-stories__card-wrap">
        {link && hasStoryLink(link) && !isPageEditing ? (
          <Link field={link} className="cv-stories__card">
            {inner}
          </Link>
        ) : (
          <div className="cv-stories__card">{inner}</div>
        )}
        {isPageEditing && link && <Link field={link} className="cv-stories__editor-link" />}
      </div>
    );
  };

  return (
    <div className={`component four-column-cta cv-stories ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="cv-stories__grid">
          {stories.map((story) => (
            <Card
              key={story.key}
              image={story.image}
              title={story.title}
              text={story.text}
              link={story.link}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
