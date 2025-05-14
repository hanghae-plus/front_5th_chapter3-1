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
