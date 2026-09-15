'use client';

// ============================================================================
// AskInfoButton — bouton "Demander des informations" pour les pages formation
// ============================================================================
// Au clic : ouvre le widget Assistant IA (Lara) avec une question de départ
// contextuelle à la formation affichée sur la page.
//
// Ex : depuis /f/technicien-qhse → "Bonjour Lara, j'ai besoin de plus
//      d'informations pour le niveau Technicien en QHSE."
//
// Utilise le store global Zustand (`useAssistantStore`) pour ouvrir le widget
// + pré-remplir une question qui sera envoyée automatiquement.
// ============================================================================

import { Sparkles } from 'lucide-react';
import { useAssistantStore } from '@/stores/assistant-store';

interface Props {
  /** Titre complet de la formation (ex : "Technicien QHSE") */
  formationTitle: string;
  /** Niveau lisible (ex : "Technicien") — fallback si pas fourni */
  formationLevel?: string;
}

export function AskInfoButton({ formationTitle, formationLevel }: Props) {
  const openWithQuestion = useAssistantStore((s) => s.openWithQuestion);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Construire une question de départ contextuelle et polie
    //
    // Pour les formations DIPLOMANTES (level = "technicien", "licence", "master", etc.),
    // on utilise le niveau lisible + "en QHSE" → "Technicien QHSE en QHSE"
    // (en fait on a déjà "Technicien QHSE" dans levelLabels, donc on a un doublon "QHSE"
    // qu'on nettoie en passant formationTitle directement).
    //
    // Pour les formations CERTIFIANTES (level = "certifiant"), le levelLabels ne
    // contient pas cette clé → on récupère "certifiant" qui ne veut rien dire.
    // On préfère alors utiliser le TITRE de la formation (ex : "Sauveteur Secouriste
    // du Travail (SST)") sans le suffixe "en QHSE" (la certification n'est pas un
    // "niveau QHSE" mais une formation spécifique).
    const isCertifiante = !formationLevel || formationLevel === 'certifiant' || formationLevel === 'Certifiante';

    const question = isCertifiante
      ? `Bonjour Lara, j'ai besoin de plus d'informations sur la formation "${formationTitle}".`
      : `Bonjour Lara, j'ai besoin de plus d'informations pour ${formationLevel || formationTitle} en QHSE.`;
    openWithQuestion(question);
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      className="block w-full text-center text-sm text-slate-600 hover:text-emerald-700 transition-colors py-2 flex items-center justify-center gap-1.5"
    >
      <Sparkles className="h-3.5 w-3.5" />
      Demander des informations
    </a>
  );
}
