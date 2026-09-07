import type { ReactNode } from "react";

type LegalArticleProps = {
  title: string;
  /** Date ISO (AAAA-MM-JJ) de dernière mise à jour. */
  lastUpdated: string;
  children: ReactNode;
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "UTC" });

/** Gabarit d'une page légale : titre, date de mise à jour, contenu en `prose`. */
export function LegalArticle({ title, lastUpdated, children }: LegalArticleProps) {
  return (
    <article className="prose max-w-none">
      <h1>{title}</h1>
      <p className="lead">
        Dernière mise à jour : <time dateTime={lastUpdated}>{dateFormatter.format(new Date(lastUpdated))}</time>
      </p>
      {children}
    </article>
  );
}
