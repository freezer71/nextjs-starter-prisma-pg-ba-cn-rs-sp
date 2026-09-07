@AGENTS.md

# Starter Next.js — architecture en place

Starter réutilisable : Next.js 16 (App Router, Turbopack), Prisma 7 + Postgres, Better Auth, shadcn/ui (Base UI, Tailwind 4), Resend + React Email, Stripe. Interface et emails en français.

## Commandes

| Commande | Rôle |
|---|---|
| `npm run db:up` | Postgres local (Docker, port `POSTGRES_PORT`) |
| `npm run db:migrate` / `db:generate` / `db:studio` | Prisma (config dans `prisma.config.ts`) |
| `npm run dev` | Serveur de dev |
| `npm run typecheck` / `lint` / `test` / `build` | Vérifications (vitest pour la logique pure) |
| `npm run email:dev` | Prévisualisation des emails (`emails/`) |
| `npm run stripe:listen` / `stripe:smoke` | Webhook Stripe : CLI Stripe, ou test signé sans compte |
| `npm run auth:generate` | Régénère le schéma Prisma de Better Auth (après ajout d'un plugin ; retirer temporairement `import "server-only"` des modules chargés) |

## Arborescence

```
app/(auth)/*        login, signup, verify-email, forgot-password, reset-password, magic-link
app/(app)/*         espace connecté (dashboard) — chaque page appelle requireSession()
app/(legal)/*       pages légales publiques : legal (mentions), privacy (confidentialité), terms (CGU/CGV)
app/api/auth/[...all]  handler Better Auth
app/api/stripe/webhook route webhook (signature + idempotence)
app/theme.css       ★ tokens de couleur / radius : seul fichier à modifier pour le thème
config/             site.ts (nom, URL), auth.ts (politique mdp, routes), billing.ts (plans Stripe), legal.ts (éditeur, hébergeur, contact RGPD, sous-traitants, durées)
lib/env.ts          variables d'env validées (zod) — ajouter toute nouvelle variable ici
lib/db.ts           singleton Prisma (adapter pg) ; client généré dans lib/generated/prisma (ignoré par git)
lib/auth/           auth.ts (serveur), client.ts (authClient), session.ts (getSession / requireSession)
lib/email/send.ts   envoi Resend ; sans RESEND_API_KEY en dev, l'email est logué en console
lib/stripe/         client, customer (getOrCreateStripeCustomer), store, webhook-handlers, actions
lib/security/       csp.ts (CSP nonce), headers.ts (en-têtes HTTP)
lib/validations/    schémas zod des formulaires
emails/             templates React Email (imports depuis `react-email`)
components/ui       shadcn (Base UI) ; components/auth, components/app, components/billing, components/legal, site-footer.tsx
proxy.ts            CSP + redirections optimistes par cookie de session (remplace middleware.ts)
prisma/schema.prisma User/Session/Account/Verification/RateLimit (Better Auth) + Subscription + StripeWebhookEvent
```

## Flux clés

- **Auth** : formulaires client → `authClient` (rate limit + CSRF Better Auth). Email obligatoirement vérifié (`requireEmailVerification`), lien magique via plugin `magicLink`, reset avec révocation des sessions. La vraie protection est `requireSession()` dans les pages et server actions ; `proxy.ts` ne fait qu'une redirection optimiste.
- **Stripe** : customer créé à l'inscription (hook `databaseHooks.user.create.after`, non bloquant) ou à la demande ; `stripeCustomerId` sur `User`. Checkout / portail via server actions (`lib/stripe/actions.ts`). Webhook : corps brut → `constructEventAsync` → insertion `StripeWebhookEvent` (idempotence) → `handleStripeEvent`. Un abonnement par utilisateur.
- **Emails** : `sendEmail({ to, subject, react })` ; templates dans `emails/` avec layout commun.
- **Pages légales** : textes génériques en français rendus depuis `config/legal.ts` (placeholders `[…]` à remplir, dates `lastUpdated` à tenir à jour). Seuls des traceurs exemptés de consentement sont utilisés : ajouter un bandeau cookies si des outils d'analytics ou publicitaires sont introduits. Classe `prose` (`@tailwindcss/typography`) alignée sur les tokens du thème pour toute page de contenu.

## Conventions Next.js 16 à respecter

- `proxy.ts` et non `middleware.ts` ; runtime Node uniquement (pas d'`edge`).
- `params`, `searchParams`, `cookies()`, `headers()` sont asynchrones (`await`). Types `PageProps<"/route">` / `LayoutProps` globaux (régénérés par `next typegen`).
- `cacheComponents` désactivé : pas de `'use cache'`. Toute l'application est rendue dynamiquement (nonce CSP lu dans le root layout).
- `typedRoutes` activé : caster `as Route` pour les URL dynamiques ou externes.
- `redirect()` toujours hors d'un `try/catch`.
- Modules serveur : `import "server-only"` en tête (db, auth, stripe, email, env serveur).
- shadcn Base UI : `render={<Link />}` + `nativeButton={false}` au lieu d'`asChild` ; formulaires avec `Field`/`FieldGroup`/`FieldError` ; icônes lucide avec `data-icon="inline-start|inline-end"` ; tokens sémantiques uniquement (pas de couleurs brutes).

## Sécurité en place

CSP stricte avec nonce (`lib/security/csp.ts`, `proxy.ts`), en-têtes HTTP (`lib/security/headers.ts`), rate limiting Better Auth en base avec règles renforcées, `trustedOrigins` depuis l'env, cookies sécurisés, mots de passe ≥ 12 caractères + rejet des mots de passe compromis (plugin `haveIBeenPwned`), tokens magic link hachés, réponses génériques anti-énumération, validation zod client/serveur/env, signature + idempotence des webhooks, `requireSession()` dans chaque action, chemins de redirection internes seulement (`lib/safe-redirect.ts`), hook git `.githooks/pre-commit` bloquant les secrets et fichiers `.env`.

## Skills installés (`.claude/skills/`)

better-auth-best-practices, email-and-password-best-practices, better-auth-security-best-practices, shadcn, prisma-* (database-setup, client-api, cli, postgres), stripe-best-practices, resend, react-email, next-dev-loop, vercel-react-best-practices, vercel-composition-patterns. Mise à jour : `npx skills update`.
