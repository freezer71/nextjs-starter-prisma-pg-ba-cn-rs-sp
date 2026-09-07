# Starter Auth + Emails + Stripe + Thème + Sécurité — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** livrer un starter Next.js 16 avec authentification Better Auth complète, emails Resend/React Email, Stripe (customer, webhooks, checkout/portal), thème shadcn configurable et durcissement sécurité.

**Architecture :** App Router + Server Components ; formulaires auth en Client Components appelant `authClient` ; opérations Stripe en server actions ; webhook Stripe en route handler ; DAL `server-only` pour la session ; `proxy.ts` pour CSP nonce et redirections optimistes.

**Tech Stack :** Next 16.3.4, React 19.2, Tailwind 4, shadcn (base-nova), Prisma 7.10 + adapter-pg, Better Auth 1.7.2, Stripe 22, Resend 6 + react-email 6, zod 4, @t3-oss/env-nextjs, next-themes, vitest 4.

**Spec :** `docs/superpowers/specs/2026-09-05-starter-auth-stripe-design.md`

## Global Constraints

- Node 20.9+ ; TypeScript strict ; `npm` comme gestionnaire.
- Next 16 : `proxy.ts` (pas de middleware), `await params/searchParams/cookies/headers`, `cacheComponents` désactivé, pas de `runtime = 'edge'`.
- Prisma 7 : `prisma.config.ts` porte l'URL ; générateur `prisma-client` avec `output = "../lib/generated/prisma"` ; client instancié avec `PrismaPg`.
- Better Auth : plugins importés depuis `better-auth/plugins/*`, `nextCookies()` en dernier.
- Stripe : jamais `payment_method_types` ; toujours `new Stripe(...)` instancié ; signature webhook vérifiée sur le corps brut.
- shadcn : composants `Field*` pour les formulaires, tokens sémantiques uniquement, icônes `lucide-react` avec `data-icon`.
- Textes UI et emails en français ; commentaires en français.
- Aucun secret dans le code ; `.env*` ignorés par git.

---

### Task 1 : Fondations (dépendances, Postgres Docker, env, Prisma)

**Files :** `package.json`, `docker-compose.yml`, `.env.example`, `.env` (local, ignoré), `lib/env.ts`, `prisma.config.ts`, `prisma/schema.prisma`, `lib/db.ts`, `vitest.config.ts`, `tsconfig.json`.

**Interfaces produites :**
- `env` (`lib/env.ts`) : `{ DATABASE_URL, BETTER_AUTH_SECRET, RESEND_API_KEY?, EMAIL_FROM, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_PRO_MONTHLY?, BETTER_AUTH_TRUSTED_ORIGINS?, NEXT_PUBLIC_APP_URL }`.
- `db` (`lib/db.ts`) : singleton `PrismaClient` (adapter pg).
- Modèles Prisma : `User` (+ `stripeCustomerId`), `Session`, `Account`, `Verification`, `RateLimit`, `Subscription`, `StripeWebhookEvent`.

- [ ] Installer les dépendances (versions épinglées : prisma/@prisma/client/@prisma/adapter-pg 7.10.0).
- [ ] Écrire `docker-compose.yml` (postgres:17-alpine, `${POSTGRES_PORT:-5432}`), démarrer, vérifier `pg_isready`.
- [ ] Écrire `lib/env.ts` avec `createEnv` + zod ; test vitest : un env invalide lève.
- [ ] Écrire `prisma.config.ts`, `prisma/schema.prisma` (modèles ci-dessus, `@@map` en snake_case), `lib/db.ts`.
- [ ] `npx prisma migrate dev --name init` ; `npx prisma generate` ; `npx tsc --noEmit` passe.
- [ ] Commit `feat: fondations (env, prisma, postgres docker)`.

### Task 2 : Thème shadcn + layout racine

**Files :** `components.json`, `app/globals.css`, `app/theme.css`, `app/layout.tsx`, `app/page.tsx`, `components/theme-provider.tsx`, `components/theme-toggle.tsx`, `config/site.ts`, `components/ui/*`.

**Interfaces produites :** `siteConfig = { name, description, url, links }` ; `ThemeProvider` (client, `nonce?`) ; `ThemeToggle`.

