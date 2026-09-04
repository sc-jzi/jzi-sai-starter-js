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

interface FileField {
  value?: {
    src?: string;
    name?: string;
  };
}

interface Fields {
  Text1: Field<string>;
  SubText1: Field<string>;
  Image1: ImageField;
  Video1?: FileField;
  Link1: LinkField;
  Text2: Field<string>;
  SubText2: Field<string>;
  Image2: ImageField;
  Video2?: FileField;
  Link2: LinkField;
  Text3: Field<string>;
  SubText3: Field<string>;
  Image3: ImageField;
  Video3?: FileField;
  Link3: LinkField;
}

const mediaSrc = (field?: FileField | ImageField): string => field?.value?.src || '';

const ColumnMedia = ({
  image,
  video,
  width,
  height,
}: {
  image: ImageField;
  video?: FileField;
  width: number;
  height: number;
}): JSX.Element => {
  const videoUrl = mediaSrc(video);
  if (videoUrl) {
    return (
      <video src={videoUrl} poster={mediaSrc(image)} controls playsInline>
        <NextImage field={image} width={width} height={height} />
      </video>
    );
  }
  return <NextImage field={image} width={width} height={height} />;
};

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

/* Chamberlain variant — navy start-date bar */
export const ChamberlainStartDates = (props: ThreeColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const columns = [
    { text: props.fields.Text1, subText: props.fields.SubText1 },
    { text: props.fields.Text2, subText: props.fields.SubText2 },
    { text: props.fields.Text3, subText: props.fields.SubText3 },
  ];

  return (
    <div
      className={`component three-column-cta chamberlain-start-dates ${sxaStyles}`}
      id={id ? id : undefined}
      style={{ backgroundColor: '#013a81', opacity: 0.8, zIndex: 1000 }}
    >
      <div className="container">
        <div className="row">
          {columns.map((column, index) => (
            <div className="col-sm-12 col-lg-4" key={index}>
              <div className="content-wrapper">
                <p className="chamberlain-start-dates__label">
                  <Text field={column.text} />
                </p>
                <p className="chamberlain-start-dates__value">
                  <Text field={column.subText} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* Chamberlain variant — navy portrait video cards */
export const ChamberlainVideos = (props: ThreeColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const columns = [
    { image: props.fields.Image1, video: props.fields.Video1, text: props.fields.Text1, subText: props.fields.SubText1 },
    { image: props.fields.Image2, video: props.fields.Video2, text: props.fields.Text2, subText: props.fields.SubText2 },
    { image: props.fields.Image3, video: props.fields.Video3, text: props.fields.Text3, subText: props.fields.SubText3 },
  ];

  return (
    <div
      className={`component three-column-cta chamberlain-videos ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="chamberlain-videos__intro-wrapper">
          <h2 className="chamberlain-videos__heading">Built To Lift Up Those Who Care</h2>
          <p className="chamberlain-videos__intro">
            With expert faculty to guide you, personalized coaching that keeps you on track, and generous
            scholarships that open doors.
          </p>
        </div>
        <div className="row">
          {columns.map((column, index) => (
            <div className="col-sm-12 col-lg-4" key={index}>
              <div className="content-wrapper">
                <ColumnMedia image={column.image} video={column.video} width={400} height={560} />
                <h2>
                  <Text field={column.text} />
                </h2>
                {(column.subText?.value || isPageEditing) && (
                  <p>
                    <Text field={column.subText} />
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* Chamberlain variant — image or video support cards */
export const ChamberlainCare = (props: ThreeColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const columns = [
    {
      image: props.fields.Image1,
      video: props.fields.Video1,
      text: props.fields.Text1,
      subText: props.fields.SubText1,
      link: props.fields.Link1,
    },
    {
      image: props.fields.Image2,
      video: props.fields.Video2,
      text: props.fields.Text2,
      subText: props.fields.SubText2,
      link: props.fields.Link2,
    },
    {
      image: props.fields.Image3,
      video: props.fields.Video3,
      text: props.fields.Text3,
      subText: props.fields.SubText3,
      link: props.fields.Link3,
    },
  ];

  return (
    <div
      className={`component three-column-cta chamberlain-care ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="row g-4">
          {columns.map((column, index) => (
            <div className="col-sm-12 col-lg-4" key={index}>
              <div className="chamberlain-care__card">
                <div className="chamberlain-care__media">
                  <ColumnMedia image={column.image} video={column.video} width={480} height={280} />
                </div>
                <h2>
                  <Text field={column.text} />
                </h2>
                <p>
                  <Text field={column.subText} />
                </p>
                {(isPageEditing || column.link?.value?.href) && (
                  <Link field={column.link} className="chamberlain-link-arrow" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* Chamberlain variant — Insights to Inspire story tiles */
export const ChamberlainInsights = (props: ThreeColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const columns = [
    { image: props.fields.Image1, text: props.fields.Text1, subText: props.fields.SubText1, link: props.fields.Link1 },
    { image: props.fields.Image2, text: props.fields.Text2, subText: props.fields.SubText2, link: props.fields.Link2 },
    { image: props.fields.Image3, text: props.fields.Text3, subText: props.fields.SubText3, link: props.fields.Link3 },
  ];

  return (
    <div
      className={`component three-column-cta chamberlain-insights ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <h2 className="chamberlain-insights__heading">Insights to Inspire</h2>
        <p className="chamberlain-insights__intro">
          Explore topics that ignite passion and purpose in your healthcare journey.
        </p>
        <div className="row g-4">
          {columns.map((column, index) => (
            <div className="col-sm-12 col-lg-4" key={index}>
              <Link field={column.link} className="wrapper-link">
                <NextImage field={column.image} width={480} height={280} />
                <h2>
                  <Text field={column.text} />
                </h2>
                <p>
                  <Text field={column.subText} />
                </p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
