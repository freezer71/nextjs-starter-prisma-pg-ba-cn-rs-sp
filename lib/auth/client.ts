import { magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/**
 * Client Better Auth (Client Components uniquement).
 * `baseURL` est déduite de l'origine courante : inutile de la préciser.
 */
export const authClient = createAuthClient({
  plugins: [magicLinkClient()],
});

export const { useSession, signOut } = authClient;
