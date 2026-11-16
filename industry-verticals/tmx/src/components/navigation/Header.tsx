'use client';

import { AppPlaceholder, ComponentMap, ImageField, NextImage, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { JSX } from 'react';
import { Tmx as SymbolSearchTmx } from './SymbolSearch';

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

// harness:header-kit:start Header Tmx
/* Tmx variant (hand-edited after harness/scripts/header-kit.mjs: a kit re-run replaces this block). Two bands like tmx.com:
   a ~118px logo band (logo left ~101x90 from LogoImage, the header-tools placeholder right for the SymbolSearch) and below it
   a ~42px nav band holding the header-right placeholder (Navigation). The nav band is the band the header gate measures. */
export const Tmx = (props: HeaderProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const { page } = useSitecore();
  const containerClass = `container container-${props.params?.ContainerWidth?.toLowerCase()}-fluid`;

  return (
    <div className={`component header variant-tmx ${sxaStyles}`} id={id ? id : undefined}>
      <div className="header-logo-band">
        <div className={containerClass}>
          <div className="header-logo-row">
            {(page.mode.isEditing || props.fields?.LogoImage?.value?.src) && (
              <div className="header-logo">
                <NextImage field={props.fields?.LogoImage} width={101} height={90} />
                {/* the home link covers the logo as a sibling of the image (the image is not inside the <a>), like tmx.com
                    where the logo link holds no <img>; its accessible name is the logo's alt text */}
                <a href="/" className="header-logo-link" aria-label={props.fields?.LogoImage?.value?.alt?.toString() || undefined} />
              </div>
            )}
            <div className="header-tools">
              {/* SymbolSearch is hardcoded chrome (cms: false, no datasource): rendered directly, not through a placeholder.
                  A new 'header-tools' placeholder was refused by Sitecore ("does not define compatible renderings"). */}
              <SymbolSearchTmx rendering={props.rendering} params={{}} page={page} />
            </div>
          </div>
        </div>
      </div>
      <div className="header-nav-band">
        <div className={containerClass}>
          <AppPlaceholder name="header-right" rendering={props.rendering} page={page} componentMap={props.componentMap} />
        </div>
      </div>
    </div>
  );
};
// harness:header-kit:end Header Tmx
