import { Box, Flex, useToast, VStack } from '@chakra-ui/react';
import { useRef, useState } from 'react';

import { Event, EventForm } from './entities/event/model/types.ts';
import { useSearch } from './features/search/models/useSearch.ts';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { findOverlappingEvents } from './utils/eventOverlap.ts';
import { AlertWidget } from './widgets/AlertWidget/ui/AlertWidget.tsx';
import { CalendarWidget } from './widgets/CalendarWidget/ui/CalendarWidget.tsx';
import { EventFormWidget } from './widgets/EventFormWidget/ui/EventFormWidget.tsx';
import { EventListWidget } from './widgets/EventListWidget/ui/EventListWidget.tsx';
import { NotificationWidget } from './widgets/NotificationWidget/ui/NotificationWidget.tsx';

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

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
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventFormWidget
          // 기본 정보
          title={title}
          date={date}
          startTime={startTime}
          endTime={endTime}
          description={description}
          location={location}
          category={category}
          // 시간 에러
          startTimeError={startTimeError}
          endTimeError={endTimeError}
          // 반복 설정
          isRepeating={isRepeating}
          repeatType={repeatType}
          repeatInterval={repeatInterval}
          repeatEndDate={repeatEndDate}
          // 알림 설정
          notificationTime={notificationTime}
          notificationOptions={notificationOptions}
          // 이벤트 상태
          editingEvent={editingEvent}
          // 이벤트 핸들러
          setTitle={setTitle}
          setDate={setDate}
          handleStartTimeChange={handleStartTimeChange}
          handleEndTimeChange={handleEndTimeChange}
          setDescription={setDescription}
          setLocation={setLocation}
          setCategory={setCategory}
          setIsRepeating={setIsRepeating}
          setRepeatType={setRepeatType}
          setRepeatInterval={setRepeatInterval}
          setRepeatEndDate={setRepeatEndDate}
          setNotificationTime={setNotificationTime}
          addOrUpdateEvent={addOrUpdateEvent}
          onSubmit={addOrUpdateEvent}
        />

        <CalendarWidget
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          view={view}
          currentDate={currentDate}
          holidays={holidays}
          setView={setView}
          navigate={navigate}
        />

        <EventListWidget
          searchTerm={searchTerm}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          notificationOptions={notificationOptions}
          setSearchTerm={setSearchTerm}
          editEvent={editEvent}
          deleteEvent={deleteEvent}
        />
      </Flex>

      <AlertWidget
        isOverlapDialogOpen={isOverlapDialogOpen}
        cancelRef={cancelRef}
        setIsOverlapDialogOpen={setIsOverlapDialogOpen}
        overlappingEvents={overlappingEvents}
        saveEvent={saveEvent}
        editingEvent={editingEvent}
        eventData={{
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
        }}
      />

      {notifications.length > 0 && (
        <NotificationWidget notifications={notifications} setNotifications={setNotifications} />
      )}
    </Box>
  );
}

export default App;
