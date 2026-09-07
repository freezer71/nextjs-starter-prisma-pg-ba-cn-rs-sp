/**
 * En-têtes de sécurité appliqués à toutes les réponses (pages et API) via next.config.ts.
 * La Content-Security-Policy est posée par proxy.ts (elle dépend d'un nonce par requête).
 */
export function securityHeaders({ isProduction }: { isProduction: boolean }) {
  const headers = [
    // Empêche le navigateur de deviner un type MIME différent de celui annoncé.
    { key: "X-Content-Type-Options", value: "nosniff" },
    // Interdit l'affichage du site dans une iframe (doublon volontaire de frame-ancestors pour les vieux navigateurs).
    { key: "X-Frame-Options", value: "DENY" },
    // Ne transmet l'URL complète qu'en même origine.
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // Désactive les API sensibles non utilisées. Retirer `payment=()` si Payment Request API est nécessaire.
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=(), payment=()",
    },
    // Isolation d'origine (protège des attaques type Spectre et de l'inclusion cross-origin).
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
    // Désactive le préchargement DNS implicite vers des tiers.
    { key: "X-DNS-Prefetch-Control", value: "off" },
  ];

  if (isProduction) {
    // HSTS : à n'activer qu'en HTTPS. `preload` suppose une inscription sur hstspreload.org.
    headers.push({ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" });
  }

  return headers;
}
