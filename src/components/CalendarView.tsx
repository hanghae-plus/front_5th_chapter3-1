import { VStack } from '@chakra-ui/react';
import { FC } from 'react';

import { Event } from '../types';
import MonthView from './MonthView';
import WeekView from './WeekView';

type CalendarViewProps = {
  view: 'week' | 'month';
  currentDate: Date;
  holidays: { [key: string]: string };
  filteredEvents: Event[];
  notifiedEvents: string[];
};

const CalendarView: FC<CalendarViewProps> = ({
  view,
  currentDate,
  holidays,
  filteredEvents,
  notifiedEvents,
}) => {
  return (
    <VStack flex={1} align="stretch">
      {view === 'week' ? (
        <WeekView
          currentDate={currentDate}
          events={filteredEvents}
          notifiedEvents={notifiedEvents}
        />
      ) : (
        <MonthView
          currentDate={currentDate}
          events={filteredEvents}
          holidays={holidays}
          notifiedEvents={notifiedEvents}
        />
      )}
    </VStack>
  );
};

export default CalendarView;
