'use client';

/* Bristol County Savings Bank client variants of the reused components (re-exported by each component file under the Variant
   Definition name). Looks measured from the bank's live pages (sections*.json, crops, theme/theme.yaml). */
import { JSX } from 'react';
import { Link, LinkField, NextImage, RichText, Text, useSitecore } from '@sitecore-content-sdk/nextjs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFields = Record<string, any>;
type VariantProps = { params?: { [key: string]: string }; fields?: AnyFields };

const has = (f?: { value?: unknown }) => !!f?.value && String(f.value).trim() !== '';
const hasLink = (f?: LinkField) => !!f?.value?.href;
const useEditing = () => !!useSitecore()?.page?.mode?.isEditing;
// The bank's photos are CSS backgrounds; the Image field drives the background (the <img> is only rendered while editing in Pages)
const bg = (img?: { value?: { src?: string } }) => (img?.value?.src ? { backgroundImage: `url("${img.value.src}")` } : undefined);
const wrap = (p: VariantProps, cls: string) => ({
  className: `component ${cls} ${p.params?.styles || ''}`,
  id: p.params?.RenderingIdentifier || undefined,
});

/* ThreeColumnCta: three white cards with an icon, title, text and Learn More (home) */
export const BcsbThreeColumnCta = (p: VariantProps): JSX.Element => {
  const f = p.fields ?? {};
  const editing = useEditing();
  return (
    <section {...wrap(p, 'bcsb-cards bcsb-cards--icons')}>
      <div className="container bcsb-cards__row">
        {!editing &&
          [1, 2, 3].map((n) =>
            has(f[`Text${n}`]) ? (
              // the bank's card is one button-like block: icon, title, text and Learn More inside one link
              <Link key={n} field={f[`Link${n}`]} className="bcsb-card bcsb-card--block" role="button">
                {f[`Image${n}`]?.value?.src && <NextImage field={f[`Image${n}`]} className="bcsb-card__icon" width={80} height={74} />}
                <Text tag="span" className="bcsb-card__name" field={f[`Text${n}`]} />
                <Text tag="span" className="bcsb-card__text" field={f[`SubText${n}`]} />
                <span className="bcsb-card__link">{String(f[`Link${n}`]?.value?.text || 'Learn More')}</span>
              </Link>
            ) : null
          )}
        {editing && [1, 2, 3].map((n) =>
          editing || has(f[`Text${n}`]) ? (
            <div key={n} className="bcsb-card">
              {(editing || f[`Image${n}`]?.value?.src) && (
                <NextImage field={f[`Image${n}`]} className="bcsb-card__icon" width={80} height={74} />
              )}
              <Text tag="h3" className="bcsb-card__title" field={f[`Text${n}`]} />
              <Text tag="p" className="bcsb-card__text" field={f[`SubText${n}`]} />
              {(editing || hasLink(f[`Link${n}`])) && <Link field={f[`Link${n}`]} className="bcsb-card__link" />}
            </div>
          ) : null
        )}
      </div>
    </section>
  );
};

/* ThreeColumnCta, News look: heading with See All News, three news cards (photo, category line, title, Read Article) */
export const BcsbThreeColumnCtaNews = (p: VariantProps): JSX.Element => {
  const f = p.fields ?? {};
  const editing = useEditing();
  return (
    <section {...wrap(p, 'bcsb-news')}>
      <div className="container">
        <div className="bcsb-news__head">
          <Text tag="h2" className="bcsb-news__heading" field={f.Heading} />
          {(editing || hasLink(f.HeadingLink)) && <Link field={f.HeadingLink} className="bcsb-news__all" />}
        </div>
        <div className="bcsb-news__row">
          {[1, 2, 3].map((n) =>
            editing || has(f[`Text${n}`]) ? (
              <article key={n} className="bcsb-news__card">
                {(editing || f[`Image${n}`]?.value?.src) && (
                  <div className="bcsb-news__img" role="img" aria-label={String(f[`Image${n}`]?.value?.alt ?? '')} style={editing ? undefined : bg(f[`Image${n}`])}>
                    {editing && <NextImage field={f[`Image${n}`]} width={600} height={330} />}
                  </div>
                )}
                <div className="bcsb-news__body">
                  <Text tag="p" className="bcsb-news__tags" field={f[`SubText${n}`]} />
                  <Text tag="h3" className="bcsb-news__title" field={f[`Text${n}`]} />
                </div>
                {(editing || hasLink(f[`Link${n}`])) && <Link field={f[`Link${n}`]} className="bcsb-news__link" />}
              </article>
            ) : null
          )}
        </div>
      </div>
    </section>
  );
};

