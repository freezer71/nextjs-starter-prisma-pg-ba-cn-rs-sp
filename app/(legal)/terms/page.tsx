import type { Metadata } from "next";
import Link from "next/link";

import { LegalArticle } from "@/components/legal/legal-article";
import { legalConfig } from "@/config/legal";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Conditions générales d'utilisation" };

export default function TermsPage() {
  const { publisher, consumerMediator, governingLaw, jurisdiction } = legalConfig;

  return (
    <LegalArticle title="Conditions générales d'utilisation et de vente" lastUpdated={legalConfig.lastUpdated.terms}>
      <p>
        Les présentes conditions générales (« CGU ») régissent l&apos;accès et l&apos;utilisation du service{" "}
        {siteConfig.name} (« le Service ») édité par {publisher.name} (« l&apos;Éditeur »), accessible à l&apos;adresse{" "}
        <a href={siteConfig.url}>{siteConfig.url}</a>. Elles s&apos;appliquent à toute personne utilisant le Service
        (« l&apos;Utilisateur »).
      </p>

      <h2>1. Acceptation</h2>
      <p>
        La création d&apos;un compte et l&apos;utilisation du Service impliquent l&apos;acceptation pleine et entière
        des présentes CGU et de la <Link href={siteConfig.links.privacy}>politique de confidentialité</Link>. Si vous
        n&apos;acceptez pas ces conditions, vous ne devez pas utiliser le Service.
      </p>

      <h2>2. Description du Service</h2>
      <p>
        Le Service est une application en ligne accessible via un navigateur web. L&apos;Éditeur peut faire évoluer
        les fonctionnalités du Service à tout moment, sans en dégrader substantiellement les caractéristiques
        essentielles pour les Utilisateurs disposant d&apos;un abonnement en cours.
      </p>

      <h2>3. Compte utilisateur</h2>
      <p>
        L&apos;accès au Service nécessite la création d&apos;un compte avec une adresse email valide. L&apos;Utilisateur
        s&apos;engage à fournir des informations exactes, à les maintenir à jour et à préserver la confidentialité de
        ses identifiants. Toute action réalisée depuis son compte est réputée effectuée par lui. En cas
        d&apos;utilisation non autorisée de son compte, l&apos;Utilisateur doit en informer l&apos;Éditeur sans délai
        à <a href={`mailto:${publisher.email}`}>{publisher.email}</a>.
      </p>

      <h2>4. Abonnement, prix et paiement</h2>
      <p>
        Certaines fonctionnalités du Service sont accessibles dans le cadre d&apos;un abonnement payant. Les prix sont
        indiqués en euros, toutes taxes comprises, et affichés avant toute souscription. Le paiement est réalisé par
        l&apos;intermédiaire de notre prestataire Stripe ; l&apos;Éditeur ne conserve aucune donnée bancaire.
      </p>
      <p>
        L&apos;abonnement est reconduit tacitement à chaque échéance (mensuelle ou annuelle selon la formule choisie)
        jusqu&apos;à sa résiliation. En cas d&apos;échec de paiement, l&apos;accès aux fonctionnalités payantes peut
        être suspendu après notification. L&apos;Éditeur peut modifier ses tarifs ; toute modification est notifiée au
        moins 30 jours avant son application et ne s&apos;applique qu&apos;à l&apos;échéance suivante.
      </p>

      <h2>5. Droit de rétractation</h2>
      <p>
        Conformément à l&apos;article L221-18 du Code de la consommation, l&apos;Utilisateur consommateur dispose
        d&apos;un délai de 14 jours à compter de la souscription pour exercer son droit de rétractation, sans avoir à
        motiver sa décision, en écrivant à <a href={`mailto:${publisher.email}`}>{publisher.email}</a>. Si
        l&apos;Utilisateur demande expressément que le Service commence avant la fin de ce délai, il reste redevable du
        prix correspondant à la période d&apos;utilisation écoulée jusqu&apos;à sa rétractation.
      </p>

      <h2>6. Durée et résiliation</h2>
      <p>
        L&apos;Utilisateur peut résilier son abonnement à tout moment depuis son espace de facturation. La résiliation
        prend effet à la fin de la période en cours ; aucune période entamée n&apos;est remboursée, sauf disposition
        légale contraire. L&apos;Utilisateur peut également demander la suppression de son compte à tout moment.
      </p>
      <p>
        L&apos;Éditeur peut suspendre ou supprimer un compte en cas de manquement aux présentes CGU, après notification
        et, sauf urgence, un délai raisonnable pour y remédier.
      </p>

      <h2>7. Obligations de l&apos;Utilisateur</h2>
      <p>L&apos;Utilisateur s&apos;engage à utiliser le Service conformément à la loi et aux présentes CGU. Il lui est notamment interdit de :</p>
      <ul>
        <li>porter atteinte à la sécurité ou à l&apos;intégrité du Service (intrusion, surcharge, contournement) ;</li>
        <li>usurper l&apos;identité d&apos;un tiers ou créer des comptes automatisés ;</li>
        <li>diffuser des contenus illicites, diffamatoires, contrefaisants ou contraires à l&apos;ordre public ;</li>
        <li>revendre ou céder l&apos;accès au Service sans accord écrit de l&apos;Éditeur.</li>
      </ul>

      <h2>8. Propriété intellectuelle</h2>
      <p>
        Le Service, sa structure, son code, ses interfaces et ses contenus sont protégés par le droit de la propriété
        intellectuelle et demeurent la propriété exclusive de l&apos;Éditeur. L&apos;abonnement confère uniquement un
        droit d&apos;utilisation personnel, non exclusif et non transférable. Les contenus créés par l&apos;Utilisateur
        restent sa propriété ; il accorde à l&apos;Éditeur une licence limitée aux besoins de la fourniture du Service.
      </p>

      <h2>9. Disponibilité et responsabilité</h2>
      <p>
        L&apos;Éditeur s&apos;efforce d&apos;assurer un accès continu au Service mais ne peut garantir une
        disponibilité ininterrompue. Des interruptions pour maintenance peuvent survenir ; l&apos;Éditeur s&apos;efforce
        d&apos;en informer les Utilisateurs à l&apos;avance.
      </p>
      <p>
        L&apos;Éditeur est tenu d&apos;une obligation de moyens. Sa responsabilité ne saurait être engagée pour les
        dommages indirects, la perte de données imputable à l&apos;Utilisateur ou à un tiers, ni en cas de force
        majeure. À l&apos;égard des Utilisateurs professionnels, la responsabilité de l&apos;Éditeur est limitée au
        montant des sommes versées au cours des douze derniers mois. Ces limitations ne s&apos;appliquent pas aux
        droits dont bénéficient les consommateurs en vertu de dispositions légales impératives.
      </p>

      <h2>10. Données personnelles</h2>
      <p>
        Le traitement des données personnelles est décrit dans la{" "}
        <Link href={siteConfig.links.privacy}>politique de confidentialité</Link>, qui fait partie intégrante des
        présentes CGU.
      </p>

      <h2>11. Modification des CGU</h2>
      <p>
        L&apos;Éditeur peut modifier les présentes CGU. Les Utilisateurs sont informés de toute modification
        substantielle au moins 30 jours avant son entrée en vigueur. La poursuite de l&apos;utilisation du Service après
        cette date vaut acceptation des nouvelles conditions ; à défaut, l&apos;Utilisateur peut résilier son compte.
      </p>

      <h2>12. Droit applicable et litiges</h2>
      <p>
        Les présentes CGU sont soumises au {governingLaw}. En cas de litige, les parties rechercheront une solution
        amiable avant toute action judiciaire.
      </p>
      {consumerMediator ? (
        <p>
          Conformément aux articles L611-1 et suivants du Code de la consommation, l&apos;Utilisateur consommateur peut
          recourir gratuitement au médiateur de la consommation suivant : {consumerMediator.name},{" "}
          {consumerMediator.address}, <a href={consumerMediator.url}>{consumerMediator.url}</a>.
        </p>
      ) : null}
      <p>
        À défaut de résolution amiable, et sous réserve des règles de compétence impératives applicables aux
        consommateurs, le litige sera porté devant les {jurisdiction}.
      </p>

      <h2>13. Contact</h2>
      <p>
        Pour toute question relative aux présentes CGU : <a href={`mailto:${publisher.email}`}>{publisher.email}</a>.
        Voir aussi nos <Link href={siteConfig.links.legal}>mentions légales</Link>.
      </p>
    </LegalArticle>
  );
}
