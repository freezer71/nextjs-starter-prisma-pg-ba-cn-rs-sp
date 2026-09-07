/**
 * Constantes d'authentification partagées client / serveur.
 * Modifier ici pour ajuster la politique de mots de passe ou les redirections.
 */
export const authConfig = {
  /**
   * Préfixe des cookies Better Auth. Propre au projet pour ne pas entrer en collision
   * avec une autre application sur le même hôte (ex. plusieurs projets sur localhost).
   */
  cookiePrefix: "starter",
  /** Longueur minimale des mots de passe (appliquée côté client et par Better Auth). */
  passwordMinLength: 12,
  passwordMaxLength: 128,
  /** Durées en secondes. */
  sessionExpiresIn: 60 * 60 * 24 * 7, // 7 jours
  sessionUpdateAge: 60 * 60 * 24, // rafraîchissement quotidien
  /**
   * Durée du cache de session en cookie. Pendant cette durée, une session révoquée en base
   * (déconnexion à distance, reset de mot de passe) reste utilisable : garder une valeur courte.
   */
  sessionCookieCacheMaxAge: 60, // 1 minute
  verificationTokenExpiresIn: 60 * 60, // 1 heure
  resetPasswordTokenExpiresIn: 60 * 30, // 30 minutes
  magicLinkExpiresIn: 60 * 5, // 5 minutes
  routes: {
    login: "/login",
    signup: "/signup",
    verifyEmail: "/verify-email",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    magicLink: "/magic-link",
    /** Destination après connexion. */
    afterLogin: "/dashboard",
    /** Destination après déconnexion. */
    afterLogout: "/login",
  },
  /** Préfixes de routes réservées aux utilisateurs connectés (utilisés par proxy.ts). */
  protectedPrefixes: ["/dashboard"],
} as const;
