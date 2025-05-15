import { Box, Flex, Heading, useToast, VStack } from '@chakra-ui/react';

import { CalendarViewController } from './components/CalendarViewController.tsx';
import { EventForm } from './components/EventForm.tsx';
import { EventList } from './components/EventList.tsx';
import { MonthView } from './components/MonthView.tsx';
import { Notifications } from './components/Notifications.tsx';
import { WeekView } from './components/WeekView.tsx';
import { useEventFormContext } from './contexts/EventFormContext.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useOverlapDialog } from './hooks/useOverlapDialog.tsx';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm as EventFormType } from './types';
import { findOverlappingEvents } from './utils/eventOverlap';

function App() {
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
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    resetForm,
  } = useEventFormContext();

  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const { openOverlapDialog, OverlapDialog } = useOverlapDialog({
    onSave: () => {
      saveEvent({
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
      });
    },
  });

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

    const eventData: Event | EventFormType = {
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
    if (overlapping.length > 0) {
      openOverlapDialog(overlapping);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventForm onSubmit={addOrUpdateEvent} />

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
          onEventDelete={deleteEvent}
        />
      </Flex>

      <OverlapDialog />

      <Notifications
        notifications={notifications}
        onClose={(index) => setNotifications((prev) => prev.filter((_, i) => i !== index))}
      />
    </Box>
  );
}

export default App;
