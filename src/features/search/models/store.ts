// features/search/model/store.ts
import { create } from 'zustand';

import { SearchState } from './types';
import { Event } from '../../../entities/event/model/types';

interface SearchStore extends SearchState {
  setSearchTerm: (term: string) => void;
  setFilteredEvents: (events: Event[]) => void;
  setCurrentDate: (date: Date) => void;
  setView: (view: 'week' | 'month') => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  searchTerm: '',
  filteredEvents: [],
  currentDate: new Date(),
  view: 'month',
  setSearchTerm: (term) => set({ searchTerm: term }),
  setFilteredEvents: (events) => set({ filteredEvents: events }),
  setCurrentDate: (date) => set({ currentDate: date }),
  setView: (view) => set({ view }),
}));
