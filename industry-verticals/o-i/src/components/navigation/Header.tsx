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

/* OI variant — dark bar, white logo, gold pill Catalog via placeholder */
export const OI = (props: HeaderProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const sxaStyles = `${props.params.styles?.trimEnd() || ''}`;

  return (
    <header
      className={`component header oi-brand oi-header border-b border-[var(--brand-border)] bg-[var(--brand-header-bg)] text-[var(--brand-header-fg)] ${sxaStyles}`}
      id={id ? id : undefined}
      style={{ fontFamily: 'var(--brand-heading-font)' }}
    >
      <div className="mx-auto flex min-h-16 max-w-[1280px] items-center gap-6 px-6">
        <a href="/" className="shrink-0">
          <NextImage field={props.fields?.LogoImage} width={72} height={36} className="h-8 w-auto" />
        </a>
        <div className="min-w-0 flex-1 [&_a]:text-[var(--brand-header-fg)] [&_a]:no-underline [&_a]:text-sm [&_.button]:!rounded-[var(--brand-button-radius)] [&_.button]:!border-0 [&_.button]:!bg-[var(--brand-primary)] [&_.button]:!px-5 [&_.button]:!py-2 [&_.button]:!text-sm [&_.button]:!font-bold [&_.button]:!text-[var(--brand-primary-foreground)]">
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
