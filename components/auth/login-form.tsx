"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { TurnstileWidget, useTurnstile } from "@/components/auth/turnstile";
import { CAPTCHA_PENDING_MESSAGE, translateAuthError, useAuthForm } from "@/components/auth/use-auth-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authConfig } from "@/config/auth";
import { authClient } from "@/lib/auth/client";
import { loginSchema } from "@/lib/validations/auth";

type LoginFormProps = {
  /** Destination après connexion (paramètre `next`, limité aux chemins internes). */
  next?: string;
};

export function LoginForm({ next }: LoginFormProps) {
  const router = useRouter();
  const { errors, formError, setFormError, pending, handleSubmit } = useAuthForm(loginSchema);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const turnstile = useTurnstile();

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setUnverifiedEmail(null);
    if (!turnstile.ready) {
      setFormError(CAPTCHA_PENDING_MESSAGE);
      return;
    }
    const { error } = await authClient.signIn.email({ email, password, rememberMe: true, fetchOptions: turnstile.fetchOptions });
    turnstile.reset();
    if (error) {
      // Email non vérifié (Better Auth renvoie automatiquement un email de vérification).
      // Tester le code et non le statut : un échec du captcha est aussi un 403.
      if (error.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(email);
        return;
      }
      if (error.status === 429) {
        setFormError("Trop de tentatives. Patientez une minute avant de réessayer.");
        return;
      }
      setFormError(translateAuthError(error.code, "Email ou mot de passe incorrect."));
      return;
    }
    router.push((next ?? authConfig.routes.afterLogin) as Route);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {formError ? <FormMessage variant="error" title={formError} /> : null}
      {unverifiedEmail ? (
        <FormMessage
          variant="error"
          title="Adresse email non vérifiée"
          description="Un nouveau lien de confirmation vient de vous être envoyé. Vérifiez votre boîte de réception."
        />
      ) : null}
      <FieldGroup>
        <Field data-invalid={Boolean(errors.email) || undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(errors.email) || undefined} />
          <FieldError>{errors.email}</FieldError>
        </Field>
        <Field data-invalid={Boolean(errors.password) || undefined}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
            <Link href={authConfig.routes.forgotPassword} className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
          <Input id="password" name="password" type="password" autoComplete="current-password" required aria-invalid={Boolean(errors.password) || undefined} />
          <FieldError>{errors.password}</FieldError>
        </Field>
      </FieldGroup>
      <TurnstileWidget {...turnstile.widgetProps} />
      <SubmitButton pending={pending}>Se connecter</SubmitButton>
    </form>
  );
}
