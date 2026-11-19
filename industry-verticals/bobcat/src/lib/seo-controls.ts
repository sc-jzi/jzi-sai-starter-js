/**
 * Page-level SEO controls an editor sets in Pages (the "SEO" section of the Bobcat Page template, inherited by every
 * Bobcat page type): MetaRobotsNoIndex, MetaRobotsNoFollow (Checkbox) and CanonicalUrl (General Link).
 * Read from the route fields of the layout data; the page route renders them (robots meta in generateMetadata, the
 * canonical in src/AlternateLinks.tsx).
 */
type CheckboxField = { value?: boolean | string };
type LinkField = { value?: { href?: string } };

export type SeoRouteFields = {
  MetaRobotsNoIndex?: CheckboxField;
  MetaRobotsNoFollow?: CheckboxField;
  CanonicalUrl?: LinkField;
};

const checked = (field?: CheckboxField) => field?.value === true || field?.value === '1';

export type SeoControls = {
  noIndex: boolean;
  noFollow: boolean;
  /** the canonical override as authored: an absolute URL (external link) or a site path (internal link) */
  canonicalHref?: string;
};

export const readSeoControls = (fields?: SeoRouteFields): SeoControls => ({
  noIndex: checked(fields?.MetaRobotsNoIndex),
  noFollow: checked(fields?.MetaRobotsNoFollow),
  canonicalHref: fields?.CanonicalUrl?.value?.href?.trim() || undefined,
});
