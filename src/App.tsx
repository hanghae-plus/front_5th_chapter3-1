import { Box, Flex } from '@chakra-ui/react';

import { AlertOverlapEvent } from './components/alert/AlertOverlapEvent.tsx';
import { EventEdit, EventSearch, EventView } from './components/event';
import { NotificationList } from './components/notification';
import {
  useCalendarView,
  useEventForm,
  useEventOperations,
  useNotifications,
  useSearch,
  useOverlappingEventDialog,
  useEventValidation,
} from './hooks';
import { Event, EventForm } from './types';

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

  const overlapDialog = useOverlappingEventDialog({
    onConfirmSave: async (event) => {
      await saveEvent(event);
      resetForm();
    },
  });

  const { validateAndSaveEvent } = useEventValidation({
    events,
    onSave: saveEvent,
    onReset: resetForm,
    openOverlapDialog: overlapDialog.openDialog,
  });

  const addOrUpdateEvent = async () => {
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

    await validateAndSaveEvent(eventData);
  };

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventEdit
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
          addOrUpdateEvent={addOrUpdateEvent}
        />

        <EventView
          view={view}
          setView={setView}
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
          navigate={navigate}
        />

        <EventSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          editEvent={editEvent}
          deleteEvent={deleteEvent}
        />
      </Flex>

      <AlertOverlapEvent
        isOpen={overlapDialog.isOpen}
        onClose={overlapDialog.closeDialog}
        overlappingEvents={overlapDialog.overlappingEvents}
        onConfirm={overlapDialog.confirm}
        eventData={{
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
        }}
      />

      <NotificationList notifications={notifications} setNotifications={setNotifications} />
    </Box>
  );
}

export default App;
