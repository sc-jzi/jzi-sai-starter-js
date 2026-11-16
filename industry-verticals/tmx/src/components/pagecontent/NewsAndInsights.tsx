import { JSX } from "react";
import {
  DateField,
  Field,
  ImageField,
  Link as ContentSdkLink,
  LinkField,
  NextImage as ContentSdkImage,
  Text,
} from "@sitecore-content-sdk/nextjs";
import { ComponentProps } from "lib/component-props";

type JsonValue<T> = { jsonValue?: T };

interface NewsAndInsightsItem {
  id: string;
  kind?: JsonValue<Field<string>>;
  image?: JsonValue<ImageField>;
  title?: JsonValue<Field<string>>;
  excerpt?: JsonValue<Field<string>>;
  date?: JsonValue<Field<string>>;
  link?: JsonValue<LinkField>;
}

interface NewsAndInsightsDatasource {
  id?: string;
  title?: JsonValue<Field<string>>;
  povHeading?: JsonValue<Field<string>>;
  povLink?: JsonValue<LinkField>;
  pressHeading?: JsonValue<Field<string>>;
  pressLink?: JsonValue<LinkField>;
  children?: { results?: NewsAndInsightsItem[] };
}

export type NewsAndInsightsProps = ComponentProps & {
  fields: {
    data?: {
      datasource?: NewsAndInsightsDatasource;
    };
  };
};

const formatDate = (date: Date | null): string =>
  date
    ? date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : "";

// Sitecore returns 0001-01-01 for an empty Date field.
const hasDate = (field?: Field<string>): boolean =>
  !!field?.value && new Date(field.value).getUTCFullYear() > 1;

const isPress = (item: NewsAndInsightsItem): boolean =>
  (item.kind?.jsonValue?.value || "").trim().toLowerCase() === "press";

const Chevron = (): JSX.Element => (
  <svg
    className="news-insights__chevron"
    viewBox="0 0 28 28"
    width="28"
    height="28"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M0 0h13l15 14-15 14H0l15-14z" fill="currentColor" />
  </svg>
);

const NewsAndInsightsEmpty = ({
  props,
}: {
  props: NewsAndInsightsProps;
}): JSX.Element => (
  <div
    className={`component news-insights ${props.params?.styles || ""}`.trimEnd()}
  >
    <div className="component-content">
      <span className="is-empty-hint">
        News And Insights: no datasource selected
      </span>
    </div>
  </div>
);

const PovCard = ({
  item,
  isEditing,
}: {
  item: NewsAndInsightsItem;
  isEditing: boolean;
}): JSX.Element => {
  const image = item.image?.jsonValue;
  const title = item.title?.jsonValue;
  const excerpt = item.excerpt?.jsonValue;
  const link = item.link?.jsonValue;
  const hasLink = !!link?.value?.href;

  const media = (image?.value?.src || isEditing) && (
    <div className="news-insights__media">
      <ContentSdkImage field={image} width={300} height={200} />
    </div>
  );
  const titleEl = (title?.value || isEditing) && (
    <h4 className="news-insights__title">
      <Text field={title} tag="span" />
    </h4>
  );
  const excerptEl = (excerpt?.value || isEditing) && (
    <Text field={excerpt} tag="p" className="news-insights__excerpt" />
  );

  // Outside editing the whole POV card is one link (picture, title, excerpt), as on tmx.com.
  if (hasLink && !isEditing) {
    return (
      <ContentSdkLink
        field={link as LinkField}
        className="news-insights__card news-insights__pov news-insights__pov--link"
      >
        {media}
        <div className="news-insights__body">
          {titleEl}
          {excerptEl}
        </div>
      </ContentSdkLink>
    );
  }

  return (
    <article className="news-insights__card news-insights__pov">
      {media}
      <div className="news-insights__body">
        {titleEl}
        {excerptEl}
        {isEditing && (
          <ContentSdkLink
            field={link as LinkField}
            className="news-insights__edit-link"
          />
        )}
      </div>
    </article>
  );
};

