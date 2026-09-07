import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type SubmitButtonProps = {
  pending: boolean;
  children: ReactNode;
};

/** Bouton de soumission avec état de chargement. */
export function SubmitButton({ pending, children }: SubmitButtonProps) {
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Spinner data-icon="inline-start" aria-hidden="true" /> : null}
      {children}
    </Button>
  );
}
