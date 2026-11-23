import { JSX } from 'react';
import {
  Field,
  ImageField,
  Link,
  LinkField,
  NextImage,
  RichText,
  RichTextField,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface Fields {
  Title?: Field<string>;
  Text?: RichTextField;
  Link?: LinkField;
  Image?: ImageField;
  Rate1Value?: Field<string>;
  Rate1Suffix?: Field<string>;
  Rate1Label?: Field<string>;
  Rate2Value?: Field<string>;
  Rate2Suffix?: Field<string>;
  Rate2Label?: Field<string>;
  RatesNote?: Field<string>;
  Disclosure?: RichTextField;
}

export type RatePromoHeroProps = ComponentProps & { fields?: Fields };

type Look = 'default' | 'split' | 'image';

const has = (f?: { value?: unknown }) => !!f?.value && String(f.value).trim() !== '';

const Rate = ({
  value,
  suffix,
  label,
  editing,
}: {
  value?: Field<string>;
  suffix?: Field<string>;
  label?: Field<string>;
  editing: boolean;
}): JSX.Element | null => {
  if (!editing && !has(value)) return null;
  return (
    <div className="rate-promo-hero__rate">
      <div className="rate-promo-hero__rate-figure">
        <Text tag="span" className="rate-promo-hero__rate-value" field={value} />
        {(editing || has(suffix)) && <Text tag="span" className="rate-promo-hero__rate-suffix" field={suffix} />}
      </div>
      {(editing || has(label)) && <Text tag="div" className="rate-promo-hero__rate-label" field={label} />}
    </div>
  );
};

const RatesPanel = ({ fields, editing }: { fields: Fields; editing: boolean }): JSX.Element | null => {
  const hasRates = has(fields.Rate1Value) || has(fields.Rate2Value);
  if (!editing && !hasRates) return null;
  return (
    <div className="rate-promo-hero__rates">
      <div className="rate-promo-hero__rate-row">
        <Rate value={fields.Rate1Value} suffix={fields.Rate1Suffix} label={fields.Rate1Label} editing={editing} />
        {(editing || has(fields.Rate2Value)) && <span className="rate-promo-hero__divider" aria-hidden="true" />}
        <Rate value={fields.Rate2Value} suffix={fields.Rate2Suffix} label={fields.Rate2Label} editing={editing} />
      </div>
      {(editing || has(fields.RatesNote)) && (
        <Text tag="p" className="rate-promo-hero__note" field={fields.RatesNote} />
      )}
      {/* The disclosure sits directly under the rates it qualifies (compliance), not at the bottom of the page */}
      {(editing || has(fields.Disclosure)) && (
        <RichText className="rate-promo-hero__disclosure" field={fields.Disclosure} />
      )}
    </div>
  );
};

const RatePromoHeroBody = ({ props, look }: { props: RatePromoHeroProps; look: Look }): JSX.Element => {
  const fields = props.fields ?? {};
  const editing = !!props.page?.mode?.isEditing;
  const id = props.params?.RenderingIdentifier;
  const styles = props.params?.styles || '';
  const hasRates = has(fields.Rate1Value) || has(fields.Rate2Value);
  const hasImage = !!fields.Image?.value?.src;
  const pageTitle = props.page?.layout?.sitecore?.route?.fields?.Title as Field<string> | undefined;

  if (!props.fields) {
    return (
      <div className={`component rate-promo-hero ${styles}`} id={id}>
        <span className="is-empty-hint">Rate promo hero</span>
      </div>
    );
  }

  const link = (editing || fields.Link?.value?.href) && (
    <Link field={fields.Link as LinkField} className="rate-promo-hero__button" />
  );

  if (look === 'image') {
    // Promo page: photo left, green rates panel right, title strip with the button underneath.
    return (
      <section className={`component rate-promo-hero rate-promo-hero--image ${styles}`} id={id}>
        <div className="rate-promo-hero__band">
          <div
            className="rate-promo-hero__photo"
            role="img"
            aria-label={String(fields.Image?.value?.alt ?? '')}
            style={!editing && hasImage ? { backgroundImage: `url("${fields.Image?.value?.src}")` } : undefined}
          >
            {editing && <NextImage field={fields.Image} width={1100} height={500} />}
          </div>
          <div className="rate-promo-hero__panel">
            {(editing || has(fields.Text)) && <RichText className="rate-promo-hero__panel-text" field={fields.Text} />}
            <RatesPanel fields={fields} editing={editing} />
          </div>
        </div>
        <div className="rate-promo-hero__strip container">
          <Text tag="h1" className="rate-promo-hero__title" field={fields.Title} />
          {link}
        </div>
      </section>
    );
  }

  // Homepage: two columns in solid colours (slate text panel left, light rates panel right), the same in Pages and on the site;
  // without rates, the photo fills the right column.
  return (
    <section
      className={`component rate-promo-hero rate-promo-hero--split ${look === 'default' ? 'rate-promo-hero--plain' : ''} ${styles}`}
      id={id}
    >
      <div
        className={`rate-promo-hero__text${hasImage && look === 'split' ? ' rate-promo-hero__text--photo' : ''}`}
        // the bank's hero picture is the band image: cropped to the text column only its slate half shows (the rates baked into its
        // right half fall outside the column, so they never repeat the editable rates). Applied in Pages too, so the text stays readable.
        style={hasImage && look === 'split' ? { backgroundImage: `url("${fields.Image?.value?.src}")` } : undefined}
      >
        {/* The page's own title (route field Title) as the visually hidden h1, as on the bank's homepage */}
        {pageTitle?.value && <Text tag="h1" className="sr-only" field={pageTitle} />}
        <div className="rate-promo-hero__text-inner">
          <Text tag="h2" className="rate-promo-hero__title" field={fields.Title} />
          {(editing || has(fields.Text)) && <RichText className="rate-promo-hero__body" field={fields.Text} />}
          {link}
        </div>
      </div>
      <div className="rate-promo-hero__aside">
        {hasRates || editing ? (
          <RatesPanel fields={fields} editing={editing} />
        ) : (
          hasImage && <NextImage field={fields.Image} className="rate-promo-hero__aside-image" width={960} height={420} />
        )}
      </div>
    </section>
  );
};

export const Default = (props: RatePromoHeroProps): JSX.Element => <RatePromoHeroBody props={props} look="default" />;

export const BristolCountySavingsBank = (props: RatePromoHeroProps): JSX.Element => (
  <RatePromoHeroBody props={props} look="split" />
);

export const BristolCountySavingsBankWithImage = (props: RatePromoHeroProps): JSX.Element => (
  <RatePromoHeroBody props={props} look="image" />
);
