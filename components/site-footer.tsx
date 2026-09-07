import Link from "next/link";

import { siteConfig } from "@/config/site";

/** Pied de page commun aux pages publiques : liens légaux obligatoires. */
export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
        <nav aria-label="Informations légales" className="flex flex-wrap items-center justify-center gap-4">
          <Link href={siteConfig.links.legal} className="underline-offset-4 hover:text-foreground hover:underline">
            Mentions légales
          </Link>
          <Link href={siteConfig.links.privacy} className="underline-offset-4 hover:text-foreground hover:underline">
            Confidentialité
          </Link>
          <Link href={siteConfig.links.terms} className="underline-offset-4 hover:text-foreground hover:underline">
            Conditions d&apos;utilisation
          </Link>
        </nav>
      </div>
    </footer>
  );
}
