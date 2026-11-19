'use client';

import { JSX, useState } from 'react';
import { ComponentProps } from 'lib/component-props';
import { loginConfig } from './login-config';

export type LoginPanelProps = ComponentProps;

const LoginPanelBody = ({ className, id }: { className: string; id?: string }): JSX.Element => {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState('');

  return (
    <div className={`component login-panel ${className}`} id={id}>
      <button
        type="button"
        className="login-panel__toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {loginConfig.buttonLabel}
      </button>
      {open && (
        <div className="login-panel__dropdown" role="dialog" aria-label={loginConfig.buttonLabel}>
          <label className="login-panel__label" htmlFor="login-panel-account">
            {loginConfig.accountTypeLabel}
          </label>
          <div className="login-panel__row">
            <select
              id="login-panel-account"
              className="login-panel__select"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              <option value="">{loginConfig.placeholder}</option>
              {loginConfig.accounts.map((a) => (
                <option key={a.label} value={a.href}>
                  {a.label}
                </option>
              ))}
            </select>
            <a
              className={`login-panel__submit${target ? '' : ' is-disabled'}`}
              href={target || undefined}
              aria-disabled={!target}
              target="_blank"
              rel="noopener noreferrer"
            >
              {loginConfig.submitLabel}
            </a>
          </div>
          {loginConfig.links.map((l) => (
            <a key={l.label} className="login-panel__link" href={l.href} target="_blank" rel="noopener noreferrer">
              {l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export const Default = (props: LoginPanelProps): JSX.Element => (
  <LoginPanelBody className={props.params?.styles || ''} id={props.params?.RenderingIdentifier} />
);

export const BristolCountySavingsBank = (props: LoginPanelProps): JSX.Element => (
  <LoginPanelBody
    className={`login-panel--bcsb ${props.params?.styles || ''}`}
    id={props.params?.RenderingIdentifier}
  />
);
