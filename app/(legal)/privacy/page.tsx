import type { Metadata } from "next";
import Link from "next/link";

import { LegalArticle } from "@/components/legal/legal-article";
import { legalConfig } from "@/config/legal";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function PrivacyPage() {
  const { publisher, privacyContact, dpo, retention, subprocessors } = legalConfig;
  const hasNonEuSubprocessor = subprocessors.some((item) => !/union européenne|france|ue\b/i.test(item.location));

  return (
    <LegalArticle title="Politique de confidentialité" lastUpdated={legalConfig.lastUpdated.privacy}>
      <p>
        {publisher.name} (« nous ») accorde une grande importance à la protection de vos données personnelles. La
        présente politique vous informe, conformément au Règlement (UE) 2016/679 (« RGPD ») et à la loi Informatique et
        Libertés, des conditions dans lesquelles nous traitons les données collectées via {siteConfig.name} (« le
        Service »).
      </p>

      <h2>1. Responsable du traitement</h2>
      <ul>
        <li>
          <strong>Raison sociale :</strong> {publisher.name}, {publisher.legalForm}
        </li>
        <li>
          <strong>Siège social :</strong> {publisher.address}
        </li>
        <li>
          <strong>Immatriculation :</strong> {publisher.registration}
        </li>
        <li>
          <strong>Contact données personnelles :</strong>{" "}
          <a href={`mailto:${privacyContact.email}`}>{privacyContact.email}</a>
        </li>
        {dpo.designated ? (
          <li>
            <strong>Délégué à la protection des données :</strong> {dpo.name},{" "}
            <a href={`mailto:${dpo.email}`}>{dpo.email}</a>
          </li>
        ) : null}
      </ul>

      <h2>2. Données collectées</h2>
      <p>Nous collectons uniquement les données nécessaires au fonctionnement du Service :</p>
      <ul>
        <li>
          <strong>Données de compte :</strong> nom, adresse email, mot de passe (stocké sous forme hachée, jamais en
          clair), statut de vérification de l&apos;adresse email.
        </li>
        <li>
          <strong>Données de connexion :</strong> adresse IP, navigateur utilisé, dates de connexion et jetons de
          session.
        </li>
        <li>
          <strong>Données de facturation :</strong> identifiant client, état de l&apos;abonnement, historique des
          factures. Vos données bancaires sont collectées et traitées directement par notre prestataire de paiement
          Stripe ; nous n&apos;y avons jamais accès.
        </li>
        <li>
          <strong>Échanges :</strong> contenu de vos demandes adressées à notre support.
        </li>
      </ul>

      <h2>3. Finalités, bases légales et durées de conservation</h2>
      <div className="not-prose overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4 font-medium">Finalité</th>
              <th className="py-2 pr-4 font-medium">Base légale</th>
              <th className="py-2 font-medium">Durée de conservation</th>
            </tr>
          </thead>
          <tbody className="align-top">
            <tr className="border-b">
              <td className="py-2 pr-4">Création et gestion de votre compte, authentification</td>
              <td className="py-2 pr-4">Exécution du contrat (art. 6.1.b)</td>
              <td className="py-2">{retention.account}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4">Envoi des emails de service (confirmation, réinitialisation, connexion)</td>
              <td className="py-2 pr-4">Exécution du contrat (art. 6.1.b)</td>
              <td className="py-2">Durée du compte</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4">Gestion des abonnements, facturation et comptabilité</td>
              <td className="py-2 pr-4">Exécution du contrat (art. 6.1.b) et obligation légale (art. 6.1.c)</td>
              <td className="py-2">{retention.billing}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4">Sécurité du Service, prévention de la fraude et des abus (limitation de débit)</td>
              <td className="py-2 pr-4">Intérêt légitime (art. 6.1.f)</td>
              <td className="py-2">{retention.securityLogs}</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Support et réponse à vos demandes</td>
              <td className="py-2 pr-4">Exécution du contrat (art. 6.1.b)</td>
              <td className="py-2">{retention.support}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Nous ne réalisons aucune prospection commerciale sans votre consentement préalable et aucune décision
        exclusivement automatisée produisant des effets juridiques à votre égard.
      </p>

      <h2>4. Destinataires et sous-traitants</h2>
      <p>
        Vos données sont accessibles aux seules personnes habilitées de {publisher.name}, dans la limite de leurs
        missions. Nous faisons appel aux prestataires suivants, qui traitent vos données pour notre compte dans le
        cadre d&apos;un contrat conforme à l&apos;article 28 du RGPD :
      </p>
      <ul>
        {subprocessors.map((item) => (
          <li key={item.name}>
            <strong>
              <a href={item.url}>{item.name}</a>
            </strong>{" "}
            : {item.purpose}. Localisation : {item.location}.
          </li>
        ))}
      </ul>
      <p>
        Vos données peuvent également être communiquées aux autorités administratives ou judiciaires lorsque la loi
        l&apos;exige.
      </p>

      <h2>5. Transferts hors de l&apos;Union européenne</h2>
      {hasNonEuSubprocessor ? (
        <>
          <p>
            Certains prestataires traitent vos données en dehors de l&apos;Espace économique européen. Ces transferts
            sont encadrés par les garanties suivantes :
          </p>
          <ul>
            {subprocessors.map((item) => (
              <li key={item.name}>
                <strong>{item.name}</strong> : {item.safeguard}.
              </li>
            ))}
          </ul>
          <p>
            Vous pouvez obtenir une copie de ces garanties en nous écrivant à{" "}
            <a href={`mailto:${privacyContact.email}`}>{privacyContact.email}</a>.
          </p>
        </>
      ) : (
        <p>Toutes vos données sont hébergées et traitées au sein de l&apos;Union européenne.</p>
      )}

      <h2>6. Cookies et stockage local</h2>
      <p>
        Le Service n&apos;utilise que des traceurs strictement nécessaires à son fonctionnement, exemptés de
        consentement au titre de l&apos;article 82 de la loi Informatique et Libertés :
      </p>
      <ul>
        <li>
          <strong>Cookies de session :</strong> permettent de vous maintenir connecté de façon sécurisée. Ils sont
          supprimés à la déconnexion ou à l&apos;expiration de la session.
        </li>
        <li>
          <strong>Préférence d&apos;affichage :</strong> votre choix de thème (clair ou sombre) est mémorisé dans le
          stockage local de votre navigateur.
        </li>
      </ul>
      <p>Nous n&apos;utilisons aucun traceur publicitaire ni outil de mesure d&apos;audience nécessitant votre consentement.</p>

      <h2>7. Vos droits</h2>
      <p>Conformément aux articles 15 à 22 du RGPD, vous disposez des droits suivants :</p>
      <ul>
        <li>
          <strong>Accès</strong> : obtenir la confirmation que vos données sont traitées et en recevoir une copie.
        </li>
        <li>
          <strong>Rectification</strong> : faire corriger des données inexactes ou incomplètes.
        </li>
        <li>
          <strong>Effacement</strong> : demander la suppression de vos données dans les cas prévus par la loi.
        </li>
        <li>
          <strong>Limitation</strong> : demander le gel temporaire du traitement.
        </li>
        <li>
          <strong>Portabilité</strong> : recevoir vos données dans un format structuré et lisible par machine.
        </li>
        <li>
          <strong>Opposition</strong> : vous opposer à un traitement fondé sur notre intérêt légitime.
        </li>
        <li>
          <strong>Directives post-mortem</strong> : définir le sort de vos données après votre décès.
        </li>
      </ul>
      <p>
        Pour exercer ces droits, écrivez-nous à <a href={`mailto:${privacyContact.email}`}>{privacyContact.email}</a>{" "}
        ou par courrier à {privacyContact.postalAddress}. Nous répondrons dans un délai d&apos;un mois, prolongeable de
        deux mois pour les demandes complexes. Une preuve d&apos;identité pourra vous être demandée en cas de doute
        raisonnable.
      </p>
      <p>
        Vous pouvez également introduire une réclamation auprès de la Commission nationale de l&apos;informatique et
        des libertés (CNIL) : <a href="https://www.cnil.fr/fr/plaintes">www.cnil.fr/fr/plaintes</a> ou 3 place de
        Fontenoy, TSA 80715, 75334 Paris Cedex 07.
      </p>

      <h2>8. Sécurité</h2>
      <p>
        Nous mettons en œuvre des mesures techniques et organisationnelles adaptées pour protéger vos données :
        chiffrement des échanges (HTTPS), hachage des mots de passe, vérification de l&apos;adresse email, limitation
        des tentatives de connexion, contrôle des accès et journalisation. En cas de violation de données susceptible
        d&apos;engendrer un risque élevé pour vos droits, nous vous en informerons conformément à l&apos;article 34 du
        RGPD.
      </p>

      <h2>9. Mineurs</h2>
      <p>
        Le Service s&apos;adresse aux personnes âgées d&apos;au moins 15 ans. Si vous avez moins de 15 ans, vous ne
        pouvez créer un compte qu&apos;avec l&apos;accord du titulaire de l&apos;autorité parentale.
      </p>

      <h2>10. Modifications</h2>
      <p>
        Nous pouvons faire évoluer la présente politique. En cas de modification substantielle, vous en serez informé
        par email ou par un message dans le Service. La version en vigueur est toujours disponible à cette adresse,
        datée en haut de page.
      </p>

      <h2>11. Contact</h2>
      <p>
        Pour toute question relative à vos données personnelles :{" "}
        <a href={`mailto:${privacyContact.email}`}>{privacyContact.email}</a>. Voir aussi nos{" "}
        <Link href={siteConfig.links.legal}>mentions légales</Link> et nos{" "}
        <Link href={siteConfig.links.terms}>conditions d&apos;utilisation</Link>.
      </p>
    </LegalArticle>
  );
}
