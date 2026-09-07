import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

/** Layout des pages légales (publiques). */
export default function LegalLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold">
          {siteConfig.name}
        </Link>
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" render={<Link href="/login" />} nativeButton={false}>
            Connexion
          </Button>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">{children}</main>
      <SiteFooter />
    </div>
  );
}
