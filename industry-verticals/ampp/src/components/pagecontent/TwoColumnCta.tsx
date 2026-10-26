'use client';

import { JSX } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  Text,
  Link,
  useSitecore,
  Placeholder,
  NextImage,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import useVisibility from 'src/hooks/useVisibility';

interface Fields {
  Title1: Field<string>;
  Text1: Field<string>;
  Image1: ImageField;
  Link1: LinkField;
  Title2: Field<string>;
  Text2: Field<string>;
  Image2: ImageField;
  Link2: LinkField;
}

export type TwoColumnCtaProps = ComponentProps & {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: TwoColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  const Column = ({
    image,
    title,
    text,
    link,
    placeholder,
    delay,
  }: {
    image: ImageField;
    title: Field<string>;
    text: Field<string>;
    link: LinkField;
    placeholder: string;
    delay?: number;
  }) => {
    const [isVisible, domRef] = useVisibility(delay);
    const buttonStyle = props.params?.ButtonStyle
      ? `button-${props.params.ButtonStyle.toLowerCase()}`
      : 'button-main';

    return (
      <div
        className={`col-sm-12 col-lg-6 ${
          !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
        }`}
        ref={domRef}
      >
        <div className="content-wrapper">
          <NextImage field={image} width={800} height={800} />
          {(isPageEditing || title?.value) && (
            <h2>
              <Text field={title} />
            </h2>
          )}
          {(isPageEditing || text?.value) && (
            <p>
              <Text field={text} />
            </p>
          )}
          {(isPageEditing || link?.value?.href) && (
            <Link field={link} className={`button ${buttonStyle}`} />
          )}
          <Placeholder name={placeholder} rendering={props.rendering} />
        </div>
      </div>
    );
  };

  return (
    <div className={`component two-column-cta pb-5 ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="row">
          <Column
            image={props.fields.Image1}
            title={props.fields.Title1}
            text={props.fields.Text1}
            link={props.fields.Link1}
            placeholder="two-col-placeholder-left"
            delay={0}
          />
          <Column
            image={props.fields.Image2}
            title={props.fields.Title2}
            text={props.fields.Text2}
            link={props.fields.Link2}
            placeholder="two-col-placeholder-right"
            delay={500}
          />
        </div>
      </div>
    </div>
  );
};

const renderingParam = (params: { [key: string]: string } | undefined, name: string): string => {
  if (!params) return '';
  const key = Object.keys(params).find((k) => k.toLowerCase() === name.toLowerCase());
  const raw = key ? String(params[key] ?? '') : '';
  if (!raw) return '';
  try {
    return decodeURIComponent(raw.replace(/\+/g, ' '));
  } catch {
    return raw;
  }
};

const AmppTextColumn = ({
  title,
  text,
  link,
  showImage,
  image,
  isPageEditing,
  linkClass,
}: {
  title?: Field<string>;
  text?: Field<string>;
  link?: LinkField;
  showImage: boolean;
  image?: ImageField;
  isPageEditing: boolean;
  linkClass: string;
}): JSX.Element => (
  <div className="col-lg-6">
    <div className="ampp-card">
      {showImage && image && (isPageEditing || image.value?.src) && (
        <NextImage field={image} width={640} height={360} />
      )}
      {title && (isPageEditing || title.value) && (
        <h3>
          <Text field={title} />
        </h3>
      )}
      {text && (isPageEditing || text.value) && (
        <p>
          <Text field={text} />
        </p>
      )}
      {link && (isPageEditing || link.value?.href) && <Link field={link} className={linkClass} />}
    </div>
  </div>
);

/* AMPP variant: two text cards on the gray band. SectionTitle is the band heading the live section is named for. */
export const Ampp = (props: TwoColumnCtaProps): JSX.Element => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sectionTitle = renderingParam(props.params, 'SectionTitle');
  const intro = renderingParam(props.params, 'Intro');
  const footnote = renderingParam(props.params, 'Footnote');
  const footnoteLabel = renderingParam(props.params, 'FootnoteLabel');
  const footnoteHref = renderingParam(props.params, 'FootnoteHref');
  const linkClass = sectionTitle
    ? `ampp-inline-link${renderingParam(props.params, 'LinkTone') === 'blue' ? ' is-blue' : ''}`
    : 'button button-main';

  return (
    <div className={`component two-column-cta variant-ampp col-12 ${sectionTitle ? 'has-section-title' : ''} ${props.params?.styles || ''}`} id={props.params.RenderingIdentifier || undefined}>
      <div className="container">
        {sectionTitle && <h2 className="ampp-section-title">{sectionTitle}</h2>}
        {intro && <p className="ampp-intro">{intro}</p>}
        <div className="row">
          <AmppTextColumn title={props.fields?.Title1} text={props.fields?.Text1} link={props.fields?.Link1} image={props.fields?.Image1} showImage={false} isPageEditing={isPageEditing} linkClass={linkClass} />
          <AmppTextColumn title={props.fields?.Title2} text={props.fields?.Text2} link={props.fields?.Link2} image={props.fields?.Image2} showImage={false} isPageEditing={isPageEditing} linkClass={linkClass} />
        </div>
        {(footnote || footnoteHref) && (
          <p className="ampp-footnote">
            {footnote}{' '}
            {footnoteHref && (
              <a className={linkClass} href={footnoteHref}>
                {footnoteLabel || footnoteHref}
              </a>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

/* AMPP text cards: same gray two-column band. */
export const AmppTextCards = Ampp;

/* AMPP membership choice: two columns, both actions under the left column. */
export const AmppMembershipChoice = (props: TwoColumnCtaProps): JSX.Element => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  return (
    <div className={`component two-column-cta variant-ampp-membership col-12 ${props.params?.styles || ''}`} id={props.params.RenderingIdentifier || undefined}>
      <div className="container">
        <div className="row">
          <div className="col-lg-6">
            <h3>
              <Text field={props.fields.Title1} />
            </h3>
            <p>
              <Text field={props.fields.Text1} />
            </p>
          </div>
          <div className="col-lg-6">
            <h3>
              <Text field={props.fields.Title2} />
            </h3>
            <p>
              <Text field={props.fields.Text2} />
            </p>
          </div>
        </div>
        <div className="ampp-actions">
          {(isPageEditing || props.fields?.Link1?.value?.href) && (
            <Link field={props.fields.Link1} className="button button-main" />
          )}
          {(isPageEditing || props.fields?.Link2?.value?.href) && (
            <Link field={props.fields.Link2} className="button button-main" />
          )}
        </div>
      </div>
    </div>
  );
};
