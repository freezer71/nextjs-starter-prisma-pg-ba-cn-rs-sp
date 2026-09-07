import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Tailwind, Text } from "react-email";
import type { ReactNode } from "react";

import { siteConfig } from "@/config/site";

import { emailTailwindConfig } from "../tailwind.config";

type EmailLayoutProps = {
  /** Texte d'aperçu affiché dans la boîte de réception. */
  preview: string;
  heading: string;
  children: ReactNode;
};

/** Gabarit commun à tous les emails transactionnels. */
export function EmailLayout({ preview, heading, children }: EmailLayoutProps) {
  return (
    <Html lang="fr">
      <Tailwind config={emailTailwindConfig}>
        <Head />
        <Body className="bg-canvas font-sans">
          <Preview>{preview}</Preview>
          <Container className="mx-auto my-10 max-w-[480px] rounded-lg bg-surface p-8">
            <Text className="m-0 text-sm font-semibold text-muted">{siteConfig.name}</Text>
            <Heading as="h1" className="mt-4 mb-6 text-2xl font-semibold text-brand">
              {heading}
            </Heading>
            <Section>{children}</Section>
            <Hr className="my-8 border-solid border-border" />
            <Text className="m-0 text-xs text-muted">
              Vous recevez cet email car une action a été demandée sur {siteConfig.name}. Si vous n&apos;êtes pas
              à l&apos;origine de cette demande, ignorez ce message.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
