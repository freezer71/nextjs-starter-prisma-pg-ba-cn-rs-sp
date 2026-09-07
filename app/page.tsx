import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function HomePage() {
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
          <Button render={<Link href="/signup" />} nativeButton={false}>
            Créer un compte
          </Button>
        </nav>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">{siteConfig.name}</h1>
        <p className="max-w-xl text-lg text-muted-foreground">{siteConfig.description}</p>
        <Button size="lg" render={<Link href="/signup" />} nativeButton={false}>
          Commencer
          <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
        </Button>
      </main>
      <SiteFooter />
    </div>
  );
}
