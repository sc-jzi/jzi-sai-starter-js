'use client';

import { AppPlaceholder, ComponentMap, ImageField, NextImage, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { JSX } from 'react';

export type HeaderProps = ComponentProps & {
  fields: {
    LogoImage: ImageField;
  };
  componentMap: ComponentMap;
};

export const Default = (props: HeaderProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();

  return (
    <div className={`component header ${props.params.styles?.trimEnd()}`} id={id ? id : undefined}>
      <div className={`container container-${props.params?.ContainerWidth?.toLowerCase()}-fluid`}>
        <div className="row align-items-center">
          <div className="col-auto">
            <AppPlaceholder name="header-left" rendering={props.rendering} page={page} componentMap={props.componentMap} />
          </div>
          <div className="col">
            <AppPlaceholder name="header-right" rendering={props.rendering} page={page} componentMap={props.componentMap} />
          </div>
        </div>
      </div>
    </div>
  );
};



export const WithLogoImage = (props: HeaderProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const { page } = useSitecore();
  
  return (
    <div className={`component header ${sxaStyles}`} id={id ? id : undefined}>
      <div className={`container container-${props.params?.ContainerWidth?.toLowerCase()}-fluid`}>
        <div className="row align-items-center">
          <div className="col-auto">
            <NextImage field={props.fields.LogoImage} width={200} height={50} />
          </div>
          <div className="col">
            <AppPlaceholder name="header-right" rendering={props.rendering} page={page} componentMap={props.componentMap} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* Kal Tire variant — two-tier utility and retail navigation */
export const KalTire = (props: HeaderProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <header
      className={`component header kal-tire-header border-b border-[var(--brand-border)] bg-[var(--brand-header-bg)] text-[var(--brand-header-fg)] ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="bg-[var(--brand-muted)]">
        <div className="mx-auto flex min-h-8 max-w-[1280px] items-center justify-end px-6 text-[0.7rem] font-semibold uppercase">
          <AppPlaceholder
            name="header-left"
            rendering={props.rendering}
            page={page}
            componentMap={props.componentMap}
          />
        </div>
      </div>
      <div className="mx-auto flex min-h-20 max-w-[1280px] items-center gap-7 px-6">
        <NextImage
          field={props.fields?.LogoImage}
          width={180}
          height={48}
          className="h-auto w-36 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <AppPlaceholder
            name="header-right"
            rendering={props.rendering}
            page={page}
            componentMap={props.componentMap}
          />
        </div>
      </div>
    </header>
  );
};
