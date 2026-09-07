import "server-only";
import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { authConfig } from "@/config/auth";
import { auth } from "@/lib/auth/auth";

/**
 * Couche d'accès à la session (DAL).
 * `cache` mémoïse le résultat pendant un même rendu : layouts, pages et composants
 * peuvent tous appeler `getSession()` sans requête supplémentaire.
 */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/**
 * Pour les pages réservées aux visiteurs (login, signup...) : un utilisateur déjà connecté
 * est renvoyé vers l'application. Vérifie la session réelle, pas seulement le cookie.
 */
export async function redirectIfAuthenticated() {
  const session = await getSession();
  if (session) {
    redirect(authConfig.routes.afterLogin);
  }
}

/**
 * Exige une session valide, sinon redirige vers la page de connexion
 * en conservant la destination (`?next=`).
 * À appeler dans chaque page protégée et chaque server action : un layout ne suffit pas.
 */
export async function requireSession(nextPath?: string) {
  const session = await getSession();
  if (!session) {
    const target = nextPath ? `${authConfig.routes.login}?next=${encodeURIComponent(nextPath)}` : authConfig.routes.login;
    redirect(target as Route);
  }
  return session;
}
