import { AppLayout } from './components/AppLayout';
import { CalendarDisplay } from './components/CalendarDisplay';
import { EventForm } from './components/EventForm';
import { EventList } from './components/EventList';
import { NotificationList } from './components/NotificationList';
import { OverlapDialog } from './components/OverlapDialog';
import { useCalendarView } from './hooks/useCalendarView';
import { useEventForm } from './hooks/useEventForm';
import { useEventManagement } from './hooks/useEventManagement';
import { useEventOperations } from './hooks/useEventOperations';
import { useNotifications } from './hooks/useNotifications';
import { useSearch } from './hooks/useSearch';

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

  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () => {
    resetForm();
    setEditingEvent(null);
  });

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const {
    handleSubmitEvent,
    handleContinueSaveAfterOverlap,
    isOverlapDialogOpen,
    setIsOverlapDialogOpen, // OverlapDialog를 직접 제어하기 위해 필요
    overlappingEvents,
    cancelRef,
  } = useEventManagement({
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
    events,
    resetForm,
    saveEvent,
  });

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
      addOrUpdateEvent={handleSubmitEvent}
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
        onContinue={handleContinueSaveAfterOverlap}
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
