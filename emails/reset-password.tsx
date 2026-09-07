import { Text } from "react-email";

import { EmailButton } from "./components/email-button";
import { EmailFallbackLink } from "./components/email-fallback-link";
import { EmailLayout } from "./components/email-layout";

export type ResetPasswordEmailProps = {
  name: string;
  url: string;
};

export default function ResetPasswordEmail({ name, url }: ResetPasswordEmailProps) {
  return (
    <EmailLayout preview="Réinitialisez votre mot de passe" heading="Réinitialisation du mot de passe">
      <Text className="text-base text-brand">Bonjour {name},</Text>
      <Text className="text-base text-brand">
        Une demande de réinitialisation de mot de passe a été effectuée pour votre compte. Cliquez sur le bouton
        ci-dessous pour choisir un nouveau mot de passe. Ce lien expire dans 30 minutes.
      </Text>
      <EmailButton href={url}>Choisir un nouveau mot de passe</EmailButton>
      <EmailFallbackLink href={url} />
    </EmailLayout>
  );
}

ResetPasswordEmail.PreviewProps = {
  name: "Marie",
  url: "http://localhost:3000/reset-password?token=exemple",
} satisfies ResetPasswordEmailProps;
