import { z } from "zod";

import { authConfig } from "@/config/auth";

/**
 * Schémas de validation des formulaires d'authentification.
 * Utilisés côté client (retour immédiat) ; Better Auth revalide côté serveur.
 */

export const emailSchema = z
  .string()
  .trim()
  .min(1, "L'adresse email est requise.")
  .email("Adresse email invalide.")
  .max(254, "Adresse email trop longue.");

export const passwordSchema = z
  .string()
  .min(authConfig.passwordMinLength, `Le mot de passe doit contenir au moins ${authConfig.passwordMinLength} caractères.`)
  .max(authConfig.passwordMaxLength, `Le mot de passe ne peut pas dépasser ${authConfig.passwordMaxLength} caractères.`);

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Le nom doit contenir au moins 2 caractères.")
  .max(80, "Le nom ne peut pas dépasser 80 caractères.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis."),
});

export const signupSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const emailOnlySchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type EmailOnlyInput = z.infer<typeof emailOnlySchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/** Transforme les erreurs zod en dictionnaire `champ → message` pour l'affichage. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in result)) result[key] = issue.message;
  }
  return result;
}
