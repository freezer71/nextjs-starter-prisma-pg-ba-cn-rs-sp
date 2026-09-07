import Link from "next/link";

import { UserMenu } from "@/components/app/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/config/site";
import { getSession } from "@/lib/auth/session";

/** En-tête de l'espace connecté. La session est mémoïsée : aucun appel DB supplémentaire. */
export async function AppHeader() {
  const session = await getSession();

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/dashboard" className="font-semibold">
          {siteConfig.name}
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session ? <UserMenu user={session.user} /> : null}
        </div>
      </div>
    </header>
  );
}
