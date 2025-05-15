import { Event } from '../../../entities/event/model/types';

export interface SearchState {
  searchTerm: string;
  filteredEvents: Event[];
  currentDate: Date;
  view: 'week' | 'month';
}
