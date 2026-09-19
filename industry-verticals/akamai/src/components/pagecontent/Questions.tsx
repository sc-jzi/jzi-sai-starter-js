'use client';

import { useState, JSX } from 'react';
import { Field, RichText, Text } from '@sitecore-content-sdk/nextjs';

interface QuestionFields {
  Question: Field<string>;
  Answer: Field<string>;
}

export type QuestionItemProps = {
  fields: QuestionFields;
  name: string;
  url: string;
};

export type QuestionsProps = {
  params: { [key: string]: string };
  fields: {
    items: QuestionItemProps[];
  };
};

const Question = ({
  item,
  accent,
}: {
  item: QuestionItemProps;
  accent?: boolean;
}): JSX.Element => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (accent) {
    return (
      <div className="border-b border-[rgba(0,40,86,0.12)]">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between gap-4 bg-transparent py-5 text-left"
          aria-expanded={isExpanded}
        >
          <Text
            field={item.fields.Question}
            tag="h3"
            className="m-0 text-base font-semibold text-black md:text-lg"
          />
          <span
            className={`shrink-0 text-[var(--brand-secondary)] transition-transform ${isExpanded ? 'rotate-180' : ''
              }`}
            aria-hidden
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={18} fill="currentColor">
              <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
            </svg>
          </span>
        </button>
        <div className={`answer ${isExpanded ? 'd-block' : 'd-none'}`}>
          <RichText field={item.fields.Answer} />
        </div>
      </div>
    );
  }

  return (
    <div className="question-item">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`button-clear-appearance ${isExpanded ? 'expanded' : ''}`}
      >
        <h3>
          <Text field={item.fields.Question} />
        </h3>
        <span className="icon-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            width={23}
            fill="currentColor"
          >
            <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
          </svg>
        </span>
      </button>
      <div className={`answer ${isExpanded ? 'd-block' : 'd-none'}`}>
        <RichText field={item.fields.Answer} />
      </div>
    </div>
  );
};

export const Default = (props: QuestionsProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const questions = props.fields?.items;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component questions ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-lg-6">
            {questions
              ?.filter((_, index) => index % 2 === 0)
              ?.map((item) => (
                <Question key={item.url} item={item} />
              ))}
          </div>
          <div className="col-sm-12 col-lg-6">
            {questions
              ?.filter((_, index) => index % 2 !== 0)
              ?.map((item) => (
                <Question key={item.url} item={item} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SingleColumn = (props: QuestionsProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const questions = props.fields?.items;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component questions single-column ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="questions-wrapper">
          {questions?.map((item) => (
            <Question key={item.url} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

/* Akamai — single-column FAQ accordion styled for product pages */
export const Akamai = (props: QuestionsProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const questions = props.fields?.items;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div
      className={`component questions akamai-brand akamai-faq bg-[var(--brand-bg)] pb-12 ${sxaStyles}`}
      id={id || undefined}
      style={{ fontFamily: 'var(--brand-heading-font)' }}
    >
      <div className="mx-auto max-w-[800px] px-6">
        {questions?.map((item) => (
          <Question key={item.url} item={item} accent />
        ))}
      </div>
    </div>
  );
};
