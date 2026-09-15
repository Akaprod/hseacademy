// ============================================================================
// Store global pour l'état d'ouverture du panneau Assistant IA.
// Permet au bouton "Agent" dans le header de contrôler l'ouverture du panneau
// qui est rendu par <AssistantWidget /> dans layout.tsx.
// ============================================================================
// IMPORTANT : Header (page.tsx) et AssistantWidget (layout.tsx) sont dans des
// chunks webpack SÉPARÉS. Si le module est bundlé dans chaque chunk, create()
// serait appelé deux fois → deux stores indépendants → le clic ne déclenche
// rien. On utilise globalThis pour garantir un singleton à travers les chunks.
// ============================================================================
//
// pendingQuestion : message pré-rempli à envoyer automatiquement quand le
// widget s'ouvre. Utilisé par les boutons "Demander des informations" sur les
// pages de formation — le widget s'ouvre et envoie la question contextuelle.
// Le widget RESET pendingQuestion après envoi (usage unique).
// ============================================================================

import { create } from 'zustand';

interface AssistantStore {
  isOpen: boolean;
  pendingQuestion: string | null;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  setPendingQuestion: (q: string | null) => void;
  /** Ouvre le widget et (optionnellement) pré-remplit une question à envoyer auto. */
  openWithQuestion: (question: string) => void;
}

const GLOBAL_KEY = '__hse_academy_assistant_store__';

function getOrCreateStore() {
  // globalThis garantit un singleton même si le module est bundlé
  // dans plusieurs chunks webpack séparés
  const g = globalThis as any;
  if (g[GLOBAL_KEY]) return g[GLOBAL_KEY];

  const store = create<AssistantStore>((set) => ({
    isOpen: false,
    pendingQuestion: null,
    setOpen: (open: boolean) => set({ isOpen: open }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    setPendingQuestion: (q: string | null) => set({ pendingQuestion: q }),
    openWithQuestion: (question: string) =>
      set({ isOpen: true, pendingQuestion: question }),
  }));

  g[GLOBAL_KEY] = store;
  return store;
}

export const useAssistantStore = getOrCreateStore();
