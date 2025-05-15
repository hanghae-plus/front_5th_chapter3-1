import { Alert, AlertIcon, AlertTitle, Box, CloseButton, Flex, VStack } from '@chakra-ui/react';
import { useState } from 'react';

import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { Event } from './types';
import { EventForm } from './components/EventForm.tsx';
import { CalendarView } from './components/CalendarView.tsx';
import { SearchView } from './components/SearchView.tsx';
import { OverlapAlertDialog } from './components/OverlapAlertDialog.tsx';

function App() {
  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
  } = useEventForm();

  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const eventForm = {
    id: editingEvent ? editingEvent.id : undefined,
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    repeat: {
      type: isRepeating ? repeatType : 'none',
      interval: repeatInterval,
      endDate: repeatEndDate || undefined,
    },
    isRepeating,
    notificationTime,
    startTimeError,
    endTimeError,
  };
  const eventHandlers = {
    setTitle,
    setDate,
    setDescription,
    setLocation,
    setCategory,
    setNotificationTime,
    setIsRepeating,
    setRepeatType,
    setRepeatInterval,
    setRepeatEndDate,
    setOverlappingEvents,
    setIsOverlapDialogOpen,
    handleStartTimeChange,
    handleEndTimeChange,
    saveEvent,
    resetForm,
  };

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventForm
          events={events}
          eventForm={eventForm}
          eventHandlers={eventHandlers}
          editingEvent={editingEvent}
        />

        <CalendarView
          view={view}
          currentDate={currentDate}
          events={events}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
          navigate={navigate}
          setView={setView}
        />

        <SearchView
          events={events}
          currentDate={currentDate}
          view={view}
          editEvent={editEvent}
          deleteEvent={deleteEvent}
          notifiedEvents={notifiedEvents}
        />
      </Flex>

      <OverlapAlertDialog
        isOpen={isOverlapDialogOpen}
        onClose={() => setIsOverlapDialogOpen(false)}
        overlappingEvents={overlappingEvents}
        saveEvent={saveEvent}
        editingEvent={editingEvent}
      />

      {notifications.length > 0 && (
        <VStack position="fixed" top={4} right={4} spacing={2} align="flex-end">
          {notifications.map((notification, index) => (
            <Alert key={index} status="info" variant="solid" width="auto">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle fontSize="sm">{notification.message}</AlertTitle>
              </Box>
              <CloseButton
                onClick={() => setNotifications((prev) => prev.filter((_, i) => i !== index))}
              />
            </Alert>
          ))}
        </VStack>
      )}
    </Box>
  );
}

export default App;
