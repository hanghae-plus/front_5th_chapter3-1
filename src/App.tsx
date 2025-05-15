import { Box, Flex, Heading, useToast, VStack } from '@chakra-ui/react';
import { useRef, useState } from 'react';

import { AppLayout } from './components/AppLayout';
import { CalendarDisplay } from './components/CalendarHeader';
import { EventForm } from './components/EventForm';
import { EventList } from './components/EventList';
import { NotificationList } from './components/NotificationList';
import { OverlapDialog } from './components/OverlapDialog';
import { useCalendarView } from './hooks/useCalendarView';
import { useEventForm } from './hooks/useEventForm';
import { useEventOperations } from './hooks/useEventOperations';
import { useNotifications } from './hooks/useNotifications';
import { useSearch } from './hooks/useSearch';
import { Event, EventForm as EventFormType } from './types';
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
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  const handleContinueSaveEvent = async () => {
    setIsOverlapDialogOpen(false);
    const eventData = {
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

  const eventFormSection = (
    <EventForm
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
      addOrUpdateEvent={addOrUpdateEvent}
      editingEvent={editingEvent}
    />
  );

  const calendarViewSection = (
    <CalendarDisplay
      view={view}
      currentDate={currentDate}
      filteredEvents={filteredEvents}
      notifiedEvents={notifiedEvents}
      holidays={holidays}
      onNavigate={navigate}
      onSetView={setView}
    />
  );

  const eventListSection = (
    <EventList
      events={filteredEvents}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      notifiedEvents={notifiedEvents}
      onEdit={editEvent}
      onDelete={deleteEvent}
    />
  );

  return (
    <>
      <AppLayout
        eventFormSection={eventFormSection}
        calendarViewSection={calendarViewSection}
        eventListSection={eventListSection}
      />

      <OverlapDialog
        isOpen={isOverlapDialogOpen}
        onClose={() => setIsOverlapDialogOpen(false)}
        overlappingEvents={overlappingEvents}
        onContinue={handleContinueSaveEvent}
        cancelRef={cancelRef}
      />

      <NotificationList
        notifications={notifications}
        onClose={(index) => setNotifications((prev) => prev.filter((_, i) => i !== index))}
      />
    </>
  );
}

export default App;
