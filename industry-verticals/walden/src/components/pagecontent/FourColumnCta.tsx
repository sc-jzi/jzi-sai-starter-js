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

interface Fields {
  Title1: Field<string>;
  Text1: Field<string>;
  Image1: ImageField;
  Link1: LinkField;
  Title2: Field<string>;
  Text2: Field<string>;
  Image2: ImageField;
  Link2: LinkField;
  Title3: Field<string>;
  Text3: Field<string>;
  Image3: ImageField;
  Link3: LinkField;
  Title4: Field<string>;
  Text4: Field<string>;
  Image4: ImageField;
  Link4: LinkField;
}

export type FourColumnCtaProps = {
  params: { [key: string]: string };
  fields: Fields;
};

const PROGRAM_FINDER_FALLBACKS = ["Bachelor's", "Master's", 'Doctoral', 'Certificate'];

const hasHref = (link?: LinkField): boolean => Boolean(link?.value?.href);

const FourColumnCtaEmpty = ({
  className,
  id,
  label,
}: {
  className: string;
  id?: string;
  label: string;
}): JSX.Element => (
  <div className={className} id={id} style={{ minHeight: 160 }}>
    <div className="container">
      <div className="p-4" style={{ border: '1px dashed var(--brand-border, #ccc)' }}>
        <span className="is-empty-hint">{label}</span>
      </div>
    </div>
  </div>
);

const FinderButton = ({
  title,
  link,
  fallback,
}: {
  title?: Field<string>;
  link?: LinkField;
  fallback: string;
}): JSX.Element => {
  const label = title?.value || link?.value?.text || fallback;
  const inner = (
    <>
      {title?.value ? <Text field={title} /> : <span>{label}</span>}
    </>
  );

  if (link && hasHref(link)) {
    return (
      <Link field={link} className="walden-finder__btn">
        {inner}
      </Link>
    );
  }

  return <span className="walden-finder__btn">{inner}</span>;
};