- [ ] `npx shadcn@latest init --defaults` ; vérifier `components.json` (`base`, `iconLibrary`).
- [ ] `npx shadcn@latest add button card input label field alert badge separator dropdown-menu avatar spinner skeleton sonner` (adapter selon disponibilité ; `toast` si base).
- [ ] Extraire les tokens dans `app/theme.css`, importer depuis `globals.css` ; conserver `@theme inline` dans `globals.css`.
- [ ] Root layout : fonts Geist, `ThemeProvider attribute="class"`, `Toaster`, `lang="fr"`, `suppressHydrationWarning`.
- [ ] Landing minimale (`app/page.tsx`) avec liens login/signup.
- [ ] `npm run build` passe ; commit `feat: thème shadcn configurable et layout`.

### Task 3 : Emails (Resend + React Email)

**Files :** `lib/email/send.ts`, `emails/components/email-layout.tsx`, `emails/verify-email.tsx`, `emails/reset-password.tsx`, `emails/magic-link.tsx`, `package.json` (script `email:dev`).

**Interfaces produites :** `sendEmail({ to, subject, react, idempotencyKey?, tags? }): Promise<{ ok: boolean }>` ; composants `VerifyEmail({ url, name })`, `ResetPasswordEmail({ url, name })`, `MagicLinkEmail({ url })`.

- [ ] Wrapper Resend : sans `RESEND_API_KEY` en dev → log console (sujet + lien extrait) ; en prod → erreur explicite.
- [ ] Templates avec layout commun (Tailwind + pixelBasedPreset, `Preview`, `Container`, `Button box-border`).
- [ ] Test vitest : `render(<VerifyEmail url=.../>, { plainText: true })` contient l'URL.
- [ ] Commit `feat: emails transactionnels Resend + React Email`.

### Task 4 : Better Auth (serveur, client, DAL, proxy)

**Files :** `config/auth.ts`, `lib/auth/auth.ts`, `lib/auth/client.ts`, `lib/auth/session.ts`, `app/api/auth/[...all]/route.ts`, `proxy.ts`, `lib/security/csp.ts`, `prisma/schema.prisma` (vérifier via `@better-auth/cli generate`).

**Interfaces produites :**
- `auth` (server) ; `authClient` (`signIn.email`, `signUp.email`, `signIn.magicLink`, `requestPasswordReset`, `resetPassword`, `sendVerificationEmail`, `signOut`, `useSession`).
- `getSession(): Promise<Session | null>` ; `requireSession(): Promise<Session>` (redirect `/login`).
- `authConfig = { passwordMinLength: 12, routes: { login, signup, afterLogin: "/dashboard", verifyEmail, resetPassword, magicLink, forgotPassword } }`.
- `buildCsp({ nonce, isDev }): string`.

- [ ] Config serveur complète (voir spec §4) + hook création customer Stripe (placeholder importé de Task 6 : `syncStripeCustomerOnSignup(user)` — créer le module dès cette tâche avec un no-op si `STRIPE_SECRET_KEY` absent).
- [ ] `npx @better-auth/cli generate --config lib/auth/auth.ts` → comparer avec le schéma, migrer si différence.
- [ ] Route handler `toNextJsHandler(auth)` ; `curl /api/auth/ok` → `{status:"ok"}`.
- [ ] `proxy.ts` : nonce + CSP + redirections via `getSessionCookie` ; matcher excluant `/api`, statiques, prefetch. Test vitest sur `buildCsp` (contient nonce, `unsafe-eval` seulement en dev, `frame-ancestors 'none'`).
- [ ] Commit `feat: Better Auth (email/mdp, vérification, reset, magic link) + proxy`.

### Task 5 : Pages et formulaires d'authentification

**Files :** `lib/validations/auth.ts`, `app/(auth)/layout.tsx`, `app/(auth)/{login,signup,verify-email,forgot-password,reset-password,magic-link}/page.tsx`, `components/auth/{login-form,signup-form,forgot-password-form,reset-password-form,magic-link-form,resend-verification-form,auth-card}.tsx`.

**Interfaces produites :** schémas zod `loginSchema`, `signupSchema`, `emailSchema`, `resetPasswordSchema` (+ tests vitest) ; composants formulaires.

