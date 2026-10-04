const INTERNAL_ORIGIN = "http://internal.invalid";

/**
 * N'accepte que des chemins internes (commençant par un seul `/`) pour éviter
 * les redirections ouvertes vers des sites tiers via `?next=`.
 */
export function safeInternalPath(value: string | string[] | undefined, fallback?: string): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return fallback;
  if (!candidate.startsWith("/") || candidate.startsWith("//")) return fallback;
  // Le navigateur supprime tabulations et retours à la ligne et lit `\` comme `/` :
  // "/\t/evil.com" ou "/\\evil.com" deviennent "//evil.com".
  if (/[\u0000-\u001F\u007F\\]/.test(candidate)) return fallback;
  // Dernier garde-fou : le chemin résolu doit rester sur la même origine.
  if (new URL(candidate, INTERNAL_ORIGIN).origin !== INTERNAL_ORIGIN) return fallback;
  return candidate;
}
