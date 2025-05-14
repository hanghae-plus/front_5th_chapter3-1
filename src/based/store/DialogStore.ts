import { create } from 'zustand';

interface DialogStore {
  isOverlapDialogOpen: boolean;
  setIsOverlapDialogOpen: (isOpen: boolean) => void;
}

export const useDialogStore = create<DialogStore>((set) => ({
  isOverlapDialogOpen: false,
  setIsOverlapDialogOpen: (isOpen) => set({ isOverlapDialogOpen: isOpen }),
}));
