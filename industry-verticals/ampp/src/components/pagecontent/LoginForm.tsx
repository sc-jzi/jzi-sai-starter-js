'use client';

import { FormEvent, JSX, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RichText, Text, type Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type JsonField<T> = { jsonValue?: Field<T> };

interface LoginFormFields {
  data?: {
    datasource?: {
      title?: JsonField<string>;
      text?: JsonField<string>;
    };
  };
}

type LoginFormProps = ComponentProps & {
  fields?: LoginFormFields;
};

const LoginForm = ({ fields, params, look }: LoginFormProps & { look: string }): JSX.Element => {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const datasource = fields?.data?.datasource;
  const id = params?.RenderingIdentifier;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.trim()) {
      router.push('/');
    }
  };

  return (
    <section className={`component login-form col-12 ${look} ${params?.styles || ''}`} id={id}>
      <div className="container">
        {datasource?.title?.jsonValue && <Text tag="h1" field={datasource.title.jsonValue} />}
        {datasource?.text?.jsonValue && <RichText field={datasource.text.jsonValue} />}
        <form className="login-fields" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" name="email" autoComplete="username" />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button className="button" type="submit">
            Sign in
          </button>
        </form>
      </div>
    </section>
  );
};

export const Default = (props: LoginFormProps): JSX.Element => <LoginForm {...props} look="variant-sign-in" />;

export const SignIn = (props: LoginFormProps): JSX.Element => <LoginForm {...props} look="variant-sign-in" />;
