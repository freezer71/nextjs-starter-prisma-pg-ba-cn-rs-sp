import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { FormMessage } from "@/components/auth/form-message";
import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import { authConfig } from "@/config/auth";
import { redirectIfAuthenticated } from "@/lib/auth/session";
import { safeInternalPath } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage(props: PageProps<"/login">) {
  await redirectIfAuthenticated();
  const searchParams = await props.searchParams;
  const next = safeInternalPath(searchParams.next);
  const justReset = searchParams.reset === "1";

  return (
    <AuthCard
      title="Connexion"
      description="Connectez-vous avec votre email et votre mot de passe."
      footer={
        <>
          <p>
            Pas encore de compte ?{" "}
            <Link href={authConfig.routes.signup} className="text-foreground underline underline-offset-4">
              Créer un compte
            </Link>
          </p>
          <Button variant="link" render={<Link href={authConfig.routes.magicLink} />} nativeButton={false}>
            Se connecter avec un lien magique
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {justReset ? (
          <FormMessage variant="success" title="Mot de passe modifié" description="Vous pouvez maintenant vous connecter." />
        ) : null}
        <LoginForm next={next} />
      </div>
    </AuthCard>
  );
}
