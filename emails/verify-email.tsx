import { Text } from "react-email";

import { EmailButton } from "./components/email-button";
import { EmailFallbackLink } from "./components/email-fallback-link";
import { EmailLayout } from "./components/email-layout";

export type VerifyEmailProps = {
  name: string;
  url: string;
};

export default function VerifyEmail({ name, url }: VerifyEmailProps) {
  return (
    <EmailLayout preview="Confirmez votre adresse email" heading="Confirmez votre adresse email">
      <Text className="text-base text-brand">Bonjour {name},</Text>
      <Text className="text-base text-brand">
        Merci pour votre inscription. Cliquez sur le bouton ci-dessous pour confirmer votre adresse email et activer
        votre compte. Ce lien expire dans une heure.
      </Text>
      <EmailButton href={url}>Confirmer mon email</EmailButton>
      <EmailFallbackLink href={url} />
    </EmailLayout>
  );
}

VerifyEmail.PreviewProps = {
  name: "Marie",
  url: "http://localhost:3000/api/auth/verify-email?token=exemple",
} satisfies VerifyEmailProps;
