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

/* Pentair variant — utility row + logo + existing nav placeholders */
export const Pentair = (props: HeaderProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const { page } = useSitecore();
  const hasLogo = Boolean(props.fields?.LogoImage?.value?.src);

  return (
    <div className={`component header pentair ${sxaStyles}`} id={id ? id : undefined}>
      <div className="pentair-utility-bar">
        <div className={`container container-${props.params?.ContainerWidth?.toLowerCase()}-fluid`}>
          <ul>
            <li>
              <a href="https://www.pentair.com/en-us/about-pentair/newsroom/blog.html">Blog</a>
            </li>
            <li>
              <a href="https://www.pentair.com/en-us.html">Brands</a>
            </li>
            <li>
              <a href="https://www.pentair.com/en-us/about-pentair/careers.html">Careers</a>
            </li>
            <li>
              <a href="https://www.pentair.com/en-us/about-pentair.html">Contact Us</a>
            </li>
            <li>
              <a href="https://www.pentair.com/en-us.html">Find a Dealer</a>
            </li>
            <li>
              <a href="https://www.pentair.com/en-us.html">Partner Portal</a>
            </li>
          </ul>
        </div>
      </div>
      <div className={`container container-${props.params?.ContainerWidth?.toLowerCase()}-fluid pentair-header-main`}>
        <div className="row align-items-center">
          <div className="col-auto">
            {hasLogo ? (
              <NextImage field={props.fields.LogoImage} width={200} height={50} />
            ) : (
              <AppPlaceholder
                name="header-left"
                rendering={props.rendering}
                page={page}
                componentMap={props.componentMap}
              />
            )}
          </div>
          <div className="col">
            <AppPlaceholder
              name="header-right"
              rendering={props.rendering}
              page={page}
              componentMap={props.componentMap}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
