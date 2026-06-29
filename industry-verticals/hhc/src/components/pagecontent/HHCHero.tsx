'use client';

import { JSX } from 'react';
import {
  Field,
  ImageField,
  Link,
  LinkField,
  NextImage,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from 'components/lib/utils';
import { buttonVariants } from 'components/ui/button';

interface Fields {
  Title: Field<string>;
  Subtitle: Field<string>;
  HeroImage: ImageField;
  CTA: LinkField;
}

export type DemoProps = ComponentProps & {
  fields: Fields;
};

export const Default = (props: DemoProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const sxaStyles = props.params?.styles?.trimEnd() ?? '';

  return (
    <section
      className={cn('component demo-hero relative w-full overflow-hidden', sxaStyles)}
      id={id || undefined}
      aria-labelledby="demo-hero-title"
    >
      <div className="absolute inset-0">
        <NextImage
          field={props.fields.HeroImage}
          className="h-full w-full object-cover"
          width={1920}
          height={800}
          priority
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/25"
          aria-hidden="true"
        />
      </div>

      <div className="relative mx-auto flex min-h-[28rem] max-w-7xl items-center px-4 py-16 sm:min-h-[32rem] sm:px-6 sm:py-20 lg:min-h-[36rem] lg:px-8">
        <div className="max-w-2xl">
          <Text
            id="demo-hero-title"
            tag="h1"
            field={props.fields.Title}
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
          />

          <Text
            tag="p"
            field={props.fields.Subtitle}
            className="mt-4 text-lg text-white/90 sm:mt-6 sm:text-xl"
          />

          <div className="mt-8 sm:mt-10">
            <Link
              field={props.fields.CTA}
              className={cn(buttonVariants({ size: 'lg' }), 'no-underline hover:no-underline')}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
