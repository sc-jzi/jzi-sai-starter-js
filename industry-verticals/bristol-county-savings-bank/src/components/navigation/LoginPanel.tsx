'use client';

import { JSX, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ComponentProps } from 'lib/component-props';
import { loginConfig } from './login-config';

export type LoginPanelProps = ComponentProps;

const LoginPanelBody = ({ className, id }: { className: string; id?: string }): JSX.Element => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [target, setTarget] = useState(loginConfig.accounts[0]?.href ?? '');
  const closeRef = useRef<HTMLButtonElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  // The drawer is portalled to <body>: the header bars create stacking contexts and colour rules it must not inherit.
  const drawer = (
    <div className={`login-drawer ${className}${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div className="login-drawer__backdrop" onClick={close} />
      <div
        className="login-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-drawer-title"
        // inert keeps the closed (off-screen) panel out of the tab order
        {...(!open ? { inert: true } : {})}
      >
        <button ref={closeRef} type="button" className="login-drawer__close" aria-label={loginConfig.closeLabel} onClick={close}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
        <p id="login-drawer-title" className="login-drawer__title">
          {loginConfig.title}
        </p>
        <hr className="login-drawer__rule" />
        <label className="login-drawer__label" htmlFor="login-drawer-account">
          {loginConfig.accountTypeLabel}
        </label>
        <select
          id="login-drawer-account"
          className="login-drawer__select"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        >
          {loginConfig.accounts.map((a) => (
            <option key={a.label} value={a.href}>
              {a.label}
            </option>
          ))}
        </select>
        <a className="login-drawer__submit" href={target} target="_blank" rel="noopener noreferrer">
          {loginConfig.submitLabel}
        </a>
        {loginConfig.links.map((l) => (
          <a key={l.label} className="login-drawer__link" href={l.href} target="_blank" rel="noopener noreferrer">
            {l.label}
          </a>
        ))}
        {loginConfig.promo && (
          <>
            <hr className="login-drawer__rule" />
            <div className="login-drawer__promo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="login-drawer__promo-image" src={loginConfig.promo.image} alt="" loading="lazy" />
              <p className="login-drawer__title">{loginConfig.promo.title}</p>
              <p className="login-drawer__text">{loginConfig.promo.text}</p>
              <a className="login-drawer__submit" href={loginConfig.promo.cta.href}>
                {loginConfig.promo.cta.label}
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className={`component login-panel ${className}`} id={id}>
      <button
        ref={toggleRef}
        type="button"
        className="login-panel__toggle"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        {loginConfig.buttonLabel}
      </button>
      {mounted && createPortal(drawer, document.body)}
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
