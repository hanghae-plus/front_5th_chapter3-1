import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  CloseButton,
  Flex,
  Heading,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';

import { EventConflictAlertDialog } from './components/dialog/ConflictWarn.tsx';
import { EventFormComponent } from './components/EventForm.tsx';
import { EventList } from './components/EventList.tsx';
import { MonthView } from './components/MonthView.tsx';
import { Navigation } from './components/Navigation.tsx';
import { WeekView } from './components/WeekView.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm } from './types';
import { findOverlappingEvents } from './utils/eventOverlap';

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
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

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

    const eventData: Event | EventForm = {
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
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  const onAlertClick = () => {
    setIsOverlapDialogOpen(false);
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
  };

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventFormComponent
          isRepeating={isRepeating}
          title={title}
          date={date}
          startTime={startTime}
          endTime={endTime}
          description={description}
          location={location}
          category={category}
          repeatType={repeatType}
          repeatInterval={repeatInterval}
          repeatEndDate={repeatEndDate}
          notificationTime={notificationTime}
          startTimeError={startTimeError}
          endTimeError={endTimeError}
          editingEvent={editingEvent}
          setTitle={setTitle}
          setDate={setDate}
          handleStartTimeChange={handleStartTimeChange}
          handleEndTimeChange={handleEndTimeChange}
          setDescription={setDescription}
          setLocation={setLocation}
          setCategory={setCategory}
          setRepeatType={setRepeatType}
          setRepeatInterval={setRepeatInterval}
          setRepeatEndDate={setRepeatEndDate}
          setNotificationTime={setNotificationTime}
          addOrUpdateEvent={addOrUpdateEvent}
          setIsRepeating={setIsRepeating}
        />

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
          editEvent={editEvent}
          deleteEvent={deleteEvent}
        />
      </Flex>

      <EventConflictAlertDialog
        isOverlapDialogOpen={isOverlapDialogOpen}
        setIsOverlapDialogOpen={setIsOverlapDialogOpen}
        overlappingEvents={overlappingEvents}
        onAlertClick={onAlertClick}
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