/* PromoCta: photo left, heading, text and up to two buttons right */
export const BcsbPromoCta = (p: VariantProps): JSX.Element => {
  const f = p.fields ?? {};
  const editing = useEditing();
  return (
    <section {...wrap(p, 'bcsb-promo')}>
      <div className="container bcsb-promo__row">
        {(editing || f.Image?.value?.src) && (
          <div className="bcsb-promo__media" style={editing ? undefined : bg(f.Image)} role="img" aria-label={String(f.Image?.value?.alt ?? '')}>
            {editing && <NextImage field={f.Image} width={800} height={534} />}
          </div>
        )}
        <div className="bcsb-promo__content">
          <Text tag="h2" className="bcsb-promo__title" field={f.Title} />
          {(editing || has(f.Text)) && <RichText className="bcsb-promo__text" field={f.Text} />}
          {(editing || hasLink(f.Link) || hasLink(f.Link2)) && (
            <div className="bcsb-promo__buttons">
              {(editing || hasLink(f.Link)) && <Link field={f.Link} className="bcsb-btn bcsb-btn--solid" />}
              {(editing || hasLink(f.Link2)) && <Link field={f.Link2} className="bcsb-btn bcsb-btn--outline" />}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

/* PromoCta, WithBackgroundImage look: full-width background image with the text box (or, without a button, the help band) */
export const BcsbPromoCtaBackground = (p: VariantProps): JSX.Element => {
  const f = p.fields ?? {};
  const editing = useEditing();
  const boxed = editing || hasLink(f.Link);
  return (
    <section {...wrap(p, `bcsb-bgpromo ${boxed ? 'bcsb-bgpromo--boxed' : 'bcsb-bgpromo--band'}`)} style={editing ? undefined : bg(f.Image)}>
      {editing && <NextImage field={f.Image} className="bcsb-bgpromo__bg" width={1600} height={650} />}
      <div className="container bcsb-bgpromo__inner">
        <div className="bcsb-bgpromo__box">
          <Text tag="h2" className="bcsb-bgpromo__title" field={f.Title} />
          {(editing || has(f.Text)) && <RichText className="bcsb-bgpromo__text" field={f.Text} />}
          {(editing || hasLink(f.Link)) && <Link field={f.Link} className="bcsb-btn bcsb-btn--solid" />}
        </div>
      </div>
    </section>
  );
};

/* AppPromo: gradient band, title left, store badges right (badge artwork drawn in code, links from the derived template) */
// Store badge artwork is decoration, drawn in code (an SVG as an image, like the bank's badge images); the link comes from the field
const badgeArt = (store: 'google' | 'apple') => {
  const [small, big, w] = store === 'google' ? ['GET IT ON', 'Google Play', 150] : ['Download on the', 'App Store', 130];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="44" viewBox="0 0 ${w} 44"><rect x="0.5" y="0.5" width="${w - 1}" height="43" rx="6" fill="none" stroke="#fff"/><text x="${w / 2 + 10}" y="17" fill="#fff" font-family="Arial" font-size="8" text-anchor="middle">${small}</text><text x="${w / 2 + 10}" y="33" fill="#fff" font-family="Arial" font-size="15" font-weight="600" text-anchor="middle">${big}</text><path d="M12 12 L26 22 L12 32 Z" fill="#fff"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
const Badge = ({ field, store }: { field?: LinkField; store: 'google' | 'apple' }): JSX.Element => (
  <Link field={field as LinkField} className={`bcsb-badge bcsb-badge--${store} btn-store`} role="button">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={badgeArt(store)} alt={String(field?.value?.text || (store === 'google' ? 'Get it on Google Play' : 'Download on the App Store'))} />
    <span className="sr-only">{String(field?.value?.text || '')}</span>
  </Link>
);
export const BcsbAppPromo = (p: VariantProps): JSX.Element => {
  const f = p.fields ?? {};
  const editing = useEditing();
  return (
    <section {...wrap(p, 'bcsb-app')}>
      <div className="container bcsb-app__row">
        <Text tag="p" className="bcsb-app__title" field={f.Title} />
        <div className="bcsb-app__badges">
          {(editing || hasLink(f.GooglePlayLink)) && <Badge field={f.GooglePlayLink} store="google" />}
          {(editing || hasLink(f.AppStoreLink)) && <Badge field={f.AppStoreLink} store="apple" />}
        </div>
      </div>
    </section>
  );
};

/* Hero: full-width photo, page title strip below with an optional button */
export const BcsbHero = (p: VariantProps): JSX.Element => {
  const f = p.fields ?? {};
  const editing = useEditing();
  return (
    <section {...wrap(p, 'bcsb-hero')}>
      <div className="bcsb-hero__photo" style={editing ? undefined : bg(f.Image)} role="img" aria-label={String(f.Image?.value?.alt ?? '')}>
        {editing && <NextImage field={f.Image} width={1920} height={500} />}
      </div>
      <div className="container bcsb-hero__strip">
        <Text tag="h1" className="bcsb-hero__title" field={f.Title} />
        {(editing || hasLink(f.Link)) && <Link field={f.Link} className="bcsb-btn bcsb-btn--solid bcsb-btn--green" />}
      </div>
    </section>
  );
};

/* FourColumnCta: white cards with a green top border, title, text and Learn More; three per row, centred */
export const BcsbFourColumnCta = (p: VariantProps): JSX.Element => {
  const f = p.fields ?? {};
  const editing = useEditing();
  return (
    <section {...wrap(p, 'bcsb-cards bcsb-cards--text')}>
      <div className="container bcsb-cards__row bcsb-cards__row--wrap">
        {!editing &&
          [1, 2, 3, 4].map((n) =>
            has(f[`Title${n}`]) ? (
              // the bank's card is one clickable block (no heading): the whole card is the Learn More link
              <div key={n} className="bcsb-card bcsb-card--left">
              <Link field={f[`Link${n}`]} className="bcsb-card__hit">
                <Text tag="span" className="bcsb-card__name bcsb-card__title--green" field={f[`Title${n}`]} />
                <Text tag="span" className="bcsb-card__text" field={f[`Text${n}`]} />
                <span className="bcsb-card__link bcsb-card__link--green">{String(f[`Link${n}`]?.value?.text || 'Learn More')}</span>
              </Link>
              </div>
            ) : null
          )}
        {editing && [1, 2, 3, 4].map((n) =>
          editing || has(f[`Title${n}`]) ? (
            <div key={n} className="bcsb-card bcsb-card--left">
              <Text tag="h3" className="bcsb-card__title bcsb-card__title--green" field={f[`Title${n}`]} />
              <Text tag="p" className="bcsb-card__text" field={f[`Text${n}`]} />
              {(editing || hasLink(f[`Link${n}`])) && <Link field={f[`Link${n}`]} className="bcsb-card__link bcsb-card__link--green" />}
            </div>
          ) : null
        )}
      </div>
    </section>
  );
};

/* Comparison: two slate rate cards (title, rate, APY*, olive button) */
export const BcsbComparison = (p: VariantProps): JSX.Element => {
  const f = p.fields ?? {};
  const editing = useEditing();
  const card = (n: 1 | 2) => (
    <div className="bcsb-rate">
      <Text tag="h3" className="bcsb-rate__title" field={f[`Title${n}`]} />
      <h4 className="bcsb-rate__figure">
        <Text field={f[`Amount${n}`]} />
        <Text field={f[`Currency${n}`]} />
      </h4>
      <Text tag="p" className="bcsb-rate__sub" field={f[`Subtitle${n}`]} />
      {(editing || hasLink(f[`Link${n}`])) && (
        <div className="bcsb-rate__foot">
          <Link field={f[`Link${n}`]} className="bcsb-rate__button" />
        </div>
      )}
    </div>
  );
  return (
    <section {...wrap(p, 'bcsb-rates')}>
      <div className="container bcsb-rates__row">
        {card(1)}
        {(editing || has(f.Amount2)) && card(2)}
      </div>
    </section>
  );
};

/* RichText: heading + paragraphs; a band without a heading is the grey disclosure strip (styled in CSS) */
export const BcsbRichText = (p: VariantProps): JSX.Element => {
  const f = p.fields ?? {};
  return (
    <section {...wrap(p, 'bcsb-text')}>
      <div className="container">
        <RichText className="bcsb-text__body" field={f.Text} />
      </div>
    </section>
  );
};

/* RichText, Plain look: text on white (the disclosure under the Prime Time CD page) */
export const BcsbRichTextPlain = (p: VariantProps): JSX.Element => {
  const f = p.fields ?? {};
  return (
    <section {...wrap(p, 'bcsb-text bcsb-text--plain')}>
      <div className="container">
        <RichText className="bcsb-text__body" field={f.Text} />
      </div>
    </section>
  );
};

/* Footer: logo badge + quick links + socials; gradient bar with routing/NMLS and legal links; about paragraph; FDIC / EHL / copyright */
const FOOTER_MARKS = {
  fdic: 'https://jzi-verticals.sitecoresandbox.cloud/api/public/content/113668-footer-s10-member-fdic?v=44f917ab',
  ehl: 'https://jzi-verticals.sitecoresandbox.cloud/api/public/content/113673-footer-s10-equal-housing-lender?v=194b95d9',
};
const SOCIAL_ICON: Record<string, string> = { linkedin: 'in', facebook: 'f', instagram: '◎', x: 'X', twitter: 'X' };
export const BcsbFooter = (p: VariantProps & { splash?: boolean }): JSX.Element => {
  const f = p.fields ?? {};
  const splash = !!p.splash; // promo pages: no quick links, socials or legal links (the bank's marketing-splash footer)
  const editing = useEditing();
  const socials = [1, 2, 3].map((n) => f[`SocialLink${n}`]).filter((l) => editing || hasLink(l));
  return (
    <footer {...wrap(p, 'bcsb-footer')}>
      <div className="container bcsb-footer__top">
        <div className="bcsb-footer__badge">
          {(editing || f.Image1?.value?.src) && <NextImage field={f.Image1} width={160} height={135} />}
        </div>
        {!splash && <RichText className="bcsb-footer__quick" field={f.Text1} />}
        {!splash && <div className="bcsb-footer__socials">
          {socials.map((l, k) => (
            <Link key={k} field={l} className="bcsb-footer__social" aria-label={`${l?.value?.text ?? ''} Link`}>
              <span aria-hidden="true">{SOCIAL_ICON[String(l?.value?.text || '').toLowerCase()] ?? '•'}</span>
              <span className="sr-only">{`${l?.value?.text ?? ''} Link`}</span>
            </Link>
          ))}
          {/* X (Twitter): the Footer template has three social link fields; the bank's fourth is hardcoded chrome */}
          <a className="bcsb-footer__social" href="https://twitter.com/bcsb" aria-label="Twitter Link" target="_blank" rel="noopener noreferrer">
            <span aria-hidden="true">X</span>
            <span className="sr-only">Twitter Link</span>
          </a>
        </div>}
      </div>
      <div className="bcsb-footer__bar">
        <div className="container bcsb-footer__bar-inner">
          <RichText className="bcsb-footer__ids" field={f.Text2} />
          {!splash && <RichText className="bcsb-footer__legal" field={f.Text3} />}
        </div>
      </div>
      <div className="container bcsb-footer__about">
        <RichText field={f.Text4} />
      </div>
      <div className="container bcsb-footer__bottom">
        <div className="bcsb-footer__marks">
          {editing ? (
            <>
              <Link field={f.Link1} className="bcsb-footer__mark" />
              <Link field={f.Link2} className="bcsb-footer__mark" />
            </>
          ) : (
            <>
              {/* Regulatory marks: the Footer template has no image fields for them, so the logos are hardcoded chrome (uploaded to Content Hub) */}
              {hasLink(f.Link1) && (
                <Link field={f.Link1} className="bcsb-footer__mark">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={FOOTER_MARKS.fdic} alt={String(f.Link1?.value?.text || 'Member FDIC')} width={81} height={50} />
                </Link>
              )}
              {hasLink(f.Link2) && (
                <Link field={f.Link2} className="bcsb-footer__mark">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={FOOTER_MARKS.ehl} alt={String(f.Link2?.value?.text || 'Equal Housing Lender')} width={42} height={50} />
                </Link>
              )}
            </>
          )}
        </div>
        <Text tag="p" className="bcsb-footer__copy" field={f.Copyright} />
        {!splash && (
          // App store badges of the bank's footer (hardcoded chrome; badge artwork drawn in code)
          <div className="bcsb-footer__apps">
            <a href="https://apps.apple.com/us/app/bcsb-mobile-app/id6798324907" target="_blank" rel="noopener noreferrer" className="bcsb-footer__app">
              <svg role="img" aria-label="Available on the App Store" viewBox="0 0 120 40" width="120" height="40">
                <rect width="120" height="40" rx="6" fill="#000" />
                <text x="60" y="17" fill="#fff" fontSize="7" textAnchor="middle">Download on the</text>
                <text x="60" y="30" fill="#fff" fontSize="12" fontWeight="600" textAnchor="middle">App Store</text>
              </svg>
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.bristolcountysavings.imobile&hl=en" target="_blank" rel="noopener noreferrer" className="bcsb-footer__app">
              <svg role="img" aria-label="Android app on Google Play" viewBox="0 0 135 40" width="135" height="40">
                <rect width="135" height="40" rx="6" fill="#000" />
                <text x="70" y="17" fill="#fff" fontSize="7" textAnchor="middle">GET IT ON</text>
                <text x="70" y="30" fill="#fff" fontSize="12" fontWeight="600" textAnchor="middle">Google Play</text>
              </svg>
            </a>
          </div>
        )}
      </div>
    </footer>
  );
};

export const BcsbFooterSplash = (p: VariantProps): JSX.Element => <BcsbFooter {...p} splash />;
