/**
 * Construction de l'en-tête Content-Security-Policy.
 *
 * Politique stricte basée sur un nonce : seuls les scripts portant le nonce de la requête
 * (ou chargés par eux, via 'strict-dynamic') sont exécutés. Next.js applique automatiquement
 * le nonce à ses propres scripts lorsqu'il le trouve dans l'en-tête CSP de la requête.
 *
 * Domaines Stripe autorisés pour Stripe.js / Checkout embarqué. Ajouter ici les domaines
 * de vos services tiers (analytics, CDN d'images, ...).
 */

const STRIPE_SCRIPT_HOSTS = ["https://js.stripe.com", "https://checkout.stripe.com"];
const STRIPE_FRAME_HOSTS = ["https://js.stripe.com", "https://checkout.stripe.com", "https://hooks.stripe.com"];
const STRIPE_CONNECT_HOSTS = ["https://api.stripe.com", "https://checkout.stripe.com"];

export type CspOptions = {
  nonce: string;
  /** En développement, React a besoin de 'unsafe-eval' pour ses outils de débogage. */
  isDev?: boolean;
};

export function buildCsp({ nonce, isDev = false }: CspOptions): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...STRIPE_SCRIPT_HOSTS, ...(isDev ? ["'unsafe-eval'"] : [])],
    // Les composants UI positionnent leurs éléments via des attributs style inline :
    // 'unsafe-inline' est nécessaire ici (risque limité : les styles ne peuvent pas exécuter de code).
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "blob:", "data:", "https://*.stripe.com"],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", ...STRIPE_CONNECT_HOSTS, ...(isDev ? ["ws:", "wss:"] : [])],
    "frame-src": [...STRIPE_FRAME_HOSTS],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
  };

  const parts = Object.entries(directives).map(([name, values]) => `${name} ${values.join(" ")}`);
  if (!isDev) parts.push("upgrade-insecure-requests");
  return parts.join("; ");
}

/** Génère un nonce aléatoire (128 bits, encodé en base64). */
export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}
