"use client";

import { useState } from "react";

import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { useAuthForm } from "@/components/auth/use-auth-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authConfig } from "@/config/auth";
import { authClient } from "@/lib/auth/client";
import { emailOnlySchema } from "@/lib/validations/auth";

export function MagicLinkForm() {
  const { errors, formError, setFormError, pending, handleSubmit } = useAuthForm(emailOnlySchema);
  const [sent, setSent] = useState(false);

  const onSubmit = handleSubmit(async ({ email }) => {
    const { error } = await authClient.signIn.magicLink({
      email,
      callbackURL: authConfig.routes.afterLogin,
      newUserCallbackURL: authConfig.routes.afterLogin,
      // Better Auth ajoute `?error=` à cette URL si le lien est invalide ou expiré.
      errorCallbackURL: authConfig.routes.magicLink,
    });
    if (error?.status === 429) {
      setFormError("Trop de tentatives. Patientez une minute avant de réessayer.");
      return;
    }
    // Réponse identique que le compte existe ou non (anti-énumération).
    setSent(true);
  });

  if (sent) {
    return (
      <FormMessage
        variant="success"
        title="Lien envoyé"
        description="Consultez votre boîte de réception et cliquez sur le lien pour vous connecter. Il expire dans 5 minutes."
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {formError ? <FormMessage variant="error" title={formError} /> : null}
      <FieldGroup>
        <Field data-invalid={Boolean(errors.email) || undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(errors.email) || undefined} />
          <FieldError>{errors.email}</FieldError>
        </Field>
      </FieldGroup>
      <SubmitButton pending={pending}>Recevoir un lien de connexion</SubmitButton>
    </form>
  );
}
