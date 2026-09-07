/**
 * N'accepte que des chemins internes (commençant par un seul `/`) pour éviter
 * les redirections ouvertes vers des sites tiers via `?next=`.
 */
export function safeInternalPath(value: string | string[] | undefined, fallback?: string): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return fallback;
  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.startsWith("/\\")) return fallback;
  return candidate;
}
