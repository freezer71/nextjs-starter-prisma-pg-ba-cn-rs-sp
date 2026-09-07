import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { FormMessage } from "@/components/auth/form-message";
import { MagicLinkForm } from "@/components/auth/magic-link-form";
import { authConfig } from "@/config/auth";
import { redirectIfAuthenticated } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Connexion par lien magique" };

/** Better Auth redirige ici avec `?error=` si le lien est invalide ou expiré. */
export default async function MagicLinkPage(props: PageProps<"/magic-link">) {
  await redirectIfAuthenticated();
  const searchParams = await props.searchParams;
  const error = typeof searchParams.error === "string" ? searchParams.error : undefined;

  return (
    <AuthCard
      title="Lien magique"
      description="Recevez un lien de connexion par email, sans mot de passe."
      footer={
        <Link href={authConfig.routes.login} className="text-foreground underline underline-offset-4">
          Se connecter avec un mot de passe
        </Link>
      }
    >
      <div className="flex flex-col gap-6">
        {error ? <FormMessage variant="error" title="Ce lien est invalide ou a expiré. Demandez-en un nouveau." /> : null}
        <MagicLinkForm />
      </div>
    </AuthCard>
  );
}
