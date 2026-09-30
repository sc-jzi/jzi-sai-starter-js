'use client';

import { JSX } from 'react';
import {
  Field,
  ImageField,
  RichTextField,
  Text,
  RichText,
  useSitecore,
  Link,
  LinkField,
  Placeholder,
  NextImage,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { IconAccent } from 'components/non-sitecore/IconAccent';
import { DottedAccent } from 'components/non-sitecore/DottedAccent';

interface Fields {
  Tagline: Field<string>;
  Title: Field<string>;
  Text: RichTextField;
  Image: ImageField;
  Cta1: LinkField;
  Cta2: LinkField;
  Icon: ImageField;
  QuickOrderTitle?: Field<string>;
  QuickOrderText?: Field<string>;
  QuickOrderLink?: LinkField;
}

export type HeroBannerProps = ComponentProps & {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: HeroBannerProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component hero-banner ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container container-wide">
        <div className="hero-row">
          <div className="content-column">
            <h6 className="eyebrow-accent">
              <Text field={props.fields.Tagline} />
            </h6>
            <h1 className="display-2 fw-bold">
              <Text field={props.fields.Title} />
            </h1>

            <div className="rich-content mb-4">
              <RichText field={props.fields.Text} />
            </div>
            <div className="btn-array pt-3 pb-4">
              {(isPageEditing || props.fields?.Cta1?.value?.href) && (
                <Link field={props.fields.Cta1} className="button button-main" />
              )}
              {(isPageEditing || props.fields?.Cta2?.value?.href) && (
                <Link field={props.fields.Cta2} className="button button-simple mx-4" />
              )}
            </div>
            <div className="row mt-2">
              <Placeholder name="hero-banner" rendering={props.rendering} />
            </div>
            <IconAccent image={props.fields.Icon} />
          </div>
          <div className="img-column">
            <div className="img-wrapper">
              <DottedAccent className="dotted-accent-top" />
              <NextImage
                field={props.fields.Image}
                className="img-fluid"
                width={700}
                height={700}
              />
              <DottedAccent className="dotted-accent-bottom" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* DwyerOmega variant — split welcome, product photo, and Quick Order card */
export const DwyerOmega = (props: HeroBannerProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const quickOrderLink = props.fields.QuickOrderLink?.value?.href
    ? props.fields.QuickOrderLink
    : props.fields.Cta2;

  return (
    <section
      className={`component hero-banner ${sxaStyles}`}
      id={id ? id : undefined}
      style={{ background: 'var(--brand-muted, #F5F5F7)' }}
    >
      <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr_320px]">
        <div>
          <p
            className="mb-3 text-sm font-semibold tracking-wide"
            style={{ color: 'var(--brand-fg, #1C1C1C)' }}
          >
            <Text field={props.fields.Tagline} />
          </p>
          <h1
            className="mb-4 text-3xl font-semibold leading-tight"
            style={{
              fontFamily: 'var(--brand-heading-font, inherit)',
              color: 'var(--brand-fg, #1C1C1C)',
            }}
          >
            <Text field={props.fields.Title} />
          </h1>
          <div className="mb-4 text-base" style={{ color: 'var(--brand-muted-fg, #5E6265)' }}>
            <RichText field={props.fields.Text} />
          </div>
          {(isPageEditing || props.fields?.Cta1?.value?.href) && (
            <Link
              field={props.fields.Cta1}
              className="text-sm font-semibold"
              style={{ color: 'var(--brand-accent, #D4232D)' }}
            />
          )}
        </div>
        <div className="flex justify-center">
          <NextImage field={props.fields.Image} className="max-h-[280px] w-auto object-contain" width={420} height={280} />
        </div>
        <form
          className="rounded-lg bg-white p-6 shadow-md"
          onSubmit={(event) => event.preventDefault()}
        >
          <h2 className="text-lg font-semibold" style={{ color: 'var(--brand-primary, #232C65)' }}>
            <Text field={props.fields.QuickOrderTitle} />
          </h2>
          <p className="mb-4 mt-1 text-sm" style={{ color: 'var(--brand-muted-fg, #5E6265)' }}>
            <Text field={props.fields.QuickOrderText} />
          </p>
          {[0, 1].map((row) => (
            <div key={row} className="mb-3 grid grid-cols-[1fr_72px] gap-2">
              <label className="text-xs" style={{ color: 'var(--brand-muted-fg, #5E6265)' }}>
                Part #
                <input className="mt-1 w-full rounded border px-2 py-1" style={{ borderColor: 'var(--brand-border, #E4E4E7)' }} />
              </label>
              <label className="text-xs" style={{ color: 'var(--brand-muted-fg, #5E6265)' }}>
                Qty
                <input className="mt-1 w-full rounded border px-2 py-1" style={{ borderColor: 'var(--brand-border, #E4E4E7)' }} />
              </label>
            </div>
          ))}
          {(isPageEditing || quickOrderLink?.value?.href) && (
            <Link
              field={quickOrderLink}
              className="mt-2 inline-flex w-full items-center justify-center rounded px-4 py-2 text-sm font-semibold"
              style={{
                background: 'var(--brand-primary, #232C65)',
                color: 'var(--brand-primary-foreground, #fff)',
                borderRadius: 'var(--brand-button-radius, 0.375rem)',
              }}
            />
          )}
        </form>
      </div>
    </section>
  );
};
