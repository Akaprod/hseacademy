// ============================================================================
// Store global pour l'état d'ouverture du panneau Assistant IA.
// Permet au bouton "Agent" dans le header de contrôler l'ouverture du panneau
// qui est rendu par <AssistantWidget /> dans layout.tsx.
// ============================================================================

import { create } from 'zustand';

interface AssistantStore {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useAssistantStore = create<AssistantStore>((set) => ({
  isOpen: false,
  setOpen: (open: boolean) => set({ isOpen: open }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
