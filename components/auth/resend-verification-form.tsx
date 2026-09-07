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

type ResendVerificationFormProps = {
  defaultEmail?: string;
};

export function ResendVerificationForm({ defaultEmail }: ResendVerificationFormProps) {
  const { errors, formError, setFormError, pending, handleSubmit } = useAuthForm(emailOnlySchema);
  const [sent, setSent] = useState(false);

  const onSubmit = handleSubmit(async ({ email }) => {
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: authConfig.routes.verifyEmail,
    });
    if (error?.status === 429) {
      setFormError("Trop de tentatives. Patientez une minute avant de réessayer.");
      return;
    }
    setSent(true);
  });

  if (sent) {
    return (
      <FormMessage
        variant="success"
        title="Email envoyé"
        description="Si un compte non vérifié est associé à cette adresse, un nouveau lien de confirmation vient d'être envoyé."
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {formError ? <FormMessage variant="error" title={formError} /> : null}
      <FieldGroup>
        <Field data-invalid={Boolean(errors.email) || undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" defaultValue={defaultEmail} required aria-invalid={Boolean(errors.email) || undefined} />
          <FieldError>{errors.email}</FieldError>
        </Field>
      </FieldGroup>
      <SubmitButton pending={pending}>Renvoyer le lien de confirmation</SubmitButton>
    </form>
  );
}
