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
    url: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
  },
});
