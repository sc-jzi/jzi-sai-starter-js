'use client';

import { FormEvent, JSX, useState } from 'react';
import { identity } from '@sitecore-content-sdk/events';
import { ComponentProps } from 'lib/component-props';

type LoginStatus = 'idle' | 'sending' | 'signed-in' | 'error';

export const Default = (props: ComponentProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<LoginStatus>('idle');
  const [signedInAs, setSignedInAs] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const identifier = email.trim().toLowerCase();
    if (!identifier) {
      return;
    }

    setStatus('sending');
    try {
      await identity({
        email: identifier,
        identifiers: [{ id: identifier, provider: 'email' }],
      });
      setSignedInAs(identifier);
      setStatus('signed-in');
    } catch (error) {
      console.error('IDENTITY event was not sent', error);
      setStatus('error');
    }
  };

  return (
    <div className={`component login ${sxaStyles}`} id={id ? id : undefined}>
      <form className="apexus-login" onSubmit={handleSubmit}>
        <label className="apexus-login-field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="apexus-login-field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button className="apexus-login-button" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Signing in…' : 'Log in'}
        </button>
        {status === 'signed-in' && (
          <p className="apexus-login-message" role="status">
            Signed in as {signedInAs}.
          </p>
        )}
        {status === 'error' && (
          <p className="apexus-login-message apexus-login-message-error" role="alert">
            Sign-in could not send the identity event. Refresh the published site and try again.
          </p>
        )}
      </form>
    </div>
  );
};
