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
                {props.fields?.Eyebrow?.value && (
                  <p className="eyebrow-accent">
                    <Text field={props.fields.Eyebrow} />
                  </p>
                )}
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
                {props.fields?.Eyebrow?.value && (
                  <p className="eyebrow-accent">
                    <Text field={props.fields.Eyebrow} />
                  </p>
                )}
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

export const MccLabel = (props: CtaBannerProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label">
    <Default {...props} />
  </section>
);

export const MccLabelSimple = (props: CtaBannerProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label-simple">
    <Default {...props} />
  </section>
);

export const MccLabelImageLeft = (props: CtaBannerProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label-split mcc-label-image-left">
    <Default {...props} />
  </section>
);

export const MccLabelImageRight = (props: CtaBannerProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label-split mcc-label-image-right">
    <Default {...props} />
  </section>
);

export const MccLabelImageLeftYellow = (props: CtaBannerProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label-split mcc-label-image-left mcc-label-yellow">
    <Default {...props} />
  </section>
);

// Article head: the same fields, with the Link shown as a small back link above the title (not a button)
export const MccLabelArticle = (props: CtaBannerProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  return (
    <section className="variant-mcc-label mcc-label-split mcc-label-article-head">
      <div className={`component cta-banner ${props.params?.styles || ''}`} id={id ? id : undefined}>
        <div className="container-widest-fluid">
          <div className="container">
            <div className="row row-gap-4 main-content">
              <div className="col-lg-6">
                <div className="content-wrapper">
                  {(isPageEditing || props.fields?.Link?.value?.href) && (
                    <Link field={props.fields.Link} className="back-link" />
                  )}
                  <h1 className="display-4 fw-bold mb-3">
                    <Text field={props.fields?.Title} />
                  </h1>
                  {(isPageEditing || props.fields?.Text?.value) && (
                    <RichText field={props.fields?.Text} className="text-content" />
                  )}
                </div>
              </div>
              <div className="col-md-10 mx-auto col-lg-6 mx-lg-0">
                <div className="image-wrapper">
                  <NextImage field={props.fields?.Image} className="d-block mx-lg-auto img-fluid" width={520} height={390} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const MccLabelImageRightPale = (props: CtaBannerProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label-split mcc-label-image-right mcc-label-pale">
    <Default {...props} />
  </section>
);
