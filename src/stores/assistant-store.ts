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

import { create } from 'zustand';

interface AssistantStore {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const GLOBAL_KEY = '__hse_academy_assistant_store__';

function getOrCreateStore() {
  // globalThis garantit un singleton même si le module est bundlé
  // dans plusieurs chunks webpack séparés
  const g = globalThis as any;
  if (g[GLOBAL_KEY]) return g[GLOBAL_KEY];

  const store = create<AssistantStore>((set) => ({
    isOpen: false,
    setOpen: (open: boolean) => set({ isOpen: open }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  }));

  g[GLOBAL_KEY] = store;
  return store;
}

export const useAssistantStore = getOrCreateStore();
