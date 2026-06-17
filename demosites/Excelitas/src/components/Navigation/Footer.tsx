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
    <div
      className={`component footer bg-excelitas-dark text-white ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container-excelitas section-spacing">
        <div className="mb-10 lg:mb-14">
          <div className="mb-10 max-w-[200px]">
            <NextImage
              field={props.fields?.Image1}
              width={200}
              height={60}
              className="h-auto w-full brightness-0 invert"
            />
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            <div>
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                <Text field={props.fields?.Title1} />
              </div>
              <div className="links rich-text-light">
                <RichText field={props.fields?.Text1} />
              </div>
            </div>
            <div>
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                <Text field={props.fields?.Title2} />
              </div>
              <div className="links rich-text-light">
                <RichText field={props.fields?.Text2} />
              </div>
            </div>
            <div>
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                <Text field={props.fields?.Title3} />
              </div>
              <div className="links rich-text-light">
                <RichText field={props.fields?.Text3} />
              </div>
            </div>
            <div>
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                <Text field={props.fields?.Title4} />
              </div>
              <div className="links rich-text-light">
                <RichText field={props.fields?.Text4} />
              </div>
            </div>
          </div>
        </div>
        <hr className="border-white/15" />
        <div className="footnote flex flex-col gap-4 pt-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <Text field={props.fields?.Copyright} />
          <div className="privacy-links flex flex-wrap gap-4">
            <Link field={props.fields?.Link1} />
            <Link field={props.fields?.Link2} />
          </div>
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
      className={`component footer with-socials bg-excelitas-dark text-white ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container-excelitas section-spacing">
        <div className="mb-10 lg:mb-14">
          <div className="mb-10 max-w-[200px]">
            <NextImage
              field={props.fields?.Image1}
              width={200}
              height={60}
              className="h-auto w-full brightness-0 invert"
            />
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            <div>
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                <Text field={props.fields?.Title1} />
              </div>
              <div className="links rich-text-light">
                <RichText field={props.fields?.Text1} />
              </div>
            </div>
            <div>
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                <Text field={props.fields?.Title2} />
              </div>
              <div className="links rich-text-light">
                <RichText field={props.fields?.Text2} />
              </div>
            </div>
            <div>
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                <Text field={props.fields?.SocialsTitle} />
              </div>
              <div className="links-socials flex gap-3">
                <Link
                  field={props.fields?.SocialLink1}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-excelitas-green"
                >
                  <NextImage field={props.fields?.SocialIcon1} width={18} height={18} />
                </Link>
                <Link
                  field={props.fields?.SocialLink2}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-excelitas-green"
                >
                  <NextImage field={props.fields?.SocialIcon2} width={18} height={18} />
                </Link>
                <Link
                  field={props.fields?.SocialLink3}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-excelitas-green"
                >
                  <NextImage field={props.fields?.SocialIcon3} width={18} height={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
        <hr className="border-white/15" />
        <div className="footnote flex flex-col gap-4 pt-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <Text field={props.fields?.Copyright} />
          <div className="privacy-links flex flex-wrap gap-4">
            <Link field={props.fields?.Link1} />
            <Link field={props.fields?.Link2} />
          </div>
        </div>
      </div>
    </div>
  );
};
