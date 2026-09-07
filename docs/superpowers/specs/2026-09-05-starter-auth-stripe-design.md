# Starter Next.js — Auth, Emails, Stripe, Thème, Sécurité

Date : 2026-09-05
Statut : implémenté en mode autonome sous les hypothèses listées en fin de document.

## 1. Objectif

Transformer le `create-next-app` vierge en starter réutilisable :

- Authentification complète avec Better Auth : inscription + vérification d'email, connexion, mot de passe oublié / réinitialisation, Magic Link.
- Emails transactionnels via Resend + React Email.
- Stripe : client, système de Stripe Customer lié à l'utilisateur, webhooks signés et idempotents, Checkout + Customer Portal pour un abonnement.
- Thème basique shadcn/ui configurable en un seul fichier.
- Mesures de sécurité adaptées à ce périmètre.
- Skills installés dans `.claude/skills/` et documentation d'architecture dans `CLAUDE.md`.

## 2. Stack et versions

| Brique | Version | Note |
|---|---|---|
| Next.js | 16.3.4 (App Router, Turbopack) | `proxy.ts` remplace `middleware.ts`, `params`/`searchParams` sont des Promises, `cacheComponents` désactivé |
| React | 19.2 | |
| Tailwind CSS | 4 | tokens via `@theme inline` |
| shadcn/ui | latest (preset `base-nova`, Base UI) | composants copiés dans `components/ui`, formulaires avec `Field`/`FieldGroup`/`FieldError` |
| Prisma | 7.10 + `@prisma/adapter-pg` | `prisma.config.ts`, générateur `prisma-client` avec `output` explicite |
| Better Auth | 1.7.2 | adaptateur Prisma, plugins `magicLink` et `nextCookies` |
| Stripe SDK | 22.x (API `2026-08-26.dahlia`) | |
| Resend | 6.x + `react-email` 6.x | composants, `render` et `Tailwind` importés depuis `react-email` |
| Validation | zod 4 + `@t3-oss/env-nextjs` | zod côté client (safeParse à la soumission) et serveur |
| Tests | vitest 4 | tests unitaires de la logique pure |

## 3. Arborescence cible

```
app/
  layout.tsx                 # root layout : fonts, ThemeProvider, nonce CSP
  page.tsx                   # landing minimale
  globals.css                # imports Tailwind + base
  theme.css                  # ★ tokens de couleur / radius (fichier à modifier pour changer le thème)
  (auth)/
    layout.tsx               # centrage carte auth
    login/page.tsx
    signup/page.tsx
    verify-email/page.tsx    # « vérifiez votre boîte mail » + renvoi + gestion ?error=
    forgot-password/page.tsx
    reset-password/page.tsx  # lit ?token= / ?error=
    magic-link/page.tsx
  (app)/
    layout.tsx               # header appli (user menu, logout)
    dashboard/page.tsx       # protégé : compte + facturation
  api/auth/[...all]/route.ts # handler Better Auth
  api/stripe/webhook/route.ts
components/
  ui/…                       # shadcn
  auth/…                     # formulaires auth (client components)
  billing/…                  # carte facturation
  theme-toggle.tsx
config/
  site.ts                    # nom, description, URLs
  auth.ts                    # constantes (longueur mdp, chemins de redirection)
  billing.ts                 # plans / price IDs
emails/                      # templates React Email
  verify-email.tsx, reset-password.tsx, magic-link.tsx, components/layout.tsx
lib/
  env.ts                     # validation zod des variables d'env
  db.ts                      # singleton Prisma
  auth/auth.ts               # config serveur Better Auth
  auth/client.ts             # createAuthClient
  auth/session.ts            # DAL : getSession / requireSession (server-only)
  email/send.ts              # wrapper Resend (fallback console en dev sans clé)
  stripe/client.ts           # singleton Stripe
  stripe/customer.ts         # getOrCreateStripeCustomer, sync
  stripe/subscription.ts     # mapping Stripe → DB
  stripe/webhook-handlers.ts # dispatch par type d'événement
  stripe/actions.ts          # server actions checkout / portal
  security/csp.ts            # construction de l'en-tête CSP
  utils.ts                   # cn()
prisma/
  schema.prisma
  migrations/
prisma.config.ts
proxy.ts                     # CSP nonce + redirections de session (optimistes)
docker-compose.yml           # Postgres local
.env.example
```

