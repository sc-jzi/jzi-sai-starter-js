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

const PromoCtaEmpty = (): JSX.Element => (
  <div className="component promo-cta">
    <div className="component-content">
      <span className="is-empty-hint">Promo CTA</span>
    </div>
  </div>
);

/* OIImageLeft — photo left, copy right, oversized OI watermark */
export const OIImageLeft = (props: PromoCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  if (!props.fields) {
    return <PromoCtaEmpty />;
  }

  return (
    <div
      className={`component promo-cta oi-brand oi-promo-image-left bg-transparent py-20 text-[var(--brand-fg)] ${sxaStyles}`}
      id={id ? id : undefined}
      style={{ fontFamily: 'var(--brand-heading-font)' }}
    >
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <NextImage
            field={props.fields.Image}
            width={900}
            height={1100}
            className="h-auto w-full rounded-[var(--brand-radius)] object-cover"
          />
        </div>
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 -top-16 select-none text-[12rem] font-bold leading-none text-[var(--brand-fg)] opacity-[0.06] md:text-[16rem]"
          >
            OI
          </span>
          <div className="relative">
            {(props.fields.Eyebrow?.value || isPageEditing) && (
              <Text
                field={props.fields.Eyebrow}
                tag="p"
                className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-primary)]"
              />
            )}
            <Text
              field={props.fields.Title}
              tag="h2"
              className="m-0 text-[2.25rem] font-semibold leading-tight text-[var(--brand-fg)] md:text-[2.75rem]"
            />
            <RichText
              field={props.fields.Text}
              className="mt-5 text-[1.125rem] leading-relaxed text-[var(--brand-muted-fg)] [&_p]:mb-4 [&_p:last-child]:mb-0"
            />
            {(isPageEditing || props.fields?.Link?.value?.href) && (
              <Link
                field={props.fields.Link}
                className="mt-8 inline-flex items-center rounded-[var(--brand-button-radius)] bg-[var(--brand-primary)] px-7 py-2.5 text-sm font-bold text-[var(--brand-primary-foreground)] no-underline hover:brightness-95"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* OIValues — large photo left, copy + gold pill right */
export const OIValues = (props: PromoCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  if (!props.fields) {
    return <PromoCtaEmpty />;
  }

  return (
    <div
      className={`component promo-cta oi-brand oi-values bg-transparent py-20 text-[var(--brand-fg)] ${sxaStyles}`}
      id={id ? id : undefined}
      style={{ fontFamily: 'var(--brand-heading-font)' }}
    >
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <NextImage
            field={props.fields.Image}
            width={900}
            height={1100}
            className="h-auto w-full object-cover"
          />
        </div>
        <div>
          <Text
            field={props.fields.Title}
            tag="h2"
            className="m-0 text-[2.25rem] font-semibold leading-tight text-[var(--brand-fg)] md:text-[2.75rem]"
          />
          <RichText
            field={props.fields.Text}
            className="mt-5 text-[1.125rem] leading-relaxed text-[var(--brand-muted-fg)] [&_p]:mb-0"
          />
          {(isPageEditing || props.fields?.Link?.value?.href) && (
            <Link
              field={props.fields.Link}
              className="mt-8 inline-flex items-center rounded-[var(--brand-button-radius)] bg-[var(--brand-primary)] px-7 py-2.5 text-sm font-bold text-[var(--brand-primary-foreground)] no-underline hover:brightness-95"
            />
          )}
        </div>
      </div>
    </div>
  );
};

/* OIHero — text-only dark stacked headline + gold pill (Hero Banner is not in Available Renderings) */
export const OIHero = (props: PromoCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  if (!props.fields) {
    return <PromoCtaEmpty />;
  }

  return (
    <div
      className={`component promo-cta oi-brand oi-hero bg-transparent py-10 text-[var(--brand-fg)] ${sxaStyles}`}
      id={id ? id : undefined}
      style={{ fontFamily: 'var(--brand-heading-font)' }}
    >
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="max-w-xl lg:ml-auto">
          {(props.fields.Title?.value || isPageEditing) && (
            <Text
              field={props.fields.Title}
              tag="h1"
              className="m-0 max-w-[11ch] text-[2.75rem] font-semibold leading-[1.08] text-[var(--brand-fg)] md:text-[4rem]"
            />
          )}
          {(props.fields.Text?.value || isPageEditing) && (
            <RichText
              field={props.fields.Text}
              className="mt-6 text-[1.05rem] leading-relaxed text-[var(--brand-muted-fg)] [&_p]:mb-0"
            />
          )}
          {(isPageEditing || props.fields?.Link?.value?.href) && (
            <Link
              field={props.fields.Link}
              className="mt-8 inline-flex items-center rounded-[var(--brand-button-radius)] bg-[var(--brand-primary)] px-7 py-2.5 text-sm font-bold text-[var(--brand-primary-foreground)] no-underline hover:brightness-95"
            />
          )}
        </div>
      </div>
    </div>
  );
};
