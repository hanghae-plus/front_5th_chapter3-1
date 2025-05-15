import { useCalendarView } from '../../../hooks/useCalendarView';
import { useSearch } from '../../../hooks/useSearch';
import { Event } from '../../../types';

export const useCalendarViewStateAndActions = (events: Event[]) => {
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  return {
    viewState: {
      view,
      currentDate,
      holidays,
      searchTerm,
      filteredEvents,
    },
    viewActions: {
      setView,
      navigate,
      setSearchTerm,
    },
  };
};

export interface CalendarViewState {
  view: 'week' | 'month';
  currentDate: Date;
  holidays: Record<string, string>;
  searchTerm: string;
  filteredEvents: Event[];
}

export interface CalendarViewActions {
  setView: (view: 'week' | 'month') => void;
  navigate: (direction: 'prev' | 'next') => void;
  setSearchTerm: (searchTerm: string) => void;
}