## 4. Authentification (Better Auth)

### Configuration serveur (`lib/auth/auth.ts`)

- `database: prismaAdapter(db, { provider: "postgresql" })`.
- `emailAndPassword`: `enabled`, `requireEmailVerification: true`, `minPasswordLength` (constante dans `config/auth.ts`, 12 par défaut), `autoSignIn: false` (inutile tant que l'email n'est pas vérifié), `revokeSessionsOnPasswordReset: true`, `resetPasswordTokenExpiresIn: 30 min`, `sendResetPassword` → email React.
- `emailVerification`: `sendOnSignUp: true`, `sendOnSignIn: true`, `autoSignInAfterVerification: true`, `expiresIn: 1 h`, `sendVerificationEmail` → email React.
- Plugins : `magicLink({ sendMagicLink, expiresIn: 5 min, storeToken: "hashed" })`, `nextCookies()` en dernier.
- `session`: `expiresIn 7 j`, `updateAge 1 j`, `cookieCache { enabled, maxAge 1 min }` (les révocations se propagent en moins d'une minute).
- `rateLimit`: `enabled: true`, `storage: "database"`, règles renforcées sur `sign-in/email`, `sign-up/email`, `sign-in/magic-link`, `request-password-reset`, `send-verification-email`.
- `trustedOrigins`: `[NEXT_PUBLIC_APP_URL]` + `BETTER_AUTH_TRUSTED_ORIGINS` optionnel.
- `advanced.ipAddress.ipAddressHeaders: ["x-forwarded-for", "x-real-ip"]`.
- `databaseHooks.user.create.after` : création du Stripe Customer (non bloquante, tolérante aux pannes).

### Flux

| Flux | Page | Appel client | Résultat |
|---|---|---|---|
| Inscription | `/signup` | `authClient.signUp.email({ name, email, password, callbackURL: "/verify-email" })` | redirection `/verify-email?email=` |
| Vérification | `/verify-email` | lien email → `/api/auth/verify-email` | session créée, redirection `/verify-email` → `/dashboard` ; erreur : `?error=` affiché + renvoi |
| Connexion | `/login` | `authClient.signIn.email` | `/dashboard` ; 403 email non vérifié → message + lien renvoi |
| Mot de passe oublié | `/forgot-password` | `authClient.requestPasswordReset({ email, redirectTo: "/reset-password" })` | message générique (anti-énumération) |
| Réinitialisation | `/reset-password?token=` | `authClient.resetPassword({ newPassword, token })` | `/login?reset=1` ; `?error=` → lien invalide |
| Magic Link | `/magic-link` | `authClient.signIn.magicLink({ email, callbackURL: "/dashboard", errorCallbackURL: "/magic-link" })` | message générique ; `?error=` affiché |
| Déconnexion | header | `authClient.signOut()` | `/login` |

### Protection des routes

- `proxy.ts` : contrôle **optimiste** via `getSessionCookie(request, { cookiePrefix })` : sans cookie → `/login?next=` pour `/dashboard/*`. Les pages visiteur (`/login`, `/signup`, `/forgot-password`, `/magic-link`) ne sont pas redirigées par le proxy (un cookie périmé créerait une boucle) : elles appellent `redirectIfAuthenticated()` qui vérifie la session réelle. Le matcher exclut `/api`, `_next/static`, `_next/image`, favicon et prefetches.
- Cookies Better Auth préfixés (`cookiePrefix: "starter"`) pour ne pas entrer en collision avec d'autres applications sur le même hôte.
- Vérification réelle dans les pages via `requireSession()` (`lib/auth/session.ts`, `server-only`, `React.cache`, `redirect("/login")`). Les layouts n'assurent jamais seuls la protection.
- Toute server action commence par `requireSession()`.

## 5. Emails (Resend + React Email)

- `lib/email/send.ts` : `sendEmail({ to, subject, react })` → `resend.emails.send({ from: env.EMAIL_FROM, to, subject, react, text })` avec `text` généré via `render(..., { plainText: true })`. Retourne `{ data, error }` ; les erreurs sont loguées sans exposer d'info à l'utilisateur.
- En développement sans `RESEND_API_KEY`, le contenu (sujet + lien) est écrit dans la console : permet de tester tous les flux sans compte Resend.
- Templates dans `emails/` avec un layout commun (`emails/components/layout.tsx`) reprenant le nom du site depuis `config/site.ts`. Prévisualisation : `npm run email:dev`.

## 6. Stripe

### Modèle de données (Prisma)

- `User.stripeCustomerId String? @unique`.
- `Subscription { id (sub Stripe) @id, userId, stripeCustomerId, status, priceId, currentPeriodEnd, cancelAtPeriodEnd, createdAt, updatedAt }` (un abonnement actif max par user pour ce starter).
- `StripeWebhookEvent { id (evt_…) @id, type, createdAt }` : idempotence.

### Customer

- `getOrCreateStripeCustomer(user)` : renvoie `stripeCustomerId` ou crée le customer (`email`, `name`, `metadata.userId`) puis persiste. Appelé à l'inscription (hook) et paresseusement avant checkout / portal.
- Webhook `customer.deleted` → remise à `null`.

### Webhook (`app/api/stripe/webhook/route.ts`)

1. `await request.text()` + en-tête `stripe-signature` → `stripe.webhooks.constructEvent` avec `STRIPE_WEBHOOK_SECRET` ; échec → 400.
2. Idempotence : `create` de `StripeWebhookEvent` ; conflit d'unicité → 200 sans retraitement.
3. Dispatch (`lib/stripe/webhook-handlers.ts`) :
   - `checkout.session.completed` (mode subscription, `payment_status !== "unpaid"`) → upsert de l'abonnement.
   - `customer.subscription.created|updated|deleted` → upsert / suppression.
   - `invoice.paid`, `invoice.payment_failed` → journalisation (point d'extension pour emails).
   - `customer.deleted` → détachement.
   - Types inconnus → ignorés (200).
4. Erreur de traitement → 500 (Stripe rejoue) après suppression de l'entrée d'idempotence.

### Actions serveur (`lib/stripe/actions.ts`)

- `createCheckoutSession(priceId)` : session requise, `priceId` validé contre `config/billing.ts`, `mode: "subscription"`, `customer`, `client_reference_id: userId`, `success_url`/`cancel_url` vers `/dashboard`, pas de `payment_method_types`.
- `createBillingPortalSession()` : session requise, `return_url` `/dashboard`.
- Les deux terminent par `redirect(url)` hors `try/catch`.

### Config

- `config/billing.ts` : liste des plans `{ id, name, description, priceId: env.STRIPE_PRICE_… }`.
- `lib/stripe/client.ts` : `new Stripe(env.STRIPE_SECRET_KEY, { apiVersion, typescript: true, appInfo })`.

## 7. Thème

- `app/theme.css` : uniquement les variables (`--background`, `--primary`, … en oklch, light + `.dark`) et `--radius`. C'est le seul fichier à modifier pour changer la palette. `globals.css` importe Tailwind, `tw-animate-css`, `theme.css` et déclare le mapping `@theme inline`.
- Fonts : `next/font/google` (Geist) dans `app/layout.tsx`, exposées en `--font-sans` / `--font-mono`.
- Mode sombre : `next-themes` (`attribute="class"`, `nonce` transmis) + `ThemeToggle`.
- `config/site.ts` : `name`, `description`, `url`, liens légaux.

## 7 bis. Pages légales

- `config/legal.ts` : éditeur, directeur de publication, hébergeur, contact données personnelles / DPO, durées de conservation, sous-traitants (hébergeur, Stripe, Resend), médiateur de la consommation, droit applicable. Placeholders `[…]` à remplir par projet.
- `app/(legal)/` : `legal` (mentions légales, LCEN art. 6-III), `privacy` (politique de confidentialité, RGPD art. 13 : responsable, données, finalités/bases légales/durées, sous-traitants, transferts, cookies exemptés, droits, CNIL, sécurité, mineurs), `terms` (CGU + CGV : compte, abonnement Stripe, rétractation, résiliation, responsabilité, médiation, juridiction).
- `components/site-footer.tsx` sur la landing, les pages d'auth et les pages légales ; mention de consentement sous le formulaire d'inscription.
- Mise en forme : `@tailwindcss/typography` (`prose`) avec les tokens du thème.

## 8. Sécurité

| Mesure | Où |
|---|---|
| CSP stricte avec nonce (`script-src 'self' 'nonce-…' 'strict-dynamic'`, `'unsafe-eval'` en dev uniquement), `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, allowlist Stripe (`js.stripe.com`, `checkout.stripe.com`, `api.stripe.com`) | `lib/security/csp.ts` + `proxy.ts` |
| HSTS (prod), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, `poweredByHeader: false` | `next.config.ts` |
| Rate limiting Better Auth (stockage base) + règles renforcées sur endpoints sensibles | `lib/auth/auth.ts` |
| CSRF / origin check Better Auth actifs, `trustedOrigins` explicites, cookies `httpOnly` `secure` `sameSite=lax` | `lib/auth/auth.ts` |
| Vérification d'email obligatoire, révocation des sessions au reset, tokens magic link hachés, expirations courtes | `lib/auth/auth.ts` |
| Messages génériques (anti-énumération) sur reset / magic link | pages auth |
| Validation zod côté client et serveur (formulaires, actions, env) | `lib/validations/auth.ts`, `lib/env.ts` |
| Signature + idempotence des webhooks Stripe ; corps brut ; `/api` hors proxy | `app/api/stripe/webhook/route.ts` |
| Server actions : `requireSession()` systématique, `allowedOrigins`, `bodySizeLimit` | `lib/stripe/actions.ts`, `next.config.ts` |
| `server-only` sur tous les modules serveur (db, auth, stripe, email, env serveur) | `lib/*` |
| Secrets uniquement en variables d'env ; `.env*` ignorés ; hook git pre-commit bloquant `sk_live`/`rk_live` | `.githooks/pre-commit`, script `prepare` |
| `dangerouslyAllowLocalIP` non activé, `images.remotePatterns` vide par défaut | `next.config.ts` |

## 9. Tests

- Vitest (`npm test`) : mapping Stripe → Subscription, dispatch des webhooks (avec doubles pour la DB), schémas zod des formulaires, construction de la CSP.
- Vérification manuelle : `next build` (types + lint), migrations sur Postgres Docker, parcours signup → vérification → login → magic link → reset via les liens logués en console, webhook via `stripe listen` / `stripe trigger` si la CLI est authentifiée.

## 10. Outils de dev

- `docker-compose.yml` : Postgres 17, port paramétrable `POSTGRES_PORT`.
- Scripts npm : `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `db:generate`, `db:migrate`, `db:push`, `db:studio`, `email:dev`, `stripe:listen`, `prepare` (hooks git).
- `.env.example` documenté.

## 11. Hypothèses prises en mode autonome

1. Langue de l'interface et des emails : français.
2. Pas de fournisseur OAuth (Google, GitHub…) : ajout trivial dans `socialProviders`.
3. Pas de 2FA, d'organisations ni d'admin.
4. Un seul abonnement par utilisateur ; les plans sont définis dans `config/billing.ts` avec des price IDs en variables d'env.
5. Checkout hébergé par Stripe (redirection), pas de Payment Element embarqué.
6. Longueur minimale de mot de passe : 12 caractères (constante modifiable).
7. Les formulaires appellent `authClient` côté client (rate limiting et CSRF Better Auth appliqués) ; les opérations Stripe passent par des server actions.
8. Stockage du rate limit en base (pas de Redis).
9. Pas de page `/pricing` dédiée : la carte facturation du dashboard suffit au starter.
