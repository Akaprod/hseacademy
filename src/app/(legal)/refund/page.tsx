import type { Metadata } from 'next';
import LegalPageContent from '@/components/legal-page-content';

export const metadata: Metadata = {
  title: 'Politique de Remboursement — HSE Academy',
  description: 'Politique de remboursement applicable aux formations et paiements HSE Academy',
};

// ============================================================================
// Page publique /refund — Politique de remboursement
// ============================================================================
// Accessible sans authentification. Le contenu administrable est chargé
// dynamiquement depuis /api/legal-content?type=refund. Si l'admin n'a pas
// encore renseigné le champ, le contenu par défaut ci-dessous est affiché.
// ============================================================================

const FALLBACK_CONTENT = `La présente politique décrit les conditions dans lesquelles un apprenant peut prétendre à un remboursement des frais engagés auprès de HSE Academy pour une formation ou un service associé.

Elle s'applique aux paiements validés manuellement par l'administration, conformément aux règles métier de la plateforme. Les examens sont gratuits et ne donnent lieu à aucun remboursement. Le premier cours suivi par un apprenant est gratuit ; aucun remboursement n'est donc applicable pour ce cours.

Les paiements concernés par cette politique sont : (i) le paiement d'un cours payant (formations suivantes), et (ii) le paiement d'une attestation imprimée.`;

const FALLBACK_SECTIONS = [
  {
    heading: '1. Demande de remboursement',
    body: `Toute demande de remboursement doit être adressée à l'administration par écrit, en indiquant l'identité du demandeur, la formation concernée, le montant payé, et le motif de la demande.

L'administration examinera la demande et répondra dans un délai raisonnable. Aucun remboursement automatique n'est déclenché ; chaque demande est traitée individuellement.`,
  },
  {
    heading: '2. Cas pouvant donner lieu à remboursement',
    body: `Un remboursement peut être envisagé notamment dans les situations suivantes : paiement en double d'une même formation, formation non accessible malgré un paiement validé, décision administrative d'annulation d'une formation par l'établissement.

Le remboursement, s'il est accordé, porte sur le montant effectivement payé et validé par l'administration, dans la devise d'origine.`,
  },
  {
    heading: '3. Cas ne pouvant donner lieu à remboursement',
    body: `Aucun remboursement n'est applicable dans les cas suivants : formation déjà terminée et attestation déjà délivrée, échec à un examen (les examens étant gratuits), contenu consulté partiellement ou intégralement, demande formulée au-delà d'un délai raisonnable après l'accès à la formation.

L'éligibilité à une attestation ne constitue pas un motif de remboursement.`,
  },
  {
    heading: "4. Modalités d’exécution",
    body: `Le remboursement, s’il est validé, est effectué par l’administration selon les modalités convenues avec le demandeur. Le délai effectif dépend du mode de paiement initial et des contraintes des prestataires de paiement.`,
  },
];

export default function RefundPage() {
  return (
    <LegalPageContent
      type="refund"
      title="Politique de Remboursement"
      subtitle="Conditions applicables aux formations et paiements HSE Academy"
      fallbackContent={FALLBACK_CONTENT}
      fallbackSections={FALLBACK_SECTIONS}
    />
  );
}
