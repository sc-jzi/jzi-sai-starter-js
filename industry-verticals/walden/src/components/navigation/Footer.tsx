'use client';

import { JSX } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  Link,
  Text,
  RichTextField,
  RichText,
  NextImage,
} from '@sitecore-content-sdk/nextjs';

interface Fields {
  Image1: ImageField;
  Title1: Field<string>;
  Text1: RichTextField;
  Title2: Field<string>;
  Text2: RichTextField;
  Title3: Field<string>;
  Text3: RichTextField;
  Title4: Field<string>;
  Text4: RichTextField;
  Copyright: Field<string>;
  Link1: LinkField;
  Link2: LinkField;
  SocialsTitle: Field<string>;
  SocialLink1: LinkField;
  SocialIcon1: ImageField;
  SocialLink2: LinkField;
  SocialIcon2: ImageField;
  SocialLink3: LinkField;
  SocialIcon3: ImageField;
}

export type FooterProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: FooterProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component component-spaced footer ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="content">
          <div className="logo">
            <NextImage
              field={props.fields?.Image1}
              width={200}
              height={200}
              className="img-fluid"
            />
          </div>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 row-gap-5 gx-5">
            <div className="col">
              <div className="title">
                <Text field={props.fields?.Title1} />
              </div>
              <div className="links">
                <RichText field={props.fields?.Text1} />
              </div>
            </div>
            <div className="col">
              <div className="title">
                <Text field={props.fields?.Title2} />
              </div>
              <div className="links">
                <RichText field={props.fields?.Text2} />
              </div>
            </div>
            <div className="col">
              <div className="title">
                <Text field={props.fields?.Title3} />
              </div>
              <div className="links">
                <RichText field={props.fields?.Text3} />
              </div>
            </div>
            <div className="col">
              <div className="title">
                <Text field={props.fields?.Title4} />
              </div>
              <div className="links">
                <RichText field={props.fields?.Text4} />
              </div>
            </div>
          </div>
        </div>
        <hr />
        <div className="footnote">
          <Text field={props.fields?.Copyright} />
          <div className="privacy-links">
            <Link field={props.fields?.Link1} />
            <Link field={props.fields?.Link2} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* Walden variant — dark teal mega footer */