const PressCard = ({
  item,
  isEditing,
}: {
  item: NewsAndInsightsItem;
  isEditing: boolean;
}): JSX.Element => {
  const title = item.title?.jsonValue;
  const date = item.date?.jsonValue;
  const link = item.link?.jsonValue;
  const hasLink = !!link?.value?.href;

  return (
    <article className="news-insights__card news-insights__press">
      {date && (hasDate(date) || isEditing) && (
        <DateField
          field={date}
          tag="time"
          className="news-insights__date"
          render={formatDate}
        />
      )}
      {(title?.value || isEditing) && (
        <h4 className="news-insights__title">
          {hasLink && !isEditing ? (
            <ContentSdkLink
              field={link as LinkField}
              className="news-insights__link"
            >
              <Text field={title} tag="span" />
            </ContentSdkLink>
          ) : (
            <Text field={title} tag="span" />
          )}
        </h4>
      )}
      {isEditing && (
        <ContentSdkLink
          field={link as LinkField}
          className="news-insights__edit-link"
        />
      )}
    </article>
  );
};

const NewsAndInsightsBody = ({
  props,
  variantClass,
}: {
  props: NewsAndInsightsProps;
  variantClass: string;
}): JSX.Element => {
  const datasource = props.fields?.data?.datasource;
  if (!datasource) return <NewsAndInsightsEmpty props={props} />;

  const isEditing = !!props.page?.mode?.isEditing;
  const id = props.params?.RenderingIdentifier;
  const items = datasource.children?.results ?? [];
  const povs = items.filter((item) => !isPress(item));
  const press = items.filter(isPress);

  const title = datasource.title?.jsonValue;
  const povHeading = datasource.povHeading?.jsonValue;
  const povLink = datasource.povLink?.jsonValue;
  const pressHeading = datasource.pressHeading?.jsonValue;
  const pressLink = datasource.pressLink?.jsonValue;

  return (
    <section
      className={`component news-insights ${variantClass} ${props.params?.styles || ""}`.trimEnd()}
      id={id ? id : undefined}
    >
      <div className="container">
        {(title?.value || isEditing) && (
          <h2 className="news-insights__heading">
            <Chevron />
            <Text field={title} tag="span" />
          </h2>
        )}
        <div className="row news-insights__row">
          <div className="col-12 col-lg-8 news-insights__col news-insights__col--pov">
            {(povHeading?.value || isEditing) && (
              <Text
                field={povHeading}
                tag="h3"
                className="news-insights__subheading"
              />
            )}
            <div className="news-insights__pov-grid">
              {povs.map((item) => (
                <PovCard key={item.id} item={item} isEditing={isEditing} />
              ))}
            </div>
            {(povLink?.value?.href || isEditing) && (
              <div className="news-insights__actions">
                <ContentSdkLink
                  field={povLink as LinkField}
                  className="news-insights__button"
                />
              </div>
            )}
          </div>
          <div className="col-12 col-lg-4 news-insights__col news-insights__col--press">
            {(pressHeading?.value || isEditing) && (
              <Text
                field={pressHeading}
                tag="h3"
                className="news-insights__subheading"
              />
            )}
            <div className="news-insights__press-list">
              {press.map((item) => (
                <PressCard key={item.id} item={item} isEditing={isEditing} />
              ))}
            </div>
            {(pressLink?.value?.href || isEditing) && (
              <div className="news-insights__actions">
                <ContentSdkLink
                  field={pressLink as LinkField}
                  className="news-insights__button"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Default = (props: NewsAndInsightsProps): JSX.Element => (
  <NewsAndInsightsBody props={props} variantClass="news-insights--default" />
);

export const Tmx = (props: NewsAndInsightsProps): JSX.Element => (
  <NewsAndInsightsBody props={props} variantClass="news-insights--tmx" />
);
