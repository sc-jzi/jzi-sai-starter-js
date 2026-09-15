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
            <a href="/"><NextImage field={props.fields.LogoImage} width={200} height={50} /></a>
          </div>
          <div className="col">
            <AppPlaceholder name="header-right" rendering={props.rendering} page={page} componentMap={props.componentMap} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* Akamai variant — white solid bar, logo left, centered nav, blue Contact sales CTA */
export const Akamai = (props: HeaderProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <header
      className={`component header akamai-header border-b border-[var(--brand-border)] bg-[var(--brand-header-bg)] text-[var(--brand-header-fg)] ${sxaStyles}`}
      id={id ? id : undefined}
      style={{ fontFamily: 'var(--brand-heading-font)' }}
    >
      <div className="mx-auto flex min-h-[4.5rem] max-w-[1200px] items-center gap-6 px-6">
        <a href="/" className="shrink-0">
          <NextImage
            field={props.fields?.LogoImage}
            width={160}
            height={40}
            className="h-9 w-auto"
          />
        </a>
        <div className="min-w-0 flex-1 [&_a]:text-[var(--brand-header-fg)] [&_a]:no-underline [&_a]:text-sm [&_a]:font-semibold [&_.button]:!bg-[var(--brand-secondary)] [&_.button]:!text-[var(--brand-secondary-foreground)] [&_.button]:!rounded-[var(--brand-button-radius)] [&_.button]:!border-0 [&_.button]:!px-4 [&_.button]:!py-2 [&_.button]:!text-sm [&_.button]:!font-semibold">
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
