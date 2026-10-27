import { Field, ImageField } from '@sitecore-content-sdk/nextjs';

/** New image fields can arrive as the raw Content Hub XML string. NextImage needs { value: { src } }. */
export function asImageField(field?: ImageField | Field<string>): ImageField | undefined {
  const value = field?.value as { src?: string } | string | undefined;
  if (!value) return undefined;
  if (typeof value === 'object' && value.src) return field as ImageField;
  if (typeof value !== 'string') return undefined;
  const src = value.match(/src="([^"]+)"/)?.[1];
  if (!src) return undefined;
  const alt = value.match(/alt="([^"]*)"/)?.[1] ?? '';
  const width = Number(value.match(/width="(\d+)"/)?.[1] || 0) || undefined;
  const height = Number(value.match(/height="(\d+)"/)?.[1] || 0) || undefined;
  return { value: { src, alt, width, height } };
}
