# Starter Next.js 16

Next.js 16 · Prisma 7 + Postgres · Better Auth · shadcn/ui · Resend + React Email · Stripe.

## Démarrage

```bash
cp .env.example .env            # puis renseigner BETTER_AUTH_SECRET (openssl rand -base64 32)
npm install                     # génère aussi le client Prisma
npm run db:up                   # Postgres local (Docker)
npm run db:migrate              # applique les migrations
npm run dev                     # http://localhost:3000
```

Sans `RESEND_API_KEY`, les emails (vérification, reset, lien magique) sont affichés dans la console du serveur avec leur lien : tous les parcours sont testables sans compte Resend.

## Stripe

1. Renseigner `STRIPE_SECRET_KEY` (clé restreinte `rk_` recommandée) et `STRIPE_PRICE_PRO_MONTHLY` (Price d'un Product en mode abonnement).
2. En développement : `npm run stripe:listen` puis copier le secret `whsec_...` affiché dans `STRIPE_WEBHOOK_SECRET`.
3. En production : créer un endpoint webhook vers `/api/stripe/webhook` abonné aux événements listés dans `HANDLED_STRIPE_EVENTS` (`lib/stripe/webhook-handlers.ts`).
4. `npm run stripe:smoke` envoie des événements signés au serveur local pour vérifier la route sans compte Stripe.

Pensez à Stripe Tax si vous facturez des clients UE/US (`automatic_tax` nécessite une immatriculation active).

## Déploiement Vercel

Le script `vercel-build` (détecté automatiquement par Vercel, ne pas définir de « Build Command » dans le dashboard) exécute `prisma generate`, `next build`, puis `prisma migrate deploy` :

- **Production** : migrations appliquées à chaque déploiement ; un échec fait échouer le build (le déploiement n'est pas promu).
- **Preview** : migrations ignorées, sauf si `MIGRATE_ON_PREVIEW=1` (base propre à chaque preview, ex. branches Neon). Ne jamais pointer une preview vers la base de production avec cette option.
- **Pooler** : si `DATABASE_URL` passe par un pooler (Supabase `:6543`, Neon `-pooler`), renseigner `DIRECT_URL` (connexion directe) pour les migrations. `DATABASE_URL_UNPOOLED` (intégration Neon) est pris en compte automatiquement.

Les migrations s'appliquent avant la mise en ligne de la nouvelle version, pendant que l'ancienne tourne encore : les écrire rétrocompatibles (ajouter d'abord, supprimer dans un déploiement ultérieur). Variables à définir sur Vercel : celles de `.env.example`, avec `NEXT_PUBLIC_APP_URL` sur l'URL de production.

## Personnaliser

- Thème : `app/theme.css` (couleurs oklch, `--radius`). Nom, URL, contact : `config/site.ts`.
- Politique de mots de passe, routes d'auth : `config/auth.ts`. Plans : `config/billing.ts`.
- Nouvelle variable d'environnement : `lib/env.ts` + `.env.example`.
- Emails : `emails/` (`npm run email:dev` pour la prévisualisation).
- Pages légales (`/legal`, `/privacy`, `/terms`) : remplir `config/legal.ts` (éditeur, hébergeur, contact RGPD, sous-traitants) et faire valider les textes par un conseil juridique.

## Scripts

`dev`, `build`, `vercel-build`, `start`, `lint`, `typecheck`, `test`, `db:*`, `auth:generate`, `email:dev`, `stripe:listen`, `stripe:smoke`.

Voir `CLAUDE.md` pour l'architecture détaillée et les conventions.
