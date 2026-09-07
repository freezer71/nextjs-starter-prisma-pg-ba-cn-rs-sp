import { AppHeader } from "@/components/app/app-header";

/**
 * Layout de l'espace connecté. Il n'assure PAS la protection des routes :
 * chaque page appelle `requireSession()` (les layouts ne se re-rendent pas à chaque navigation).
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8">{children}</main>
    </div>
  );
}