export const Walden = (props: FooterProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component footer walden-footer ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="content">
          <div className="logo mb-4">
            <NextImage field={props.fields?.Image1} width={200} height={60} className="img-fluid" />
          </div>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 row-gap-5 gx-5">
            <div className="col">
              <div className="title">
                <Text field={props.fields?.Title1} />
              </div>
              <div className="links">
                <RichText field={props.fields?.Text1} />
              </div>
            </div>
            <div className="col">
              <div className="title">
                <Text field={props.fields?.Title2} />
              </div>
              <div className="links">
                <RichText field={props.fields?.Text2} />
              </div>
            </div>
            <div className="col">
              <div className="title">
                <Text field={props.fields?.Title3} />
              </div>
              <div className="links">
                <RichText field={props.fields?.Text3} />
              </div>
            </div>
            <div className="col">
              <div className="title">
                <Text field={props.fields?.Title4} />
              </div>
              <div className="links">
                <RichText field={props.fields?.Text4} />
              </div>
              <div className="title mt-4">
                <Text field={props.fields?.SocialsTitle} />
              </div>
              <div className="links links-socials walden-footer__socials">
                <Link field={props.fields?.SocialLink1}>
                  <NextImage field={props.fields?.SocialIcon1} width={22} height={22} />
                </Link>
                <Link field={props.fields?.SocialLink2}>
                  <NextImage field={props.fields?.SocialIcon2} width={22} height={22} />
                </Link>
                <Link field={props.fields?.SocialLink3}>
                  <NextImage field={props.fields?.SocialIcon3} width={22} height={22} />
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="walden-footer__bottom">
          <div className="walden-footer__marks">
            <img
              className="is-knockout"
              src="https://www.waldenu.edu/sites/g/files/krcnkv446/files/styles/atge_default_md/public/2022-10/ccne_0.png?itok=lJDtRI3h"
              alt="CCNE Accredited"
            />
            <img
              src="https://www.waldenu.edu/sites/g/files/krcnkv446/files/styles/atge_default_md/public/Walden/Images/Newsroom/walden-news/2019/cswe-accred-300x-250.jpg?itok=K4whVHki"
              alt="CSWE"
            />
            <img
              src="https://www.waldenu.edu/sites/g/files/krcnkv446/files/styles/atge_default_md/public/Walden/Images/Newsroom/walden-news/2014/cacrep-new-logo.gif?itok=Sk913TVS"
              alt="CACREP Accredited"
            />
            <img
              src="https://www.waldenu.edu/sites/g/files/krcnkv446/files/styles/atge_default_md/public/Walden/Images/Newsroom/alumni-magazine/content-images/2020-vol-1/accreditation/ceph-logo-doctoral-masters-600x450.jpg?itok=UEhZawxX"
              alt="CEPH Accredited"
            />
          </div>
          <p>
            Walden University is accredited by the Higher Learning Commission (
            <a href="https://www.hlcommission.org" target="_blank" rel="noreferrer">
              www.hlcommission.org
            </a>
            ), an institutional accreditation agency recognized by the U.S. Department of Education.
          </p>
          <p>
            Walden University is a member of Covista{' '}
            <a href="https://www.covista.com/" target="_blank" rel="noreferrer">
              https://www.covista.com/
            </a>{' '}
            | Walden University is certified to operate by SCHEV
          </p>
          <p>© 2026 Walden University LLC. All rights reserved.</p>
          <p className="walden-footer__legal">
            <a href="https://www.waldenu.edu/legal">Legal &amp; Consumer Info</a>
            <span aria-hidden>|</span>
            <a href="https://www.waldenu.edu/legal/website-terms-and-conditions">
              Website Terms and Conditions
            </a>
            <span aria-hidden>|</span>
            <a href="https://www.waldenu.edu/legal/cookie-policy">Cookie Policy</a>
            <span aria-hidden>|</span>
            <a href="https://www.waldenu.edu/legal/cookie-preferences">Cookie Preferences</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export const WithSocials = (props: FooterProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div
      className={`component component-spaced footer with-socials ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="content">
          <div className="logo">
            <NextImage
              field={props.fields?.Image1}
              width={200}
              height={200}
              className="img-fluid"
            />
          </div>
          <div className="row row-cols-1 row-cols-md-3 row-gap-5 gx-5">
            <div className="col">
              <div className="title eyebrow-accent">
                <Text field={props.fields?.Title1} />
              </div>
              <div className="links">
                <RichText field={props.fields?.Text1} />
              </div>
            </div>
            <div className="col">
              <div className="title eyebrow-accent">
                <Text field={props.fields?.Title2} />
              </div>
              <div className="links">
                <RichText field={props.fields?.Text2} />
              </div>
            </div>
            <div className="col">
              <div className="title eyebrow-accent">
                <Text field={props.fields?.SocialsTitle} />
              </div>
              <div className="links links-socials">
                <Link field={props.fields?.SocialLink1}>
                  <NextImage field={props.fields?.SocialIcon1} width={16} height={16} />
                </Link>
                <Link field={props.fields?.SocialLink2}>
                  <NextImage field={props.fields?.SocialIcon2} width={16} height={16} />
                </Link>
                <Link field={props.fields?.SocialLink3}>
                  <NextImage field={props.fields?.SocialIcon3} width={16} height={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
        <hr />
        <div className="footnote">
          <Text field={props.fields?.Copyright} />
          <div className="privacy-links">
            <Link field={props.fields?.Link1} />
            <Link field={props.fields?.Link2} />
          </div>
        </div>
      </div>
    </div>
  );
};
