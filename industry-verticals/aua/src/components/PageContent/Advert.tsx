'use client';

import React, { JSX, useEffect, useMemo, useState } from 'react';
import {
  Field,
  Link,
  LinkField,
  Text,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface Fields {
  AdUnitPath: Field<string>;
  AdSlotId: Field<string>;
  AdLabel: Field<string>;
  Headline: Field<string>;
  Description: Field<string>;
  CTA: LinkField;
}

export type AdvertProps = ComponentProps & {
  params: { [key: string]: string };
  fields: Fields;
};

type AdFormat = 'leaderboard' | 'rectangle' | 'responsive';

type AdFormatConfig = {
  width: number;
  height: number;
  containerClassName: string;
  creativeClassName: string;
};

const AD_FORMATS: Record<AdFormat, AdFormatConfig> = {
  leaderboard: {
    width: 728,
    height: 90,
    containerClassName: 'mx-auto w-full max-w-[728px]',
    creativeClassName: 'min-h-[90px] flex-row items-center gap-4 px-4 py-2',
  },
  rectangle: {
    width: 300,
    height: 250,
    containerClassName: 'mx-auto w-full max-w-[300px]',
    creativeClassName: 'min-h-[250px] flex-col items-start justify-between gap-3 p-4',
  },
  responsive: {
    width: 970,
    height: 250,
    containerClassName: 'mx-auto w-full max-w-[970px]',
    creativeClassName: 'min-h-[90px] flex-col items-start justify-center gap-2 px-6 py-4 sm:min-h-[120px] sm:flex-row sm:items-center sm:gap-6',
  },
};

const DEFAULT_AD_UNIT_PATH = '/6499/aua-demo/leaderboard';
const DEFAULT_AD_SLOT_ID = 'aua-leaderboard-1';
const DEFAULT_AD_LABEL = 'Advertisement';
const DEFAULT_HEADLINE = 'Advance Your Urology Career';
const DEFAULT_DESCRIPTION = 'Join the AUA for member benefits, CME, and peer connection.';
const DEFAULT_CTA: LinkField = {
  value: {
    href: 'https://www.auanet.org/membership',
    text: 'Learn More',
    linktype: 'external',
    url: 'https://www.auanet.org/membership',
    anchor: '',
    target: '_blank',
  },
};

declare global {
  interface Window {
    googletag?: {
      cmd: Array<() => void>;
      display: (slotElementId: string) => void;
      pubads?: () => {
        refresh: (slots?: unknown[]) => void;
      };
    };
  }
}

const getFieldValue = (field: Field<string> | undefined, fallback: string): string =>
  field?.value?.trim() ? field.value.trim() : fallback;

const getLinkField = (field: LinkField | undefined, fallback: LinkField): LinkField => {
  if (field?.value?.href?.trim()) {
    return field;
  }

  return fallback;
};

const simulateGooglePublisherTag = (slotElementId: string, adUnitPath: string): void => {
  if (!window.googletag) {
    window.googletag = {
      cmd: [],
      display: () => {},
    };
  }

  window.googletag.cmd.push(() => {
    window.googletag?.display(slotElementId);
  });

  if (process.env.NODE_ENV === 'development') {
    console.info('[Advert] Simulated GPT display()', { slotElementId, adUnitPath });
  }
};

type GoogleAdSlotProps = {
  format: AdFormat;
  fields: Fields;
  isPageEditing: boolean;
  sxaStyles: string;
  renderingIdentifier?: string;
};

const GoogleAdSlot = ({
  format,
  fields,
  isPageEditing,
  sxaStyles,
  renderingIdentifier,
}: GoogleAdSlotProps): JSX.Element => {
  const formatConfig = AD_FORMATS[format];
  const adUnitPath = getFieldValue(fields.AdUnitPath, DEFAULT_AD_UNIT_PATH);
  const adSlotId = getFieldValue(fields.AdSlotId, DEFAULT_AD_SLOT_ID);
  const adLabel = getFieldValue(fields.AdLabel, DEFAULT_AD_LABEL);
  const headlineField = fields.Headline?.value?.trim()
    ? fields.Headline
    : { value: DEFAULT_HEADLINE };
  const descriptionField = fields.Description?.value?.trim()
    ? fields.Description
    : { value: DEFAULT_DESCRIPTION };
  const ctaField = getLinkField(fields.CTA, DEFAULT_CTA);
  const slotElementId = useMemo(() => `div-gpt-ad-${adSlotId.replace(/[^\w-]/g, '-')}`, [adSlotId]);
  const [isLoaded, setIsLoaded] = useState(isPageEditing);

  useEffect(() => {
    if (isPageEditing) {
      return;
    }

    setIsLoaded(false);
    simulateGooglePublisherTag(slotElementId, adUnitPath);

    const loadTimer = window.setTimeout(() => {
      setIsLoaded(true);
    }, 650);

    return () => {
      window.clearTimeout(loadTimer);
    };
  }, [adUnitPath, isPageEditing, slotElementId]);

  return (
    <div
      className={`component aua-advert ${sxaStyles}`.trim()}
      id={renderingIdentifier || undefined}
      data-gpt-simulated="true"
      data-ad-format={format}
    >
      <div className={`${formatConfig.containerClassName} px-2`}>
        <p className="mb-1 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-[#6b7280]">
          <Text field={fields.AdLabel?.value?.trim() ? fields.AdLabel : { value: adLabel }} />
        </p>

        <div
          id={slotElementId}
          data-ad-unit-path={adUnitPath}
          data-ad-slot-id={adSlotId}
          data-google-query-id={`simulated-${adSlotId}`}
          role="complementary"
          aria-label={adLabel}
          aria-busy={!isLoaded}
          className="relative overflow-hidden border border-[#d1d5db] bg-[#f4f4f4] shadow-sm"
          style={{
            minWidth: format === 'responsive' ? '320px' : `${formatConfig.width}px`,
            minHeight: `${formatConfig.height}px`,
          }}
        >
          {!isLoaded && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-[#eceff3]"
              aria-hidden="true"
            >
              <div className="flex w-[min(100%,18rem)] flex-col gap-2 px-4">
                <div className="h-2 animate-pulse rounded bg-[#d1d5db]" />
                <div className="h-2 w-4/5 animate-pulse rounded bg-[#d1d5db]" />
                <div className="mt-1 h-6 w-24 animate-pulse rounded bg-[#cbd5e1]" />
              </div>
            </div>
          )}

          <div
            className={`flex w-full bg-gradient-to-r from-[#003d5b] to-[#0077b5] text-white transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${formatConfig.creativeClassName}`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75">
                Sponsored
              </p>
              <h3
                className={`font-[family-name:var(--font-family-heading)] font-semibold leading-tight text-white ${
                  format === 'rectangle' ? 'text-lg' : 'text-base sm:text-lg'
                }`}
              >
                <Text field={headlineField} />
              </h3>
              <p
                className={`mt-1 text-white/90 ${
                  format === 'leaderboard' ? 'line-clamp-1 text-xs' : 'text-sm'
                }`}
              >
                <Text field={descriptionField} />
              </p>
            </div>

            {(isPageEditing || ctaField.value.href) && (
              <Link
                field={ctaField}
                className={`inline-flex shrink-0 items-center justify-center bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#003d5b] transition-opacity hover:opacity-90 ${
                  format === 'rectangle' ? 'w-full' : ''
                }`}
              />
            )}
          </div>
        </div>

        {isPageEditing && (
          <div className="mt-2 rounded border border-dashed border-[#0077b5]/40 bg-[#f0f5f9] px-3 py-2 text-xs text-[#003d5b]">
            <p className="font-semibold">Simulated Google Ad Manager slot</p>
            <p>
              Unit path: <code className="text-[11px]">{adUnitPath}</code>
            </p>
            <p>
              Slot ID: <code className="text-[11px]">{slotElementId}</code>
            </p>
            <p>
              Size: {formatConfig.width}×{formatConfig.height}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const AdvertVariant = (props: AdvertProps & { format: AdFormat }): JSX.Element => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`.trim();

  return (
    <GoogleAdSlot
      format={props.format}
      fields={props.fields}
      isPageEditing={isPageEditing}
      sxaStyles={sxaStyles}
      renderingIdentifier={props.params.RenderingIdentifier}
    />
  );
};

export const Default = (props: AdvertProps): JSX.Element => (
  <AdvertVariant {...props} format="leaderboard" />
);

export const MediumRectangle = (props: AdvertProps): JSX.Element => (
  <AdvertVariant {...props} format="rectangle" />
);

export const ResponsiveBanner = (props: AdvertProps): JSX.Element => (
  <AdvertVariant {...props} format="responsive" />
);
