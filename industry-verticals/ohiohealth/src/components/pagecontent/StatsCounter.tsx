'use client';

import { JSX } from 'react';
import { Field, ImageField, NextImage, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { CountUp } from 'components/non-sitecore/CountUp';
import { DottedAccent } from 'components/non-sitecore/DottedAccent';

interface Fields {
  Image1: ImageField;
  Image2: ImageField;
  Value1: Field<string>;
  Symbol1: Field<string>;
  Caption1: Field<string>;
  Value2: Field<string>;
  Symbol2: Field<string>;
  Caption2: Field<string>;
  Value3: Field<string>;
  Symbol3: Field<string>;
  Caption3: Field<string>;
  // heading and a fourth stat: only on the demo's derived datasource template (StatsCounterOhioHealth, R22 extend)
  Heading?: Field<string>;
  Value4?: Field<string>;
  Symbol4?: Field<string>;
  Caption4?: Field<string>;
}

export type StatsCounterProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: StatsCounterProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div
      className={`component stats-counter component-spaced ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container container-wide-fluid">
        <NextImage field={props.fields?.Image1} className="image-left" width={300} height={300} />
        <div className="container">
          <DottedAccent className="dotted-accent-top" />
          <div className="row gx-0">
            <div className="col-lg-4">
              <p className="display-6 fw-bold">
                <span>
                  {isPageEditing ? (
                    <Text field={props.fields?.Value1} />
                  ) : (
                    <CountUp value={parseInt(props.fields?.Value1.value)} />
                  )}
                </span>
                <span>
                  <Text field={props.fields?.Symbol1} />
                </span>
              </p>
              <p className="fs-5 mb-0">
                <Text field={props.fields?.Caption1} />
              </p>
            </div>
            <div className="col-lg-4">
              <p className="display-6 fw-bold">
                <span>
                  {isPageEditing ? (
                    <Text field={props.fields?.Value2} />
                  ) : (
                    <CountUp value={parseInt(props.fields?.Value2.value)} />
                  )}
                </span>
                <span>
                  <Text field={props.fields?.Symbol2} />
                </span>
              </p>
              <p className="fs-5 mb-0">
                <Text field={props.fields?.Caption2} />
              </p>
            </div>
            <div className="col-lg-4">
              <p className="display-6 fw-bold">
                <span>
                  {isPageEditing ? (
                    <Text field={props.fields?.Value3} />
                  ) : (
                    <CountUp value={parseInt(props.fields?.Value3.value)} />
                  )}
                </span>
                <span>
                  <Text field={props.fields?.Symbol3} />
                </span>
              </p>
              <p className="fs-5 mb-0">
                <Text field={props.fields?.Caption3} />
              </p>
            </div>
          </div>
          <DottedAccent className="dotted-accent-bottom" />
        </div>
        <NextImage field={props.fields?.Image2} className="image-right" width={300} height={300} />
      </div>
    </div>
  );
};

// OhioHealth "Excellence you can trust": heading, then four stats (outline icon, big number, caption) on navy.
// The outline icons are decoration drawn in code (R26), one per position as on the live band.
const OH_ICONS: JSX.Element[] = [
  <path key="star" d="M24 5l5.6 11.4 12.6 1.8-9.1 8.9 2.2 12.5L24 33.7l-11.3 5.9 2.2-12.5-9.1-8.9 12.6-1.8z" />,
  <g key="building"><rect x="8" y="6" width="22" height="36" /><rect x="30" y="18" width="12" height="24" /><path d="M14 13h3M21 13h3M14 20h3M21 20h3M14 27h3M21 27h3M14 34h3M21 34h3M35 25h3M35 32h3" /></g>,
  <g key="leaf"><path d="M10 38C10 18 24 8 40 8c0 18-10 30-30 30z" /><path d="M10 38L28 20" /></g>,
  <g key="medal"><circle cx="24" cy="18" r="12" /><path d="M24 11l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z" /><path d="M16 28l-4 14 7-4 5 6M32 28l4 14-7-4-5 6" /></g>,
];

export const OhioHealth = (props: StatsCounterProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const f = props.fields;
  const stats = [
    { value: f?.Value1, symbol: f?.Symbol1, caption: f?.Caption1 },
    { value: f?.Value2, symbol: f?.Symbol2, caption: f?.Caption2 },
    { value: f?.Value3, symbol: f?.Symbol3, caption: f?.Caption3 },
    { value: f?.Value4, symbol: f?.Symbol4, caption: f?.Caption4 },
  ].filter((x) => x.value && (x.value.value || isEditing));

  return (
    <section className={`component oh-stats ${sxaStyles}`} id={id ? id : undefined}>
      <div className="oh-stats__inner">
        {f?.Heading && (f.Heading.value || isEditing) && (
          <h2 className="oh-stats__heading">
            <Text field={f.Heading} />
          </h2>
        )}
        <div className="oh-stats__row">
          {stats.map((x, i) => (
            <div className="oh-stats__item" key={i}>
              <div className="oh-stats__figure">
                <svg className="oh-stats__icon" viewBox="0 0 48 48" width="64" height="64" aria-hidden="true">
                  {OH_ICONS[i % OH_ICONS.length]}
                </svg>
                <h3 className="oh-stats__value">
                  <Text field={x.value} />
                  {x.symbol && <Text field={x.symbol} />}
                </h3>
              </div>
              {x.caption && (
                <p className="oh-stats__caption">
                  <Text field={x.caption} />
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
