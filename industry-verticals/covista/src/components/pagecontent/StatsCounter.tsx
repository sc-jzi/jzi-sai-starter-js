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

const StatIcon = ({ name }: { name: 'building' | 'graduates' | 'stethoscope' }) => {
  if (name === 'building') {
    return (
      <svg className="cv-stats__icon" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M6 28V10l10-6 10 6v18H6z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path d="M13 28v-8h6v8" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 14h2M18 14h2M12 18h2M18 18h2" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (name === 'graduates') {
    return (
      <svg className="cv-stats__icon" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M4 14l12-6 12 6-12 6-12-6z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 16.5v6c3 2 9 2 12 0v-6" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  return (
    <svg className="cv-stats__icon" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M8 6h6v6H8zM18 6h6v6h-6z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M11 12v3a5 5 0 0 0 10 0v-3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M21 20v4a3 3 0 0 1-3 3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
};

export const CovistaCards = (props: StatsCounterProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  const Card = ({
    value,
    symbol,
    caption,
    icon,
  }: {
    value: Field<string>;
    symbol: Field<string>;
    caption: Field<string>;
    icon: 'building' | 'graduates' | 'stethoscope';
  }) => (
    <div className="cv-stats__card">
      <StatIcon name={icon} />
      <p className="cv-stats__value">
        <span>
          {isPageEditing ? (
            <Text field={value} />
          ) : (
            <CountUp value={parseInt(value?.value || '0', 10)} />
          )}
        </span>
        <Text field={symbol} />
      </p>
      <p className="cv-stats__caption">
        <Text field={caption} />
      </p>
    </div>
  );

  return (
    <div className={`component stats-counter cv-stats ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="cv-stats__grid">
          <Card
            value={props.fields?.Value1}
            symbol={props.fields?.Symbol1}
            caption={props.fields?.Caption1}
            icon="building"
          />
          <Card
            value={props.fields?.Value2}
            symbol={props.fields?.Symbol2}
            caption={props.fields?.Caption2}
            icon="graduates"
          />
          <Card
            value={props.fields?.Value3}
            symbol={props.fields?.Symbol3}
            caption={props.fields?.Caption3}
            icon="stethoscope"
          />
        </div>
      </div>
    </div>
  );
};
