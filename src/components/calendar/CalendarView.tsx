import renderMonthView from './MonthView';
import renderWeekView from './WeekView';
import { Event } from '../../types';

interface Props {
  view: 'week' | 'month';
  currentDate: Date;
  holidays: Record<string, string>;
  filteredEvents: Event[];
  notifiedEvents: string[];
}

const CalendarView = ({ view, currentDate, holidays, filteredEvents, notifiedEvents }: Props) => {
  if (view === 'week') {
    return renderWeekView({ currentDate, filteredEvents, notifiedEvents });
  }
  return renderMonthView({ currentDate, holidays, filteredEvents, notifiedEvents });
};

export default CalendarView;
