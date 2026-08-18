export function isSitecoreSearchConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SEARCH_CUSTOMER_KEY && process.env.NEXT_PUBLIC_SEARCH_API_KEY);
}
