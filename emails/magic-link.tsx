import { Text } from "react-email";

import { EmailButton } from "./components/email-button";
import { EmailFallbackLink } from "./components/email-fallback-link";
import { EmailLayout } from "./components/email-layout";

export type MagicLinkEmailProps = {
  url: string;
};

export default function MagicLinkEmail({ url }: MagicLinkEmailProps) {
  return (
    <EmailLayout preview="Votre lien de connexion" heading="Votre lien de connexion">
      <Text className="text-base text-brand">
        Cliquez sur le bouton ci-dessous pour vous connecter. Ce lien est à usage unique et expire dans 5 minutes.
      </Text>
      <EmailButton href={url}>Me connecter</EmailButton>
      <EmailFallbackLink href={url} />
    </EmailLayout>
  );
}

MagicLinkEmail.PreviewProps = {
  url: "http://localhost:3000/api/auth/magic-link/verify?token=exemple",
} satisfies MagicLinkEmailProps;
