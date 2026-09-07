import type { NextConfig } from "next";

import { securityHeaders } from "./lib/security/headers";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Ne révèle pas la technologie utilisée.
  poweredByHeader: false,
  // Vérification des `href` de <Link> et des `router.push` à la compilation.
  typedRoutes: true,
  images: {
    // Aucun domaine distant autorisé par défaut : ajouter ici les hôtes d'images externes.
    remotePatterns: [],
  },
  experimental: {
    serverActions: {
      // Taille maximale du corps des Server Actions (1 Mo par défaut).
      bodySizeLimit: "1mb",
      // Origines supplémentaires autorisées à invoquer les Server Actions (reverse proxy, preview...).
      allowedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",").map((o) => o.trim().replace(/^https?:\/\//, "")) ?? [],
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders({ isProduction }),
      },
    ];
  },
};

export default nextConfig;
