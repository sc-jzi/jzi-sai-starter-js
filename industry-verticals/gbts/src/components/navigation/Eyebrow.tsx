'use client';

import {
  AppPlaceholder,
  ComponentMap,
  ImageField,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { JSX, useState } from 'react';
import PreviewSearch from '../search/PreviewSearch';
import { PREVIEW_WIDGET_ID } from '../../_data/customizations';

export type EyebrowProps = ComponentProps & {
  fields: {
    LogoImage: ImageField;
  };
  componentMap: ComponentMap;
};

export const Default = (props: EyebrowProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <div className="header-top bg-[#00254c] text-white w-full px-[20px]">
        <div className="container-fluid">
          <div className="row justify-content-between">
            <div className="col-auto">
              Gallagher Bassett Technical Services LLC, NYC DOB PROVIDER NO. CP046
            </div>
            <div className="col-auto">NYC DOB PROVIDER NO. 4Q68</div>
            <div className="col-auto">718-389-2103</div>
          </div>
        </div>
      </div>

      <div
        className={`component eyebrow ${props.params.styles?.trimEnd() ?? ''}`}
        id={id || undefined}
      >
        <div
          className={`container container-${props.params?.ContainerWidth?.toLowerCase()}-fluid`}
        >
          <div className="row">
            <div className="col col-placeholder">
              <div className="flex items-center justify-end gap-2">
                {isSearchOpen ? (
                  <PreviewSearch
                    rfkId={PREVIEW_WIDGET_ID}
                    isOpen={isSearchOpen}
                    setIsSearchOpen={setIsSearchOpen}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
                    aria-label="Open search"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                      />
                    </svg>
                  </button>
                )}

                <AppPlaceholder
                  name="eyebrow-right"
                  rendering={props.rendering}
                  page={page}
                  componentMap={props.componentMap}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};