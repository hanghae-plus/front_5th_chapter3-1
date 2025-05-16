import { Box, Flex, useToast, VStack } from '@chakra-ui/react';
import { useRef, useState } from 'react';

import { CalendarView } from './components/CalendarView';
import { EventForm } from './components/EventForm';
import { EventList } from './components/EventList';
import { NotificationDisplay } from './components/NotificationDisplay';
import { OverlapDialog } from './components/OverlapDialog';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm as EventFormDataType } from './types'; // Renamed to avoid conflict
import { findOverlappingEvents } from './utils/eventOverlap';

function App() {
  const formState = useEventForm();
  const {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    isRepeating,
    repeatType,
    repeatInterval,
    repeatEndDate,
    notificationTime,
    editingEvent,
    setEditingEvent,
    resetForm,
    startTimeError,
    endTimeError,
  } = formState;

  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const calendarViewProps = useCalendarView();
  const searchProps = useSearch(events, calendarViewProps.currentDate, calendarViewProps.view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const toast = useToast();

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (startTimeError || endTimeError) {
      toast({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const eventData: Event | EventFormDataType = {
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
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    if (
      overlapping.length > 0 &&
      (!editingEvent || overlapping.some((opEvent) => opEvent.id !== editingEvent.id))
    ) {
      const distinctOverlappingEvents = editingEvent
        ? overlapping.filter((opEvent) => opEvent.id !== editingEvent.id)
        : overlapping;

      if (distinctOverlappingEvents.length > 0) {
        setOverlappingEvents(distinctOverlappingEvents);
        setIsOverlapDialogOpen(true);
      } else {
        await saveEvent(eventData);
        resetForm();
      }
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  const handleConfirmOverlap = async () => {
    setIsOverlapDialogOpen(false);
    const eventData: Event | EventFormDataType = {
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
      notificationTime,
    };
    await saveEvent(eventData);
    resetForm();
  };

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
          editEvent={formState.editEvent}
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
