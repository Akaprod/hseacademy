import type { Metadata } from 'next';
import LegalPageContent from '@/components/legal-page-content';

export const metadata: Metadata = {
  title: 'Conditions Générales — HSE Academy',
  description: "Conditions générales d'utilisation et de vente de la plateforme HSE Academy",
};

// ============================================================================
// Page publique /terms — Conditions générales
// ============================================================================
// Accessible sans authentification. Contenu admin chargé depuis
// /api/legal-content?type=terms. Si l'admin n'a pas renseigné le champ,
// le contenu par défaut ci-dessous est affiché.
// ============================================================================

const FALLBACK_CONTENT = `Les présentes conditions générales définissent les modalités d'utilisation de la plateforme HSE Academy, ainsi que les droits et obligations des parties dans le cadre des formations proposées.

Elles s'appliquent à tout utilisateur accédant à la plateforme, qu'il soit inscrit ou simple visiteur. L'inscription à une formation ou la création d'un compte vaut acceptation expresse des présentes conditions.

HSE Academy se réserve le droit de modifier les présentes conditions à tout moment. Les conditions applicables sont celles en vigueur au moment de l'inscription.`;

const FALLBACK_SECTIONS = [
  {
    heading: '1. Objet',
    body: `La plateforme HSE Academy est un service de formation professionnelle à distance spécialisé dans les domaines QHSE (Qualité, Hygiène, Sécurité, Environnement). Elle propose des formations structurées par chapitres, des examens, et la délivrance d'attestations professionnelles.`,
  },
  {
    heading: '2. Accès au service',
    body: `L'accès à la plateforme nécessite la création d'un compte utilisateur. L'utilisateur s'engage à fournir des informations exactes lors de l'inscription et à les maintenir à jour.

L'accès aux formations est conditionné par les règles métier de la plateforme : le premier cours suivi par un utilisateur est gratuit, les cours suivants sont payants selon les tarifs en vigueur. Les examens sont gratuits.

HSE Academy ne saurait être tenue responsable des interruptions d'accès dues à des contraintes techniques externes (connectivité, maintenance, etc.).`,
  },
  {
    heading: '3. Inscription et compte',
    body: `L'utilisateur est responsable de la confidentialité de ses identifiants. Toute activité effectuée depuis son compte est réputée effectuée par lui-même.

L'identité de l'utilisateur peut être vérifiée par l'administration avant la délivrance d'une attestation. La falsification d'identité entraîne l'annulation des attestations obtenues et la fermeture du compte.`,
  },
  {
    heading: '4. Formations',
    body: `Les formations sont structurées en chapitres. L'utilisateur peut suivre les chapitres dans l'ordre proposé et passer les examens associés. La progression est enregistrée et peut être consultée depuis le profil.

Le contenu pédagogique est la propriété intellectuelle de HSE Academy. Toute reproduction, redistribution ou representation non autorisée est interdite.`,
  },
  {
    heading: '5. Examens et scores',
    body: `Les examens sont gratuits. Le score obtenu est enregistré et contribue au score global de la formation. Une formation est considérée comme terminée lorsque les conditions de complétion définies par l'établissement sont remplies.`,
  },
  {
    heading: '6. Paiements',
    body: `Les paiements sont validés manuellement par l'administration. Le montant, la devise et les modes de paiement acceptés sont définis par HSE Academy. Les tarifs en vigueur sont ceux affichés au moment du paiement.

Les paiements validés ne sont pas automatiquement remboursés. La politique de remboursement est détaillée sur la page dédiée /refund.`,
  },
  {
    heading: '7. Attestations',
    body: `Une attestation ne peut être délivrée que lorsque les conditions d'éligibilité sont satisfaites : formation terminée, score conforme, et — pour les cours payants — paiement validé par l'administration.

Les attestations portent un numéro de série unique et une signature cryptographique. Elles sont vérifiables publiquement via l'URL de vérification inscrite sur chaque attestation. Le statut d'une attestation peut être révoqué par l'administration en cas de fraude ou de falsification.

L'attestation numérique est incluse dans le paiement d'un cours payant. L'attestation imprimée est un service optionnel, facturé séparément.`,
  },
  {
    heading: '8. Responsabilités',
    body: `HSE Academy s'engage à fournir un service conforme aux présentes conditions et à maintenir la disponibilité de la plateforme dans la mesure du possible.

L'utilisateur est responsable de l'usage qu'il fait des formations et des attestations. HSE Academy décline toute responsabilité quant à l'usage qui pourrait être fait des attestations par des tiers, ou quant à la reconnaissance d'une formation par un organisme externe.`,
  },
  {
    heading: '9. Propriété intellectuelle',
    body: `L'ensemble des contenus pédagogiques, supports, articles, et éléments graphiques de la plateforme sont la propriété intellectuelle de HSE Academy. Toute reproduction, redistribution, ou utilisation commerciale non autorisée est interdite.

Les attestations délivrées aux utilisateurs leur appartiennent à titre personnel et ne peuvent être ni modifiées ni altérées.`,
  },
  {
    heading: '10. Suspension et résiliation',
    body: `HSE Academy se réserve le droit de suspendre ou de résilier un compte en cas de manquement aux présentes conditions, de fraude, ou de tentative de contournement des règles métier (paiement, attestation, etc.). L'utilisateur peut à tout moment demander la suppression de son compte.`,
  },
  {
    heading: '11. Données personnelles',
    body: `Le traitement des données personnelles est décrit dans la politique de confidentialité accessible à l'adresse /privacy. L'utilisateur est invité à consulter cette page pour toute information relative à la collecte et au traitement de ses données.`,
  },
  {
    heading: '12. Modifications des conditions',
    body: `Les présentes conditions peuvent être modifiées par HSE Academy à tout moment. La version applicable est celle publiée sur la plateforme au moment de l'inscription ou de la connexion de l'utilisateur.`,
  },
];

export default function TermsPage() {
  return (
    <LegalPageContent
      type="terms"
      title="Conditions Générales"
      subtitle="Conditions d'utilisation et de vente de la plateforme HSE Academy"
      fallbackContent={FALLBACK_CONTENT}
      fallbackSections={FALLBACK_SECTIONS}
    />
  );
}
