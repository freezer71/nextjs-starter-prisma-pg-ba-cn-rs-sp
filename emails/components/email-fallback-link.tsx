import { Link, Text } from "react-email";

/** Lien texte de secours si le bouton n'est pas cliquable. */
export function EmailFallbackLink({ href }: { href: string }) {
  return (
    <Text className="mt-6 text-xs text-muted">
      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :{" "}
      <Link href={href} className="break-all text-brand underline">
        {href}
      </Link>
    </Text>
  );
}
