import { Box, Flex } from '@chakra-ui/react';

import { CalendarView } from './components/CalendarView';
import { EventForm } from './components/EventForm';
import { EventList } from './components/EventList';
import { NotificationDisplay } from './components/NotificationDisplay';
import { OverlapDialog } from './components/OverlapDialog';
import { useAppLogic } from './hooks/useAppLogic';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';

function App() {
  const formState = useEventForm();
  const { setEditingEvent, editEvent } = formState;

  const { events, saveEvent, deleteEvent } = useEventOperations(
    Boolean(formState.editingEvent),
    () => setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const calendarViewProps = useCalendarView();
  const searchProps = useSearch(events, calendarViewProps.currentDate, calendarViewProps.view);

  const {
    isOverlapDialogOpen,
    setIsOverlapDialogOpen,
    overlappingEvents,
    cancelRef,
    addOrUpdateEvent,
    handleConfirmOverlap,
  } = useAppLogic({ formState, events, saveEvent });

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventForm formState={formState} onSubmit={addOrUpdateEvent} />

        <CalendarView
          {...calendarViewProps}
          filteredEvents={searchProps.filteredEvents}
          notifiedEvents={notifiedEvents}
        />

        <EventList
          {...searchProps}
          notifiedEvents={notifiedEvents}
          editEvent={editEvent}
          deleteEvent={deleteEvent}
        />
      </Flex>

      <OverlapDialog
        isOpen={isOverlapDialogOpen}
        onClose={() => setIsOverlapDialogOpen(false)}
        onConfirm={handleConfirmOverlap}
        overlappingEvents={overlappingEvents}
        cancelRef={cancelRef}
      />

      <NotificationDisplay notifications={notifications} setNotifications={setNotifications} />
    </Box>
  );
}

export default App;
