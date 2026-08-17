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

const PSEG_LOGIN = 'https://nj.myaccount.pseg.com/user/login';

/* Pseg variant — utility bar, logo, shortcut icons, Sitecore nav */
export const Pseg = (props: HeaderProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const logoSrc = props.fields?.LogoImage?.value?.src;

  return (
    <div className={`component header pseg ${props.params.styles?.trimEnd()}`} id={id ? id : undefined}>
      <div className="pseg-utility-bar">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <a href="https://www.pseg.com/" target="_blank" rel="noreferrer">
                PSEG Corporate
              </a>
              <a href="https://www.psegliny.com/" target="_blank" rel="noreferrer">
                PSEG Long Island
              </a>
              <a href="https://corporate.pseg.com/aboutpseg/psegpower" target="_blank" rel="noreferrer">
                PSEG Power
              </a>
            </div>
            <div>
              <a href="https://nj.pseg.com/contactus">Contact Us</a>
              <a className="pseg-utility-emergency" href="https://nj.pseg.com/outageandgasleaks">
                Outage &amp; Gas Emergency
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="pseg-brand-bar">
        <div className={`container container-${props.params?.ContainerWidth?.toLowerCase()}-fluid`}>
          <div className="row align-items-center">
            <div className="col-auto">
              {logoSrc ? (
                <NextImage field={props.fields.LogoImage} width={160} height={42} className="pseg-logo" />
              ) : (
                <img src="/pseg/logo.png" alt="PSE&G" className="pseg-logo" width={160} height={42} />
              )}
            </div>
            <div className="col">
              <div className="pseg-shortcuts">
                <a href="https://nj.myaccount.pseg.com/viewmybill">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <rect x="4" y="3" width="16" height="18" rx="2" />
                    <path d="M8 8h8M8 12h8M8 16h5" />
                  </svg>
                  Pay Bill
                </a>
                <a href="https://nj.pseg.com/outageandgasleaks">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M13 2 4 14h7l-1 8 10-14h-7l0-6z" />
                  </svg>
                  Outage
                </a>
                <a href={PSEG_LOGIN}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
                  </svg>
                  My Account
                </a>
                <a href="https://nj.pseg.com/saveenergyandmoney">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M12 3c4 4 6 7 6 10a6 6 0 1 1-12 0c0-3 2-6 6-10z" />
                  </svg>
                  Savings &amp; Energy
                </a>
              </div>
            </div>
          </div>
          <div className="row pseg-nav-row">
            <div className="col">
              <AppPlaceholder name="header-right" rendering={props.rendering} page={page} componentMap={props.componentMap} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
