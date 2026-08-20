import { JSX } from 'react';
import { ComponentProps } from 'lib/component-props';

type EyebrowLink = {
  href: string;
  label: string;
};

const LEFT_LINKS: EyebrowLink[] = [
  { href: 'https://commercial.kaltire.com/en/', label: 'Commercial Tires & Services' },
  { href: 'https://www.kaltiremining.com/en/', label: 'Mining Tire Group' },
];

const RIGHT_LINKS: EyebrowLink[] = [
  { href: 'https://www.kaltire.com/en/contact-us.html', label: 'Contact Us' },
  { href: 'https://www.kaltire.com/en/login/', label: 'Sign In' },
];

export type EyebrowProps = ComponentProps;

const linkClassName =
  'whitespace-nowrap text-[13px] font-bold text-[var(--brand-fg)] no-underline hover:text-[var(--brand-primary)]';

const LocationPinIcon = (): JSX.Element => (
  <svg
    aria-hidden="true"
    viewBox="0 0 16 16"
    className="h-3.5 w-3.5 shrink-0 fill-current"
  >
    <path d="M8 1.5a4.6 4.6 0 0 0-4.6 4.6c0 3.4 4.6 8.4 4.6 8.4s4.6-5 4.6-8.4A4.6 4.6 0 0 0 8 1.5Zm0 6.3A1.7 1.7 0 1 1 8 4.4a1.7 1.7 0 0 1 0 3.4Z" />
  </svg>
);

export const Default = (props: EyebrowProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`.trim();

  return (
    <div
      className={`component eyebrow kal-tire-eyebrow hidden bg-[var(--brand-muted)] md:block ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="mx-auto flex min-h-8 max-w-[1280px] items-center justify-between gap-8 px-6 py-2">
        <ul className="m-0 flex list-none items-center gap-8 p-0">
          {LEFT_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={linkClassName}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <ul className="m-0 ml-auto flex list-none items-center gap-8 p-0">
          {RIGHT_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={linkClassName}>
                {link.label}
              </a>
            </li>
          ))}
          <li className="flex items-center gap-1.5 text-[13px] font-bold text-[var(--brand-fg)]">
            <LocationPinIcon />
            <span>
              Location:{' '}
              <a href="https://www.kaltire.com/en/stores/" className={linkClassName}>
                Kanata
              </a>
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
