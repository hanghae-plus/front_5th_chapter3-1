import { Box, Flex, Heading, VStack } from '@chakra-ui/react';

import { EventFormComponent } from './components/EventForm.tsx';
import { EventList } from './components/EventList.tsx';
import { MonthView } from './components/MonthView.tsx';
import { Navigation } from './components/Navigation.tsx';
import { NotificationComponent } from './components/Notification.tsx';
import { WeekView } from './components/WeekView.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { useEditingEventStore } from './store/editing-event.ts';

function App() {
  const { editingEvent, setEditingEvent } = useEditingEventStore();
  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventFormComponent saveEvent={saveEvent} editingEvent={editingEvent} events={events} />

        <VStack flex={1} spacing={5} align="stretch">
          <Heading>일정 보기</Heading>

          <Navigation view={view} setView={setView} navigate={navigate} />

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
          setSearchTerm={setSearchTerm}
          deleteEvent={deleteEvent}
        />
      </Flex>
      <NotificationComponent notifications={notifications} setNotifications={setNotifications} />
    </Box>
  );
}

export default App;
