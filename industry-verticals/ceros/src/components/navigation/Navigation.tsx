'use client';

import React, { useCallback, useRef, useState, JSX } from 'react';
import { Link, LinkField, Text, TextField, useSitecore } from '@sitecore-content-sdk/nextjs';
import { useRouter } from 'next/navigation';
import { cerosMenuPanels, cerosHeaderButtons } from 'lib/ceros-menu';

interface Fields {
  Id: string;
  DisplayName: string;
  Title: TextField;
  NavigationTitle: TextField;
  Href: string;
  Querystring: string;
  Children: Array<Fields>;
  Styles: string[];
}

type NavigationProps = {
  params?: { [key: string]: string };
  fields: Fields;
  handleClick: (event?: React.MouseEvent<HTMLElement>) => void;
  relativeLevel: number;
};

const getNavigationText = function (props: NavigationProps): JSX.Element | string {
  let text;

  if (props.fields.NavigationTitle) {
    text = <Text field={props.fields.NavigationTitle} />;
  } else if (props.fields.Title) {
    text = <Text field={props.fields.Title} />;
  } else {
    text = props.fields.DisplayName;
  }

  return text;
};

const getLinkField = (props: NavigationProps): LinkField => ({
  value: {
    href: props.fields.Href,
    title: getLinkTitle(props),
    querystring: props.fields.Querystring,
  },
});

export const Default = (props: NavigationProps): JSX.Element => {
  const [isPreviewSearchOpen, setIsPreviewSearchOpen] = useState(false);
  const [isOpenMenu, openMenu] = useState(false);
  const { page } = useSitecore();
  const containerRef = useRef(null);
  const router = useRouter();

  const onRedirect = useCallback(
    (url: string) => {
      router.push(url);
    },
    [router]
  );

  const onSearchIconClick = useCallback(() => {
    setIsPreviewSearchOpen((isPreviewSearchOpen) => {
      return !isPreviewSearchOpen;
    });

    // Focus on element with ID search-input
    setTimeout(() => {
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }, 0);
  }, []);


  const styles =
    props.params != null
      ? `${props.params.GridParameters ?? ''} ${props.params.Styles ?? ''}`.trimEnd()
      : '';
  const id = props.params != null ? props.params.RenderingIdentifier : null;

  if (!Object.values(props.fields).length) {
    return (
      <div
        className={`component navigation col-12 position-right navigation-horizontal ${styles}`}
        id={id ? id : undefined}
      >
        <div className="component-content">[Navigation]</div>
      </div>
    );
  }

  const handleToggleMenu = (event?: React.MouseEvent<HTMLElement>, flag?: boolean): void => {
    if (event && page?.mode.isEditing) {
      event.preventDefault();
    }

    if (flag !== undefined) {
      return openMenu(flag);
    }

    openMenu(!isOpenMenu);
  };

  const list = Object.values(props.fields)
    .filter((element) => element)
    .map((element: Fields, key: number) => (
      <NavigationList
        key={`${key}${element.Id}`}
        fields={element}
        handleClick={(event: React.MouseEvent<HTMLElement>) => handleToggleMenu(event, false)}
        relativeLevel={1}
      />
    ));

//  if (isSearchSDKEnabled) {
  //  list.push(
    //  <li className="	d-none d-lg-block" key="search-icon">
      //  <PreviewSearchIcon
        //  className="search-play-icon"
          //onClick={onSearchIconClick}
//          keyphrase={''}
  //      />
    //  </li>
    //);
  //}

  return (
    <div
      className={`component navigation col-12 position-right navigation-horizontal ${styles}`}
      id={id ? id : undefined}
    >
      {!isPreviewSearchOpen && (
        <label className="menu-mobile-navigate-wrapper">
          <input
            type="checkbox"
            className="menu-mobile-navigate"
            checked={isOpenMenu}
            onChange={() => handleToggleMenu()}
          />
          {/* DEMO TEAM CUSTOMIZATION */}
          <div className="menu-humburger">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="component-content">
            <nav>
              {/* DEMO TEAM CUSTOMIZATION */}
              <ul>{list}</ul>
            </nav>
          </div>
        </label>
      )}
{/*      {isSearchSDKEnabled && (
  //      <div ref={containerRef} className={`search-input-container ${!isPreviewSearchOpen ? 'search-input-container-hidden' : ''}`}>
    //      <PreviewSearchWidget rfkId="rfkid_6" itemRedirectionHandler={onRedirect} />
      //  </div>
//      )}*/}
    </div>
  );
};