- [ ] Schémas zod + tests (mot de passe trop court refusé, confirmation différente refusée, email invalide refusé).
- [ ] `AuthCard` (Card + titre + description + footer lien).
- [ ] Formulaires : état local, `safeParse` à la soumission, erreurs par champ via `Field data-invalid` + `FieldError`, erreur globale via `Alert`, bouton désactivé + `Spinner` pendant l'appel.
- [ ] Pages serveur : lecture de `searchParams` (Promise) pour `error`, `token`, `email`, `reset`, `next`.
- [ ] Parcours manuel : signup → lien console → dashboard ; login non vérifié → message ; reset ; magic link.
- [ ] Commit `feat: pages d'authentification`.

### Task 6 : Espace connecté (dashboard, header, déconnexion)

**Files :** `app/(app)/layout.tsx`, `app/(app)/dashboard/page.tsx`, `components/app/app-header.tsx`, `components/app/user-menu.tsx`, `components/app/sign-out-button.tsx`.

- [ ] Layout avec header (logo, `ThemeToggle`, `UserMenu` : nom/email, déconnexion).
- [ ] Page dashboard : `requireSession()`, carte « Compte » (nom, email, badge vérifié), emplacement carte facturation (Task 7).
- [ ] Commit `feat: espace connecté`.

### Task 7 : Stripe (client, customer, webhooks, checkout/portal, facturation)

**Files :** `config/billing.ts`, `lib/stripe/client.ts`, `lib/stripe/customer.ts`, `lib/stripe/subscription.ts`, `lib/stripe/webhook-handlers.ts`, `lib/stripe/actions.ts`, `app/api/stripe/webhook/route.ts`, `components/billing/billing-card.tsx`, tests `lib/stripe/*.test.ts`.

**Interfaces produites :**
- `stripe` singleton.
- `getOrCreateStripeCustomer(user: { id, email, name, stripeCustomerId }): Promise<string>` ; `syncStripeCustomerOnSignup(user)`.
- `mapStripeSubscription(sub: Stripe.Subscription, userId: string): SubscriptionRecord`.
- `handleStripeEvent(event: Stripe.Event, deps: { db, stripe }): Promise<void>`.
- Actions : `createCheckoutSession(formData)`, `createBillingPortalSession()`.
- `plans: Plan[]` avec `{ id, name, description, priceId, features }`.

- [ ] Tests : mapping (status, priceId, currentPeriodEnd depuis `items.data[0].current_period_end`, cancelAtPeriodEnd) ; dispatch `customer.subscription.deleted` supprime ; `customer.deleted` détache ; type inconnu no-op.
- [ ] Implémenter ; route webhook : `request.text()`, `constructEvent`, idempotence via `StripeWebhookEvent`, 400/200/500.
- [ ] Actions serveur avec `requireSession()` puis `redirect(url)` hors try/catch.
- [ ] `BillingCard` : abonnement courant (statut, échéance) ou bouton « S'abonner » ; bouton « Gérer la facturation ».
- [ ] Test manuel : `stripe listen --forward-to localhost:3000/api/stripe/webhook` + `stripe trigger customer.subscription.created` si CLI connectée ; sinon test unitaire de la route avec une signature générée via `stripe.webhooks.generateTestHeaderString`.
- [ ] Commit `feat: Stripe customer, webhooks, checkout et portail`.

### Task 8 : Durcissement sécurité et config Next

**Files :** `next.config.ts`, `.githooks/pre-commit`, `package.json` (`prepare`), `lib/security/headers.ts`.

- [ ] `headers()` : HSTS (prod), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `X-Frame-Options: DENY`, `poweredByHeader: false`, `typedRoutes: true`, `experimental.serverActions.bodySizeLimit`.
- [ ] Hook pre-commit bloquant `sk_live_|rk_live_|whsec_` dans les fichiers indexés ; `prepare` → `git config core.hooksPath .githooks`.
- [ ] Vérifier en dev : en-têtes présents (`curl -I`), aucune erreur CSP console sur login/dashboard.
- [ ] Commit `feat: en-têtes de sécurité et hook anti-secrets`.

### Task 9 : Documentation et vérification finale

**Files :** `CLAUDE.md`, `README.md`, `.env.example`.

- [ ] `CLAUDE.md` : architecture en place (stack, arborescence, flux, commandes, où configurer thème/plans/env), conventions Next 16 essentielles, lien vers les skills.
- [ ] README : démarrage rapide (docker, env, migrate, dev, stripe listen, email dev).
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` verts.
- [ ] Commit `docs: architecture et démarrage`.
