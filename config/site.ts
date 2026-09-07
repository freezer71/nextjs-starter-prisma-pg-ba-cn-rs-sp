/**
 * Configuration générale du site : à adapter pour chaque nouveau projet.
 * Utilisée par les métadonnées, les emails et l'en-tête.
 */
export const siteConfig = {
  name: "Starter",
  description: "Starter Next.js avec Prisma, Better Auth, shadcn/ui, Resend et Stripe.",
  // URL publique (sans slash final), utilisée pour les liens absolus dans les emails.
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  // Adresse de contact affichée dans les emails.
  supportEmail: "support@example.com",
  /** Pages légales (voir config/legal.ts pour leur contenu). */
  links: {
    legal: "/legal",
    privacy: "/privacy",
    terms: "/terms",
  },
} as const;

export type SiteConfig = typeof siteConfig;
