import { JSX } from 'react';
import { RichText, RichTextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface Fields {
  Title: RichTextField;
  Text: RichTextField;
}

export type IntroSplitProps = ComponentProps & {
  fields: Fields;
};

// Large headline (bold words kept) on the left, body paragraphs on the right; stacked on mobile.
export const Default = (props: IntroSplitProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const isPageEditing = props.page?.mode?.isEditing;

  return (
    <div className={`component intro-split ${props.params?.styles || ''}`} id={id || undefined}>
      <div className="intro-split__layout">
        {props.fields?.Title && (isPageEditing || props.fields.Title.value) && (
          <RichText tag="div" className="intro-split__title" field={props.fields.Title} />
        )}
        {props.fields?.Text && (isPageEditing || props.fields.Text.value) && (
          <RichText tag="div" className="intro-split__text" field={props.fields.Text} />
        )}
      </div>
    </div>
  );
};

export const MccLabel = (props: IntroSplitProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label mcc-label-intro-split">
    <Default {...props} />
  </section>
);
