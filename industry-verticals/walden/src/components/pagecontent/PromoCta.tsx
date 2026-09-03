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
import { GoldArrow } from 'components/non-sitecore/GoldArrow';

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

/* Walden variant — AI / Google Cloud split */
export const Walden = (props: PromoCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component promo-cta walden-promo ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <NextImage field={props.fields.Image} className="img-fluid" width={720} height={720} />
          </div>
          <div className="col-lg-6">
            {(props.fields.Eyebrow?.value || isPageEditing) && (
              <p className="walden-promo__eyebrow">
                <Text field={props.fields.Eyebrow} />
              </p>
            )}
            <h2 className="walden-promo__title">
              <Text field={props.fields.Title} />
            </h2>
            <div className="walden-promo__text">
              <RichText field={props.fields.Text} />
            </div>
            {(isPageEditing || props.fields?.Link?.value?.href) && (
              <Link field={props.fields.Link} className="button button-main" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* Walden variant — centered heading, Tempo / Guided Path, split photo */
export const WaldenEducation = (props: PromoCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component promo-cta walden-education ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="walden-education__heading">
          {(props.fields.Eyebrow?.value || isPageEditing) && (
            <p className="walden-education__eyebrow">
              <Text field={props.fields.Eyebrow} />
            </p>
          )}
          <h2 className="walden-education__title">
            <Text field={props.fields.Title} />
          </h2>
        </div>
        <div className="walden-education__tabs" aria-hidden>
          <span className="walden-education__tab is-active">Tempo Learning</span>
          <span className="walden-education__tab">Guided Path</span>
        </div>
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <NextImage field={props.fields.Image} className="img-fluid" width={720} height={720} />
          </div>
          <div className="col-lg-6">
            <p className="walden-education__eyebrow">
              <Text field={props.fields.Subtitle} />
            </p>
            <div className="walden-education__text">
              <RichText field={props.fields.Text} />
            </div>
            {(isPageEditing || props.fields?.Link?.value?.href) && (
              <Link field={props.fields.Link} className="walden-link-arrow" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* Walden variant — Quality Matters copy + accreditation card */
export const WaldenQuality = (props: PromoCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component promo-cta walden-quality ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            {(props.fields.Eyebrow?.value || isPageEditing) && (
              <p className="walden-promo__eyebrow">
                <Text field={props.fields.Eyebrow} />
              </p>
            )}
            <h2 className="walden-quality__title">
              <Text field={props.fields.Title} />
            </h2>
            <div className="walden-promo__text">
              <RichText field={props.fields.Text} />
            </div>
            {(isPageEditing || props.fields?.Link?.value?.href) && (
              <Link field={props.fields.Link} className="walden-link-arrow" />
            )}
          </div>
          <div className="col-lg-6">
            <div className="walden-quality__card">
              <NextImage field={props.fields.Image} width={220} height={165} />
              <p className="walden-quality__subtitle">
                <Text field={props.fields.Subtitle} />
              </p>
              {(isPageEditing || props.fields?.Link2?.value?.href) && (
                <Link field={props.fields.Link2} className="walden-link-arrow mt-3" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Walden variant — Goals Within Reach, stat + lifestyle photo */
export const WaldenGoals = (props: PromoCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component promo-cta walden-goals ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            {(props.fields.Eyebrow?.value || isPageEditing) && (
              <p className="walden-goals__eyebrow">
                <Text field={props.fields.Eyebrow} />
              </p>
            )}
            <h2 className="walden-goals__title">
              <Text field={props.fields.Title} />
            </h2>
            {(props.fields.Subtitle?.value || isPageEditing) && (
              <p className="walden-goals__stat">
                <Text field={props.fields.Subtitle} />
              </p>
            )}
            <div className="walden-goals__text">
              <RichText field={props.fields.Text} />
            </div>
            {(isPageEditing || props.fields?.Link?.value?.href) && (
              <Link field={props.fields.Link} className="walden-link-arrow" />
            )}
          </div>
          <div className="col-lg-6">
            <NextImage field={props.fields.Image} className="img-fluid" width={720} height={720} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* Walden variant — photo + overlapping gold-arrow link card */
export const WaldenLinkCard = (props: PromoCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component promo-cta walden-link-card ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="row align-items-center g-0">
          <div className="col-lg-6 walden-link-card__media">
            <NextImage field={props.fields.Image} className="img-fluid" width={740} height={602} />
          </div>
          <div className="col-lg-6">
            <div className="walden-link-card__card">
              {(props.fields.Eyebrow?.value || isPageEditing) && (
                <p className="walden-link-card__eyebrow">
                  <Text field={props.fields.Eyebrow} />
                </p>
              )}
              <h2 className="walden-link-card__title">
                <Text field={props.fields.Title} />
              </h2>
              {(isPageEditing || props.fields?.Link?.value?.href) && (
                <Link field={props.fields.Link} className="walden-link-card__item">
                  <span>{props.fields.Link?.value?.text}</span>
                  <GoldArrow />
                </Link>
              )}
              {(isPageEditing || props.fields?.Link2?.value?.href) && (
                <Link field={props.fields.Link2} className="walden-link-card__item">
                  <span>{props.fields.Link2?.value?.text}</span>
                  <GoldArrow />
                </Link>
              )}
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
