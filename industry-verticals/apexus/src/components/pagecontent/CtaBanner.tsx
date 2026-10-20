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
  NextImage,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { useApexusAudience } from 'src/lib/apexus-audience';
import { DottedAccent } from 'components/non-sitecore/DottedAccent';
import { IconAccent } from 'components/non-sitecore/IconAccent';
import useVisibility from 'src/hooks/useVisibility';

interface Fields {
  Eyebrow: Field<string>;
  Title: Field<string>;
  Text: RichTextField;
  Link: LinkField;
  Image: ImageField;
  Icon: ImageField;
}

export type CtaBannerProps = ComponentProps & {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: CtaBannerProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const [isVisible, domRef] = useVisibility();
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div
      className={`component cta-banner component-spaced ${sxaStyles}`}
      id={id ? id : undefined}
      ref={domRef}
    >
      <div className="container container-widest-fluid">
        <div className="container">
          <div className="row row-gap-4 main-content align-items-center">
            <div className="col-lg-6">
              <IconAccent image={props.fields.Icon} inverted />
              <div className="content-wrapper">
                <h6 className="eyebrow-accent">
                  <Text field={props.fields.Eyebrow} />
                </h6>
                <h1 className="display-4 fw-bold mb-3">
                  <Text field={props.fields.Title} />
                </h1>
                <div className="fs-5">
                  <RichText field={props.fields.Text} className="text-content" />

                  {(isPageEditing || props.fields?.Link?.value?.href) && (
                    <Link field={props.fields.Link} className="button button-main mt-3" />
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-10 mx-auto col-lg-6 mx-lg-0">
              <div className="image-wrapper">
                <DottedAccent className="dotted-accent-top" />
                <NextImage
                  field={props.fields.Image}
                  className={`d-block mx-lg-auto img-fluid ${
                    !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
                  }`}
                  width={800}
                  height={800}
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

export const LargeImage = (props: CtaBannerProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const [isVisible, domRef] = useVisibility();
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div
      className={`component cta-banner component-spaced with-large-image with-dotted-accents ${sxaStyles}`}
      id={id ? id : undefined}
      ref={domRef}
    >
      <div className="container container-widest-fluid">
        <div className="row row-gap-4 main-content align-items-center">
          <div className="col-lg-6">
            <div className="content-column">
              <IconAccent image={props.fields.Icon} inverted />
              <div className="content-wrapper">
                <h6 className="eyebrow-accent">
                  <Text field={props.fields.Eyebrow} />
                </h6>
                <h1 className="display-4 fw-bold mb-3">
                  <Text field={props.fields.Title} />
                </h1>
                <div className="fs-5">
                  <RichText field={props.fields.Text} className="text-content" />

                  {(isPageEditing || props.fields?.Link?.value?.href) && (
                    <Link field={props.fields.Link} className="button button-main mt-3" />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-10 mx-auto col-lg-6 mx-lg-0">
            <div className="image-wrapper">
              <DottedAccent className="dotted-accent-top" />
              <NextImage
                field={props.fields.Image}
                className={`d-block mx-lg-auto img-fluid ${
                  !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
                }`}
                width={850}
                height={850}
              />
              <DottedAccent className="dotted-accent-bottom" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Apexus variant: image left, light grey panel right with an uppercase title over a rule, body text and a blue square button */
export const Apexus = (props: CtaBannerProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const audience = useApexusAudience();
  const homeFeature = props.fields?.Title?.value?.includes('FELLOWSHIP');
  const personalized =
    !isPageEditing && homeFeature && audience
      ? audience === 'manufacturer'
        ? {
            title: 'Trusted, Timely, Transparent Refunds',
            text: 'The Manufacturer Refund Service (MRS) helps manufacturers compliantly and efficiently resolve 340B overcharges to covered entities with a trusted, timely, and transparent process.',
            label: 'Learn More',
            href: '/apexus-refund-services/manufacturer-refund-service',
            image:
              'https://jzi-verticals.sitecoresandbox.cloud/api/public/content/102303-section3-img5?v=0d56dd01',
            alt: '340B Prime Vendor Program Logo',
          }
        : {
            title: 'COVERED ENTITY REFUND SERVICE - STREAMLINED REFUND RESOLUTION',
            text: 'The Covered Entity Refund Service (CRS) facilitates the return of ineligible 340B discounts to individual manufacturers. Covered entities work directly with Apexus to efficiently process refunds to manufacturers through a proprietary process, reducing the time and effort spent resolving errors.',
            label: 'Learn More',
            href: '/apexus-refund-services/covered-entity-refund-service',
            image:
              'https://jzi-verticals.sitecoresandbox.cloud/api/public/content/102324-section3-img7?v=4451316c',
            alt: '340B University',
          }
      : null;

  return (
    <div className={`component cta-banner variant-apexus ${sxaStyles}`} id={id ? id : undefined}>
      <div className="apexus-cta-banner-inner">
        <div className="apexus-cta-banner-image">
          {personalized ? (
            <img src={personalized.image} alt={personalized.alt} width={460} height={333} />
          ) : (
            <NextImage field={props.fields?.Image} width={460} height={333} />
          )}
        </div>
        <div className="apexus-cta-banner-panel">
          {personalized ? (
            <h3 className="apexus-cta-banner-title">{personalized.title}</h3>
          ) : (
            (isPageEditing || props.fields?.Title?.value) && (
              <Text tag="h3" field={props.fields?.Title} className="apexus-cta-banner-title" />
            )
          )}
          {personalized ? (
            <div className="apexus-cta-banner-text">
              <p>{personalized.text}</p>
            </div>
          ) : (
            <RichText field={props.fields?.Text} className="apexus-cta-banner-text" />
          )}
          {personalized ? (
            <a className="apexus-button" href={personalized.href}>
              {personalized.label}
            </a>
          ) : (
            (isPageEditing || props.fields?.Link?.value?.href) && (
              <Link field={props.fields.Link} className="apexus-button" />
            )
          )}
        </div>
      </div>
    </div>
  );
};
