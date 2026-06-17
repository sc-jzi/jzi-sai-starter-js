import { ImageField, NextImage, Placeholder } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { JSX } from 'react';

export const Default = (props: ComponentProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = props.params.styles?.trimEnd() || '';

  return (
    <div
      className={`component header bg-excelitas-dark py-3 md:py-4 ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container-excelitas">
        <div className="flex items-center justify-between gap-4">
          <div className="shrink-0">
            <Placeholder name="header-left" rendering={props.rendering} />
          </div>
          <div className="hidden flex-1 items-center justify-center lg:flex">
            <Placeholder name="header-right" rendering={props.rendering} />
          </div>
          <div className="flex items-center gap-4 lg:hidden">
            <Placeholder name="header-right" rendering={props.rendering} />
          </div>
        </div>
      </div>
    </div>
  );
};

export type WithImageProps = ComponentProps & {
  fields: {
    LogoImage: ImageField;
  };
};

export const WithLogoImage = (props: WithImageProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = props.params?.styles || '';

  return (
    <div
      className={`component header bg-excelitas-dark py-3 md:py-4 ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container-excelitas">
        <div className="flex items-center justify-between gap-6">
          <div className="shrink-0">
            <NextImage
              field={props.fields.LogoImage}
              width={180}
              height={40}
              className="h-8 w-auto md:h-10"
            />
          </div>
          <nav className="hidden flex-1 items-center justify-center lg:flex" aria-label="Main">
            <Placeholder name="header-right" rendering={props.rendering} />
          </nav>
          <div className="flex items-center gap-3 md:gap-5">
            <div className="lg:hidden">
              <Placeholder name="header-right" rendering={props.rendering} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