/* Walden variant — dark teal program finder bar */
export const WaldenProgramFinder = (props: FourColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const fields = props.fields;
  const className = `component four-column-cta walden-program-finder ${sxaStyles}`;

  if (!fields) {
    return <FourColumnCtaEmpty className={className} id={id} label="Four Column CTA — Program Finder" />;
  }

  const buttons = [
    { title: fields.Title1, link: fields.Link1 },
    { title: fields.Title2, link: fields.Link2 },
    { title: fields.Title3, link: fields.Link3 },
    { title: fields.Title4, link: fields.Link4 },
  ];

  return (
    <div className={className} id={id ? id : undefined}>
      <div className="container">
        <div className="walden-finder">
          <div className="walden-finder__search-col">
            <div className="walden-finder__label">
              {fields.Text1?.value ? <Text field={fields.Text1} /> : 'Find your online program:'}
            </div>
            <input
              className="walden-finder__search"
              type="search"
              placeholder="SEARCH WALDEN PROGRAMS"
              aria-label="Search Walden programs"
            />
          </div>
          <div className="walden-finder__buttons">
            {buttons.map((button, index) => (
              <FinderButton
                key={index}
                title={button.title}
                link={button.link}
                fallback={PROGRAM_FINDER_FALLBACKS[index]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PROGRAM_ROWS = ["Bachelor's Programs", "Master's Programs", 'Doctoral Programs'];
const INTEREST_TITLES = ['Nursing', 'Social Work & Human Services', 'Psychology', 'Education'];

type MaybeTextField = Field<string> & { jsonValue?: { value?: string } };

const textValue = (field?: Field<string>): string => {
  if (!field) {
    return '';
  }
  const typed = field as MaybeTextField;
  if (typeof typed.value === 'string' && typed.value.trim()) {
    return typed.value;
  }
  if (typeof typed.jsonValue?.value === 'string' && typed.jsonValue.value.trim()) {
    return typed.jsonValue.value;
  }
  return '';
};

const withTextValue = (field: Field<string> | undefined, fallback: string): Field<string> => ({
  ...(field || { value: fallback }),
  value: textValue(field) || fallback,
});

const withLinkValue = (field: LinkField | undefined, text: string): LinkField => {
  const current = field?.value || {};
  return {
    ...(field || { value: { href: '#' } }),
    value: {
      href: current.href || '#',
      linktype: current.linktype || 'external',
      ...current,
      text: current.text || text,
    },
  };
};

const InterestArrow = (): JSX.Element => (
  <span className="walden-interest__arrow" aria-hidden>
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
      <path
        d="M3 9h12M10 5l4 4-4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

const InterestIcon = ({ index }: { index: number }): JSX.Element => {
  const icons = [
    <svg key="license" width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <rect x="8" y="6" width="20" height="24" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 12h12M12 16.5h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="18" cy="24" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <path d="M18 22.4v3.4M16.6 24h2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>,
    <svg key="people" width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <circle cx="18" cy="11" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 23.5c.6-3.2 2.7-5 6-5s5.4 1.8 6 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="9.5" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M6 23c.4-2.4 1.8-3.8 3.8-4.3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="26.5" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M30 23c-.4-2.4-1.8-3.8-3.8-4.3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>,
    <svg key="book" width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <path
        d="M18 11c-2.2-1.8-5.4-2.6-9-2.2v16.4c3.6-.4 6.8.4 9 2.2 2.2-1.8 5.4-2.6 9-2.2V8.8c-3.6-.4-6.8.4-9 2.2z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M18 11v16.4" stroke="currentColor" strokeWidth="1.75" />
    </svg>,
    <svg key="apple" width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <path
        d="M18 13.5c2.8-4.2 6.4-4.6 7.2-4.6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M18 14.8c-2.4-2.6-7-2.3-9.2 1.4-2.4 4 0 10.6 4.4 12.4 1.4.6 2.4.2 3.2-.6.8.8 1.8 1.2 3.2.6 4.4-1.8 6.8-8.4 4.4-12.4-1.8-3-5.4-4-6-1.4z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>,
  ];

  return <span className="walden-interest__icon-fallback">{icons[index] || icons[0]}</span>;
};

const isStockFourColImage = (image?: ImageField): boolean => {
  const src = typeof image?.value?.src === 'string' ? image.value.src : '';
  const alt = typeof image?.value?.alt === 'string' ? image.value.alt : '';
  return /four-col-promo/i.test(src) || /four-col-promo/i.test(alt);
};

/* Walden variant — area of interest cards with gold-arrow program links */
export const WaldenInterestGrid = (props: FourColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const fields = props.fields;
  const className = `component four-column-cta walden-interest-grid ${sxaStyles}`;

  if (!fields) {
    return <FourColumnCtaEmpty className={className} id={id} label="Four Column CTA — Areas of Interest" />;
  }

  const columns = [
    { image: fields.Image1, title: fields.Title1, text: fields.Text1, link: fields.Link1 },
    { image: fields.Image2, title: fields.Title2, text: fields.Text2, link: fields.Link2 },
    { image: fields.Image3, title: fields.Title3, text: fields.Text3, link: fields.Link3 },
    { image: fields.Image4, title: fields.Title4, text: fields.Text4, link: fields.Link4 },
  ];

  return (
    <div className={className} id={id ? id : undefined}>
      <div className="container">
        <h2 className="walden-interest__heading">Browse by Your Area of Interest</h2>
        <div className="row g-4">
          {columns.map((column, index) => {
            const titleField = withTextValue(column.title, INTEREST_TITLES[index]);
            const textField = withTextValue(
              column.text,
              "Bachelor's, Master's, and Doctoral programs"
            );
            const linkField = withLinkValue(column.link, PROGRAM_ROWS[0]);
            const linkHref = linkField.value?.href;
            const showCustomImage = Boolean(column.image?.value?.src) && !isStockFourColImage(column.image);

            return (
              <div className="col-sm-6 col-lg-3" key={index}>
                <div className="walden-interest__card">
                  <div className="walden-interest__icon">
                    <span className={`walden-interest__image-field${showCustomImage || isPageEditing ? '' : ' is-fallback'}`}>
                      <NextImage field={column.image || { value: {} }} width={40} height={40} />
                    </span>
                    {!showCustomImage && <InterestIcon index={index} />}
                  </div>
                  <Text tag="h3" field={titleField} className="walden-interest__title" />
                  <Text tag="p" field={textField} className="walden-interest__text" />
                  <div className="walden-interest__rows">
                    <Link field={linkField} className="walden-interest__row">
                      <span>{linkField.value?.text || PROGRAM_ROWS[0]}</span>
                      <InterestArrow />
                    </Link>
                    {PROGRAM_ROWS.slice(1).map((label) =>
                      linkHref && linkHref !== '#' ? (
                        <a key={label} href={linkHref} className="walden-interest__row">
                          <span>{label}</span>
                          <InterestArrow />
                        </a>
                      ) : (
                        <span key={label} className="walden-interest__row">
                          <span>{label}</span>
                          <InterestArrow />
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const Default = (props: FourColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const fields = props.fields;
  const className = `component component-spaced four-column-cta ${sxaStyles}`;

  if (!fields) {
    return <FourColumnCtaEmpty className={className} id={id} label="Four Column CTA" />;
  }

  const Column = ({
    image,
    title,
    text,
    link,
    delay,
    fallback,
  }: {
    image?: ImageField;
    title?: Field<string>;
    text?: Field<string>;
    link?: LinkField;
    delay?: number;
    fallback: string;
  }) => {
    const [isVisible, domRef] = useVisibility(delay);
    const body = (
      <div className="content-wrapper">
        <NextImage field={image} width={300} height={300} />
        <div className="text-wrapper">
          <h2>{title?.value ? <Text field={title} /> : fallback}</h2>
          <p>{text?.value ? <Text field={text} /> : null}</p>
        </div>
      </div>
    );

    return (
      <div
        className={`col-sm-12 col-lg-3 ${
          !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
        }`}
        ref={domRef}
      >
        {link && hasHref(link) ? <Link field={link}>{body}</Link> : body}
      </div>
    );
  };

  return (
    <div className={className} id={id ? id : undefined}>
      <div className="container">
        <div className="row">
          <Column
            image={fields.Image1}
            title={fields.Title1}
            text={fields.Text1}
            link={fields.Link1}
            fallback="Column 1"
          />
          <Column
            image={fields.Image2}
            title={fields.Title2}
            text={fields.Text2}
            link={fields.Link2}
            delay={500}
            fallback="Column 2"
          />
          <Column
            image={fields.Image3}
            title={fields.Title3}
            text={fields.Text3}
            link={fields.Link3}
            delay={1000}
            fallback="Column 3"
          />
          <Column
            image={fields.Image4}
            title={fields.Title4}
            text={fields.Text4}
            link={fields.Link4}
            delay={1500}
            fallback="Column 4"
          />
        </div>
      </div>
    </div>
  );
};
