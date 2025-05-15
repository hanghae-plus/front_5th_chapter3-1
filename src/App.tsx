import { Box, Flex, Heading, useToast, VStack } from '@chakra-ui/react';
import { useRef, useState } from 'react';

import CalendarNavigation from './components/CalendarNavigation.tsx';
import EventList from './components/EventList.tsx';
import EventManager from './components/EventManager.tsx';
import { MonthView } from './components/MonthView.tsx';
import NotificationList from './components/NotificationList.tsx';
import OverlapDialog from './components/OverlapDialog.tsx';
import WeekView from './components/WeekView.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useOverlapDialog } from './hooks/useOverlapDialog.ts';
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
  const { isOverlapDialogOpen, closeOverlapDialog, openOverlapDialog } = useOverlapDialog();

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
      openOverlapDialog();
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  const handleContinueWithOverlap = () => {
    closeOverlapDialog();
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
        <EventManager
          addOrUpdateEvent={addOrUpdateEvent}
          title={title}
          setTitle={setTitle}
          date={date}
          setDate={setDate}
          startTime={startTime}
          endTime={endTime}
          description={description}
          setDescription={setDescription}
          location={location}
          setLocation={setLocation}
          category={category}
          setCategory={setCategory}
          isRepeating={isRepeating}
          setIsRepeating={setIsRepeating}
          repeatType={repeatType}
          setRepeatType={setRepeatType}
          repeatInterval={repeatInterval}
          setRepeatInterval={setRepeatInterval}
          repeatEndDate={repeatEndDate}
          setRepeatEndDate={setRepeatEndDate}
          notificationTime={notificationTime}
          setNotificationTime={setNotificationTime}
          startTimeError={startTimeError}
          endTimeError={endTimeError}
          handleStartTimeChange={handleStartTimeChange}
          handleEndTimeChange={handleEndTimeChange}
          editingEvent={editingEvent}
        />

        <VStack flex={1} spacing={5} align="stretch">
          <Heading>일정 보기</Heading>

          <CalendarNavigation view={view} setView={setView} navigate={navigate} />

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
              filteredEvents={filteredEvents}
              notifiedEvents={notifiedEvents}
              holidays={holidays}
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

      <OverlapDialog
        isOverlapDialogOpen={isOverlapDialogOpen}
        closeOverlapDialog={closeOverlapDialog}
        handleContinueWithOverlap={handleContinueWithOverlap}
        overlappingEvents={overlappingEvents}
        cancelRef={cancelRef}
      />

      {notifications.length > 0 && (
        <NotificationList notifications={notifications} setNotifications={setNotifications} />
      )}
    </Box>
  );
}

export default App;
