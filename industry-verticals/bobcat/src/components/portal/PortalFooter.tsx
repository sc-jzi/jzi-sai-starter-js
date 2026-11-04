'use client';

import { Field, ImageField, NextImage, RichText, RichTextField, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { JSX } from 'react';
import { ComponentProps } from 'lib/component-props';

/**
 * PortalFooter: the My Machine footer - a dark band with the tagline logo, then a white band with the parent-company
 * logo beside the legal text and the copyright line. Used in the Portal Footer partial design.
 */

interface FooterFields {
  Logo?: ImageField;
  SecondaryLogo?: ImageField;
  Text?: RichTextField;
  Copyright?: Field<string>;
}

type PortalFooterProps = ComponentProps & { fields?: FooterFields };

const PortalFooterView = ({ props, look }: { props: PortalFooterProps; look: 'default' | 'bobcat' }): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const f = props.fields ?? {};
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();

  return (
    <footer className={`component portal-footer portal-footer--${look} ${styles}`} id={id ? id : undefined}>
      <div className="portal-footer__band">
        <div className="portal-footer__inner">
          {(isEditing || !!f.Logo?.value?.src) && (
            <NextImage field={f.Logo} width={214} height={29} className="portal-footer__tagline" />
          )}
        </div>
      </div>
      <div className="portal-footer__legal">
        <div className="portal-footer__inner portal-footer__inner--legal">
          {(isEditing || !!f.SecondaryLogo?.value?.src) && (
            <NextImage field={f.SecondaryLogo} width={140} height={28} className="portal-footer__secondary-logo" />
          )}
          <div className="portal-footer__text">
            <RichText field={f.Text} />
            {(isEditing || !!f.Copyright?.value) && (
              <p className="portal-footer__copyright">
                <Text field={f.Copyright} />
              </p>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Default = (props: PortalFooterProps): JSX.Element => <PortalFooterView props={props} look="default" />;

/* Bobcat: dark "One Tough Animal" band over the white parent-company and legal band */
export const Bobcat = (props: PortalFooterProps): JSX.Element => <PortalFooterView props={props} look="bobcat" />;
