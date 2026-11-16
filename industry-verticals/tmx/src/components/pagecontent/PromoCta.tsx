'use client';

import { JSX } from 'react';
import {
  Field,
  ImageField,
  RichTextField,
  Text,
  RichText,
  Link,
  LinkField,
  useSitecore,
  Placeholder,
  NextImage,
} from '@sitecore-content-sdk/nextjs';
import useVisibility from 'src/hooks/useVisibility';
import { ComponentProps } from 'lib/component-props';
import { DottedAccent } from 'components/non-sitecore/DottedAccent';

interface Fields {
  Eyebrow: Field<string>;
  Title: Field<string>;
  Subtitle: Field<string>;
  Text: RichTextField;
  Image: ImageField;
  Link: LinkField;
  Link2: LinkField;
  // Extra fields of the TMX derived datasource template (R22); only the Tmx variants read them.
  SectionTitle?: Field<string>;
  Link3?: LinkField;
  Link4?: LinkField;
  Link5?: LinkField;
  Link6?: LinkField;
  Link7?: LinkField;
}

export type PromoCtaProps = ComponentProps & {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: PromoCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const [isVisible, domRef] = useVisibility();
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component promo-cta ${sxaStyles}`} id={id ? id : undefined} ref={domRef}>
      <div className="container">
        <div className="row row-gap-4 main-content align-items-center">
          <div className="col-lg-5 text-center text-lg-start">
            <h6 className="eyebrow-accent">
              <Text field={props.fields.Eyebrow} />
            </h6>
            <h1 className="display-6 fw-bold mb-3">
              <Text field={props.fields.Title} />
            </h1>
            <div className="promo-cta-text">
              <p className="fs-5">
                <Text field={props.fields.Subtitle} />
              </p>

              <RichText field={props.fields.Text} className="text-content" />

              <div className="row mt-2">
                <Placeholder name="promo-cta" rendering={props.rendering} />
              </div>

              {(isPageEditing || props.fields?.Link?.value?.href) && (
                <Link field={props.fields.Link} className="button button-main mt-3 me-4" />
              )}
              {(isPageEditing || props.fields?.Link2?.value?.href) && (
                <Link field={props.fields.Link2} className="button button-simple mt-3 " />
              )}
            </div>
          </div>
          <div className="col-md-10 mx-auto col-lg-7 mx-lg-0">
            <div className="image-wrapper">
              <DottedAccent className="dotted-accent-top" />
              <NextImage
                field={props.fields.Image}
                className={`d-block mx-lg-auto img-fluid ${
                  !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
                }`}
                width={900}
                height={900}
              />
              <DottedAccent className="dotted-accent-bottom" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WithPlaceholderColumn = (props: PromoCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const [isVisible, domRef] = useVisibility();
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div
      className={`component promo-cta with-placeholder-column ${sxaStyles}`}
      id={id ? id : undefined}
      ref={domRef}
    >
      <div className="container">
        <div className="row row-gap-4 main-content align-items-center">
          <div className="col-lg-5 text-center text-lg-start">
            <h6 className="eyebrow-accent">
              <Text field={props.fields.Eyebrow} />
            </h6>
            <h1 className="fs-1 fw-bold mb-3">
              <Text field={props.fields.Title} />
            </h1>
            <div className="promo-cta-text">
              <p className="fs-5">
                <Text field={props.fields.Subtitle} />
              </p>

              <RichText field={props.fields.Text} className="text-content" />

              {(isPageEditing || props.fields?.Link?.value?.href) && (
                <Link field={props.fields.Link} className="button button-main mt-3" />
              )}
              {(isPageEditing || props.fields?.Link2?.value?.href) && (
                <Link field={props.fields.Link2} className="button button-simple mt-3 mx-4" />
              )}
            </div>
          </div>

          <div className="col-md-12 mx-auto col-lg-7 mx-lg-0">
            <div className="row align-items-center">
              <div className="promo-cta-placeholder col-12 col-md-9">
                <div className="promo-cta-placeholder-inner">
                  <div className="row">
                    <Placeholder name="promo-cta" rendering={props.rendering} />
                  </div>
                </div>
              </div>

              <div className="image-wrapper d-none d-md-block col-md-8">
                <DottedAccent className="dotted-accent-top" />
                <NextImage
                  field={props.fields.Image}
                  className={`d-block mx-lg-auto img-fluid ${
                    !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
                  }`}
                  width={900}
                  height={900}
                />
                <DottedAccent className="dotted-accent-bottom" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WithBackgroundImage = (props: PromoCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div
      className={`component promo-cta with-background-image ${sxaStyles}]`}
      id={id ? id : undefined}
      style={{
        backgroundImage: `url("${props.fields.Image.value?.src}")`,
      }}
    >
      <div className="container">
        <div className="row justify-content-center main-content">
          <div className="col-12 mx-auto">
            <h1 className="display-3 fw-bold text-center mb-3">
              <Text field={props.fields.Title} />
            </h1>
            <div className="fs-3 text-center">
              <RichText field={props.fields.Text} />

              {(isPageEditing || props.fields?.Link?.value?.href) && (
                <Link field={props.fields.Link} className="button button-main mt-3" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* TMX chevron drawn before the section title (decoration, not a field) */
const TmxChevron = (): JSX.Element => (
  <svg className="tmx-chevron" viewBox="0 0 26 30" aria-hidden="true" focusable="false">
    <polygon points="0,0 12,0 26,15 12,30 0,30 14,15" />
  </svg>
);

/* TMX variant body: light cyan band, framed photo beside a centred title, text and navy pill buttons */
const PromoCtaTmx = ({
  props,
  imageSide,
  variantClass,
}: {
  props: PromoCtaProps;
  imageSide: 'left' | 'right';
  variantClass: string;
}): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const fields = props.fields;
  const links = [
    fields?.Link,
    fields?.Link2,
    fields?.Link3,
    fields?.Link4,
    fields?.Link5,
    fields?.Link6,
    fields?.Link7,
  ];
  const visibleLinks = links
    .map((link, i) => ({ link, key: `link-${i + 1}` }))
    .filter(({ link }) => (isPageEditing && link) || link?.value?.href);

  const media = (
    <div className="promo-cta-tmx__media">
      {(isPageEditing || fields?.Image?.value?.src) && (
        <NextImage field={fields?.Image} className="promo-cta-tmx__image" width={545} height={400} />
      )}
    </div>
  );

  const body = (
    <div className="promo-cta-tmx__body">
      {(isPageEditing || fields?.Title?.value) && (
        <Text field={fields?.Title} tag="h2" className="promo-cta-tmx__title" />
      )}
      {(isPageEditing || fields?.Text?.value) && (
        <RichText field={fields?.Text} className="promo-cta-tmx__text" />
      )}
      {visibleLinks.length > 0 && (
        <div className="promo-cta-tmx__buttons">
          {visibleLinks.map(({ link, key }) => (
            <Link key={key} field={link as LinkField} className="promo-cta-tmx__button" />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`component promo-cta ${variantClass} promo-cta-tmx--image-${imageSide} ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="promo-cta-tmx__inner">
        {(isPageEditing || fields?.SectionTitle?.value) && (
          <h2 className="promo-cta-tmx__section-title">
            <TmxChevron />
            <Text field={fields?.SectionTitle} />
          </h2>
        )}
        <div className="promo-cta-tmx__grid">
          {imageSide === 'left' ? (
            <>
              {media}
              {body}
            </>
          ) : (
            <>
              {body}
              {media}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* TMX variant: image left (Our Companies, Derivatives) */
export const TmxImageLeft = (props: PromoCtaProps): JSX.Element => (
  <PromoCtaTmx props={props} imageSide="left" variantClass="variant-tmx variant-tmx-image-left" />
);

/* TMX variant: image right (Equities and Fixed Income, Global Insights) */
export const TmxImageRight = (props: PromoCtaProps): JSX.Element => (
  <PromoCtaTmx props={props} imageSide="right" variantClass="variant-tmx variant-tmx-image-right" />
);

/* TMX variant: same look as TmxImageLeft */
export const Tmx = (props: PromoCtaProps): JSX.Element => (
  <PromoCtaTmx props={props} imageSide="left" variantClass="variant-tmx variant-tmx-image-left" />
);
