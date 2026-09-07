"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { translateAuthError, useAuthForm } from "@/components/auth/use-auth-form";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authConfig } from "@/config/auth";
import { siteConfig } from "@/config/site";
import { authClient } from "@/lib/auth/client";
import { signupSchema } from "@/lib/validations/auth";

export function SignupForm() {
  const router = useRouter();
  const { errors, formError, setFormError, pending, handleSubmit } = useAuthForm(signupSchema);

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      // Page atteinte après le clic sur le lien de confirmation.
      callbackURL: authConfig.routes.verifyEmail,
    });
    if (error) {
      if (error.status === 429) {
        setFormError("Trop de tentatives. Patientez une minute avant de réessayer.");
        return;
      }
      setFormError(translateAuthError(error.code, "Impossible de créer le compte. Vérifiez les informations saisies."));
      return;
    }
    router.push(`${authConfig.routes.verifyEmail}?email=${encodeURIComponent(email)}`);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {formError ? <FormMessage variant="error" title={formError} /> : null}
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name) || undefined}>
          <FieldLabel htmlFor="name">Nom</FieldLabel>
          <Input id="name" name="name" autoComplete="name" required aria-invalid={Boolean(errors.name) || undefined} />
          <FieldError>{errors.name}</FieldError>
        </Field>
        <Field data-invalid={Boolean(errors.email) || undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(errors.email) || undefined} />
          <FieldError>{errors.email}</FieldError>
        </Field>
        <Field data-invalid={Boolean(errors.password) || undefined}>
          <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
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
      <SubmitButton pending={pending}>Créer mon compte</SubmitButton>
      <p className="text-center text-xs text-muted-foreground">
        En créant un compte, vous acceptez nos{" "}
        <Link href={siteConfig.links.terms} className="underline underline-offset-4 hover:text-foreground">
          conditions d&apos;utilisation
        </Link>{" "}
        et notre{" "}
        <Link href={siteConfig.links.privacy} className="underline underline-offset-4 hover:text-foreground">
          politique de confidentialité
        </Link>
        .
      </p>
    </form>
  );
}
