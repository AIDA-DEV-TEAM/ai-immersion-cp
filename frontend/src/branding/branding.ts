/**
 * Branding single source. The product name lives here (and only here) so a client
 * swap is a one-file edit. `VITE_BRAND_NAME` overrides the fallback at build time.
 */
export const PRODUCT_NAME = import.meta.env.VITE_BRAND_NAME ?? 'AI Immersion'

/** Short tagline shown on the start screen. */
export const PRODUCT_TAGLINE =
  'A guided, six-step workshop that turns a real business challenge into a buildable AI pilot concept.'
