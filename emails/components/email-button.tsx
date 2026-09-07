import { Button } from "react-email";
import type { ReactNode } from "react";

/** Bouton d'action principal (lien) d'un email. */
export function EmailButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button
      href={href}
      className="box-border block rounded-md bg-brand px-5 py-3 text-center text-sm font-medium text-brand-foreground no-underline"
    >
      {children}
    </Button>
  );
}
