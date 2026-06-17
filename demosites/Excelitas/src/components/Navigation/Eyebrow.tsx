import { Placeholder } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { JSX } from 'react';

export const Default = (props: ComponentProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = props.params.styles?.trimEnd() || '';

  return (
    <div
      className={`component eyebrow border-b border-excelitas-gray-300 bg-excelitas-gray-50 py-2 ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container-excelitas">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-4">
            <Placeholder name="eyebrow-left" rendering={props.rendering} />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Placeholder name="eyebrow-right" rendering={props.rendering} />
          </div>
        </div>
      </div>
    </div>
  );
};
