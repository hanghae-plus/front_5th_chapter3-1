import { create } from 'zustand';

import { Event } from '../types';

interface EditingEventStore {
  editingEvent: Event | null;
  setEditingEvent: (event: Event | null) => void;
}

export const useEditingEventStore = create<EditingEventStore>((set) => ({
  editingEvent: null,
  setEditingEvent: (event) => set({ editingEvent: event }),
}));
