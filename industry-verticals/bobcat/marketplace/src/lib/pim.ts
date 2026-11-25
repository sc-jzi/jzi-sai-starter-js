/**
 * The PIM adapter (catalog plan section 2: "src/lib/pim/ is one small file, copied into both apps"). Server only: the
 * browser reads the PIM through /api/pim, so swapping Xano for Product Data Digger (and adding its key) stays here.
 */
export const PIM_API_URL = (process.env.PIM_API_URL || 'https://x8ki-letl-twmt.n7.xano.io/api:product-pim').replace(/\/$/, '');

/** PIM read paths the app may proxy: categories, listings, a product, its compatible attachments. */
export const ALLOWED = [/^categories$/, /^products$/, /^products\/[A-Za-z0-9-]+$/, /^products\/[A-Za-z0-9-]+\/compatible-attachments$/];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * One PIM read; a 429 (free plan: 10 requests / 20 s) waits and retries twice. Cached a minute by Next, unless `fresh`
 * (the "Refresh from PIM" button) asks for the PIM's current answer.
 */
export async function pimGet(path: string, search = '', fresh = false): Promise<Response> {
  let res: Response | undefined;
  const cacheOpts: RequestInit = fresh ? { cache: 'no-store' } : { next: { revalidate: 60 } };
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(`${PIM_API_URL}/${path}${search}`, { ...cacheOpts, signal: AbortSignal.timeout(15000) });
    if (res.status !== 429 || attempt === 2) break;
    await wait(2000 * (attempt + 1));
  }
  return res!;
}
