import type { Metadata } from "next";
import Link from "next/link";

import { LegalArticle } from "@/components/legal/legal-article";
import { legalConfig } from "@/config/legal";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Mentions légales" };

export default function LegalPage() {
  const { publisher, host, publicationDirector } = legalConfig;

  return (
    <LegalArticle title="Mentions légales" lastUpdated={legalConfig.lastUpdated.legal}>
      <p>
        Conformément à l&apos;article 6-III de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans
        l&apos;économie numérique, les informations suivantes sont portées à la connaissance des utilisateurs du site{" "}
        <a href={siteConfig.url}>{siteConfig.url}</a> (ci-après « le Site »).
      </p>

      <h2>Éditeur du Site</h2>
      <ul>
        <li>
          <strong>Raison sociale :</strong> {publisher.name}
        </li>
        <li>
          <strong>Forme juridique :</strong> {publisher.legalForm}, au capital de {publisher.capital}
        </li>
        <li>
          <strong>Siège social :</strong> {publisher.address}
        </li>
        <li>
          <strong>Immatriculation :</strong> {publisher.registration}
        </li>
        <li>
          <strong>Numéro de TVA intracommunautaire :</strong> {publisher.vatNumber}
        </li>
        <li>
          <strong>Email :</strong> <a href={`mailto:${publisher.email}`}>{publisher.email}</a>
        </li>
        <li>
          <strong>Téléphone :</strong> {publisher.phone}
        </li>
      </ul>

      <h2>Directeur de la publication</h2>
      <p>{publicationDirector}</p>

      <h2>Hébergement</h2>
      <p>Le Site est hébergé par :</p>
      <ul>
        <li>
          <strong>Nom :</strong> {host.name}
        </li>
        <li>
          <strong>Adresse :</strong> {host.address}
        </li>
        <li>
          <strong>Téléphone :</strong> {host.phone}
        </li>
        <li>
          <strong>Site web :</strong> <a href={host.url}>{host.url}</a>
        </li>
      </ul>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des éléments composant le Site (textes, graphismes, logos, icônes, logiciels, bases de données)
        est protégé par le droit de la propriété intellectuelle et reste la propriété exclusive de l&apos;éditeur ou de
        ses partenaires. Toute reproduction, représentation, modification ou exploitation, totale ou partielle, sans
        autorisation écrite préalable est interdite, à l&apos;exception des usages strictement privés.
      </p>

      <h2>Données personnelles et cookies</h2>
      <p>
        Les conditions de traitement de vos données personnelles et l&apos;usage des cookies sont décrits dans notre{" "}
        <Link href={siteConfig.links.privacy}>politique de confidentialité</Link>.
      </p>

      <h2>Conditions d&apos;utilisation</h2>
      <p>
        L&apos;utilisation du Site est régie par nos{" "}
        <Link href={siteConfig.links.terms}>conditions générales d&apos;utilisation</Link>.
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question relative au Site, vous pouvez nous écrire à{" "}
        <a href={`mailto:${publisher.email}`}>{publisher.email}</a>.
      </p>
    </LegalArticle>
  );
}
