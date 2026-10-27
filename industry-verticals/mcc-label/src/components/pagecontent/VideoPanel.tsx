import { JSX } from 'react';
import { Field, ImageField, NextImage, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { asImageField } from 'lib/as-image-field';

interface Fields {
  Title?: Field<string>;
  Text?: Field<string>;
  Poster?: ImageField;
  Play?: ImageField;
}

export type VideoPanelProps = ComponentProps & {
  fields?: Fields;
};

const Panel = ({ props, className }: { props: VideoPanelProps; className: string }): JSX.Element => {
  const poster = asImageField(props.fields?.Poster);
  const play = asImageField(props.fields?.Play);
  return (
    <section className={className} id={props.params?.RenderingIdentifier || undefined}>
      <div className="container">
        <div className="video-panel-row">
          {poster && <NextImage field={poster} width={598} height={436} className="video-still" />}
          <div className="video-card">
            <Text field={props.fields?.Title} tag="h2" />
            {play && <NextImage field={play} width={85} height={85} className="video-play" />}
            <Text field={props.fields?.Text} tag="p" />
          </div>
        </div>
      </div>
    </section>
  );
};

export const Default = (props: VideoPanelProps): JSX.Element => (
  <Panel props={props} className={`component video-panel ${props.params?.styles || ''}`} />
);

export const MccLabel = (props: VideoPanelProps): JSX.Element => (
  <Panel props={props} className={`component video-panel mcc-label ${props.params?.styles || ''}`} />
);
