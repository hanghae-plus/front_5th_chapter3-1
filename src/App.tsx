import { Box, Flex } from '@chakra-ui/react';

import CalendarView from './components/CalendarView.tsx';
import EventForm from './components/EventForm.tsx';
import EventList from './components/EventList.tsx';
import EventOverlapDialog from './components/EventOverlapDialog.tsx';
import NotificationList from './components/NotificationList.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useOverlapDialog } from './hooks/useOverlapDialog.ts';
import { useSearch } from './hooks/useSearch.ts';
import { formatNotificationTime } from './utils/dateUtils.ts';

const notificationOptions = [
  { value: 1 },
  { value: 10 },
  { value: 60 },
  { value: 120 },
  { value: 1440 },
].map((option) => ({
  value: option.value,
  label: formatNotificationTime(option.value),
}));

function App() {
  const eventForm = useEventForm();
  const { events, saveEvent, deleteEvent } = useEventOperations(
    Boolean(eventForm.editingEvent),
    () => eventForm.setEditingEvent(null)
  );

  const { view, currentDate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);
  const { isOverlapDialogOpen, setIsOverlapDialogOpen, overlappingEvents, setOverlappingEvents } =
    useOverlapDialog();

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventForm
          eventForm={eventForm}
          events={events}
          notificationOptions={notificationOptions}
          saveEvent={saveEvent}
          setOverlappingEvents={setOverlappingEvents}
          setIsOverlapDialogOpen={setIsOverlapDialogOpen}
        />

        <CalendarView filteredEvents={filteredEvents} />

        <EventList
          filteredEvents={filteredEvents}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          editEvent={eventForm.editEvent}
          deleteEvent={deleteEvent}
          notificationOptions={notificationOptions}
        />
      </Flex>

      <EventOverlapDialog
        eventForm={eventForm}
        isOverlapDialogOpen={isOverlapDialogOpen}
        setIsOverlapDialogOpen={setIsOverlapDialogOpen}
        overlappingEvents={overlappingEvents}
        saveEvent={saveEvent}
      />

      <NotificationList events={events} />
    </Box>
  );
}

export default App;
