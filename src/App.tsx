import { Box, Flex } from '@chakra-ui/react';

import Calendar from './components/calendar/Calendar.tsx';
import NotificationList from './components/NotificationList.tsx';
import ScheduleFormContainer from './components/ScheduleFormContainer.tsx';
import ScheduleList from './components/ScheduleList.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';

function App() {
  const { editingEvent, setEditingEvent, editEvent } = useEventForm();
  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );
  const { notifications, notifiedEvents } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <ScheduleFormContainer
          events={events}
          saveEvent={saveEvent}
          editingEvent={editingEvent}
          setEditingEvent={setEditingEvent}
        />

        <Calendar
          view={view}
          setView={setView}
          currentDate={currentDate}
          navigate={navigate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
        />

        <ScheduleList
          events={filteredEvents}
          notifiedEvents={notifiedEvents}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onEdit={editEvent}
          onDelete={deleteEvent}
        />
      </Flex>

      {notifications.length > 0 && <NotificationList events={events} />}
    </Box>
  );
}

export default App;
