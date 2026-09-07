import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

import { authConfig } from "@/config/auth";
import { buildCsp, generateNonce } from "@/lib/security/csp";

/**
 * Proxy (ex-middleware) exécuté avant chaque page :
 * 1. génère un nonce et pose l'en-tête Content-Security-Policy ;
 * 2. redirige de façon OPTIMISTE vers /login les routes protégées sans cookie de session.
 *
 * La présence du cookie ne prouve pas la validité de la session : chaque page protégée
 * et chaque server action revérifient via `requireSession()` (lib/auth/session.ts).
 * Les pages « visiteur » (login, signup...) ne sont volontairement pas redirigées ici :
 * un cookie périmé provoquerait une boucle /login ↔ /dashboard. Elles vérifient la
 * session réelle côté serveur via `redirectIfAuthenticated()`.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSessionCookie = Boolean(getSessionCookie(request, { cookiePrefix: authConfig.cookiePrefix }));

  const isProtected = authConfig.protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (isProtected && !hasSessionCookie) {
    const loginUrl = new URL(authConfig.routes.login, request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return withCsp(request);
}

function withCsp(request: NextRequest) {
  const nonce = generateNonce();
  const csp = buildCsp({ nonce, isDev: process.env.NODE_ENV === "development" });

  // L'en-tête est posé sur la requête (lu par Next.js pour attribuer le nonce aux scripts)
  // et sur la réponse (appliqué par le navigateur).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Tout sauf les routes API (webhooks, Better Auth), les fichiers statiques et les prefetch.
      source: "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
