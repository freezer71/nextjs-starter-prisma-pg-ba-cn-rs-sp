// Build Vercel : génère le client Prisma, construit l'application, puis applique
// les migrations (`prisma migrate deploy`). Lancé automatiquement par Vercel via le
// script npm `vercel-build`, sauf si une « Build Command » est définie dans le dashboard.
//
// Ordre volontaire : le build passe avant la migration. Si `next build` échoue, la base
// reste intacte ; si la migration échoue, le déploiement échoue et n'est pas promu.
// Écrire des migrations rétrocompatibles (expand / contract) : l'ancienne version reste
// en ligne jusqu'à la promotion du nouveau déploiement.
//
// Migrations selon VERCEL_ENV :
// - production : toujours (échec = build en échec) ;
// - preview    : seulement si MIGRATE_ON_PREVIEW=1 (base dédiée ou branche Neon par preview),
//                pour ne jamais migrer la base de production depuis une branche ;
// - hors Vercel (build local) : jamais.
import { spawnSync } from "node:child_process";

function run(command, args) {
  console.log(`\n▶ ${command} ${args.join(" ")}`);
  const { status } = spawnSync(command, args, { stdio: "inherit" });
  if (status !== 0) process.exit(status ?? 1);
}

const vercelEnv = process.env.VERCEL_ENV;
const shouldMigrate =
  vercelEnv === "production" || (vercelEnv === "preview" && process.env.MIGRATE_ON_PREVIEW === "1");

if (shouldMigrate && !process.env.DIRECT_URL && !process.env.DATABASE_URL_UNPOOLED && !process.env.DATABASE_URL) {
  console.error("✖ Aucune URL de base (DIRECT_URL, DATABASE_URL_UNPOOLED ou DATABASE_URL) : migration impossible.");
  process.exit(1);
}

// Le cache de dépendances Vercel peut sauter le postinstall : on régénère explicitement.
run("npx", ["prisma", "generate"]);
run("npx", ["next", "build"]);

if (shouldMigrate) {
  run("npx", ["prisma", "migrate", "deploy"]);
} else {
  console.log(`\nℹ Migrations ignorées (VERCEL_ENV=${vercelEnv ?? "non défini"}).`);
}
