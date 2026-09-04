'use client';

import { AppPlaceholder, ComponentMap, ImageField, NextImage, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { JSX, useEffect, useState } from 'react';

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

/* Chamberlain variant — transparent overlay at top, sticky white bar on scroll */
export const Chamberlain = (props: HeaderProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const { page } = useSitecore();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const readScrollY = () =>
      Math.max(
        window.scrollY || 0,
        window.pageYOffset || 0,
        document.documentElement?.scrollTop || 0,
        document.body?.scrollTop || 0
      );

    const updateScrolled = () => {
      const scrolled = readScrollY() > 0;
      setIsScrolled(scrolled);
      document.documentElement.classList.toggle('chamberlain-scrolled', scrolled);
    };

    updateScrolled();

    const scrollOpts: AddEventListenerOptions = { passive: true, capture: true };
    window.addEventListener('scroll', updateScrolled, scrollOpts);
    document.addEventListener('scroll', updateScrolled, scrollOpts);
    document.documentElement.addEventListener('scroll', updateScrolled, scrollOpts);
    document.body.addEventListener('scroll', updateScrolled, scrollOpts);

    const sentinel = document.createElement('div');
    sentinel.setAttribute('data-chamberlain-scroll-sentinel', '');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;';
    document.body.prepend(sentinel);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }

        const scrolled = !entry.isIntersecting || readScrollY() > 0;
        setIsScrolled(scrolled);
        document.documentElement.classList.toggle('chamberlain-scrolled', scrolled);
      },
      { threshold: 1 }
    );
    observer.observe(sentinel);

    return () => {
      window.removeEventListener('scroll', updateScrolled, scrollOpts);
      document.removeEventListener('scroll', updateScrolled, scrollOpts);
      document.documentElement.removeEventListener('scroll', updateScrolled, scrollOpts);
      document.body.removeEventListener('scroll', updateScrolled, scrollOpts);
      observer.disconnect();
      sentinel.remove();
      document.documentElement.classList.remove('chamberlain-scrolled');
    };
  }, []);

  return (
    <div
      className={`component header chamberlain-header${isScrolled ? ' is-scrolled' : ''} ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className={`container container-${props.params?.ContainerWidth?.toLowerCase()}-fluid`}>
        <div className="row align-items-center">
          <div className="col-auto">
            <NextImage field={props.fields.LogoImage} width={210} height={48} />
          </div>
          <div className="col">
            <AppPlaceholder name="header-right" rendering={props.rendering} page={page} componentMap={props.componentMap} />
          </div>
        </div>
      </div>
    </div>
  );
};
