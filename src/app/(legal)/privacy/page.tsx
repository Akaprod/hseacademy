import type { Metadata } from 'next';
import LegalPageContent from '@/components/legal-page-content';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité — HSE Academy',
  description: 'Politique de confidentialité et protection des données personnelles HSE Academy',
};

// ============================================================================
// Page publique /privacy — Politique de confidentialité
// ============================================================================
// Accessible sans authentification. Contenu admin chargé depuis
// /api/legal-content?type=privacy. Si l'admin n'a pas renseigné le champ,
// le contenu par défaut ci-dessous est affiché.
//
// IMPORTANT : aucun numéro de récépissé CNDP n'est inventé ici. Si l'établissement
// a effectué une déclaration CNDP, l'admin le renseigne dans le dashboard et
// le numéro s'affichera dynamiquement dans la section "Informations sur
// l'établissement". Sinon, aucune mention CNDP n'apparaît.
// ============================================================================

const FALLBACK_CONTENT = `La présente politique de confidentialité décrit la manière dont HSE Academy collecte, traite et protège les données personnelles des utilisateurs de sa plateforme de formation.

Elle s'applique à toute personne physique inscrite ou candidate à une formation, ainsi qu'aux visiteurs laissant un message via le formulaire de contact ou s'abonnant à la newsletter.

HSE Academy s'engage à traiter les données personnelles dans le respect de la réglementation applicable et à n'utiliser ces données qu'aux fins légitimes décrites ci-dessous.`;

const FALLBACK_SECTIONS = [
  {
    heading: '1. Responsable du traitement',
    body: `Le responsable du traitement des données personnelles est l'établissement HSE Academy. Les coordonnées complètes du responsable (raison sociale, adresse, téléphone, email) sont affichées dans la section « Informations sur l'établissement » ci-dessous, si elles ont été renseignées par l'administration.`,
  },
  {
    heading: '2. Finalités du traitement',
    body: `Les données collectées sont utilisées pour les finalités suivantes : création et gestion du compte utilisateur, accès aux formations et suivi de la progression, délivrance d'attestations professionnelles, gestion des paiements et de leur validation administrative, réponse aux demandes de contact, envoi de la newsletter (pour les abonnés explicites).

Aucune donnée n'est utilisée à des fins commerciales tierces ou de revente.`,
  },
  {
    heading: '3. Catégories de données collectées',
    body: `Les catégories de données traitées incluent : identité (nom, prénom), coordonnées (email, téléphone si communiqué), données d'inscription aux formations, scores et progression, preuves de paiement, messages envoyés via le formulaire de contact, adresse email des abonnés à la newsletter.

Aucune donnée sensible (santé, opinions politiques, religion, etc.) n'est collectée.`,
  },
  {
    heading: '4. Base légale du traitement',
    body: `Le traitement des données repose sur : l'exécution du contrat de formation pour les données liées au compte et à la progression, le consentement explicite de l'utilisateur pour la newsletter et les communications, l'obligation légale ou réglementaire pour la conservation des justificatifs de paiement et d'attestation, l'intérêt légitime pour les échanges avec l'administration.

L'utilisateur peut retirer son consentement à tout moment pour les traitements fondés sur celui-ci.`,
  },
  {
    heading: '5. Durée de conservation',
    body: `Les données sont conservées pour la durée nécessaire à la fourniture du service demandé, augmentée des durées de conservation requises par la réglementation applicable (notamment pour les justificatifs de paiement et les attestations délivrées). Les données des abonnés à la newsletter sont conservées jusqu'au désabonnement explicite.`,
  },
  {
    heading: '6. Sécurité',
    body: `HSE Academy met en œuvre des mesures techniques et organisationnelles appropriées pour protéger les données contre la perte, l'accès non autorisé, la divulgation ou la modification. Les mots de passe sont stockés sous forme hachée. Les attestations sont sécurisées par une signature cryptographique.`,
  },
  {
    heading: '7. Destinataires des données',
    body: `Les données sont accessibles uniquement à l'utilisateur concerné et à l'administration de HSE Academy. Aucune donnée n'est vendue ni cédée à des tiers à des fins commerciales. Les prestataires techniques (hébergement) peuvent accéder aux données uniquement dans la limite strictement nécessaire à la prestation technique, et dans le respect des obligations de confidentialité applicables.`,
  },
  {
    heading: '8. Cookies',
    body: `La plateforme utilise un cookie de session strictement nécessaire au fonctionnement du service (authentification). Ce cookie est httpOnly et sécurisé en production. Aucun cookie de tracking publicitaire n'est déposé.`,
  },
  {
    heading: '9. Droits des utilisateurs',
    body: `Conformément à la réglementation applicable, l'utilisateur dispose des droits suivants : droit d'accès, de rectification, d'effacement, à la limitation du traitement, à la portabilité, d'opposition, et le droit de retirer son consentement à tout moment.

Ces droits peuvent être exercés en contactant l'administration via les coordonnées affichées dans la section « Informations sur l'établissement » ci-dessous.`,
  },
  {
    heading: '10. CNDP',
    body: `L'établissement peut procéder à une déclaration auprès de l'autorité de protection des données à caractère personnel (CNDP ou autre autorité compétente). Si une telle déclaration a été effectuée, le numéro de récépissé apparaît dans la section « Informations sur l'établissement ». En l'absence de numéro affiché, cela signifie que la déclaration n'a pas encore été finalisée ou renseignée par l'administration.`,
  },
];

export default function PrivacyPage() {
  return (
    <LegalPageContent
      type="privacy"
      title="Politique de Confidentialité"
      subtitle="Protection des données personnelles — HSE Academy"
      fallbackContent={FALLBACK_CONTENT}
      fallbackSections={FALLBACK_SECTIONS}
    />
  );
}
