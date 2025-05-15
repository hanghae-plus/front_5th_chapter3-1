import { Box, Flex } from '@chakra-ui/react';
import { useState } from 'react';

import {
  EventFormWidget,
  Notification,
  SearchEvents,
  ShowEvents,
  WaringDialog,
} from './components';
import { weekDays, notificationOptions } from './constants.ts';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event } from './types';

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
    editingEvent,
    setEditingEvent,
    editEvent,
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
    startTimeError,
    endTimeError,
    resetForm,
    handleStartTimeChange,
    handleEndTimeChange,
  } = useEventForm();

  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventFormWidget
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
          resetForm={resetForm}
          handleStartTimeChange={handleStartTimeChange}
          handleEndTimeChange={handleEndTimeChange}
          setOverlappingEvents={setOverlappingEvents}
          setIsOverlapDialogOpen={setIsOverlapDialogOpen}
          events={events}
          saveEvent={saveEvent}
        />

        <ShowEvents
          navigate={navigate}
          view={view}
          setView={setView}
          currentDate={currentDate}
          weekDays={weekDays}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
        />

        <SearchEvents
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          notificationOptions={notificationOptions}
          editEvent={editEvent}
          deleteEvent={deleteEvent}
        />
      </Flex>

      <WaringDialog
        isOverlapDialogOpen={isOverlapDialogOpen}
        setIsOverlapDialogOpen={setIsOverlapDialogOpen}
        overlappingEvents={overlappingEvents}
        saveEvent={saveEvent}
        editingEvent={editingEvent}
        title={title}
        date={date}
        startTime={startTime}
        endTime={endTime}
        description={description}
        location={location}
        category={category}
        isRepeating={isRepeating}
        repeatType={repeatType}
        repeatInterval={repeatInterval}
        repeatEndDate={repeatEndDate}
        notificationTime={notificationTime}
      />

      {notifications.length > 0 && (
        <Notification notifications={notifications} setNotifications={setNotifications} />
      )}
    </Box>
  );
}

export default App;
