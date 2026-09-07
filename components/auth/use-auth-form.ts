"use client";

import { useState, useTransition } from "react";
import type { z } from "zod";

import { fieldErrors } from "@/lib/validations/auth";

type Errors = Record<string, string>;

/**
 * Petit hook partagé par les formulaires d'authentification :
 * validation zod à la soumission, erreurs par champ, erreur globale et état de chargement.
 */
export function useAuthForm<TSchema extends z.ZodType>(schema: TSchema) {
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(onValid: (data: z.infer<TSchema>) => Promise<void>) {
    return (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError(null);
      const raw = Object.fromEntries(new FormData(event.currentTarget));
      const parsed = schema.safeParse(raw);
      if (!parsed.success) {
        setErrors(fieldErrors(parsed.error));
        return;
      }
      setErrors({});
      startTransition(async () => {
        try {
          await onValid(parsed.data);
        } catch (error) {
          console.error(error);
          setFormError("Une erreur inattendue est survenue. Réessayez dans un instant.");
        }
      });
    };
  }

  return { errors, formError, setFormError, pending, handleSubmit };
}

/** Message d'erreur générique retourné par Better Auth, traduit pour l'utilisateur. */
export function translateAuthError(code: string | undefined, fallback: string): string {
  switch (code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "Email ou mot de passe incorrect.";
    case "EMAIL_NOT_VERIFIED":
      return "Votre adresse email n'est pas encore vérifiée.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "Un compte existe déjà avec cette adresse email.";
    case "PASSWORD_TOO_SHORT":
      return "Le mot de passe est trop court.";
    case "PASSWORD_TOO_LONG":
      return "Le mot de passe est trop long.";
    case "PASSWORD_COMPROMISED":
      return "Ce mot de passe apparaît dans une fuite de données connue. Choisissez-en un autre.";
    case "INVALID_TOKEN":
    case "TOKEN_EXPIRED":
      return "Ce lien est invalide ou a expiré.";
    default:
      return fallback;
  }
}
