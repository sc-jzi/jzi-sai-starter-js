/**
 * The demo's only write to the simulated My Machine API: "Request a quote" on the considered machine. It is remembered
 * for the session in a cookie (no database), so the machine shows "Quote pending" until the visitor signs out.
 */
export const QUOTE_COOKIE = 'bobcat_mm_quote';
