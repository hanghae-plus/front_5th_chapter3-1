import { Box, Flex, Heading, VStack } from '@chakra-ui/react';

import {
  CalendarViewController,
  EventForm,
  EventList,
  MonthView,
  Notifications,
  WeekView,
} from './components';
import { useEvents } from './contexts/EventContext.tsx';
import { useCalendarView, useNotifications, useSearch } from './hooks';

function App() {
  const { events } = useEvents();
  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventForm />

        <VStack flex={1} spacing={5} align="stretch">
          <Heading>일정 보기</Heading>

          <CalendarViewController
            view={view}
            onViewChange={setView}
            onPrevClick={() => navigate('prev')}
            onNextClick={() => navigate('next')}
          />

          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              filteredEvents={filteredEvents}
              notifiedEvents={notifiedEvents}
            />
          )}
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              holidays={holidays}
              filteredEvents={filteredEvents}
              notifiedEvents={notifiedEvents}
            />
          )}
        </VStack>

        <EventList
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          searchTerm={searchTerm}
          onSearchTermChange={(e) => setSearchTerm(e.target.value)}
        />
      </Flex>

      <Notifications
        notifications={notifications}
        onClose={(index) => setNotifications((prev) => prev.filter((_, i) => i !== index))}
      />
    </Box>
  );
}

export default App;
