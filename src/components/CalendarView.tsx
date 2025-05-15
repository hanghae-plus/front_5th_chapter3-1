import { VStack } from '@chakra-ui/react';

import MonthView from './MonthView';
import WeekView from './WeekView';

function CalendarView({ view, currentDate, holidays, filteredEvents, notifiedEvents }) {
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
}

export default CalendarView;
