/**
 * Informations légales du site : à compléter pour chaque projet.
 *
 * Ces valeurs alimentent les pages /legal (mentions légales), /privacy (politique de
 * confidentialité) et /terms (CGU / CGV). Les textes des pages sont génériques : faites-les
 * valider par un conseil juridique avant mise en production, et mettez à jour `lastUpdated`
 * à chaque modification.
 *
 * Rappel : si vous ajoutez des traceurs non exemptés (mesure d'audience non anonymisée,
 * publicité, réseaux sociaux), un bandeau de consentement devient obligatoire et la section
 * « Cookies » de la politique de confidentialité doit être adaptée.
 */

export type Subprocessor = {
  name: string;
  /** Ce que le prestataire fait pour vous. */
  purpose: string;
  /** Pays ou zone d'hébergement / de traitement. */
  location: string;
  /** Garantie encadrant un éventuel transfert hors UE (à vérifier dans le DPA du prestataire). */
  safeguard: string;
  url: string;
};

export const legalConfig = {
  /** Dates de dernière mise à jour affichées en tête de chaque page (format ISO). */
  lastUpdated: {
    legal: "2026-09-07",
    privacy: "2026-09-07",
    terms: "2026-09-07",
  },

  /** Éditeur du site (art. 6-III de la loi pour la confiance dans l'économie numérique). */
  publisher: {
    name: "[Raison sociale]",
    legalForm: "[SAS / SARL / EI / association…]",
    capital: "[Capital social, ex. 1 000 €]",
    address: "[Adresse complète du siège social]",
    /** Numéro RCS ou SIREN (ou RNA pour une association). */
    registration: "[RCS Ville 000 000 000]",
    vatNumber: "[FR00 000 000 000]",
    email: "contact@example.com",
    phone: "[+33 0 00 00 00 00]",
  },

  /** Directeur ou directrice de la publication (en général le représentant légal). */
  publicationDirector: "[Prénom Nom]",

  /** Hébergeur du site (obligatoire dans les mentions légales). */
  host: {
    name: "[Nom de l'hébergeur, ex. Vercel Inc.]",
    address: "[Adresse de l'hébergeur]",
    phone: "[Téléphone de l'hébergeur]",
    url: "https://example.com",
  },

  /** Point de contact pour les questions de données personnelles et l'exercice des droits. */
  privacyContact: {
    email: "privacy@example.com",
    postalAddress: "[Adresse postale pour l'exercice des droits]",
  },

  /** Délégué à la protection des données, si désigné (art. 37 RGPD). */
  dpo: {
    designated: false,
    name: "",
    email: "",
  },

  /** Durées de conservation affichées dans la politique de confidentialité. */
  retention: {
    account: "pendant toute la durée de votre compte, puis 3 ans en archivage intermédiaire",
    billing: "10 ans à compter de la clôture de l'exercice comptable (art. L123-22 du Code de commerce)",
    securityLogs: "12 mois",
    support: "3 ans après le dernier contact",
  },

  /** Sous-traitants ayant accès à des données personnelles (art. 28 RGPD). */
  subprocessors: [
    {
      name: "[Hébergeur de l'application]",
      purpose: "Hébergement de l'application et de la base de données",
      location: "[Union européenne / États-Unis…]",
      safeguard: "[Décision d'adéquation, clauses contractuelles types…]",
      url: "https://example.com",
    },
    {
      name: "Stripe",
      purpose: "Traitement des paiements et gestion des abonnements",
      location: "Union européenne et États-Unis",
      safeguard: "Data Privacy Framework UE–États-Unis et clauses contractuelles types",
      url: "https://stripe.com/fr/privacy",
    },
    {
      name: "Resend",
      purpose: "Envoi des emails transactionnels (confirmation d'adresse, réinitialisation de mot de passe, lien de connexion)",
      location: "États-Unis",
      safeguard: "Clauses contractuelles types de la Commission européenne",
      url: "https://resend.com/legal/privacy-policy",
    },
  ] satisfies Subprocessor[],

  /**
   * Médiateur de la consommation (obligatoire pour un professionnel vendant à des consommateurs,
   * art. L612-1 du Code de la consommation). Laisser `null` si non applicable.
   */
  consumerMediator: {
    name: "[Nom du médiateur]",
    url: "https://example.com",
    address: "[Adresse du médiateur]",
  } as { name: string; url: string; address: string } | null,

  /** Droit applicable et juridiction compétente. */
  governingLaw: "droit français",
  jurisdiction: "[Tribunaux compétents, ex. tribunaux de Paris]",
} as const;

export type LegalConfig = typeof legalConfig;
