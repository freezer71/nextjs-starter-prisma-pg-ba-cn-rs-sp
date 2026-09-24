import "dotenv/config";
import { defineConfig } from "prisma/config";

// Valeur de repli : permet `prisma generate` (postinstall) avant la création du .env.
// Les commandes qui touchent réellement la base échoueront proprement si l'URL est fausse.
const DEFAULT_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/starter?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // La CLI (migrate, studio…) exige une connexion directe : un pooler en mode transaction
    // (PgBouncer, Supavisor, Neon « -pooler ») casse les verrous et transactions des migrations.
    // DATABASE_URL_UNPOOLED est fournie automatiquement par l'intégration Neon de Vercel.
    url:
      process.env.DIRECT_URL ??
      process.env.DATABASE_URL_UNPOOLED ??
      process.env.DATABASE_URL ??
      DEFAULT_DATABASE_URL,
  },
});
