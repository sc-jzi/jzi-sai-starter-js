/**
 * Helpers for schema.org JSON-LD script tags built from Sitecore field values.
 */

/** Rich text to plain text (tags dropped, the common entities decoded, whitespace collapsed). */
export const plainText = (html?: string): string =>
  `${html ?? ''}`
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|li|h\d)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;/g, '’')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

/** Drops empty values (undefined, null, '', empty arrays and objects) so the graph only carries real content. */
const prune = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    const list = value.map(prune).filter((v) => v !== undefined);
    return list.length ? list : undefined;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([k, v]) => [k, prune(v)] as const)
      .filter(([, v]) => v !== undefined);
    return entries.length ? Object.fromEntries(entries) : undefined;
  }
  return value === '' || value === null ? undefined : value;
};

/** JSON for a <script type="application/ld+json">; "<" is escaped so the JSON can never close the script tag. */
export const toJsonLd = (data: Record<string, unknown>): string =>
  JSON.stringify(prune(data) ?? {}).replace(/</g, '\\u003c');
