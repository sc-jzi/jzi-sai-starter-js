'use client';

import { FormEvent, JSX, useState } from 'react';
import { useRouter } from 'next/navigation';
import { identity } from '@sitecore-content-sdk/events';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const datasource = fields?.data?.datasource;
  const id = params?.RenderingIdentifier;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const identifier = email.trim().toLowerCase();
    if (!identifier || !password.trim()) {
      return;
    }

    setStatus('sending');
    try {
      await identity({
        channel: 'WEB',
        currency: 'USD',
        identifiers: [
          {
            id: identifier,
            provider: 'email',
          },
        ],
        email,
      });
      router.push('/');
    } catch (error) {
      console.error('IDENTITY event was not sent', error);
      setStatus('error');
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
            <input
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
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
          <button className="button" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Signing in…' : 'Sign in'}
          </button>
          {status === 'error' && (
            <p role="alert">Sign-in could not send the identity event. Refresh the published site and try again.</p>
          )}
        </form>
      </div>
    </section>
  );
};

export const Default = (props: LoginFormProps): JSX.Element => <LoginForm {...props} look="variant-sign-in" />;

export const SignIn = (props: LoginFormProps): JSX.Element => <LoginForm {...props} look="variant-sign-in" />;
