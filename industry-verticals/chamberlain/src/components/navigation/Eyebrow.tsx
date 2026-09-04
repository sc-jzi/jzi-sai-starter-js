'use client';

import { ComponentMap, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { JSX, useEffect, useRef, useState } from 'react';

export type EyebrowProps = ComponentProps & {
  fields: {
    LogoImage: ImageField;
  };
  componentMap: ComponentMap;
};

const PersonIcon = (): JSX.Element => (
  <svg className="chamberlain-eyebrow__icon" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="8" r="3.15" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M5.4 19.2c.7-3.35 3.35-5.15 6.6-5.15s5.9 1.8 6.6 5.15"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const ChatIcon = (): JSX.Element => (
  <svg className="chamberlain-eyebrow__icon" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M8.2 16.1H6.4A2.4 2.4 0 0 1 4 13.7V8.4A2.4 2.4 0 0 1 6.4 6h8.2A2.4 2.4 0 0 1 17 8.4v5.3a2.4 2.4 0 0 1-2.4 2.4H11l-2.8 2.1v-2.1Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M10.6 5.2h7A2.4 2.4 0 0 1 20 7.6v5.1a2.4 2.4 0 0 1-1.7 2.3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const PhoneIcon = (): JSX.Element => (
  <svg className="chamberlain-eyebrow__icon" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M8.2 4.8c.45-.45 1.2-.5 1.7-.12l1.85 1.4c.42.32.55.9.3 1.37l-.85 1.55a.9.9 0 0 0 .08.95c.7.95 1.6 1.85 2.55 2.55a.9.9 0 0 0 .95.08l1.55-.85c.47-.25 1.05-.12 1.37.3l1.4 1.85c.38.5.33 1.25-.12 1.7l-1.15 1.15c-.55.55-1.35.78-2.12.55-1.95-.58-4.2-2.15-6.35-4.3-2.15-2.15-3.72-4.4-4.3-6.35-.23-.77 0-1.57.55-2.12L8.2 4.8Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronIcon = ({ up }: { up: boolean }): JSX.Element => (
  <svg className="chamberlain-eyebrow__chevron-icon" viewBox="0 0 12 8" fill="none" aria-hidden>
    {up ? (
      <path d="M1.2 6.4 6 1.6l4.8 4.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d="M1.2 1.6 6 6.4l4.8-4.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);

const ChamberlainEyebrowView = (props: EyebrowProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isInfoOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsInfoOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsInfoOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isInfoOpen]);

  return (
    <div
      className={`component eyebrow chamberlain-eyebrow ${props.params.styles?.trimEnd() || ''}`}
      id={id ? id : undefined}
    >
      <div className="chamberlain-eyebrow__inner">
        <nav className="chamberlain-eyebrow__nav" aria-label="Utility">
          <div className="chamberlain-eyebrow__menu" ref={menuRef}>
            <button
              type="button"
              className={`chamberlain-eyebrow__trigger${isInfoOpen ? ' is-open' : ''}`}
              aria-expanded={isInfoOpen}
              aria-controls="chamberlain-information-for-menu"
              aria-haspopup="true"
              onClick={() => setIsInfoOpen((open) => !open)}
            >
              <PersonIcon />
              <span>Information For</span>
              <ChevronIcon up={isInfoOpen} />
            </button>
            {isInfoOpen ? (
              <div
                id="chamberlain-information-for-menu"
                className="chamberlain-eyebrow__dropdown"
                role="menu"
              >
                <a href="https://www.chamberlain.edu/students" role="menuitem">
                  Current Students
                </a>
                <a href="https://www.chamberlain.edu/alumni" role="menuitem">
                  Alumni
                </a>
              </div>
            ) : null}
          </div>
          <a className="chamberlain-eyebrow__link" href="https://www.chamberlain.edu/">
            <ChatIcon />
            Chat
          </a>
          <a className="chamberlain-eyebrow__phone" href="tel:8772609655">
            <PhoneIcon />
            877-260-9655
          </a>
        </nav>
      </div>
    </div>
  );
};

export const Chamberlain = (props: EyebrowProps): JSX.Element => <ChamberlainEyebrowView {...props} />;

export const Default = (props: EyebrowProps): JSX.Element => <ChamberlainEyebrowView {...props} />;
