'use client';

import { JSX } from 'react';
import {
  Field,
  ImageField,
  Text,
  LinkField,
  Link,
  useSitecore,
  NextImage,
} from '@sitecore-content-sdk/nextjs';
import useVisibility from 'src/hooks/useVisibility';

interface Fields {
  Text1: Field<string>;
  SubText1: Field<string>;
  Image1: ImageField;
  Link1: LinkField;
  Text2: Field<string>;
  SubText2: Field<string>;
  Image2: ImageField;
  Link2: LinkField;
  Text3: Field<string>;
  SubText3: Field<string>;
  Image3: ImageField;
  Link3: LinkField;
  // section heading and intro: only on the demo's derived datasource template (ThreeColumnCtaOhioHealth, R22 extend)
  Heading?: Field<string>;
  Intro?: Field<string>;
}

export type ThreeColumnCtaProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: ThreeColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  const Column = ({
    image,
    text,
    subText,
    link,
    delay,
  }: {
    image: ImageField;
    text: Field<string>;
    subText: Field<string>;
    link: LinkField;
    delay?: number;
  }) => {
    const [isVisible, domRef] = useVisibility(delay);
    const buttonStyle = props.params?.ButtonStyle
      ? `button-${props.params.ButtonStyle.toLowerCase()}`
      : 'button-main';

    return (
      <div
        className={`col-sm-12 col-lg-4 ${
          !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
        } `}
        ref={domRef}
      >
        <div className="content-wrapper">
          <NextImage field={image} width={400} height={400} />
          <h2>
            <Text field={text} />
          </h2>
          <p>
            <Text field={subText} />
          </p>
          {(isPageEditing || link?.value?.href) && (
            <Link field={link} className={`button ${buttonStyle}`} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`component component-spaced three-column-cta ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="row">
          <Column
            image={props.fields.Image1}
            text={props.fields.Text1}
            subText={props.fields.SubText1}
            link={props.fields.Link1}
          />
          <Column
            image={props.fields.Image2}
            text={props.fields.Text2}
            subText={props.fields.SubText2}
            link={props.fields.Link2}
            delay={500}
          />
          <Column
            image={props.fields.Image3}
            text={props.fields.Text3}
            subText={props.fields.SubText3}
            link={props.fields.Link3}
            delay={1000}
          />
        </div>
      </div>
    </div>
  );
};

export const WithIcons = (props: ThreeColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  const Column = ({
    image,
    text,
    subText,
    link,
    delay,
  }: {
    image: ImageField;
    text: Field<string>;
    subText: Field<string>;
    link: LinkField;
    delay?: number;
  }) => {
    const [isVisible, domRef] = useVisibility(delay);
    return (
      <div
        className={`col-sm-12 col-lg-4 ${
          !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
        } `}
        ref={domRef}
      >
        <Link field={link} className="wrapper-link">
          <div className="content-wrapper">
            <div className="image-wrapper mb-5">
              <NextImage field={image} width={32} height={32} />
            </div>
            <h2>
              <Text field={text} />
            </h2>
            <p>
              <Text field={subText} />
            </p>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div
      className={`component component-spaced three-column-cta with-icons ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="row gx-0">
          <Column
            image={props.fields.Image1}
            text={props.fields.Text1}
            subText={props.fields.SubText1}
            link={props.fields.Link1}
          />
          <Column
            image={props.fields.Image2}
            text={props.fields.Text2}
            subText={props.fields.SubText2}
            link={props.fields.Link2}
            delay={500}
          />
          <Column
            image={props.fields.Image3}
            text={props.fields.Text3}
            subText={props.fields.SubText3}
            link={props.fields.Link3}
            delay={1000}
          />
        </div>
      </div>
    </div>
  );
};

export const WithIconsCompact = (props: ThreeColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  const Column = ({
    image,
    text,
    subText,
    link,
    delay,
  }: {
    image: ImageField;
    text: Field<string>;
    subText: Field<string>;
    link: LinkField;
    delay?: number;
  }) => {
    const [isVisible, domRef] = useVisibility(delay);
    return (
      <div
        className={`col-sm-12 col-lg-4 ${
          !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
        } `}
        ref={domRef}
      >
        <Link field={link} className="wrapper-link">
          <div className="content-wrapper">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="image-wrapper">
                <NextImage field={image} width={32} height={32} />
              </div>
              <h2 className="eyebrow-accent mb-0 mt-2">
                <Text field={text} />
              </h2>
            </div>
            <p>
              <Text field={subText} />
            </p>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div
      className={`component component-spaced three-column-cta with-icons with-icons-compact ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="row gx-0">
          <Column
            image={props.fields.Image1}
            text={props.fields.Text1}
            subText={props.fields.SubText1}
            link={props.fields.Link1}
          />
          <Column
            image={props.fields.Image2}
            text={props.fields.Text2}
            subText={props.fields.SubText2}
            link={props.fields.Link2}
            delay={500}
          />
          <Column
            image={props.fields.Image3}
            text={props.fields.Text3}
            subText={props.fields.SubText3}
            link={props.fields.Link3}
            delay={1000}
          />
        </div>
      </div>
    </div>
  );
};

/* OhioHealth variants: three centred columns on a light-blue band; CircleImages crops the photos round (live homepage blog band). */
const OhThree = (props: ThreeColumnCtaProps, round: boolean): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  if (!props.fields) return <div className={`component three-column-cta oh-three ${sxaStyles}`} />;
  const f = props.fields;
  const cols = [
    { t: f.Text1, s: f.SubText1, i: f.Image1, l: f.Link1 },
    { t: f.Text2, s: f.SubText2, i: f.Image2, l: f.Link2 },
    { t: f.Text3, s: f.SubText3, i: f.Image3, l: f.Link3 },
  ];
  return (
    <div
      className={`component three-column-cta oh-three ${round ? 'oh-three--round' : ''} ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="oh-container oh-three__row">
        {cols.map((c, i) => (
          <div className="oh-three__col" key={i}>
            {(isPageEditing || c.i?.value?.src) && (
              <div className="oh-three__media">
                {c.l?.value?.href && !isPageEditing ? (
                  <a href={c.l.value.href} aria-label={c.t?.value || undefined}>
                    <NextImage field={c.i} width={140} height={140} />
                  </a>
                ) : (
                  <NextImage field={c.i} width={140} height={140} />
                )}
              </div>
            )}
            <h3 className="oh-three__title">
              {c.l?.value?.href && !isPageEditing ? <a href={c.l.value.href}>{c.t?.value}</a> : <Text field={c.t} />}
            </h3>
            <p className="oh-three__text">
              <Text field={c.s} />
            </p>
            {(isPageEditing || c.l?.value?.href) && <Link field={c.l} className="oh-button" />}
          </div>
        ))}
      </div>
    </div>
  );
};
export const OhioHealth = (props: ThreeColumnCtaProps): JSX.Element => OhThree(props, false);
export const OhioHealthCircleImages = (props: ThreeColumnCtaProps): JSX.Element => OhThree(props, true);

// OhioHealth "Get care now" and "Expertise and innovation": a section heading (and intro) over three columns.
const OhColumns = (props: ThreeColumnCtaProps, kind: 'care' | 'expertise'): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const f = props.fields;
  const cols = [
    { title: f?.Text1, text: f?.SubText1, image: f?.Image1, link: f?.Link1 },
    { title: f?.Text2, text: f?.SubText2, image: f?.Image2, link: f?.Link2 },
    { title: f?.Text3, text: f?.SubText3, image: f?.Image3, link: f?.Link3 },
  ];
  const show = (fld?: Field<string>) => !!fld && (!!fld.value || isEditing);

  return (
    <section className={`component oh-cols oh-cols--${kind} ${sxaStyles}`} id={id ? id : undefined}>
      <div className="oh-cols__inner">
        {show(f?.Heading) && (
          <h2 className="oh-cols__heading">
            <Text field={f.Heading} />
          </h2>
        )}
        {show(f?.Intro) && (
          <p className="oh-cols__intro">
            <Text field={f.Intro} />
          </p>
        )}
        <div className="oh-cols__row">
          {cols.map((c, i) => (
            <div className="oh-cols__col" key={i}>
              {c.image && (c.image.value?.src || isEditing) && (
                <div className="oh-cols__media">
                  {kind === 'expertise' && c.link?.value?.href && !isEditing ? (
                    <Link field={c.link} showLinkTextWithChildrenPresent={false} aria-hidden="true" tabIndex={-1}>
                      <NextImage field={c.image} width={375} height={140} />
                    </Link>
                  ) : (
                    <NextImage field={c.image} width={kind === 'care' ? 90 : 375} height={kind === 'care' ? 80 : 140} />
                  )}
                </div>
              )}
              {show(c.title) && (
                <h3 className="oh-cols__title">
                  {kind === 'expertise' && c.link?.value?.href && !isEditing ? (
                    <Link field={c.link} showLinkTextWithChildrenPresent={false}>
                      <Text field={c.title} />
                    </Link>
                  ) : (
                    <Text field={c.title} />
                  )}
                </h3>
              )}
              {show(c.text) && (
                <p className="oh-cols__text">
                  <Text field={c.text} />
                </p>
              )}
              {c.link && (c.link.value?.href || isEditing) && (
                <Link field={c.link} className={kind === 'care' ? 'oh-cols__cta oh-cols__more' : 'oh-cols__cta oh-cols__button'} showLinkTextWithChildrenPresent>
                  {kind === 'care' && (
                    <svg viewBox="0 0 8 14" width="8" height="14" aria-hidden="true">
                      <path d="M1 1l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  )}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const OhioHealthCareNow = (props: ThreeColumnCtaProps): JSX.Element => OhColumns(props, 'care');
export const OhioHealthExpertise = (props: ThreeColumnCtaProps): JSX.Element => OhColumns(props, 'expertise');
