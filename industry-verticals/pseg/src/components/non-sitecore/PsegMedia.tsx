'use client';

import { ImageField, NextImage } from '@sitecore-content-sdk/nextjs';
import { JSX } from 'react';

type PsegMediaProps = {
  field?: ImageField;
  fallback: string;
  alt: string;
  className?: string;
  width: number;
  height: number;
};

export function PsegMedia({
  field,
  fallback,
  alt,
  className,
  width,
  height,
}: PsegMediaProps): JSX.Element {
  if (field?.value?.src) {
    return <NextImage field={field} width={width} height={height} className={className} />;
  }

  return (
    <img
      src={fallback}
      alt={(field?.value?.alt as string) || alt}
      className={className}
      width={width}
      height={height}
    />
  );
}

export function hasRealHref(href?: string): boolean {
  if (!href) {
    return false;
  }

  const normalized = href.trim().toLowerCase();
  if (!normalized || normalized === '#' || normalized === '/') {
    return false;
  }

  return !normalized.includes('example.com');
}
