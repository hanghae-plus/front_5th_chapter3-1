import MonthView from './MonthView';
import WeekView from './WeekView';

import { Event } from '@/types';

type Props = {
  view: 'week' | 'month';
  currentDate: Date;
  holidays: Record<string, string>;
  filteredEvents: Event[];
  notifiedEvents: string[];
};

const CalendarView = ({ view, currentDate, holidays, filteredEvents, notifiedEvents }: Props) => {
  return view === 'week' ? (
    <WeekView
      currentDate={currentDate}
      filteredEvents={filteredEvents}
      notifiedEvents={notifiedEvents}
    />
  ) : (
    <MonthView
      currentDate={currentDate}
      holidays={holidays}
      filteredEvents={filteredEvents}
      notifiedEvents={notifiedEvents}
    />
  );
};

export default CalendarView;
