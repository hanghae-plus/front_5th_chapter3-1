import { Box, Flex } from '@chakra-ui/react';

import { CalendarSection } from './components/calendar/CalendarSection.tsx';
import { EventEditSection } from './components/event/EventEditSection.tsx';
import { SearchEventSection } from './components/event/SearchEventSection.tsx';
import { Notification } from './components/notification/Notification.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { EventForm } from './types';

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

  const eventForm: EventForm = {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    repeat: {
      type: repeatType,
      interval: repeatInterval,
      endDate: repeatEndDate,
    },
    notificationTime,
  };

  const setEventForm = {
    setTitle,
    setDate,
    setDescription,
    setLocation,
    setCategory,
    setIsRepeating,
    setRepeatType,
    setRepeatInterval,
    setRepeatEndDate,
    setNotificationTime,
  };

  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventEditSection
          eventForm={eventForm}
          setEventForm={setEventForm}
          events={events}
          saveEvent={saveEvent}
          startTimeError={startTimeError}
          endTimeError={endTimeError}
          editingEvent={editingEvent}
          isRepeating={isRepeating}
          handleStartTimeChange={handleStartTimeChange}
          handleEndTimeChange={handleEndTimeChange}
          resetForm={resetForm}
        />

        <CalendarSection
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          navigate={navigate}
          view={view}
          setView={setView}
          holidays={holidays}
        />

        <SearchEventSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          notificationOptions={notificationOptions}
          editEvent={editEvent}
          deleteEvent={deleteEvent}
        />
      </Flex>

      {notifications.length > 0 && (
        <Notification notifications={notifications} setNotifications={setNotifications} />
      )}
    </Box>
  );
}

export default App;
