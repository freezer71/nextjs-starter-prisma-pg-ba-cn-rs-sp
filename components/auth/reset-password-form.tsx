"use client";

import { useRouter } from "next/navigation";

import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { translateAuthError, useAuthForm } from "@/components/auth/use-auth-form";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authConfig } from "@/config/auth";
import { authClient } from "@/lib/auth/client";
import { resetPasswordSchema } from "@/lib/validations/auth";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const { errors, formError, setFormError, pending, handleSubmit } = useAuthForm(resetPasswordSchema);

  const onSubmit = handleSubmit(async ({ password }) => {
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    if (error) {
      setFormError(translateAuthError(error.code, "Impossible de réinitialiser le mot de passe. Le lien a peut-être expiré."));
      return;
    }
    // Les sessions sont révoquées en base ; on efface aussi le cookie local (cache de session)
    // pour que l'utilisateur repasse par la page de connexion.
    await authClient.signOut().catch(() => undefined);
    router.push(`${authConfig.routes.login}?reset=1`);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {formError ? <FormMessage variant="error" title={formError} /> : null}
      <FieldGroup>
        <Field data-invalid={Boolean(errors.password) || undefined}>
          <FieldLabel htmlFor="password">Nouveau mot de passe</FieldLabel>
          <Input id="password" name="password" type="password" autoComplete="new-password" required aria-invalid={Boolean(errors.password) || undefined} />
          {errors.password ? (
            <FieldError>{errors.password}</FieldError>
          ) : (
            <FieldDescription>Au moins {authConfig.passwordMinLength} caractères.</FieldDescription>
          )}
        </Field>
        <Field data-invalid={Boolean(errors.confirmPassword) || undefined}>
          <FieldLabel htmlFor="confirmPassword">Confirmer le mot de passe</FieldLabel>
          <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required aria-invalid={Boolean(errors.confirmPassword) || undefined} />
          <FieldError>{errors.confirmPassword}</FieldError>
        </Field>
      </FieldGroup>
      <SubmitButton pending={pending}>Enregistrer le mot de passe</SubmitButton>
    </form>
  );
}
