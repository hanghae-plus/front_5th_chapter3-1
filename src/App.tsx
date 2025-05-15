import { Box, Flex } from '@chakra-ui/react';

import CalendarView from './components/calendar/CalendarView.tsx';
import OverlapDialog from './components/dialog/OverlapDialog';
import EventList from './components/event/EventList';
import EventEditor from './components/form/EventForm';
import NotificationList from './components/notifications/NotificationList';
import { categories, notificationOptions } from './constants';
import { useCalendarView } from './hooks/useCalendarView';
import { useEventForm } from './hooks/useEventForm';
import { useEventOperations } from './hooks/useEventOperations';
import { useNotifications } from './hooks/useNotifications';
import { useOverlapDialog } from './hooks/useOverlapDialog.ts';
import { useSearch } from './hooks/useSearch';
import { useToastMessage } from './hooks/useToastMessage';
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

  const {
    isOverlapDialogOpen,
    overlappingEvents,
    cancelRef,
    openOverlapDialog,
    closeOverlapDialog,
  } = useOverlapDialog();

  const { showErrorToast } = useToastMessage();

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      showErrorToast('필수 정보를 모두 입력해주세요.');
      return;
    }

    if (startTimeError || endTimeError) {
      showErrorToast('시간 설정을 확인해주세요.');
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
      openOverlapDialog(overlapping);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  const handleContinueOverlap = () => {
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

  const handleCloseNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventEditor
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
          editingEvent={editingEvent}
          handleStartTimeChange={handleStartTimeChange}
          handleEndTimeChange={handleEndTimeChange}
          addOrUpdateEvent={addOrUpdateEvent}
          categories={categories}
          notificationOptions={notificationOptions}
        />
        <CalendarView
          view={view}
          setView={setView}
          currentDate={currentDate}
          holidays={holidays}
          navigate={navigate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
        />

        <EventList
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          notificationOptions={notificationOptions}
          editEvent={editEvent}
          deleteEvent={deleteEvent}
        />
      </Flex>

      <OverlapDialog
        isOpen={isOverlapDialogOpen}
        onClose={closeOverlapDialog}
        overlappingEvents={overlappingEvents}
        cancelRef={cancelRef}
        onContinue={handleContinueOverlap}
      />

      <NotificationList
        notifications={notifications}
        onCloseNotification={handleCloseNotification}
      />
    </Box>
  );
}

export default App;