const NavigationList = (props: NavigationProps) => {
  const { page } = useSitecore();
  const [active, setActive] = useState(false);
  const classNameList = `${props.fields.Styles.concat('rel-level' + props.relativeLevel).join(
    ' '
  )}`;

  let children: JSX.Element[] = [];
  if (props.fields.Children && props.fields.Children.length) {
    children = props.fields.Children.map((element: Fields, index: number) => (
      <NavigationList
        key={`${index}${element.Id}`}
        fields={element}
        handleClick={props.handleClick}
        relativeLevel={props.relativeLevel + 1}
      />
    ));
  }

  return (
    <li className={`${classNameList} ${active ? 'active' : ''}`} key={props.fields.Id} tabIndex={0}>
      <div
        className={`navigation-title ${children.length ? 'child' : ''}`}
        onClick={() => setActive(() => !active)}
      >
        <Link
          field={getLinkField(props)}
          editable={page.mode.isEditing}
          onClick={props.handleClick}
        >
          {getNavigationText(props)}
        </Link>
      </div>
      {children.length > 0 ? <ul className="clearfix">{children}</ul> : null}
    </li>
  );
};

const getLinkTitle = (props: NavigationProps): string | undefined => {
  let title;
  if (props.fields.NavigationTitle?.value) {
    title = props.fields.NavigationTitle.value.toString();
  } else if (props.fields.Title?.value) {
    title = props.fields.Title.value.toString();
  } else {
    title = props.fields.DisplayName;
  }

  return title;
};

// harness:header-kit:start Navigation Ceros
/* Ceros variant: the top level comes from Sitecore (datasource Home, Main Navigation filter, children dropped); the dropdown panels under
   Products / Solutions / Resources and the two header buttons are hardcoded from the measured menu (src/lib/ceros-menu.ts), as on ceros.com.
   NOTE: hand-edited after header-kit.mjs; re-running header-kit for this customer would replace this block. */
export const Ceros = (props: NavigationProps): JSX.Element => {
  const [open, setOpen] = useState<string | null>(null);
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.GridParameters ?? ''} ${props.params?.Styles ?? ''}`.trimEnd();
  const items = (Object.values(props.fields ?? {}).filter(Boolean) as unknown as Fields[]).filter((item) => item?.Id);

  if (!items.length) {
    return (
      <div className={`component navigation variant-ceros ${styles}`} id={id ? id : undefined}>
        <div className="component-content">[Navigation]</div>
      </div>
    );
  }

  const labelOf = (item: Fields): string =>
    String(item.NavigationTitle?.value || item.Title?.value || item.DisplayName || '');

  return (
    <nav
      className={`component navigation variant-ceros ceros-nav ${styles}`}
      id={id ? id : undefined}
      aria-label="Main"
      onMouseLeave={() => setOpen(null)}
    >
      <ul className="ceros-nav__list">
        {items.map((item) => {
          const label = labelOf(item);
          const panel = cerosMenuPanels[label];
          return (
            <li key={item.Id} className="ceros-nav__item" onMouseEnter={() => setOpen(panel ? label : null)}>
              {panel ? (
                <>
                  <button
                    type="button"
                    className="ceros-nav__trigger"
                    aria-haspopup="true"
                    aria-expanded={open === label}
                    onClick={() => setOpen(open === label ? null : label)}
                  >
                    <Text field={item.NavigationTitle} />
                  </button>
                  {open === label && (
                    <div className={`ceros-nav__panel ceros-nav__panel--${label.toLowerCase()}`}>
                      <ul>
                        {panel.map((link) => (
                          <li key={link.label}>
                            <a
                              href={link.href}
                              target={link.external ? '_blank' : undefined}
                              rel={link.external ? 'noopener noreferrer' : undefined}
                            >
                              <span className="ceros-nav__panel-label">{link.label}</span>
                              {link.description && <span className="ceros-nav__panel-desc">{link.description}</span>}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  field={{ value: { href: item.Href, querystring: item.Querystring, text: label } }}
                  className="ceros-nav__link"
                >
                  <Text field={item.NavigationTitle} />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      <div className="ceros-nav__buttons">
        {cerosHeaderButtons.map((button, index) => (
          <a
            key={button.label}
            href={button.href}
            className={index === cerosHeaderButtons.length - 1 ? 'ceros-btn ceros-btn--pill' : 'ceros-btn ceros-btn--text'}
          >
            {button.label}
          </a>
        ))}
      </div>
    </nav>
  );
};
// harness:header-kit:end Navigation Ceros
