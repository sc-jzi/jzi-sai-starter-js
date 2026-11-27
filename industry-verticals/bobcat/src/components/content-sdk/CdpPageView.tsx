'use client';
import { CdpHelper, useSitecore } from '@sitecore-content-sdk/nextjs';
import { useEffect, JSX } from 'react';
import { event, pageView } from '@sitecore-content-sdk/events';
import config from 'sitecore.config';
import { productAnalyticsOf } from 'lib/pim/product-context';

/**
 * This is the CDP page view component.
 * See Sitecore Content SDK documentation for details.
 * https://www.npmjs.com/package/@sitecore-content-sdk/events
 *
 * Product pages (catalog plan section 8): a PIM product page's route item is the category's `*` wildcard, so the page view
 * is named after the product's model instead and carries the product as extension data; a PRODUCT_VIEW custom event with
 * the same data follows, for audiences and personalization conditions (authored product pages such as E35 send both too).
 */
const CdpPageView = (): JSX.Element => {
  const { page } = useSitecore();
  const { layout, siteName, mode } = page;
  const { route, context } = layout.sitecore;
  const product = productAnalyticsOf(page);

  /**
   * Determines if the page view events should be turned off.
   * IMPORTANT: You should implement based on your cookie consent management solution of choice.
   * By default it is disabled in development mode
   */
  const disabled = () => {
    return process.env.NODE_ENV === 'development';
  };

  useEffect(() => {
    // Do not create events in editing or preview mode or if missing route data
    if (!mode.isNormal || !route?.itemId) {
      return;
    }
    // Do not create events if disabled (e.g. we don't have consent)
    if (disabled()) {
      return;
    }

    const language = route.itemLanguage || config.defaultLanguage;
    const scope = config.personalize?.scope;

    const pageVariantId = CdpHelper.getPageVariantId(
      route.itemId,
      language,
      context.variantId as string,
      scope
    );
    const common = { channel: 'WEB', currency: 'USD', language, page: product?.model || route.name };
    // there can be cases where Events are not initialized which are expected to reject
    pageView({
      ...common,
      pageVariantId,
      ...(product ? { extensionData: { ...product } } : {}),
    })
      .then(() => (product ? event({ ...common, type: 'PRODUCT_VIEW', extensionData: { ...product } }) : null))
      .catch((e) => console.debug(e));
  }, [mode, route, context.variantId, siteName, product]);

  return <></>;
};

export default CdpPageView;
