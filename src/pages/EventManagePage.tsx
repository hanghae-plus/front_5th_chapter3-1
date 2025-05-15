import { Box, Flex } from '@chakra-ui/react';
import { useRef } from 'react';

import { Calendar } from '../components/calendar';
import EventFormComponent from '../components/EventForm.tsx';
import EventList from '../components/EventList.tsx';
import NotificationList from '../components/NotificationList.tsx';
import OverlapAlertDialog from '../components/OverlapAlertDialog.tsx';
import { useEventFormContext } from '../contexts/event-form-context';
import { useCalendarView } from '../hooks/useCalendarView.ts';
import { useDialog } from '../hooks/useDialog.ts';
import { useEventOperations } from '../hooks/useEventOperations.ts';
import { useNotifications } from '../hooks/useNotifications.ts';
import { useSearch } from '../hooks/useSearch.ts';

function EventManagePage() {
  const { editingEvent, setEditingEvent } = useEventFormContext();

  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const { isOpen, onClose, checkOverlap, overlappingEvents } = useDialog();

  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventFormComponent events={events} saveEvent={saveEvent} checkOverlap={checkOverlap} />

        <Calendar
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          view={view}
          setView={setView}
          currentDate={currentDate}
          holidays={holidays}
          navigate={navigate}
        />

        <EventList
          notifiedEvents={notifiedEvents}
          filteredEvents={filteredEvents}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          deleteEvent={deleteEvent}
        />
      </Flex>

      <OverlapAlertDialog
        isOpen={isOpen}
        onClose={onClose}
        cancelRef={cancelRef}
        saveEvent={saveEvent}
        editingEvent={editingEvent}
        overlappingEvents={overlappingEvents}
      />

      <NotificationList notifications={notifications} setNotifications={setNotifications} />
    </Box>
  );
}

export default EventManagePage;
